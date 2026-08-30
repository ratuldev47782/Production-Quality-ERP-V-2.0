import { HourlyInspectionModel } from "@/models/hourly-inspections";
import { dbConnect } from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// ── Timezone-safe "start of day" ────────────────────────────────────────────
// The client always sends a plain "YYYY-MM-DD" calendar-date string (computed
// in Asia/Dhaka on the frontend). We must NOT run that through any local-
// timezone conversion, because the server's timezone (UTC on most hosts,
// but not guaranteed — VPS TZ env vars, serverless cold starts, etc.) can
// make the same date string resolve to different calendar days depending on
// when/where the request runs. That mismatch between save-time and
// query-time was causing two different dates to collide onto the same
// stored date-range, so a date's saved entries would "leak" into another
// date's results.
//
// Fix: parse the Y/M/D digits directly out of the string and anchor them to
// UTC midnight. This is 100% deterministic — it never touches the server's
// local timezone, so save and query always agree with each other regardless
// of where/when the process runs.
function startOfDay(dateLike) {
  if (!dateLike) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  if (typeof dateLike === "string") {
    const match = dateLike.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    }
  }

  // Fallback for Date objects / other formats — anchor using UTC fields,
  // never local-timezone fields (getFullYear/getMonth/getDate would
  // reintroduce the same bug).
  const d = new Date(dateLike);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function toNumber(n, def = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : def;
}

function normalizeEntry(raw) {
  const hourLabel = raw.hour || raw.hourLabel || "";
  const selectedDefects = Array.isArray(raw.selectedDefects)
    ? raw.selectedDefects.map((d) => ({
        name: String(d.name || "").trim(),
        quantity: toNumber(d.quantity, 0),
      }))
    : [];

  // Extract hourIndex from hourLabel (e.g., "1st Hour" -> 1)
  let hourIndex = raw.hourIndex;
  if (!hourIndex && hourLabel) {
    const match = hourLabel.match(/^(\d+)/);
    if (match) {
      hourIndex = parseInt(match[1], 10);
    }
  }
  if (!hourIndex) hourIndex = 0;

  // Calculate totalDefects from selectedDefects
  const totalDefects = selectedDefects.reduce(
    (sum, d) => sum + (Number(d.quantity) || 0),
    0
  );

  const building = (raw.building || "").trim();
  const factory = (raw.factory || "").trim();

  const doc = {
    hourLabel,
    hourIndex,
    inspectedQty: toNumber(raw.inspectedQty, 0),
    passedQty: toNumber(raw.passedQty, 0),
    defectivePcs: toNumber(raw.defectivePcs, 0),
    afterRepair: toNumber(raw.afterRepair, 0),
    totalDefects,
    selectedDefects,
    line: raw.line || "",
    building,
    factory,
  };

  return doc;
}

