// app/api/process-names/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/services/mongo";
import mongoose from "mongoose";

// ── Model ─────────────────────────────────────────────────────────────────────
const processNameSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);
const ProcessName =
  mongoose.models.ProcessName ||
  mongoose.model("ProcessName", processNameSchema);

// ── Seed defaults if collection is empty ──────────────────────────────────────
const DEFAULT_PROCESS_NAMES = [
  "BONE POCKET MAKE BY PROFILE",
  "POCKET POINT CUT",
  "POCKET TOP STITCH & 'L' TACK (2) (ONE SIDE)",
  "DART SEWING (2)",
  "FACING ATTACH AT BACK & BACK YOKE HEM",
  "MARKING AT HOOD",
  "LABEL MAKE",
  "LABEL TACK",
  "LOOP MAKE & LOOP ATTACH",
  "VELCRO ATTACH AT BONE & MARKING AT BACK YOKE",
  "YOKE ATTACH AT FRONT (2) & SHOULDER JOIN",
  "SLEEVE ATTACH",
  "MARKING AT HOOD & HOOD 3 PART JOIN WITH ELASTIC",
  "HOOD STITCH",
  "SIDE SEAM SEWING",
  "RAWEDGE CUT",
  "SEAM SEALING AT SIDE SEAM,ARMHOLE & POCKET (ONE SIDE)",
  "SEAM SEALING AT HOOD,COLLAR,SHOULDER & BACK YOKE",
  "ZIPPER TACK,ZIPPER GARD MAKE & ZIPPER ATTACH AT GARD",
  "BODY TURN",
  "THREAD CUT",
  "IRONING",
  "QC CHECK",
  "TRIMMING",
  "PACKING",
];

async function seedIfEmpty() {
  const count = await ProcessName.countDocuments();
  if (count === 0) {
    await ProcessName.insertMany(
      DEFAULT_PROCESS_NAMES.map((name) => ({ name }))
    );
  }
}

// ── GET /api/process-names ────────────────────────────────────────────────────
export async function GET() {
  try {
    await dbConnect();
    await seedIfEmpty();
    const names = await ProcessName.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: names });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── POST /api/process-names  { name }  → add new ──────────────────────────────
export async function POST(request) {
  try {
    await dbConnect();
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: "নাম দেওয়া আবশ্যক।" }, { status: 400 });
    }
    const doc = await ProcessName.create({ name: name.trim().toUpperCase() });
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: "এই process name ইতিমধ্যে আছে।" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── DELETE /api/process-names  { id }  → remove ───────────────────────────────
export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "ID দেওয়া আবশ্যক।" }, { status: 400 });
    }
    await ProcessName.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "মুছে ফেলা হয়েছে।" });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}