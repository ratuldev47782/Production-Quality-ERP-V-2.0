// app/api/line-layouts/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/services/mongo";
import { lineLayoutModel } from "@/models/lineLayout-model";

function calcTargets(smv, planEfficiency, operator, helper, seamSealing, workingHours) {
  const manpower = (parseInt(operator) || 0) + (parseInt(helper) || 0) + (parseInt(seamSealing) || 0);
  const e = (parseFloat(planEfficiency) || 0) / 100;
  const s = parseFloat(smv) || 0;
  const h = parseInt(workingHours) || 8;
  if (s === 0 || manpower === 0) return { manpower, oneHourTarget: 0, dailyTarget: 0 };
  const dailyTarget   = Math.round((manpower * h * 60 / s) * e);
  const oneHourTarget = Math.round(dailyTarget / h);
  return { manpower, oneHourTarget, dailyTarget };
}

// Admin and IE roles can create layouts for any factory/floor.
// All other roles are scope-restricted to their assigned factory + assigned_building.
function isUnrestricted(role) {
  return role === "Admin" || role === "IE";
}

// GET /api/line-layouts
// ?factory=K-2&floor=B-3&lineNo=01   → list layouts
// ?serialNumber=SN-001&factory=K-2   → find which layout uses this serial
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const factory      = searchParams.get("factory");
    const floor        = searchParams.get("floor");
    const lineNo       = searchParams.get("lineNo");
    const serialNumber = searchParams.get("serialNumber");

    // ── Serial number lookup ──────────────────────────────────────────────────
    if (serialNumber) {
      const query = {};
      if (factory) query.factory = factory;

      const layouts = await lineLayoutModel.find(query).lean();

      for (const layout of layouts) {
        for (const proc of (layout.processes || [])) {
          const match = (proc.machines || []).find(
            (m) => m.serialNumber && m.serialNumber.toUpperCase() === serialNumber.toUpperCase()
          );
          if (match) {
            return NextResponse.json({
              success: true,
              data: { layout, matchedProcessId: String(proc._id) },
            });
          }
        }
      }

      return NextResponse.json({ success: true, data: null });
    }

    // ── List layouts ──────────────────────────────────────────────────────────
    const query = {};
    if (factory) query.factory = factory;
    if (floor)   query.floor   = floor;
    if (lineNo)  query.lineNo  = lineNo;

    const layouts = await lineLayoutModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: layouts ?? [] });

  } catch (err) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}

// POST /api/line-layouts — create new layout
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      factory, floor, lineNo, buyer, style, item,
      smv, planEfficiency, operator, helper, seamSealing,
      workingHours, sketchUrl, sketchPublicId,   // ← added sketchPublicId
      _authRole, _authFactory, _authBuilding,
    } = body;

    // ── 1. Basic required-field check ─────────────────────────────────────────
    if (!floor || !lineNo || !buyer) {
      return NextResponse.json(
        { success: false, message: "Floor, Line No and Buyer are required." },
        { status: 400 }
      );
    }

    // ── 2. Scope validation (skip for Admin / IE) ─────────────────────────────
    if (!isUnrestricted(_authRole)) {
      if (_authFactory && factory && factory !== _authFactory) {
        return NextResponse.json(
          {
            success: false,
            message: `You are not authorised to create a layout for factory "${factory}". Your assigned factory is "${_authFactory}".`,
          },
          { status: 403 }
        );
      }
      if (_authBuilding && floor && floor !== _authBuilding) {
        return NextResponse.json(
          {
            success: false,
            message: `You are not authorised to create a layout for floor "${floor}". Your assigned building is "${_authBuilding}".`,
          },
          { status: 403 }
        );
      }
    }

    // ── 3. One-layout-per-line check ──────────────────────────────────────────
    const existing = await lineLayoutModel.findOne({
      factory: factory || "",
      floor,
      lineNo,
    }).lean();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `A layout already exists for ${floor} — Line ${lineNo}. Please delete the existing layout before creating a new one.`,
        },
        { status: 409 }
      );
    }

    // ── 4. Create ─────────────────────────────────────────────────────────────
    const { manpower, oneHourTarget, dailyTarget } = calcTargets(
      smv, planEfficiency, operator, helper, seamSealing, workingHours
    );

    const layout = await lineLayoutModel.create({
      factory: factory || "",
      floor, lineNo, buyer, style, item,
      smv:            parseFloat(smv)            || 0,
      planEfficiency: parseFloat(planEfficiency) || 0,
      operator:       parseInt(operator)         || 0,
      helper:         parseInt(helper)           || 0,
      seamSealing:    parseInt(seamSealing)      || 0,
      manpower,
      workingHours:   parseInt(workingHours)     || 8,
      oneHourTarget,
      dailyTarget,
      sketchUrl:      sketchUrl      || "",
      sketchPublicId: sketchPublicId || "",   // ← added
      processes: [],
    });

    return NextResponse.json({ success: true, data: layout }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}