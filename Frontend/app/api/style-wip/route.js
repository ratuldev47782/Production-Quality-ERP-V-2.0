// app/api/style-wip/route.js
//
// FIX: StyleCapacityModel lookup now includes cycleStartDate so the correct
//      cycle's capacity is used. Previously it matched only on
//      factory+building+line+buyer+style, which always returned the FIRST
//      cycle's document even after a new cycle started.
//
// CYCLE DETECTION LOGIC (unchanged):
//   Uptodate production = sum of achievedQty for the CURRENT UNBROKEN STREAK
//   of dates on which this line ran the SAME buyer + style combo —
//   regardless of color_model. All colors of the same style count together.
//
//   Example on Line-1:
//     Jan-01: style-123, buyer-X, color-BLUE  ← cycle starts
//     Jan-02: style-123, buyer-X, color-RED   ← still same cycle (same buyer+style)
//     Jan-03: style-456, buyer-Y, color-GREEN ← different style → streak broken
//     Jan-04: style-123, buyer-X, color-BLUE  ← brand NEW streak (not Jan-01/02)
//
//   color_model param is intentionally IGNORED for streak detection and aggregation.

import { dbConnect } from "@/services/mongo";
import TargetSetterHeader from "@/models/TargetSetterHeader";
import { HourlyProductionModel } from "@/models/HourlyProduction-model";
import { StyleCapacityModel } from "@/models/StyleCapacity-model";
export const dynamic = "force-dynamic";

function toNumberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toDateString(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const factory           = searchParams.get("factory");
    const assigned_building = searchParams.get("assigned_building");
    const line              = searchParams.get("line");
    const buyer             = searchParams.get("buyer");
    const style             = searchParams.get("style");
    const dateParam         = searchParams.get("date");
    // color_model param accepted but IGNORED — uptodate is buyer+style level

    if (!factory || !assigned_building || !line || !buyer || !style || !dateParam) {
      return Response.json(
        {
          success: false,
          message:
            "factory, assigned_building, line, buyer, style, date are all required",
        },
        { status: 400 }
      );
    }

    const date = toDateString(dateParam);

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1 — Fetch ALL headers for this factory + building + line up to `date`
    //          We need the full line timeline to detect streak breaks.
    // ─────────────────────────────────────────────────────────────────────────
    const allHeadersRaw = await TargetSetterHeader.find({
      factory,
      assigned_building,
      line,
    })
      .select("_id date style buyer color_model")
      .lean();

    const allHeaders = allHeadersRaw
      .map((h) => ({ ...h, _dateStr: toDateString(h.date) }))
      .filter((h) => h._dateStr <= date)
      .sort((a, b) => (a._dateStr > b._dateStr ? -1 : 1)); // newest → oldest

    if (!allHeaders.length) {
      return Response.json({
        success: true,
        data: {
          factory,
          capacity: 0,
          totalAchieved: 0,
          wip: 0,
          rawWip: 0,
          capacityId: null,
          cycleStartDate: null,
          debug: { reason: "no headers for this line up to date" },
        },
      }, { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2 — Group headers by date, then walk backwards to find the
    //          unbroken streak for this buyer + style (all colors together).
    //
    // Rules:
    //   • Date has ≥1 header matching buyer+style (any color) → part of streak
    //   • Date has headers but NONE match buyer+style          → streak broken
    //   • Date has NO headers at all (holiday/weekend)         → skip, keep going
    // ─────────────────────────────────────────────────────────────────────────
    const headersByDate = {};
    for (const h of allHeaders) {
      if (!headersByDate[h._dateStr]) headersByDate[h._dateStr] = [];
      headersByDate[h._dateStr].push(h);
    }

    // All dates that have at least one header, newest → oldest
    const datesWithHeaders = Object.keys(headersByDate).sort().reverse();

    // Match on buyer + style only — color_model is deliberately ignored
    const matchesCombo = (h) =>
      h.buyer === buyer &&
      h.style === style;

    const streakHeaderIds = [];
    let cycleStartDate    = null;

    for (const d of datesWithHeaders) {
      const onDay      = headersByDate[d];
      const matchOnDay = onDay.filter(matchesCombo);

      if (matchOnDay.length > 0) {
        // All matching headers on this day (all colors) count
        for (const h of matchOnDay) streakHeaderIds.push(h._id);
        cycleStartDate = d; // keeps updating → ends up as earliest streak date
      } else {
        // A different buyer/style was running → streak broken
        break;
      }
    }

    if (!cycleStartDate || streakHeaderIds.length === 0) {
      return Response.json({
        success: true,
        data: {
          factory,
          capacity: 0,
          totalAchieved: 0,
          wip: 0,
          rawWip: 0,
          capacityId: null,
          cycleStartDate: null,
          debug: {
            reason: "buyer+style combo not present in most-recent production days",
            buyer, style, date,
          },
        },
      }, { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3 — Capacity doc scoped to THIS cycle via cycleStartDate.
    //
    // FIX: Previously this looked up only by factory+building+line+buyer+style,
    //      which always matched the OLDEST capacity doc. Now we scope it to the
    //      detected cycleStartDate so each cycle reads its own document.
    // ─────────────────────────────────────────────────────────────────────────
    const capacityDoc = await StyleCapacityModel.findOne({
      factory,
      assigned_building,
      line,
      buyer,
      style,
      cycleStartDate, // ✅ FIX — scope to current cycle only
    }).lean();

    const capacity = capacityDoc ? toNumberOrZero(capacityDoc.capacity) : 0;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4 — Sum achievedQty from ALL streak headers (all colors combined)
    // ─────────────────────────────────────────────────────────────────────────
    const agg = await HourlyProductionModel.aggregate([
      { $match: { headerId: { $in: streakHeaderIds } } },
      { $group: { _id: null, totalAchieved: { $sum: "$achievedQty" } } },
    ]);

    const totalAchieved = agg.length > 0 ? toNumberOrZero(agg[0].totalAchieved) : 0;
    const rawWip        = capacity - totalAchieved;
    const wip           = Math.max(rawWip, 0);

    return Response.json({
      success: true,
      data: {
        factory,
        capacity,
        totalAchieved,
        wip,
        rawWip,
        capacityId:       capacityDoc?._id || null,
        cycleStartDate,                          // ✅ always returned
        cycleHeaderCount: streakHeaderIds.length,
        debug: {
          date, buyer, style,
          note: "color_model ignored — uptodate is buyer+style level; capacity scoped to cycleStartDate",
          cycleStartDate,
          streakHeaderCount: streakHeaderIds.length,
          totalLineDates:    datesWithHeaders.length,
        },
      },
    }, { status: 200 });

  } catch (error) {
    console.error("GET /api/style-wip error:", error);
    return Response.json(
      { success: false, message: "Failed to calculate style WIP" },
      { status: 500 }
    );
  }
}