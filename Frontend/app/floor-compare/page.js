// app/floor-compare/page.jsx
"use client";

import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend, BarChart, Bar,
} from "recharts";
import {
  ArrowLeftRight, CalendarDays, Factory, Layers,
  TrendingUp, ShieldCheck, RefreshCw, ChevronUp, ChevronDown, Minus,
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────
const factoryOptions = ["K-1", "K-2", "K-3"];
const buildingOptions = ["", "A-2", "B-2", "A-3", "B-3", "A-4", "B-4", "A-5", "B-5"];
const groupByOptions = [
  { value: "line",     label: "Line-wise" },
  { value: "building", label: "Floor-wise" },
  { value: "segment",  label: "Line + Buyer + Style" },
];
const LINES = Array.from({ length: 15 }, (_, i) => `Line-${i + 1}`);

// ─── helpers ──────────────────────────────────────────────────────────────────
function todayIso()      { return new Date().toISOString().slice(0, 10); }
function daysAgoIso(d)   { const x = new Date(); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); }
function n(v, d = 0)     { const x = Number(v); return Number.isFinite(x) ? x.toFixed(d) : "-"; }
function pct(v, d = 1)   { const x = Number(v); return Number.isFinite(x) ? `${x.toFixed(d)}%` : "-"; }
function numVal(v)        { const x = Number(v); return Number.isFinite(x) ? x : 0; }

// shared dark tooltip (floats on any background)
const tooltipStyle = { backgroundColor: "#020617", border: "1px solid #1f2937", fontSize: 11, color: "#e5e7eb" };

