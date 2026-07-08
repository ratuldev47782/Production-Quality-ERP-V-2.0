//app\QualityComponents\QualityTable.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

const HOUR_COLUMNS = [
  "1st Hour","2nd Hour","3rd Hour","4th Hour","5th Hour","6th Hour",
  "7th Hour","8th Hour","9th Hour","10th Hour","11th Hour","12th Hour",
];

const STATIC_LINE_OPTIONS = [
  "Line-1","Line-2","Line-3","Line-4","Line-5","Line-6","Line-7","Line-8",
  "Line-9","Line-10","Line-11","Line-12","Line-13","Line-14","Line-15",
];

function formatDateInput(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toLocalDateLabelFromInput(inputValue) {
  if (!inputValue) return "";
  const d = new Date(inputValue + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export default function QualityTable() {
  const { auth } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput());
  const [selectedLine, setSelectedLine] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [toast, setToast] = useState(null);

  const building = useMemo(() => auth?.assigned_building || auth?.building || "", [auth]);
  const factory  = useMemo(() => auth?.factory || auth?.assigned_factory || "", [auth]);
  const viewingDateLabel = useMemo(() => toLocalDateLabelFromInput(selectedDate), [selectedDate]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSummary = async () => {
    if (!building || !factory) {
      setRows([]);
      setError("No building or factory is assigned to your account.");
      return;
    }
    try {
      setLoading(true); setError("");
      const dateIso = new Date(selectedDate + "T00:00:00").toISOString();
      let url = `/api/hourly-inspections?date=${encodeURIComponent(dateIso)}&limit=1000`;
      url += `&building=${encodeURIComponent(building)}`;
      url += `&factory=${encodeURIComponent(factory)}`;
      const res  = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load summary");
      setRows(json?.data || []);
    } catch (e) {
      setError(e.message || "Failed to load summary");
      showToast(e.message || "Failed to load summary", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!auth) return;
    fetchSummary();
    if (!autoRefresh) return;
    const id = setInterval(() => fetchSummary(), 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, selectedDate, building, autoRefresh]);

  const lineOptions = useMemo(() => {
    const set = new Set(STATIC_LINE_OPTIONS);
    rows.forEach((r) => { if (r.line) set.add(r.line); });
    return Array.from(set);
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!selectedLine) return rows;
    return rows.filter((r) => r.line === selectedLine);
  }, [rows, selectedLine]);

  const defectRows = useMemo(() => {
    const map = {};
    filteredRows.forEach((row) => {
      const hourLabel = row.hourLabel || row.hour;
      if (!Array.isArray(row.selectedDefects)) return;
      row.selectedDefects.forEach((d) => {
        if (!d?.name) return;
        const name = d.name;
        const qty  = Number(d.quantity || 0);
        if (!map[name]) map[name] = { name, perHour: {}, total: 0 };
        if (hourLabel) map[name].perHour[hourLabel] = (map[name].perHour[hourLabel] || 0) + qty;
        map[name].total += qty;
      });
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredRows]);

  const {
    perHourInspected, perHourPassed, perHourAfterRepair, perHourDefectivePieces, perHourDefects,
    totalInspected, totalPassed, totalAfterRepair, totalDefectivePieces, totalDefectsAll,
    defectiveRatePerHour, rftPerHour, dhuPerHour,
    defectiveRateTotal, rftTotal, dhuTotal,
  } = useMemo(() => {
    const perHourInspected = {}, perHourPassed = {}, perHourAfterRepair = {},
          perHourDefectivePieces = {}, perHourDefects = {};
    HOUR_COLUMNS.forEach((h) => {
      perHourInspected[h] = 0; perHourPassed[h] = 0; perHourAfterRepair[h] = 0;
      perHourDefectivePieces[h] = 0; perHourDefects[h] = 0;
    });
    let totalInspected = 0, totalPassed = 0, totalAfterRepair = 0,
        totalDefectivePieces = 0, totalDefectsAll = 0;
    filteredRows.forEach((r) => {
      const hourLabel = r.hourLabel || r.hour;
      if (!HOUR_COLUMNS.includes(hourLabel)) return;
      const inspected = Number(r.inspectedQty || 0);
      const passed    = Number(r.passedQty    || 0);
      const afterRepair = Number(r.afterRepair || 0);
      const defective = Number(r.defectivePcs || 0);
      perHourInspected[hourLabel] += inspected; perHourPassed[hourLabel] += passed;
      perHourAfterRepair[hourLabel] += afterRepair; perHourDefectivePieces[hourLabel] += defective;
      totalInspected += inspected; totalPassed += passed;
      totalAfterRepair += afterRepair; totalDefectivePieces += defective;
      let defectsThisRow = 0;
      if (Array.isArray(r.selectedDefects))
        defectsThisRow = r.selectedDefects.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
      perHourDefects[hourLabel] += defectsThisRow;
      totalDefectsAll += defectsThisRow;
    });
    const defectiveRatePerHour = {}, rftPerHour = {}, dhuPerHour = {};
    HOUR_COLUMNS.forEach((h) => {
      const ins = perHourInspected[h], def = perHourDefectivePieces[h], defs = perHourDefects[h];
      defectiveRatePerHour[h] = ins > 0 ? ((def  / ins) * 100).toFixed(2) : "0.00";
      rftPerHour[h]           = ins > 0 ? ((perHourPassed[h] / ins) * 100).toFixed(2) : "0.00";
      dhuPerHour[h]           = ins > 0 ? ((defs / ins) * 100).toFixed(2) : "0.00";
    });
    const defectiveRateTotal = totalInspected > 0 ? ((totalDefectivePieces / totalInspected) * 100).toFixed(2) : "0.00";
    const rftTotal           = totalInspected > 0 ? ((totalPassed          / totalInspected) * 100).toFixed(2) : "0.00";
    const dhuTotal           = totalInspected > 0 ? ((totalDefectsAll      / totalInspected) * 100).toFixed(2) : "0.00";
    return {
      perHourInspected, perHourPassed, perHourAfterRepair, perHourDefectivePieces, perHourDefects,
      totalInspected, totalPassed, totalAfterRepair, totalDefectivePieces, totalDefectsAll,
      defectiveRatePerHour, rftPerHour, dhuPerHour, defectiveRateTotal, rftTotal, dhuTotal,
    };
  }, [filteredRows]);

  const topDefects = useMemo(() => {
    if (!totalDefectsAll) return [];
    return defectRows.slice(0, 3).map((d, idx) => ({
      rank: idx + 1, name: d.name, qty: d.total,
      percent: ((d.total / totalDefectsAll) * 100).toFixed(2),
    }));
  }, [defectRows, totalDefectsAll]);

  const lastUpdate = useMemo(() => {
    if (!filteredRows.length) return null;
    let latest = null;
    filteredRows.forEach((r) => {
      const t = r.updatedAt || r.createdAt;
      if (!t) return;
      const time = new Date(t).getTime();
      if (latest === null || time > latest) latest = time;
    });
    return latest ? new Date(latest) : null;
  }, [filteredRows]);

  const lastUpdateLabel = lastUpdate ? lastUpdate.toLocaleTimeString() : "-";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg ${
            toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
            : toast.type === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/50 dark:text-red-300"
            : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300"}`}>
            <span className="text-lg">{toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
            <p className="text-sm font-medium">{toast.message}</p>
            <button type="button" onClick={() => setToast(null)} className="ml-2 text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl p-4 md:p-6">
        {/* PAGE HEADER */}
        <div className="mb-4 relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
          <div className="pointer-events-none absolute -inset-6 bg-[radial-gradient(900px_380px_at_0%_0%,rgba(99,102,241,0.18),transparent),radial-gradient(900px_380px_at_100%_0%,rgba(16,185,129,0.14),transparent),radial-gradient(900px_380px_at_50%_120%,rgba(245,158,11,0.10),transparent)]" />

          <div className="relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-6">
            {/* LEFT: filters */}
            <div className="flex flex-col gap-3 lg:w-auto lg:shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Filters</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Date picker */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 shadow-sm">
                  <svg className="h-3.5 w-3.5 text-indigo-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Date</span>
                  <input
                    type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-7 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700"
                  />
                </div>

                {/* Today */}
                <button type="button" onClick={() => setSelectedDate(formatDateInput())}
                  className="h-9 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 text-[12px] font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-[0.98]">
                  Today
                </button>

                {/* Line picker */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 shadow-sm">
                  <svg className="h-3.5 w-3.5 text-amber-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V4z"/>
                  </svg>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Line</span>
                  <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}
                    className="h-7 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-700">
                    <option value="">All Lines</option>
                    {lineOptions.map((line) => <option key={line} value={line}>{line}</option>)}
                  </select>
                </div>

                {/* Refresh */}
                <button type="button" onClick={fetchSummary}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 text-[12px] font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-[0.98]">
                  <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                  </svg>
                  {loading ? "Loading…" : "Refresh"}
                </button>

                {/* Auto-refresh */}
                <button type="button" onClick={() => setAutoRefresh((v) => !v)}
                  className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold shadow-sm active:scale-[0.98] transition-colors ${
                    autoRefresh ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                  <span className={`h-2 w-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-500"}`} />
                  Auto {autoRefresh ? "On" : "Off"}
                </button>

                {/* Print */}
                <button type="button" onClick={() => window.print()}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-[12px] font-semibold text-white shadow-sm hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 011-1h6a1 1 0 011 1v3H6v-3zm8-6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                  </svg>
                  Print
                </button>
              </div>

              {/* Active filter chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Active:</span>
                <span className="rounded-full border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 font-semibold text-indigo-700 dark:text-indigo-400">
                  📅 {viewingDateLabel}
                </span>
                {selectedLine ? (
                  <span className="flex items-center gap-1 rounded-full border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 font-semibold text-amber-700 dark:text-amber-400">
                    🔧 {selectedLine}
                    <button onClick={() => setSelectedLine("")} className="ml-0.5 text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">✕</button>
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2.5 py-0.5 font-medium text-slate-400 dark:text-slate-500">
                    All Lines
                  </span>
                )}
                <span className="rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2.5 py-0.5 font-medium text-slate-500 dark:text-slate-400">
                  Last update: {lastUpdateLabel}
                </span>
              </div>
            </div>

            {/* RIGHT: title */}
            <div className="min-w-0 lg:flex-1 lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 dark:border-slate-600 bg-white/70 dark:bg-slate-700/70 px-3 py-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Hourly Quality Report</span>
              </div>
              <h1 className="mt-2 text-[15px] sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Quality Hourly Defect Summary
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 lg:justify-end">
                <span className="rounded-xl border border-indigo-200/70 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 text-[12px] sm:text-sm font-semibold text-indigo-700 dark:text-indigo-400 shadow-sm">
                  {auth?.user_name || "User"}
                </span>
                {factory && (
                  <span className="rounded-xl border border-amber-200/70 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-[12px] sm:text-sm font-semibold text-amber-700 dark:text-amber-400 shadow-sm">
                    {factory}
                  </span>
                )}
                {building && (
                  <span className="rounded-xl border border-emerald-200/70 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-[12px] sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm">
                    {building}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Pick a date &amp; line to view hour-wise inspection, defect and efficiency summary.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>
        )}

        {/* MAIN TABLE CARD */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm transition-colors duration-200">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-[11px] font-semibold text-gray-900 dark:text-gray-100">Defect Name/Code</th>
                  {HOUR_COLUMNS.map((h) => (
                    <th key={h} className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-center text-[11px] font-semibold text-gray-900 dark:text-gray-100">{h}</th>
                  ))}
                  <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-center text-[11px] font-semibold text-gray-900 dark:text-gray-100">Total Defects</th>
                </tr>
              </thead>
              <tbody>
                {defectRows.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-medium text-gray-700 dark:text-gray-300">{row.name}</td>
                    {HOUR_COLUMNS.map((h) => (
                      <td key={h} className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center text-gray-700 dark:text-gray-300">{row.perHour[h] || 0}</td>
                    ))}
                    <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center font-semibold text-gray-800 dark:text-gray-200">{row.total}</td>
                  </tr>
                ))}

                {/* Total Defects row */}
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-200">
                  <td className="border border-gray-200 dark:border-gray-600 px-2 py-1">Total Defects</td>
                  {HOUR_COLUMNS.map((h) => (
                    <td key={h} className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-center">{perHourDefects[h] || 0}</td>
                  ))}
                  <td className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-center">{totalDefectsAll}</td>
                </tr>

                {/* Inspected */}
                <tr className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-semibold">Inspected Quantity</td>
                  {HOUR_COLUMNS.map((h) => (
                    <td key={h} className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center">{perHourInspected[h] || 0}</td>
                  ))}
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center font-semibold">{totalInspected}</td>
                </tr>

                {/* Passed */}
                <tr className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-semibold">Passed Quantity</td>
                  {HOUR_COLUMNS.map((h) => (
                    <td key={h} className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center">{perHourPassed[h] || 0}</td>
                  ))}
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center font-semibold">{totalPassed}</td>
                </tr>

                {/* After Repair */}
                <tr className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-semibold">Receive After Repair</td>
                  {HOUR_COLUMNS.map((h) => (
                    <td key={h} className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center">{perHourAfterRepair[h] || 0}</td>
                  ))}
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center font-semibold">{totalAfterRepair}</td>
                </tr>

                {/* Defective Pieces */}
                <tr className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 font-semibold">Defective Pieces</td>
                  {HOUR_COLUMNS.map((h) => (
                    <td key={h} className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center">{perHourDefectivePieces[h] || 0}</td>
                  ))}
                  <td className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-center font-semibold">{totalDefectivePieces}</td>
                </tr>

                {/* Defective Rate % */}
                <tr>
                  <td className="border bg-red-600 dark:bg-red-800 px-2 py-1 text-left text-xs font-semibold text-white">Defective Rate</td>
                  {HOUR_COLUMNS.map((h) => {
                    const v = Number(defectiveRatePerHour[h] || 0);
                    return (
                      <td key={h} className={`border border-gray-200 dark:border-gray-700 px-2 py-1 text-center text-xs ${v > 0 ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500"}`}>
                        {v.toFixed(2)}%
                      </td>
                    );
                  })}
                  <td className="border bg-red-100 dark:bg-red-900/40 px-2 py-1 text-center text-xs font-bold text-red-700 dark:text-red-400">{defectiveRateTotal}%</td>
                </tr>

                {/* RFT% */}
                <tr>
                  <td className="border bg-green-600 dark:bg-green-800 px-2 py-1 text-left text-xs font-semibold text-white">RFT%</td>
                  {HOUR_COLUMNS.map((h) => {
                    const v = Number(rftPerHour[h] || 0);
                    let cls = "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                    if (!v) cls = "bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500";
                    else if (v < 90) cls = "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                    else if (v < 95) cls = "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
                    return <td key={h} className={`border border-gray-200 dark:border-gray-700 px-2 py-1 text-center text-xs ${cls}`}>{v.toFixed(2)}%</td>;
                  })}
                  <td className="border bg-green-100 dark:bg-green-900/40 px-2 py-1 text-center text-xs font-bold text-green-700 dark:text-green-400">{rftTotal}%</td>
                </tr>

                {/* DHU% */}
                <tr>
                  <td className="border bg-red-600 dark:bg-red-800 px-2 py-1 text-left text-xs font-semibold text-white">DHU%</td>
                  {HOUR_COLUMNS.map((h) => {
                    const v = Number(dhuPerHour[h] || 0);
                    return (
                      <td key={h} className={`border border-gray-200 dark:border-gray-700 px-2 py-1 text-center text-xs ${v > 0 ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500"}`}>
                        {v.toFixed(2)}%
                      </td>
                    );
                  })}
                  <td className="border bg-red-100 dark:bg-red-900/40 px-2 py-1 text-center text-xs font-bold text-red-700 dark:text-red-400">{dhuTotal}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom totals */}
          <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2 text-[11px] text-gray-700 dark:text-gray-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-4">
                <span><span className="font-semibold">Total Inspected:</span> {totalInspected}</span>
                <span><span className="font-semibold">Total Passed:</span> {totalPassed}</span>
                <span><span className="font-semibold">Total Defective Pcs:</span> {totalDefectivePieces}</span>
                <span><span className="font-semibold">Total Defects:</span> {totalDefectsAll}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-3 py-1 font-semibold text-red-700 dark:text-red-400">Total Defect Rate: {defectiveRateTotal}%</span>
                <span className="rounded-full bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1 font-semibold text-yellow-800 dark:text-yellow-400">Total DHU%: {dhuTotal}%</span>
                <span className="rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1 font-semibold text-green-700 dark:text-green-400">Total RFT%: {rftTotal}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP 3 DEFECTS */}
        <div className="mt-6 rounded-lg border border-red-700 bg-red-700 dark:bg-red-900 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] md:text-xs">
            <div className="font-semibold">TOP THREE (3) DEFECTS — {viewingDateLabel}</div>
          </div>
          <div className="bg-red-600/80 dark:bg-red-800/80 px-4 pb-4 pt-2">
            {topDefects.length === 0 ? (
              <div className="rounded border border-red-300 bg-red-500/40 p-4 text-center text-xs">No defects to rank.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-red-500 dark:bg-red-800">
                      <th className="border border-red-300 dark:border-red-700 px-2 py-1 text-left">RANK</th>
                      <th className="border border-red-300 dark:border-red-700 px-2 py-1 text-left">DEFECT NAME</th>
                      <th className="border border-red-300 dark:border-red-700 px-2 py-1 text-right">DEFECT QTY</th>
                      <th className="border border-red-300 dark:border-red-700 px-2 py-1 text-right">DEFECT %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDefects.map((d) => (
                      <tr key={d.rank} className="bg-red-500/40 dark:bg-red-900/40">
                        <td className="border border-red-300 dark:border-red-700 px-2 py-1 font-semibold">#{d.rank}</td>
                        <td className="border border-red-300 dark:border-red-700 px-2 py-1">{d.name}</td>
                        <td className="border border-red-300 dark:border-red-700 px-2 py-1 text-right font-semibold">{d.qty}</td>
                        <td className="border border-red-300 dark:border-red-700 px-2 py-1 text-right">{d.percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}