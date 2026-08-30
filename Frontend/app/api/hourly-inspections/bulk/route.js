import { HourlyInspectionModel } from "@/models/hourly-inspections";
import { dbConnect } from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Same deterministic UTC-anchored date parsing as the main route.
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
  let hourIndex = raw.hourIndex;
  if (!hourIndex && hourLabel) {
    const m = hourLabel.match(/^(\d+)/);
    if (m) hourIndex = parseInt(m[1], 10);
  }
  if (!hourIndex) hourIndex = 0;
  const totalDefects = selectedDefects.reduce((s, d) => s + (Number(d.quantity) || 0), 0);
  return {
    hourLabel,
    hourIndex,
    inspectedQty: toNumber(raw.inspectedQty, 0),
    passedQty: toNumber(raw.passedQty, 0),
    defectivePcs: toNumber(raw.defectivePcs, 0),
    afterRepair: toNumber(raw.afterRepair, 0),
    totalDefects,
    selectedDefects,
    line: (raw.line || "").trim(),
    building: (raw.building || "").trim(),
    factory: (raw.factory || "").trim(),
  };
}

// POST /api/hourly-inspections/bulk
// Body: { userId, userName, building, factory, reportDate, entries: [...] }
//
// Every entry is UPSERTED on its natural unique key
// {factory, building, line, reportDate, hourIndex} — NEVER on a client-held
// _id. This is the core fix: whether a row is "create" or "update" is
// decided fresh, server-side, from the exact date/hour/line being
// submitted right now — so a stale or wrongly-mapped _id in client state
// can no longer corrupt a different date's document. That entire bug
// class is eliminated by construction, not by validation.
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const userId = body.userId;
    const userName = body.userName || "User";
    const building = (body.building || "").trim();
    const factory = (body.factory || "").trim();

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ success: false, message: "Valid userId is required." }, { status: 400 });
    }
    if (!building) return NextResponse.json({ success: false, message: "Building is required." }, { status: 400 });
    if (!factory) return NextResponse.json({ success: false, message: "Factory is required." }, { status: 400 });
    if (!body.reportDate) return NextResponse.json({ success: false, message: "reportDate is required." }, { status: 400 });

    const reportDate = startOfDay(body.reportDate);
    const rawEntries = Array.isArray(body.entries) ? body.entries : [];
    if (rawEntries.length === 0) {
      return NextResponse.json({ success: false, message: "No entries provided." }, { status: 400 });
    }

    const ops = [];
    for (const raw of rawEntries) {
      const e = normalizeEntry({ ...raw, building: raw.building || building, factory: raw.factory || factory });

      if (!e.hourLabel || !e.hourIndex || e.hourIndex < 1 || e.hourIndex > 24) {
        return NextResponse.json(
          { success: false, message: `Invalid hour for line ${e.line || "?"}.` },
          { status: 400 }
        );
      }
      if (!e.line) {
        return NextResponse.json({ success: false, message: "Line is required for every entry." }, { status: 400 });
      }

      // This is the ONLY thing that decides identity. reportDate always
      // comes from the server-computed value above, never trusted from
      // any client-supplied id.
      const key = {
        factory: e.factory,
        building: e.building,
        line: e.line,
        reportDate,
        hourIndex: e.hourIndex,
      };

      ops.push({
        updateOne: {
          filter: key,
          update: {
            $set: {
              ...e,
              reportDate,
              user: { id: new mongoose.Types.ObjectId(userId), user_name: userName },
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          upsert: true,
        },
      });
    }

    const result = await HourlyInspectionModel.bulkWrite(ops, { ordered: false });

    return NextResponse.json(
      {
        success: true,
        created: result.upsertedCount || 0,
        updated: result.modifiedCount || 0,
        message: "Bulk hourly entries saved.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /hourly-inspections/bulk error:", err);
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate entry conflict — please refresh and retry." },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}