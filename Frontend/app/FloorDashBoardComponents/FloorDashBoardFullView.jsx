// app/FloorDashBoardComponents/FloorDashBoardFullView.jsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  Monitor,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  AlertTriangle,
  Users,
  Package,
  Layers,
} from "lucide-react";

import {
  factoryOptions,
  buildingOptions,
  lineOptions,
  REFRESH_INTERVAL_FULL_MS,
  HEADER_REFRESH_MS,
  clampPercent,
  formatNumber,
  makeSegmentKey,
  makeStyleMediaKey,
  pickLatest,
  sortRowsByLineAndStyle,
  todayKeyDhaka,
  getDefaultFactoryBuilding,
  KpiPie,
} from "./floorDashboardShared";

export default function FloorDashBoardFullView() {
  const { auth } = useAuth();
  const initRef = useRef(false);

  const [factory, setFactory]   = useState("K-2");
  const [building, setBuilding] = useState("A-2");
  const [date, setDate]         = useState(() => todayKeyDhaka());
  const [line, setLine]         = useState("ALL");

  const [rows, setRows]                   = useState([]);
  const [headerMap, setHeaderMap]         = useState({});
  const [styleMediaMap, setStyleMediaMap] = useState({});
  const [wipMap, setWipMap]               = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [refreshTick, setRefreshTick] = useState(0);
  const [headerTick, setHeaderTick]   = useState(0);

  useEffect(() => {
    if (initRef.current) return;
    const { factory: f, building: b } = getDefaultFactoryBuilding(auth);
    setFactory(f || "K-2");
    setBuilding(b || "A-2");
    initRef.current = true;
  }, [auth]);

  const sortedRows = useMemo(() => sortRowsByLineAndStyle(rows), [rows]);

  useEffect(() => {
    const id = setInterval(() => setRefreshTick((p) => p + 1), REFRESH_INTERVAL_FULL_MS);
    const onFocus = () => setRefreshTick((p) => p + 1);
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setHeaderTick((p) => p + 1), HEADER_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!factory || !building || !date) return;
    const controller = new AbortController();
    const fetchDashboard = async () => {
      try {
        setLoading(true); setError("");
        const params = new URLSearchParams({ factory, building, date });
        if (line && line !== "ALL") params.append("line", line);
        const res  = await fetch(`/api/floor-dashboard?${params.toString()}`, { cache: "no-store", signal: controller.signal });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Failed to load dashboard.");
        setRows(json.lines || []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Failed to load dashboard.");
        setRows([]);
      } finally { setLoading(false); }
    };
    fetchDashboard();
    return () => controller.abort();
  }, [factory, building, date, line, refreshTick]);

  useEffect(() => {
    if (!factory || !building || !date) return;
    let cancelled = false;
    const fetchHeaders = async () => {
      try {
        const params = new URLSearchParams({ factory, assigned_building: building, date });
        if (line && line !== "ALL") params.append("line", line);
        const res  = await fetch(`/api/target-setter-header?${params.toString()}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.success) { if (!cancelled) setHeaderMap({}); return; }
        const list = json.data || json.headers || json.items || [];
        const map  = {};
        for (const h of list) {
          const segKey = makeSegmentKey(h.line, h.buyer, h.style);
          map[segKey]  = map[segKey] ? pickLatest(map[segKey], h) : h;
        }
        if (!cancelled) setHeaderMap(map);
      } catch (e) { console.error(e); if (!cancelled) setHeaderMap({}); }
    };
    fetchHeaders();
    return () => { cancelled = true; };
  }, [factory, building, date, line, headerTick]);

  useEffect(() => {
    if (!factory || !building || !date) return;
    let cancelled = false;
    const fetchMedia = async () => {
      try {
        const params = new URLSearchParams({ factory, assigned_building: building, date });
        const res    = await fetch(`/api/style-media?${params.toString()}`, { cache: "no-store" });
        const json   = await res.json();
        if (!res.ok || !json.success) { if (!cancelled) setStyleMediaMap({}); return; }
        const list = json.data || [];
        const map  = {};
        for (const doc of list) {
          const buyer      = doc?.buyer || "";
          const style      = doc?.style || "";
          const colorModel = doc?.color_model || doc?.colorModel || doc?.color || "";
          const k          = makeStyleMediaKey(factory, building, buyer, style, colorModel);
          if (!map[k]) map[k] = doc;
        }
        if (!cancelled) setStyleMediaMap(map);
      } catch (e) { console.error(e); if (!cancelled) setStyleMediaMap({}); }
    };
    fetchMedia();
    return () => { cancelled = true; };
  }, [factory, building, date]);

  useEffect(() => {
    if (!factory || !building || !date || sortedRows.length === 0) { setWipMap({}); return; }
    let cancelled = false;
    const fetchWipAll = async () => {
      const newMap = {};
      const tasks = sortedRows.map((row) => async () => {
        const segKey = makeSegmentKey(row.line, row.buyer, row.style);
        const header = headerMap[segKey];
        const buyer  = header?.buyer || row.buyer || "";
        const style  = header?.style || row.style || "";
        if (!row.line || !buyer || !style) return;
        const params = new URLSearchParams({ factory, assigned_building: building, line: row.line, buyer, style, date });
        try {
          const res  = await fetch(`/api/style-wip?${params.toString()}`, { cache: "no-store" });
          const json = await res.json();
          if (res.ok && json.success) newMap[segKey] = json.data;
        } catch (e) { console.error(e); }
      });
      const limit = 5;
      let i = 0;
      const runWorker = async () => { while (i < tasks.length) { const idx = i++; await tasks[idx](); } };
      await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, runWorker));
      if (!cancelled) setWipMap(newMap);
    };
    fetchWipAll();
    return () => { cancelled = true; };
  }, [factory, building, date, sortedRows, headerMap, refreshTick]);

  const hasData = sortedRows.length > 0;

  return (
    /* ── ROOT ──
       Light: warm cream/amber industrial feel  #faf7f2 base
       Dark:  deep slate cosmos unchanged
    */
    <div className="
      h-screen overflow-hidden py-1.5 px-2
      bg-gradient-to-b from-[#faf7f2] via-[#f5f0e8] to-[#ede8df]
      dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
      text-stone-900
      dark:text-slate-50
    ">
      <div className="max-w-[1700px] mx-auto flex flex-col gap-2 h-full">

        {/* ── Filter Panel ── */}
        <div className="
          rounded-xl border shadow-sm
          bg-white/80 border-amber-200/80
          dark:bg-white/5 dark:border-slate-800/80 dark:shadow-[0_8px_28px_rgba(0,0,0,0.9)]
        ">
          <div className="p-2 md:p-2.5 text-xs space-y-2">
            <div className="flex flex-wrap items-end gap-3">

              {/* Factory */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-100">
                  Factory
                </label>
                <select
                  className="
                    select select-xs select-bordered min-w-[120px]
                    bg-amber-50 border-amber-300 text-stone-800
                    dark:bg-amber-300/95 dark:text-slate-900 dark:border-transparent
                  "
                  value={factory} onChange={(e) => setFactory(e.target.value)}
                >
                  {factoryOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Floor */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-100">
                  Floor
                </label>
                <select
                  className="
                    select select-xs select-bordered min-w-[120px]
                    bg-amber-50 border-amber-300 text-stone-800
                    dark:bg-amber-300/95 dark:text-slate-900 dark:border-transparent
                  "
                  value={building} onChange={(e) => setBuilding(e.target.value)}
                >
                  {buildingOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-100">
                  Date
                </label>
                <input
                  type="date"
                  className="
                    input input-xs input-bordered
                    bg-amber-50 border-amber-300 text-stone-800
                    dark:bg-amber-300/95 dark:text-slate-900 dark:border-transparent
                  "
                  value={date} onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Line */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-100">
                  Line
                </label>
                <select
                  className="
                    select select-xs select-bordered min-w-[110px]
                    bg-amber-50 border-amber-300 text-stone-800
                    dark:bg-amber-300/95 dark:text-slate-900 dark:border-transparent
                  "
                  value={line} onChange={(e) => setLine(e.target.value)}
                >
                  {lineOptions.map((ln) => <option key={ln} value={ln}>{ln}</option>)}
                </select>
              </div>

              {/* View toggles */}
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href="/floor-dashboard"
                  className="
                    group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                    bg-cyan-600 border border-cyan-500 text-white
                    hover:bg-cyan-500 hover:shadow-[0_0_16px_rgba(34,211,238,0.4)]
                    dark:bg-cyan-600 dark:border-cyan-400 dark:text-slate-950
                    dark:hover:bg-cyan-500 dark:hover:shadow-[0_0_16px_rgba(34,211,238,0.5)]
                    transition-all duration-200 text-[11px] font-semibold uppercase tracking-wide
                  "
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>TV View</span>
                </Link>
                <Link
                  href="/floor-dashboard/full"
                  className="
                    inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                    bg-amber-100 border border-amber-300 text-amber-800
                    hover:bg-amber-200 hover:border-amber-400
                    dark:bg-slate-800/80 dark:border-slate-600 dark:text-slate-100
                    dark:hover:bg-violet-600/90 dark:hover:border-violet-400 dark:hover:text-white
                    transition-all duration-200 text-[11px] font-semibold uppercase tracking-wide
                  "
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Full View</span>
                </Link>
              </div>

              {loading && (
                <span className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-slate-400">
                  <span className="loading loading-spinner loading-xs" /> Auto updating...
                </span>
              )}
            </div>
            {error && <div className="alert alert-error py-1 px-2 text-[11px]"><span>{error}</span></div>}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {!hasData && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="
                w-10 h-10 rounded-2xl border-2 border-dashed flex items-center justify-center
                border-amber-300 dark:border-slate-700
              ">
                <LayoutGrid className="h-5 w-5 text-amber-400 dark:text-slate-600" />
              </div>
              <p className="text-[11px] text-stone-400 dark:text-slate-500">No data for this factory/building/date yet.</p>
            </div>
          )}
          {hasData && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 pb-2">
              {sortedRows.map((row) => {
                const segKey = makeSegmentKey(row.line, row.buyer, row.style);
                const header = headerMap[segKey];
                const buyerForMedia = header?.buyer      || row?.buyer || "";
                const styleForMedia = header?.style      || row?.style || "";
                const colorForMedia =
                  header?.color_model      || header?.colorModel ||
                  header?.color            || header?.color_model_name ||
                  row?.colorModel          || row?.color || "";
                const mediaKey = makeStyleMediaKey(factory, building, buyerForMedia, styleForMedia, colorForMedia);
                return (
                  <LineCard
                    key={`${segKey}__${colorForMedia || ""}`}
                    lineData={row}
                    header={header}
                    styleMedia={styleMediaMap[mediaKey]}
                    wipData={wipMap[segKey]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LINE CARD
   Light: warm white card, amber/stone accents, ink text
   Dark:  deep slate card, glow accents (unchanged feel)
══════════════════════════════════════════════════════ */
function LineCard({ lineData, header, styleMedia, wipData }) {
  const { line, quality, production } = lineData || {};

  const buyer      = header?.buyer      || lineData?.buyer || "-";
  const style      = header?.style      || lineData?.style || "-";
  const runDay     = header?.run_day    ?? header?.runDay  ?? "-";
  const smv        = header?.smv ?? "-";
  const item       = header?.Item       || header?.item    || lineData?.Item || "-";
  const colorModel = header?.color_model || header?.colorModel || header?.color || "-";

  const imageSrc = styleMedia?.imageSrc || "";
  const videoSrc = styleMedia?.videoSrc || "";

  const targetQty   = production?.targetQty   ?? 0;
  const achievedQty = production?.achievedQty  ?? 0;
  const rawPlan     = targetQty > 0 ? (achievedQty / targetQty) * 100 : 0;
  const planPercent = clampPercent(rawPlan);
  const varianceQty = production?.varianceQty  ?? 0;

  const prevWorkingDate        = production?.prevWorkingDate        || null;
  const prevWorkingAchievedQty = production?.prevWorkingAchievedQty ?? 0;

  const rft        = clampPercent(quality?.rftPercent        ?? 0);
  const dhu        = clampPercent(quality?.dhuPercent        ?? 0);
  const defectRate = clampPercent(quality?.defectRatePercent ?? 0);

  const hourlyEff = clampPercent(production?.currentHourEfficiency ?? 0);
  const avgEff    = clampPercent(production?.avgEffPercent         ?? 0);

  const qualityHourLabel = quality?.currentHour    ?? "-";
  const prodHourLabel    = production?.currentHour ?? "-";

  const manpowerPresent =
    production?.manpowerPresent ?? header?.manpower_present ?? header?.manpowerPresent ?? 0;

  const wip = wipData?.wip ?? 0;

  const planColor =
    planPercent >= 90 ? "#16a34a" : planPercent >= 60 ? "#d97706" : "#dc2626";
  const planColorDark =
    planPercent >= 90 ? "#34d399" : planPercent >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="
      relative flex flex-col rounded-2xl overflow-hidden
      transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01]
      border-2
      bg-white border-stone-200 shadow-[0_2px_12px_rgba(120,90,40,0.08)]
      hover:border-amber-300 hover:shadow-[0_4px_20px_rgba(180,120,40,0.13)]
      dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950
      dark:border-slate-700/50 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
      dark:hover:border-slate-600 dark:hover:shadow-[0_6px_28px_rgba(0,0,0,0.5)]
    ">
      {/* top accent stripe */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-orange-300 to-amber-400 dark:hidden" />

      {/* dark ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 hidden dark:block bg-[radial-gradient(600px_300px_at_50%_0%,rgba(52,211,153,0.08),transparent)]" />

      {/* ── HEADER: Line + Plan% ── */}
      <div className="
        flex items-center justify-between px-3 py-2 border-b
        bg-amber-50/80 border-amber-100
        dark:bg-slate-800/50 dark:border-slate-700/40
      ">
        <div className="flex items-center gap-2">
          <div className="
            flex items-center justify-center w-9 h-9 rounded-xl font-black text-sm border
            bg-sky-100 border-sky-300 text-sky-700
            dark:bg-sky-500/20 dark:border-sky-400/50 dark:text-sky-300
          ">
            {String(line).replace(/\D/g, "") || "—"}
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-widest text-stone-400 dark:text-slate-500 leading-none">Line</div>
            <div className="text-[12px] font-bold text-sky-700 dark:text-sky-300 leading-tight">{line}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* pie uses inline style colors so it adapts automatically via planColor/planColorDark */}
          <KpiPie value={planPercent} label="" color={planColor} size={38} animate={true} className="dark:hidden" />
          <KpiPie value={planPercent} label="" color={planColorDark} size={38} animate={true} className="hidden dark:block" />
          <div className="text-right">
            <div className="text-[8px] uppercase tracking-wide text-stone-400 dark:text-slate-500">Plan</div>
            <div className="text-[13px] font-black tabular-nums dark:hidden" style={{ color: planColor }}>
              {formatNumber(planPercent, 0)}%
            </div>
            <div className="text-[13px] font-black tabular-nums hidden dark:block" style={{ color: planColorDark }}>
              {formatNumber(planPercent, 0)}%
            </div>
          </div>
        </div>
      </div>

      {/* ── META TAGS ── */}
      <div className="px-2.5 pt-2 pb-1 flex flex-wrap gap-1">
        <MetaBadge color="amber"   label="Buyer"   value={buyer}      />
        <MetaBadge color="fuchsia" label="Style"   value={style}      />
        <MetaBadge color="sky"     label="Item"    value={item}       />
        <MetaBadge color="emerald" label="Color"   value={colorModel} />
        <MetaBadge color="violet"  label="SMV"     value={smv}        />
        <MetaBadge color="teal"    label="Run Day" value={runDay}     />
      </div>

      {/* ── PLAN NUMBERS ── */}
      <div className="
        mx-2.5 rounded-xl border overflow-hidden mb-2
        border-sky-200 bg-sky-50/60
        dark:border-sky-500/30 dark:bg-sky-950/40
      ">
        <div className="
          grid grid-cols-4 divide-x
          divide-sky-200 dark:divide-sky-500/20
        ">
          <PlanCell label="Target"   value={formatNumber(targetQty, 0)}   tone="sky"     />
          <PlanCell label="Achieved" value={formatNumber(achievedQty, 0)} tone="emerald" />
          <PlanCell
            label="Variance"
            value={formatNumber(varianceQty, 0)}
            tone={varianceQty >= 0 ? "emerald" : "rose"}
            icon={varianceQty >= 0 ? TrendingUp : TrendingDown}
          />
          <PlanCell label="Last Day" sublabel={prevWorkingDate} value={formatNumber(prevWorkingAchievedQty, 0)} tone="slate" />
        </div>
        {/* progress bar */}
        <div className="h-1 w-full bg-sky-100 dark:bg-slate-800">
          <div
            className="h-full transition-all duration-700 rounded-full"
            style={{ width: `${planPercent}%`, background: planPercent >= 90 ? "#16a34a" : planPercent >= 60 ? "#d97706" : "#dc2626" }}
          />
        </div>
      </div>

      {/* ── MANPOWER + WIP ── */}
      <div className="px-2.5 flex gap-1.5 mb-2">
        <div className="
          flex-1 flex items-center gap-1.5 rounded-lg border px-2 py-1.5
          bg-emerald-50 border-emerald-200
          dark:bg-slate-800/40 dark:border-slate-700/60
        ">
          <Users className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <div className="text-[8px] uppercase tracking-wide text-stone-400 dark:text-slate-500 leading-none">Manpower</div>
            <div className="text-[12px] font-bold text-emerald-700 dark:text-emerald-300 leading-tight">{manpowerPresent || "—"}</div>
          </div>
        </div>
        {wip > 0 && (
          <div className="
            flex-1 flex items-center gap-1.5 rounded-lg border px-2 py-1.5
            bg-cyan-50 border-cyan-200
            dark:bg-cyan-950/40 dark:border-cyan-600/50
          ">
            <Package className="h-3 w-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <div>
              <div className="text-[8px] uppercase tracking-wide text-stone-400 dark:text-slate-500 leading-none">WIP</div>
              <div className="text-[12px] font-bold text-cyan-700 dark:text-cyan-300 leading-tight">{formatNumber(wip, 0)}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── QUALITY ── */}
      <div className="
        mx-2.5 mb-2 rounded-xl border overflow-hidden
        border-amber-200 dark:border-slate-700/50
      ">
        <div className="
          flex items-center justify-between px-2.5 py-1 border-b
          bg-amber-50 border-amber-200
          dark:bg-slate-800/50 dark:border-slate-700/40
        ">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-amber-700 dark:text-amber-200">Quality</span>
          </div>
          <span className="text-[8px] text-emerald-600 dark:text-emerald-300 font-semibold">Q:{qualityHourLabel}</span>
        </div>
        <div className="
          grid grid-cols-3 divide-x
          divide-amber-100 bg-white
          dark:divide-slate-700/40 dark:bg-slate-900/60
        ">
          <QualityCell label="RFT%"    value={rft}        color="#16a34a" darkColor="#22c55e" />
          <QualityCell label="DHU%"    value={dhu}        color="#ea580c" darkColor="#f97316" />
          <QualityCell label="Defect%" value={defectRate} color="#dc2626" darkColor="#e11d48" />
        </div>
      </div>

      {/* ── EFFICIENCY ── */}
      <div className="
        mx-2.5 mb-2 rounded-xl border overflow-hidden
        border-sky-200 dark:border-slate-700/50
      ">
        <div className="
          flex items-center justify-between px-2.5 py-1 border-b
          bg-sky-50 border-sky-200
          dark:bg-slate-800/50 dark:border-slate-700/40
        ">
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3 text-sky-600 dark:text-sky-400" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-sky-700 dark:text-sky-200">Efficiency</span>
          </div>
          <span className="text-[8px] text-sky-600 dark:text-sky-300 font-semibold">P:{prodHourLabel}</span>
        </div>
        <div className="
          grid grid-cols-2 divide-x
          divide-sky-100 bg-white
          dark:divide-slate-700/40 dark:bg-slate-900/60
        ">
          <QualityCell label="Hourly Eff%" value={hourlyEff} color="#0369a1" darkColor="#0ea5e9" />
          <QualityCell label="Avg Eff%"    value={avgEff}    color="#4f46e5" darkColor="#6366f1" />
        </div>
      </div>

      {/* ── MEDIA ── */}
      {(imageSrc || videoSrc) && (
        <div className="mx-2.5 mb-2.5 grid grid-cols-2 gap-1.5">
          {imageSrc && (
            <div className="rounded-xl border overflow-hidden border-cyan-300 dark:border-cyan-500/50">
              <div className="
                flex items-center gap-1 px-2 py-0.5 text-[8px] uppercase tracking-widest border-b
                text-cyan-700 bg-cyan-50 border-cyan-200
                dark:text-cyan-300 dark:bg-cyan-500/10 dark:border-cyan-500/20
              ">
                <Layers className="h-2.5 w-2.5" />
                <span>Image</span>
              </div>
              <div className="h-20 bg-stone-100 dark:bg-black/90 flex items-center justify-center overflow-hidden">
                <img src={imageSrc} alt={`${line} image`} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {videoSrc && (
            <div className="rounded-xl border overflow-hidden border-emerald-300 dark:border-emerald-500/50">
              <div className="
                flex items-center gap-1 px-2 py-0.5 text-[8px] uppercase tracking-widest border-b
                text-emerald-700 bg-emerald-50 border-emerald-200
                dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20
              ">
                <Activity className="h-2.5 w-2.5" />
                <span>Video</span>
              </div>
              <div className="h-20 bg-stone-100 dark:bg-black/90 flex items-center justify-center overflow-hidden">
                <video src={videoSrc} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="none" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BOTTOM STATUS ── */}
      <div className="
        mt-auto px-3 py-1.5 flex items-center justify-between text-[9px] border-t
        bg-amber-50/60 border-amber-100
        dark:bg-slate-800/40 dark:border-slate-700/30
      ">
        <span className="font-bold uppercase tracking-widest flex items-center gap-1 text-sky-700 dark:text-sky-400">
          <Gauge className="h-3 w-3" />
          Status
        </span>
        <span className="text-stone-400 dark:text-slate-500 tabular-nums">
          {formatNumber(achievedQty, 0)} / {formatNumber(targetQty, 0)}
        </span>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function MetaBadge({ color, label, value }) {
  // Light: warm tinted badges   Dark: translucent glow badges
  const light = {
    amber:   "border-amber-300   bg-amber-50   text-amber-800",
    fuchsia: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800",
    sky:     "border-sky-300     bg-sky-50     text-sky-800",
    emerald: "border-emerald-300 bg-emerald-50 text-emerald-800",
    violet:  "border-violet-300  bg-violet-50  text-violet-800",
    teal:    "border-teal-300    bg-teal-50    text-teal-800",
  };
  const dark = {
    amber:   "dark:border-amber-500/40   dark:bg-amber-500/8   dark:text-amber-200",
    fuchsia: "dark:border-fuchsia-500/40 dark:bg-fuchsia-500/8 dark:text-fuchsia-200",
    sky:     "dark:border-sky-500/40     dark:bg-sky-500/8     dark:text-sky-200",
    emerald: "dark:border-emerald-500/40 dark:bg-emerald-500/8 dark:text-emerald-200",
    violet:  "dark:border-violet-500/40  dark:bg-violet-500/8  dark:text-violet-200",
    teal:    "dark:border-teal-500/40    dark:bg-teal-500/8    dark:text-teal-200",
  };
  const c = color in light ? color : "sky";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[8px] leading-tight font-medium ${light[c]} ${dark[c]}`}>
      <span className="opacity-60">{label}:</span>
      <span className="font-bold truncate max-w-[80px]">{value}</span>
    </span>
  );
}

function PlanCell({ label, sublabel, value, tone, icon: Icon }) {
  const lightTones = { sky: "text-sky-700", emerald: "text-emerald-700", rose: "text-rose-600", slate: "text-stone-600" };
  const darkTones  = { sky: "dark:text-sky-300", emerald: "dark:text-emerald-300", rose: "dark:text-rose-400", slate: "dark:text-slate-300" };
  const t = tone in lightTones ? tone : "slate";
  return (
    <div className="flex flex-col items-center py-1.5 px-1 gap-0.5">
      <div className={`text-[7px] uppercase tracking-wider leading-none flex items-center gap-0.5 text-stone-400 dark:text-slate-500`}>
        {Icon && <Icon className={`h-2.5 w-2.5 ${lightTones[t]} ${darkTones[t]}`} />}
        {label}
        {sublabel && <span className="opacity-60 normal-case">({sublabel})</span>}
      </div>
      <div className={`text-[13px] font-black tabular-nums leading-none ${lightTones[t]} ${darkTones[t]}`}>
        {value}
      </div>
    </div>
  );
}

function QualityCell({ label, value, color, darkColor }) {
  const pct = clampPercent(value);
  // KpiPie uses inline color — render two versions, hide via CSS
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5">
      <span className="dark:hidden">
        <KpiPie value={pct} label="" color={color} size={28} animate={true} />
      </span>
      <span className="hidden dark:inline-flex">
        <KpiPie value={pct} label="" color={darkColor || color} size={28} animate={true} />
      </span>
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[7.5px] uppercase tracking-wide text-stone-400 dark:text-slate-500 truncate">{label}</span>
        <span className="text-[12px] font-black text-stone-800 dark:text-slate-100 tabular-nums">{formatNumber(pct, 1)}%</span>
      </div>
    </div>
  );
}