// ─── sub-components ───────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, title, value, sub, accent = "text-slate-800 dark:text-white" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 p-3 shadow-sm">
      <div className="pointer-events-none absolute -inset-8
        bg-[radial-gradient(500px_180px_at_0%_0%,rgba(56,189,248,0.05),transparent),radial-gradient(500px_180px_at_100%_0%,rgba(16,185,129,0.04),transparent)]
        dark:bg-[radial-gradient(700px_240px_at_0%_0%,rgba(56,189,248,0.16),transparent),radial-gradient(700px_240px_at_100%_0%,rgba(16,185,129,0.14),transparent)]" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-300/80 truncate">{title}</div>
          <div className={`mt-1 text-xl font-extrabold tracking-tight tabular-nums ${accent}`}>{value}</div>
          {sub && <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-300/60">{sub}</div>}
        </div>
        {Icon && (
          <div className="shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-500 dark:text-slate-200">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}

// variance badge
function VarBadge({ value }) {
  const v = numVal(value);
  if (v > 0) return <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold"><ChevronUp className="h-3 w-3" />{n(v, 0)}</span>;
  if (v < 0) return <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-semibold"><ChevronDown className="h-3 w-3" />{n(Math.abs(v), 0)}</span>;
  return <span className="inline-flex items-center gap-0.5 text-slate-400"><Minus className="h-3 w-3" />0</span>;
}

// eff% badge colour
function effColor(v) {
  const x = numVal(v);
  if (x >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (x >= 60) return "text-amber-500 dark:text-amber-400";
  return "text-rose-500 dark:text-rose-400";
}

// plan% bar
function PlanBar({ achieved, target }) {
  const pct = numVal(target) > 0 ? Math.min(100, (numVal(achieved) / numVal(target)) * 100) : 0;
  const color = pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-semibold tabular-nums ${pct >= 90 ? "text-emerald-600 dark:text-emerald-400" : pct >= 70 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"}`}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

// rft / dhu / defect pill
function QualPill({ value, type }) {
  const v = numVal(value);
  let color = "text-slate-500 dark:text-slate-400";
  if (type === "rft")  color = v >= 90 ? "text-emerald-600 dark:text-emerald-400" : v >= 75 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400";
  if (type === "dhu")  color = v <= 5  ? "text-emerald-600 dark:text-emerald-400" : v <= 15 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400";
  if (type === "defect") color = v <= 5 ? "text-emerald-600 dark:text-emerald-400" : v <= 15 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400";
  return <span className={`font-semibold tabular-nums ${color}`}>{n(v, 1)}%</span>;
}

// ─── segment grouping helpers ─────────────────────────────────────────────────
function lineSortKey(l = "") { const m = String(l).match(/(\d+)/); return m ? +m[1] : 9999; }

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FloorComparePage() {
  const [factory,    setFactory]    = useState("K-2");
  const [building,   setBuilding]   = useState("");
  const [groupBy,    setGroupBy]    = useState("segment");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [from,       setFrom]       = useState(() => daysAgoIso(4));
  const [to,         setTo]         = useState(() => todayIso());

  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const hasDataRef = useRef(false);
  useEffect(() => { hasDataRef.current = !!data; }, [data]);

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!factory || !from || !to) return;
    let cancelled = false, controller = null, timerId = null;

    const run = async () => {
      if (cancelled) return;
      try { controller?.abort(); } catch {}
      controller = new AbortController();
      const first = !hasDataRef.current;
      try {
        if (first) setLoading(true); else setRefreshing(true);
        setError("");

        const p = new URLSearchParams({ factory, from, to, groupBy, line: lineFilter });
        if (building) p.append("building", building);

        const res  = await fetch(`/api/floor-compare?${p}`, { cache: "no-store", signal: controller.signal });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success) throw new Error(json?.message || "Failed to load");

        if (!cancelled) { setData(json); setLastUpdated(new Date()); }
      } catch (e) {
        if (e?.name === "AbortError") return;
        if (!cancelled) { console.error(e); setError(e?.message || "Error"); }
      } finally {
        if (!cancelled) { setLoading(false); setRefreshing(false); }
      }
    };

    run();
    timerId = setInterval(run, 5000);
    const vis = () => { if (document.visibilityState === "visible") run(); };
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelled = true;
      try { controller?.abort(); } catch {}
      clearInterval(timerId);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [factory, building, from, to, groupBy, lineFilter]);

  // ── derived data ──────────────────────────────────────────────────────────
  const summaryProd = data?.summary?.production || {};
  const summaryQual = data?.summary?.quality    || {};
  const series      = data?.series || [];
  const rows        = data?.rows   || [];
  const metaBuildings = data?.meta?.buildings || [];
  const metaLines     = data?.meta?.lines     || LINES;

  const productionTrend = useMemo(() => series.map((d) => ({
    date:     d.date,
    target:   numVal(d.production?.targetQty),
    achieved: numVal(d.production?.achievedQty),
    variance: numVal(d.production?.varianceQty),
    eff:      numVal(d.production?.effPercent),
  })), [series]);

  const qualityTrend = useMemo(() => series.map((d) => ({
    date:       d.date,
    rft:        numVal(d.quality?.rftPercent),
    dhu:        numVal(d.quality?.dhuPercent),
    defectRate: numVal(d.quality?.defectRatePercent),
  })), [series]);

  // ── segment grouping for table ─────────────────────────────────────────────
  // rows already have building/line/buyer/style from API.
  // For "segment" mode, group them: building → line → [rows]
  const rowsByBuildingLine = useMemo(() => {
    if (groupBy !== "segment") return {};
    const map = {};
    for (const r of rows) {
      const b = r.building || "—";
      const l = r.line    || "—";
      if (!map[b])    map[b]    = {};
      if (!map[b][l]) map[b][l] = [];
      map[b][l].push(r);
    }
    // sort each line's rows by buyer then style
    for (const b of Object.keys(map))
      for (const l of Object.keys(map[b]))
        map[b][l].sort((a, c) => String(a.buyer||"").localeCompare(String(c.buyer||"")) || String(a.style||"").localeCompare(String(c.style||"")));
    return map;
  }, [rows, groupBy]);

  // buildings to render in segment view
  const buildingsToRender = useMemo(() => {
    if (groupBy !== "segment") return [];
    if (building) return [building];
    return metaBuildings.length ? metaBuildings : Object.keys(rowsByBuildingLine);
  }, [groupBy, building, metaBuildings, rowsByBuildingLine]);

  // lines to render per building in segment view (respect lineFilter)
  function linesForBuilding(b) {
    if (lineFilter !== "ALL") return lineFilter ? [lineFilter] : metaLines;
    return metaLines;
  }

  // ── pill class ────────────────────────────────────────────────────────────
  const pill = "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-[1600px] px-3 py-4 space-y-4">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 overflow-hidden">
          <div className="flex flex-wrap lg:flex-nowrap divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/10">

            {/* filters */}
            <div className="w-full lg:w-auto flex-1 p-3">
              <div className="flex flex-wrap items-center gap-2">

                {/* factory */}
                <label className={pill}>
                  <Factory className="h-3.5 w-3.5 text-sky-500 dark:text-sky-300 shrink-0" />
                  <select value={factory} onChange={(e) => setFactory(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer">
                    {factoryOptions.map((f) => <option key={f} value={f} className="bg-white dark:bg-slate-900">{f}</option>)}
                  </select>
                </label>

                {/* floor */}
                <label className={pill}>
                  <Layers className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-300 shrink-0" />
                  <select value={building} onChange={(e) => setBuilding(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer">
                    {buildingOptions.map((b) => (
                      <option key={b || "ALL"} value={b} className="bg-white dark:bg-slate-900">
                        {b || "ALL Floors"}
                      </option>
                    ))}
                  </select>
                </label>

                {/* group by */}
                <label className={pill}>
                  <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer">
                    {groupByOptions.map((o) => <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900">{o.label}</option>)}
                  </select>
                </label>

                {/* line */}
                <label className={pill}>
                  <select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer">
                    <option value="ALL" className="bg-white dark:bg-slate-900">ALL Lines</option>
                    {LINES.map((l) => <option key={l} value={l} className="bg-white dark:bg-slate-900">{l}</option>)}
                  </select>
                </label>

                {/* date range */}
                <label className={pill}>
                  <CalendarDays className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300 shrink-0" />
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-[11px]" />
                  <span className="text-slate-400 text-[10px]">→</span>
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-[11px]" />
                </label>

                <button onClick={() => { setFrom(daysAgoIso(4)); setTo(todayIso()); }}
                  className={`${pill} font-medium`}>
                  Last 5 days
                </button>
              </div>

              {error && (
                <div className="mt-2 rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-[11px] text-red-600 dark:text-red-200">
                  {error}
                </div>
              )}
            </div>

            {/* title + status */}
            <div className="p-3 flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                  <h1 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    Floor Compare
                  </h1>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
                  {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Waiting…"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <KpiCard icon={TrendingUp}  title="Total Target"    value={n(summaryProd.totalTargetQty, 0)}   sub={`Avg/day ${n(summaryProd.avgTargetPerDay, 0)}`} />
          <KpiCard icon={TrendingUp}  title="Total Achieved"  value={n(summaryProd.totalAchievedQty, 0)} sub={`Avg/day ${n(summaryProd.avgAchievedPerDay, 0)}`} />
          <KpiCard icon={TrendingUp}  title="Variance"        value={n(summaryProd.totalVarianceQty, 0)} sub={`${summaryProd.daysCount ?? 0} days`}
            accent={numVal(summaryProd.totalVarianceQty) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
          <KpiCard icon={ShieldCheck} title="Avg Efficiency"  value={pct(summaryProd.avgEffPercent, 1)}  accent={effColor(summaryProd.avgEffPercent)} />
          <KpiCard icon={ShieldCheck} title="Total Inspected" value={n(summaryQual.totalInspected, 0)}   sub={`Defective Pcs ${n(summaryQual.totalDefectivePcs, 0)}`} />
          <KpiCard icon={ShieldCheck} title="Total Passed"    value={n(summaryQual.totalPassed, 0)}      sub={`Total Defects ${n(summaryQual.totalDefects, 0)}`} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <KpiCard icon={ShieldCheck} title="RFT%"        value={pct(summaryQual.rftPercent, 1)}        accent={effColor(summaryQual.rftPercent)} />
          <KpiCard icon={ShieldCheck} title="DHU%"        value={pct(summaryQual.dhuPercent, 1)}        sub={`Total Defects ${n(summaryQual.totalDefects, 0)}`} />
          <KpiCard icon={ShieldCheck} title="Defect Rate%" value={pct(summaryQual.defectRatePercent, 1)} sub={`Defective Pcs ${n(summaryQual.totalDefectivePcs, 0)}`} />
        </div>

        {/* ── CHARTS ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-300/80">Target vs Achieved (Daily)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10, color: "#64748b" }} />
                  <Bar dataKey="target"   name="Target"   fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="achieved" name="Achieved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-300/80">Efficiency Trend (Daily)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v, 1)} />
                  <Legend wrapperStyle={{ fontSize: 10, color: "#64748b" }} />
                  <Line type="monotone" dataKey="eff" name="Eff%" stroke="#eab308" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-300/80">Quality Trend (Daily)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(v, 1)} />
                  <Legend wrapperStyle={{ fontSize: 10, color: "#64748b" }} />
                  <Line type="monotone" dataKey="rft"        name="RFT%"         stroke="#22c55e" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="dhu"        name="DHU%"         stroke="#f97316" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="defectRate" name="Defect Rate%" stroke="#ef4444" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── TABLE ──────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 overflow-hidden">

          {/* table header bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300/80">
                Range Breakdown
              </span>
              <span className="rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold px-2 py-0.5">
                {rows.length} rows
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5">
                {groupByOptions.find((g) => g.value === groupBy)?.label}
              </span>
            </div>
            {loading && !data && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Loading…
              </span>
            )}
          </div>

          {/* legend bar */}
          <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Good (&ge;90% / RFT)</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Moderate</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-rose-500" />Below target</span>
            <span className="flex items-center gap-1 ml-auto">Plan% = Achieved ÷ Target</span>
          </div>

          {/* scrollable wrapper */}
          <div className="overflow-auto max-h-[600px]" style={{ WebkitOverflowScrolling: "touch" }}>
            {rows.length === 0 && !loading ? (
              <div className="px-4 py-10 text-center text-[12px] text-slate-400 dark:text-slate-500">
                No data found for the selected filters.
              </div>
            ) : groupBy === "segment" ? (
              /* ── SEGMENT MODE ─────────────────────────────────────────── */
              <SegmentTable
                buildingsToRender={buildingsToRender}
                linesForBuilding={linesForBuilding}
                rowsByBuildingLine={rowsByBuildingLine}
                factory={factory}
                lineFilter={lineFilter}
              />
            ) : (
              /* ── LINE / BUILDING MODE ─────────────────────────────────── */
              <FlatTable rows={rows} groupBy={groupBy} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── FLAT TABLE (line-wise / building-wise) ────────────────────────────────
function FlatTable({ rows, groupBy }) {
  const isBuilding = groupBy === "building";
  return (
    <table className="w-full text-[11px] border-collapse">
      <thead className="sticky top-0 z-10">
        <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-left">
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10">
            {isBuilding ? "Floor" : "Line"}
          </th>
          {/* production */}
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 border-l border-l-sky-200 dark:border-l-sky-900 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300">Target</th>
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300">Achieved</th>
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300">Variance</th>
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300">Plan%</th>
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 border-r border-r-sky-200 dark:border-r-sky-900 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300">Avg Eff%</th>
          {/* quality */}
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 border-l border-l-emerald-200 dark:border-l-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">Inspected</th>
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">Passed</th>
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">RFT%</th>
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">DHU%</th>
          <th className="px-3 py-2.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-white/10 border-r border-r-emerald-200 dark:border-r-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">Defect Rate%</th>
        </tr>
        {/* group header row */}
        <tr className="bg-slate-50 dark:bg-slate-900/60">
          <td className="px-3 py-1 border-b border-slate-100 dark:border-white/5" />
          <td colSpan={5} className="px-3 py-1 text-[9px] uppercase tracking-wider text-sky-500 dark:text-sky-400 font-semibold border-b border-slate-100 dark:border-white/5 border-l border-l-sky-200 dark:border-l-sky-900">
            Production
          </td>
          <td colSpan={5} className="px-3 py-1 text-[9px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-semibold border-b border-slate-100 dark:border-white/5 border-l border-l-emerald-200 dark:border-l-emerald-900">
            Quality
          </td>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.key || i}
            className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {isBuilding ? (r.building || r.key) : (r.line || r.key)}
            </td>
            {/* production */}
            <td className="px-3 py-2 tabular-nums border-l border-l-sky-100 dark:border-l-sky-900/50">{n(r.production?.targetQty, 0)}</td>
            <td className="px-3 py-2 tabular-nums font-semibold">{n(r.production?.achievedQty, 0)}</td>
            <td className="px-3 py-2 tabular-nums"><VarBadge value={r.production?.varianceQty} /></td>
            <td className="px-3 py-2"><PlanBar achieved={r.production?.achievedQty} target={r.production?.targetQty} /></td>
            <td className="px-3 py-2 tabular-nums border-r border-r-sky-100 dark:border-r-sky-900/50">
              <span className={`font-semibold ${effColor(r.production?.avgEffPercent)}`}>{pct(r.production?.avgEffPercent, 1)}</span>
            </td>
            {/* quality */}
            <td className="px-3 py-2 tabular-nums border-l border-l-emerald-100 dark:border-l-emerald-900/50">{n(r.quality?.totalInspected, 0)}</td>
            <td className="px-3 py-2 tabular-nums">{n(r.quality?.totalPassed, 0)}</td>
            <td className="px-3 py-2 tabular-nums"><QualPill value={r.quality?.rftPercent}        type="rft" /></td>
            <td className="px-3 py-2 tabular-nums"><QualPill value={r.quality?.dhuPercent}        type="dhu" /></td>
            <td className="px-3 py-2 tabular-nums border-r border-r-emerald-100 dark:border-r-emerald-900/50"><QualPill value={r.quality?.defectRatePercent} type="defect" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── SEGMENT TABLE (building → line → buyer/style rows) ───────────────────
function SegmentTable({ buildingsToRender, linesForBuilding, rowsByBuildingLine, factory, lineFilter }) {
  const PROD_COLS = ["Target", "Achieved", "Variance", "Plan%", "Avg Eff%"];
  const QUAL_COLS = ["Inspected", "Passed", "RFT%", "DHU%", "Defect Rate%"];

  return (
    <table className="w-full text-[11px] border-collapse">
      <thead className="sticky top-0 z-10">
        <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-left">
          <th className="px-3 py-2.5 font-semibold border-b border-slate-200 dark:border-white/10 whitespace-nowrap">Floor</th>
          <th className="px-3 py-2.5 font-semibold border-b border-slate-200 dark:border-white/10 whitespace-nowrap">Line</th>
          <th className="px-3 py-2.5 font-semibold border-b border-slate-200 dark:border-white/10 whitespace-nowrap">Buyer</th>
          <th className="px-3 py-2.5 font-semibold border-b border-slate-200 dark:border-white/10 whitespace-nowrap">Style</th>
          {PROD_COLS.map((c) => (
            <th key={c} className="px-3 py-2.5 font-semibold border-b border-slate-200 dark:border-white/10 whitespace-nowrap border-l border-l-sky-200 dark:border-l-sky-900 first-of-type:border-l-sky-200 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300">
              {c}
            </th>
          ))}
          {QUAL_COLS.map((c) => (
            <th key={c} className="px-3 py-2.5 font-semibold border-b border-slate-200 dark:border-white/10 whitespace-nowrap border-l border-l-emerald-200 dark:border-l-emerald-900 first-of-type:border-l-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
              {c}
            </th>
          ))}
        </tr>
        {/* section label row */}
        <tr className="bg-slate-50 dark:bg-slate-900/60">
          <td colSpan={4} className="px-3 py-1 border-b border-slate-100 dark:border-white/5" />
          <td colSpan={5} className="px-3 py-1 text-[9px] uppercase tracking-wider text-sky-500 dark:text-sky-400 font-semibold border-b border-slate-100 dark:border-white/5 border-l border-l-sky-200 dark:border-l-sky-900">Production</td>
          <td colSpan={5} className="px-3 py-1 text-[9px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-semibold border-b border-slate-100 dark:border-white/5 border-l border-l-emerald-200 dark:border-l-emerald-900">Quality</td>
        </tr>
      </thead>
      <tbody>
        {buildingsToRender.map((b) => {
          const lines = linesForBuilding(b);
          return (
            <Fragment key={`b-${b}`}>
              {/* ── building header ── */}
              <tr className="bg-sky-50 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/50">
                <td colSpan={14} className="px-3 py-2 font-extrabold text-sky-700 dark:text-sky-200 text-[12px] tracking-wide">
                  🏢 {factory} · {b}
                </td>
              </tr>

              {lines.map((ln) => {
                // skip if line filter active and doesn't match
                if (lineFilter !== "ALL" && ln !== lineFilter) return null;

                const lineRows = rowsByBuildingLine?.[b]?.[ln] || [];

                return (
                  <Fragment key={`l-${b}-${ln}`}>
                    {/* ── line sub-header ── */}
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
                      <td className="px-3 py-1.5 pl-6 text-slate-400 dark:text-slate-600 text-[10px]">↳</td>
                      <td className="px-3 py-1.5 font-bold text-emerald-700 dark:text-emerald-300 text-[11px] whitespace-nowrap">{ln}</td>
                      <td colSpan={12} className="px-3 py-1.5 text-[10px] text-slate-400 dark:text-slate-500 italic">
                        {lineRows.length === 0 ? "No data" : `${lineRows.length} segment${lineRows.length > 1 ? "s" : ""}`}
                      </td>
                    </tr>

                    {/* ── segment rows ── */}
                    {lineRows.length === 0 ? (
                      <tr className="border-b border-slate-100 dark:border-white/5 bg-white dark:bg-transparent opacity-50">
                        <td className="px-3 py-2 pl-8 text-slate-400 dark:text-slate-600">—</td>
                        <td className="px-3 py-2">{ln}</td>
                        <td className="px-3 py-2 text-slate-400">-</td>
                        <td className="px-3 py-2 text-slate-400">-</td>
                        {[...Array(10)].map((_, i) => <td key={i} className="px-3 py-2 text-slate-400 tabular-nums">0</td>)}
                      </tr>
                    ) : (
                      lineRows.map((r, ri) => (
                        <tr key={r.key || ri}
                          className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent">
                          {/* floor cell — only show on first row of this line */}
                          <td className="px-3 py-2 pl-8 text-slate-400 dark:text-slate-600 text-[10px]">
                            {ri === 0 ? b : ""}
                          </td>
                          <td className="px-3 py-2 text-emerald-700 dark:text-emerald-400 font-semibold whitespace-nowrap">
                            {ri === 0 ? ln : ""}
                          </td>
                          {/* buyer */}
                          <td className="px-3 py-2 max-w-[180px]">
                            <span className="font-semibold text-slate-800 dark:text-white truncate block" title={r.buyer || "-"}>
                              {r.buyer || <span className="text-slate-400 dark:text-slate-600 font-normal">-</span>}
                            </span>
                          </td>
                          {/* style */}
                          <td className="px-3 py-2 max-w-[110px]">
                            <span className="text-slate-600 dark:text-slate-300 truncate block font-mono text-[10px]" title={r.style || "-"}>
                              {r.style || "-"}
                            </span>
                          </td>
                          {/* production */}
                          <td className="px-3 py-2 tabular-nums border-l border-l-sky-100 dark:border-l-sky-900/50">{n(r.production?.targetQty, 0)}</td>
                          <td className="px-3 py-2 tabular-nums font-semibold">{n(r.production?.achievedQty, 0)}</td>
                          <td className="px-3 py-2 tabular-nums"><VarBadge value={r.production?.varianceQty} /></td>
                          <td className="px-3 py-2"><PlanBar achieved={r.production?.achievedQty} target={r.production?.targetQty} /></td>
                          <td className="px-3 py-2 tabular-nums border-r border-r-sky-100 dark:border-r-sky-900/50">
                            <span className={`font-semibold ${effColor(r.production?.avgEffPercent)}`}>{pct(r.production?.avgEffPercent, 1)}</span>
                          </td>
                          {/* quality */}
                          <td className="px-3 py-2 tabular-nums border-l border-l-emerald-100 dark:border-l-emerald-900/50">{n(r.quality?.totalInspected, 0)}</td>
                          <td className="px-3 py-2 tabular-nums">{n(r.quality?.totalPassed, 0)}</td>
                          <td className="px-3 py-2 tabular-nums"><QualPill value={r.quality?.rftPercent}        type="rft" /></td>
                          <td className="px-3 py-2 tabular-nums"><QualPill value={r.quality?.dhuPercent}        type="dhu" /></td>
                          <td className="px-3 py-2 tabular-nums border-r border-r-emerald-100 dark:border-r-emerald-900/50"><QualPill value={r.quality?.defectRatePercent} type="defect" /></td>
                        </tr>
                      ))
                    )}
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}