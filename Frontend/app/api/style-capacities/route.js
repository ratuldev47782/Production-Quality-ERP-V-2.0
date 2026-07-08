// app/api/style-capacities/route.js
//
// FIX: cycleStartDate is now part of the unique key for upsert.
// The client (LineDailyWorkingBoard) first fetches cycleStartDate from
// /api/style-wip, then passes it here. This guarantees that saving Total
// Input in a new cycle creates a NEW document instead of overwriting the
// previous cycle's capacity.
//
import { dbConnect } from "@/services/mongo";
import { StyleCapacityModel } from "@/models/StyleCapacity-model";

function toNumberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/style-capacities
// Query params: factory, assigned_building, line, buyer, style,
//               cycleStartDate (required for exact-cycle lookup),
//               userId (optional)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const factory           = searchParams.get("factory");
    const assigned_building = searchParams.get("assigned_building");
    const line              = searchParams.get("line");
    const buyer             = searchParams.get("buyer");
    const style             = searchParams.get("style");
    const cycleStartDate    = searchParams.get("cycleStartDate"); // ✅ NEW
    const userId            = searchParams.get("userId");

    const query = {};
    if (factory)           query.factory           = factory;
    if (assigned_building) query.assigned_building  = assigned_building;
    if (line)              query.line              = line;
    if (buyer)             query.buyer             = buyer;
    if (style)             query.style             = style;
    if (cycleStartDate)    query.cycleStartDate    = cycleStartDate; // ✅ NEW
    if (userId)            query["user.id"]        = userId;

    const docs = await StyleCapacityModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ success: true, data: docs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/style-capacities error:", error);
    return Response.json(
      { success: false, message: "Failed to fetch style capacities" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST  /api/style-capacities   →  UPSERT
// Body must include cycleStartDate so each cycle gets its own document.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    await dbConnect();

    const body   = await request.json();
    const errors = [];

    const factory           = body.factory;
    const assigned_building = body.assigned_building;
    const line              = body.line;
    const buyer             = body.buyer;
    const style             = body.style;
    const cycleStartDate    = body.cycleStartDate; // ✅ NEW — required
    const date              = body.date;
    const capacity          = toNumberOrZero(body.capacity);
    const user              = body.user;

    if (!factory)           errors.push("factory is required");
    if (!assigned_building) errors.push("assigned_building is required");
    if (!line)              errors.push("line is required");
    if (!buyer)             errors.push("buyer is required");
    if (!style)             errors.push("style is required");
    if (!cycleStartDate)    errors.push("cycleStartDate is required");  // ✅ NEW
    if (!user || !user.id)  errors.push("user.id is required");
    if (!Number.isFinite(capacity) || capacity < 0)
      errors.push("capacity must be a non-negative number");

    if (errors.length > 0) {
      return Response.json({ success: false, errors }, { status: 400 });
    }

    // ✅ Unique key now includes cycleStartDate — each cycle is isolated.
    const key = {
      factory,
      assigned_building,
      line,
      buyer,
      style,
      cycleStartDate,
    };

    const docToSet = {
      ...key,
      ...(date ? { date } : {}),
      capacity,
      user: {
        id:        user.id,
        user_name: user.user_name,
        role:      user.role,
      },
    };

    const saved = await StyleCapacityModel.findOneAndUpdate(
      key,
      { $set: docToSet },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return Response.json(
      {
        success: true,
        data: saved,
        message: "Capacity saved/updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/style-capacities error:", error);
    return Response.json(
      {
        success: false,
        message: error.message || "Failed to save/update style capacity.",
      },
      { status: 500 }
    );
  }
}