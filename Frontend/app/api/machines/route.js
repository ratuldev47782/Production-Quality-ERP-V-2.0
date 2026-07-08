// app/api/machines/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/services/mongo";
import { machineModel } from "@/models/machine-model";

// ─── Floor name normalization ─────────────────────────────────────────────────
const FLOOR_NORMALIZE_MAP = {
  "a2": "A-2", "a-2": "A-2", "A2": "A-2",
  "b2": "B-2", "b-2": "B-2", "B2": "B-2",
  "a3": "A-3", "a-3": "A-3", "A3": "A-3",
  "b3": "B-3", "b-3": "B-3", "B3": "B-3",
  "a4": "A-4", "a-4": "A-4", "A4": "A-4",
  "b4": "B-4", "b-4": "B-4", "B4": "B-4",
  "a5": "A-5", "a-5": "A-5", "A5": "A-5",
  "b5": "B-5", "b-5": "B-5", "B5": "B-5",
  "a6": "A-6", "a-6": "A-6", "A6": "A-6",
  "b6": "B-6", "b-6": "B-6", "B6": "B-6",
  "c4": "C-4", "c-4": "C-4", "C4": "C-4",
  "k3": "K-3", "k-3": "K-3", "K3": "K-3",
  "smd/cad": "SMD/CAD", "smd/Cad": "SMD/CAD",
  "SMD/Cad": "SMD/CAD", "smdcad": "SMD/CAD", "SMDCAD": "SMD/CAD",
};

function normalizeFloor(raw) {
  if (!raw) return raw;
  const trimmed = raw.trim();
  return FLOOR_NORMALIZE_MAP[trimmed]
      ?? FLOOR_NORMALIZE_MAP[trimmed.toLowerCase()]
      ?? trimmed;
}

// ─── GET /api/machines ────────────────────────────────────────────────────────
// ?factory=K-2              → list all machines for factory
// ?factory=K-2&name=SINGLE  → single machine detail (for form pre-fill)
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const name    = searchParams.get("name");
    const factory = searchParams.get("factory");

    if (name) {
      const query = { machineName: name };
      if (factory) query.factory = factory;
      const machine = await machineModel.findOne(query).lean();
      if (!machine)
        return NextResponse.json({ success: false, data: null }, { status: 404 });
      return NextResponse.json({ success: true, data: machine });
    }

    const query = {};
    if (factory) query.factory = factory;
    const machines = await machineModel.find(query).lean();
    return NextResponse.json({ success: true, data: machines ?? [] });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

// ─── POST /api/machines ───────────────────────────────────────────────────────
// Body: { factory, machineName, serialNumber, floorName, status }
// Behaviour:
//   • If serialNumber already exists in this machine → update floorName + status
//   • If serialNumber is new → add unit to machine's units array
//   • If machine itself doesn't exist → create it
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { factory, machineName, serialNumber, status } = body;
    const floorName = normalizeFloor(body.floorName);

    if (!machineName || !floorName || !serialNumber || !status) {
      return NextResponse.json(
        { success: false, message: "machineName, serialNumber, floorName এবং status দেওয়া আবশ্যক।" },
        { status: 400 }
      );
    }

    const validStatuses = ["Running", "Idle", "Repairable", "Damage"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `status অবশ্যই ${validStatuses.join(", ")} এর মধ্যে একটি হতে হবে।` },
        { status: 400 }
      );
    }

    const matchQuery = { machineName };
    if (factory) matchQuery.factory = factory;

    let machine = await machineModel.findOne(matchQuery);

    if (!machine) {
      // Create new machine with first unit
      machine = await machineModel.create({
        factory:  factory || "",
        machineName,
        units: [{ serialNumber, floorName, status }],
      });
      return NextResponse.json(
        { success: true, message: "Machine তৈরি হয়েছে।", data: machine },
        { status: 201 }
      );
    }

    // Find existing unit by serialNumber
    const unitIdx = machine.units.findIndex(
      (u) => u.serialNumber === serialNumber
    );

    if (unitIdx >= 0) {
      // Update existing unit — update floor and status
      machine.units[unitIdx].floorName = floorName;
      machine.units[unitIdx].status    = status;
    } else {
      // Add new unit
      machine.units.push({ serialNumber, floorName, status });
    }

    await machine.save();
    return NextResponse.json({
      success: true,
      message: unitIdx >= 0 ? "Machine unit আপডেট হয়েছে।" : "নতুন Machine unit যোগ হয়েছে।",
      data: machine,
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to save" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/machines ─────────────────────────────────────────────────────
// Body: { factory, machineName, serialNumber }
export async function DELETE(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { factory, machineName, serialNumber } = body;

    if (!machineName || !serialNumber) {
      return NextResponse.json(
        { success: false, message: "machineName এবং serialNumber দেওয়া আবশ্যক।" },
        { status: 400 }
      );
    }

    const matchQuery = { machineName };
    if (factory) matchQuery.factory = factory;

    const machine = await machineModel.findOne(matchQuery);
    if (!machine) {
      return NextResponse.json({ success: false, message: "Machine পাওয়া যায়নি।" }, { status: 404 });
    }

    const before = machine.units.length;
    machine.units = machine.units.filter((u) => u.serialNumber !== serialNumber);

    if (machine.units.length === before) {
      return NextResponse.json({ success: false, message: "Serial number পাওয়া যায়নি।" }, { status: 404 });
    }

    await machine.save();
    return NextResponse.json({ success: true, message: "Machine unit মুছে ফেলা হয়েছে।" });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to delete" },
      { status: 500 }
    );
  }
}