// ---------- POST ----------
// Accepts either a single entry (body.entry / a flat body) or a bulk array
// via body.entries / body.hours. Bulk hour-entry (one hour, many lines) is
// the main use case this batches for: the caller sends every filled-in line
// as a separate entry in `entries`, all sharing the same reportDate.

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const userId = body.userId || body.user_id || body.created_by?.id;
    const user_name =
      body.userName || body.user_name || body.created_by?.user_name;

    const building = body.building || body.assigned_building || "";
    const factory =
      body.factory || body.assigned_factory || body.factoryCode || "";

    if (!userId || !user_name) {
      return NextResponse.json(
        { success: false, message: "userId এবং userName দুটোই প্রয়োজন।" },
        { status: 400 }
      );
    }
    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId (not ObjectId)." },
        { status: 400 }
      );
    }
    if (!factory) {
      return NextResponse.json(
        { success: false, message: "Factory information is required." },
        { status: 400 }
      );
    }
    if (!building) {
      return NextResponse.json(
        { success: false, message: "Building information is required." },
        { status: 400 }
      );
    }
    if (!body.reportDate) {
      return NextResponse.json(
        { success: false, message: "reportDate is required." },
        { status: 400 }
      );
    }

    const reportDate = startOfDay(body.reportDate);

    let rawEntries = [];
    if (Array.isArray(body.entries)) rawEntries = body.entries;
    else if (Array.isArray(body.hours)) rawEntries = body.hours;
    else if (body.entry) rawEntries = [body.entry];
    else rawEntries = [body];

    if (!rawEntries || rawEntries.length === 0) {
      return NextResponse.json(
        { success: false, message: "No entries provided to save." },
        { status: 400 }
      );
    }

    const docs = rawEntries.map((e) => ({
      ...normalizeEntry({
        ...e,
        building: e.building || building,
        factory: e.factory || factory,
      }),
      user: { id: new mongoose.Types.ObjectId(userId), user_name },
      reportDate,
    }));

    for (const d of docs) {
      if (!d.hourLabel || !d.hourIndex || d.hourIndex < 1 || d.hourIndex > 24) {
        return NextResponse.json(
          {
            success: false,
            message: `hourLabel/hourIndex is required and must be between 1-24. hourLabel: "${d.hourLabel}", hourIndex: ${d.hourIndex}`,
          },
          { status: 400 }
        );
      }
      if (!d.factory) {
        return NextResponse.json(
          { success: false, message: "Factory is required for each entry." },
          { status: 400 }
        );
      }
      if (!d.building) {
        return NextResponse.json(
          { success: false, message: "Building is required for each entry." },
          { status: 400 }
        );
      }
      if (!d.line) {
        return NextResponse.json(
          { success: false, message: "Line is required for each entry." },
          { status: 400 }
        );
      }
    }

    if (docs.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid documents to insert." },
        { status: 400 }
      );
    }

    let inserted;
    try {
      // ordered: false — this matters for bulk hour-entry. When a user
      // fills every line for an hour and one line was already saved
      // earlier, we still want the other 29 lines to insert instead of
      // the whole batch stopping at the first duplicate-key error.
      inserted = await HourlyInspectionModel.insertMany(docs, {
        ordered: false,
      });
    } catch (insertError) {
      console.error("insertMany error:", insertError);

      if (insertError.name === "ValidationError") {
        const validationErrors = Object.values(insertError.errors || {})
          .map((e) => `${e.path}: ${e.message}`)
          .join(", ");
        return NextResponse.json(
          {
            success: false,
            message: `Validation failed: ${validationErrors}`,
          },
          { status: 400 }
        );
      }

      // Single-doc duplicate key error (no writeErrors array — happens when
      // there was only one doc in the batch, e.g. single-entry save).
      if (insertError.code === 11000 && !insertError.writeErrors) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An entry already exists for this combination (line/hour/date). Please edit the existing entry instead.",
          },
          { status: 409 }
        );
      }

      // Bulk (unordered) write errors — some docs succeeded, some failed.
      // Map each failure back to its line/hour so the client can tell the
      // user exactly which lines were skipped and why.
      if (insertError.writeErrors && Array.isArray(insertError.writeErrors)) {
        const failedIndexes = new Set();
        const failedDetails = insertError.writeErrors.map((e) => {
          const idx = e.index ?? e.err?.index ?? -1;
          failedIndexes.add(idx);
          const failedDoc = docs[idx];
          const code = e.code ?? e.err?.code;
          const isDup = code === 11000;
          return {
            index: idx,
            line: failedDoc?.line,
            hourLabel: failedDoc?.hourLabel,
            reason: isDup ? "duplicate" : "error",
            message: isDup
              ? `${failedDoc?.line || "This line"} already has an entry for ${failedDoc?.hourLabel || "this hour"}.`
              : e.errmsg || e.err?.errmsg || "Failed to save this line.",
          };
        });

        const insertedDocs = insertError.insertedDocs || inserted || [];

        if (insertedDocs.length > 0) {
          return NextResponse.json(
            {
              success: true,
              partial: failedDetails.length > 0,
              count: insertedDocs.length,
              data: insertedDocs,
              failed: failedDetails,
              message:
                failedDetails.length > 0
                  ? `Saved ${insertedDocs.length} of ${docs.length} entries. ${failedDetails.length} were skipped (already existed).`
                  : "Hourly inspection entries created.",
            },
            { status: 201 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            failed: failedDetails,
            message: `Failed to insert entries: ${failedDetails
              .map((f) => f.message)
              .join(" ")}`,
          },
          { status: 400 }
        );
      }

      const errorMessage =
        insertError.message ||
        insertError.errmsg ||
        String(insertError) ||
        "Unknown error occurred";

      return NextResponse.json(
        {
          success: false,
          message: `Failed to insert: ${errorMessage}`,
        },
        { status: 500 }
      );
    }

    if (!inserted || inserted.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No entries were inserted. Please check server logs for details.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: inserted.length,
        data: inserted,
        message: "Hourly inspection entries created.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /hourly-inspections outer catch error:", err);

    if (err.code === 11000 || err.name === "MongoServerError") {
      return NextResponse.json(
        {
          success: false,
          message:
            "An entry for this hour and date already exists. Please edit the existing entry instead.",
        },
        { status: 409 }
      );
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors || {})
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { success: false, message: `Validation error: ${errors}` },
        { status: 400 }
      );
    }

    const errorMessage =
      err?.message || err?.errmsg || err?.toString() || "Server error occurred";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// ---------- GET ----------
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const building = searchParams.get("building");
    const factory = searchParams.get("factory");
    const limit = Math.min(Number(searchParams.get("limit") || 200), 1000);

    const filter = {};
    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        return NextResponse.json(
          { success: false, message: "Invalid userId (not ObjectId)." },
          { status: 400 }
        );
      }
      filter["user.id"] = new mongoose.Types.ObjectId(userId);
    }
    if (date) {
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      filter.reportDate = { $gte: dayStart, $lt: dayEnd };
    }
    if (building) {
      filter.building = building;
    }
    if (factory) {
      filter.factory = factory;
    }

    const rows = await HourlyInspectionModel.find(filter)
      .sort({ reportDate: 1, hourIndex: 1, createdAt: 1 })
      .limit(limit)
      .lean();

    const rowsWithTotalDefects = rows.map((row) => {
      if (row.totalDefects === undefined || row.totalDefects === null) {
        const total = Array.isArray(row.selectedDefects)
          ? row.selectedDefects.reduce(
              (sum, d) => sum + (Number(d.quantity) || 0),
              0
            )
          : 0;
        return { ...row, totalDefects: total };
      }
      return row;
    });

    return NextResponse.json(
      {
        success: true,
        count: rowsWithTotalDefects.length,
        data: rowsWithTotalDefects,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /hourly-inspections error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// ---------- PATCH (Update) ----------
export async function PATCH(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const factory = searchParams.get("factory");

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Valid ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updateData = normalizeEntry(body);

    const totalDefects = updateData.selectedDefects.reduce(
      (sum, d) => sum + d.quantity,
      0
    );

    // ── reportDate guard ────────────────────────────────────────────────
    // Without this, PATCH will happily update ANY document that matches
    // {_id, factory} — regardless of which date it actually belongs to.
    // If the client ever attaches a stale/wrong _id to a row (date-switch
    // race condition, cached state, etc.), this was silently corrupting
    // the WRONG date's entry. Requiring reportDate in the filter turns
    // that into a loud 404 instead of a silent cross-date write.
    if (!body.reportDate) {
      return NextResponse.json(
        { success: false, message: "reportDate is required for update." },
        { status: 400 }
      );
    }
    const reportDate = startOfDay(body.reportDate);

    const filter = { _id: id, reportDate };
    if (factory) filter.factory = factory;

    const updated = await HourlyInspectionModel.findOneAndUpdate(
      filter,
      {
        ...updateData,
        totalDefects,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Entry not found for this date (id/date mismatch)." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated, message: "Entry updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH /hourly-inspections error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
// ---------- DELETE ----------
export async function DELETE(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const factory = searchParams.get("factory");

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Valid ID is required" },
        { status: 400 }
      );
    }

    const filter = { _id: id };
    if (factory) filter.factory = factory;

    const deleted = await HourlyInspectionModel.findOneAndDelete(filter);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: deleted,
        message: "Entry deleted successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /hourly-inspections error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}