// BulkHourEntryForm.jsx
"use client";

import { useAuth } from "@/app/hooks/useAuth";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const hourOptions = [
  "1st Hour","2nd Hour","3rd Hour","4th Hour","5th Hour","6th Hour",
  "7th Hour","8th Hour","9th Hour","10th Hour","11th Hour","12th Hour",
];

const defectOptions = [
  "301 - OPEN SEAM","302 - SKIP STITCH","303 - RUN OFF STITCH","304 - UNEVEN STITCH",
  "305 - DOWN / OFF STITCH","306 - BROKEN STITCH","307 - FAULTY SEWING","308 - NEEDLE MARK",
  "309 - IMPROPER JOINT STITCH","310 - IMPROPER STITCH TENSION","311 - STITCH MAGINE VARIATION",
  "312 - LABEL MISTAKE","313 - LOOSENESS","314 - INCORRECT PRINT","315 - SHADE MISMATCH",
  "316 - PUCKERING","317 - PLEATS","318 - GATHERING STITCH","319 - UNCUT-THREAD",
  "320 - INCORRECT POINT","321 - SHADING","322 - UP DOWN / HIGH LOW","323 - POOR / INSECURE TAPING",
  "324 - OFF SHAPE / POOR SHAPE","325 - STRIPE UNEVEN / MISMATCH","326 - OVERLAPPING",
  "327 - INSECURE BARTACK","328 - TRIMS MISSING","329 - WRONG TRIMS ATTCHMENT",
  "330 - WRONG/IMPROPER PLACMNT","331 - WRONG ALINGMENT","332 - INTERLINING TWISTING",
  "333 - FUSING BUBBLES","334 - SHARP POINT","335 - ZIPPER WAVY","336 - SLUNTED",
  "337 - ROPING","338 - DIRTY SPOT","339 - HI-KING","340 - VELCRO EDGE SHARPNESS",
  "341 - PEEL OFF H.T SEAL/PRINTING","342 - DAMAGE","343 - OIL STAIN","344 - IREGULAR SPI",
  "345 - FABRIC FAULT","346 - CAUGHT BY STITCH","347 - WRONG THREAD ATTCH","348 - PROCESS MISSING",
  "349 - RAW EDGE OUT","350 - INSECURE BUTTON / EYELET","351 - KNOT","352 - DYEING PROBLEM",
  "353 - MISSING YARN","354 - DIRTY MARK","355 - SLUB","356 - GLUE MARK","357 - THICK YARN",
  "358 - PRINT PROBLEM","359 - STOP MARK","360 - DOET MISSING","361 - HOLE",
  "362 - SCESSIOR CUT","363 - PEN MARK","364 - BRUSH PROBLEM","365 - NICKEL OUT","366 - COATING PROBLEM",
];

const lineOptions = [
  "Line-1","Line-2","Line-3","Line-4","Line-5","Line-6","Line-7","Line-8",
  "Line-9","Line-10","Line-11","Line-12","Line-13","Line-14","Line-15","Line-16",
  "Line-17","Line-18","Line-19","Line-20","Line-21","Line-22","Line-23","Line-24",
  "Line-25","Line-26","Line-27","Line-28","Line-29","Line-30",
];

function todayKeyDhaka() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

function dateKeyToLabel(dateKey) {
  if (!dateKey) return "";
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function draftKeyFor({ date, hour, building, factory }) {
  return `bulkHourDraft:${factory || "nf"}:${building || "nb"}:${date}:${hour}`;
}

function getUserIdFromAuth(auth) {
  return auth?.user?.id || auth?.user?._id || auth?.id || auth?._id || null;
}

const emptyRow = () => ({
  inspectedQty: "", passedQty: "", defectivePcs: "", afterRepair: "", selectedDefects: [],
});

function rowHasData(row) {
  if (!row) return false;
  return (
    row.inspectedQty !== "" ||
    row.passedQty !== "" ||
    row.defectivePcs !== "" ||
    row.afterRepair !== "" ||
    (row.selectedDefects && row.selectedDefects.length > 0)
  );
}

function SearchableDefectPicker({ options, onSelect, placeholder = "Search defect by name..." }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [hi, setHi] = React.useState(0);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 50);
    return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 50);
  }, [query, options]);

  React.useEffect(() => { setHi(0); }, [query, open]);

  const selectValue = (val) => { onSelect(val); setQuery(""); setOpen(false); };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter")) setOpen(true);
          if (!filtered.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => Math.min(i + 1, filtered.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(i - 1, 0)); }
          if (e.key === "Enter") { e.preventDefault(); selectValue(filtered[hi]); }
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
          {filtered.length ? (
            filtered.map((opt, idx) => (
              <button
                type="button"
                key={opt}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectValue(opt)}
                className={`block w-full text-left px-2 py-1.5 text-xs ${
                  idx === hi
                    ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-2 py-2 text-xs text-gray-500 dark:text-gray-400">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BulkHourEntryForm() {
  const { auth } = useAuth();
  const userId = useMemo(() => getUserIdFromAuth(auth), [auth]);
  const building = useMemo(() => auth?.assigned_building || auth?.building || "", [auth]);
  const factory = useMemo(() => auth?.factory || auth?.assigned_factory || "", [auth]);

  const [selectedDate, setSelectedDate] = useState(() => todayKeyDhaka());
  const selectedDateLabel = useMemo(() => dateKeyToLabel(selectedDate), [selectedDate]);
  const [selectedHour, setSelectedHour] = useState("");

  const [rowsMap, setRowsMap] = useState({});
  // existingRows: { [line]: fullSavedDocFromServer } — the whole doc (incl.
  // _id) so an unlocked line can be PATCHed back with the right id.
  const [existingRows, setExistingRows] = useState({});
  // editingLines: lines the user has explicitly unlocked via "Edit" — these
  // stay locked-looking (badge) but their inputs become editable and Save
  // routes them through PATCH instead of the bulk-create POST.
  const [editingLines, setEditingLines] = useState(new Set());
  const [expandedLine, setExpandedLine] = useState(null);

  const [loadingExisting, setLoadingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastState, setToastState] = useState(null);

  const showToast = (message, type = "info") => {
    setToastState({ message, type });
    setTimeout(() => setToastState(null), 5000);
  };

  // Load which lines already have an entry for this date + hour, so we can
  // mark/lock them and avoid duplicate-key round trips.
  const loadExistingForHour = useCallback(async () => {
    if (!auth || !selectedHour) { setExistingRows({}); return; }
    try {
      setLoadingExisting(true);
      let url = `/api/hourly-inspections?date=${encodeURIComponent(selectedDate)}&limit=500`;
      if (userId) url += `&userId=${userId}`;
      if (building) url += `&building=${encodeURIComponent(building)}`;
      if (factory) url += `&factory=${encodeURIComponent(factory)}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (res.ok) {
        const map = {};
        (json.data || [])
          .filter((r) => r.hourLabel === selectedHour)
          .forEach((r) => { map[r.line] = r; });
        setExistingRows(map);
      }
    } catch {
      // non-fatal — worst case a line shows as not-yet-saved until refresh
    } finally {
      setLoadingExisting(false);
    }
  }, [auth, selectedDate, selectedHour, userId, building, factory]);

  useEffect(() => {
    loadExistingForHour();
  }, [loadExistingForHour]);

  // draftKeyRef tracks which localStorage key the *current* rowsMap belongs
  // to, so the persist effect below never writes a freshly-typed row under
  // the previous hour/date's key.
  const draftKeyRef = useRef(null);

  // Switching hour or date starts a fresh sheet, but first check localStorage
  // for a draft matching this exact date+hour+building+factory — if the page
  // got refreshed before Save was clicked, restore whatever was typed.
  useEffect(() => {
    setExpandedLine(null);

    if (!selectedHour) {
      draftKeyRef.current = null;
      setRowsMap({});
      setEditingLines(new Set());
      return;
    }

    const key = draftKeyFor({ date: selectedDate, hour: selectedHour, building, factory });
    draftKeyRef.current = key;

    let restored = {};
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") restored = parsed;
      }
    } catch {
      // corrupt/blocked storage — just start with a blank sheet
    }

    setRowsMap(restored);
    const restoredLines = Object.keys(restored);
    if (restoredLines.length > 0) {
      // If any of these lines turn out to already exist on the server
      // (loaded separately by loadExistingForHour), treat them as "being
      // edited" rather than locked — the user had unsaved changes on them
      // before the refresh, so Save should PATCH, not silently discard.
      setEditingLines(new Set(restoredLines));
      showToast(`Restored unsaved draft for ${selectedHour}, ${dateKeyToLabel(selectedDate)}.`, "info");
    } else {
      setEditingLines(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedHour, building, factory]);

  // Persist every keystroke to localStorage under the current draft key, so
  // an accidental refresh/tab-close before Save doesn't lose typed data.
  // Best-effort: if storage is unavailable (private browsing, quota), we
  // silently skip rather than interrupt typing.
  useEffect(() => {
    const key = draftKeyRef.current;
    if (!key || typeof window === "undefined") return;
    try {
      if (Object.keys(rowsMap).length === 0) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(rowsMap));
      }
    } catch {
      // ignore — draft persistence is a convenience, not a requirement
    }
  }, [rowsMap]);

  // Unlock an already-saved line: prefill the row with its saved values so
  // editing starts from what's on the server, not a blank input.
  const startEdit = (line) => {
    const existing = existingRows[line];
    if (!existing) return;
    setEditingLines((prev) => new Set(prev).add(line));
    setRowsMap((prev) => ({
      ...prev,
      [line]: {
        inspectedQty: String(existing.inspectedQty ?? ""),
        passedQty: String(existing.passedQty ?? ""),
        defectivePcs: String(existing.defectivePcs ?? ""),
        afterRepair: String(existing.afterRepair ?? ""),
        selectedDefects: Array.isArray(existing.selectedDefects)
          ? existing.selectedDefects.map((d) => ({ name: d.name, quantity: String(d.quantity ?? "") }))
          : [],
      },
    }));
  };

  // Re-lock a line without saving — discards whatever was typed since Edit.
  const cancelEdit = (line) => {
    setEditingLines((prev) => { const next = new Set(prev); next.delete(line); return next; });
    setRowsMap((prev) => { const next = { ...prev }; delete next[line]; return next; });
    setExpandedLine((prev) => (prev === line ? null : prev));
  };

  const updateRow = (line, field, value) => {
    setRowsMap((prev) => ({
      ...prev,
      [line]: { ...emptyRow(), ...prev[line], [field]: value },
    }));
  };

  const addDefect = (line, defectName) => {
    if (!defectName) return;
    setRowsMap((prev) => {
      const row = { ...emptyRow(), ...prev[line] };
      if (row.selectedDefects.some((d) => d.name === defectName)) return prev;
      return { ...prev, [line]: { ...row, selectedDefects: [...row.selectedDefects, { name: defectName, quantity: "" }] } };
    });
  };

  const removeDefect = (line, idx) => {
    setRowsMap((prev) => {
      const row = { ...emptyRow(), ...prev[line] };
      const nextDefects = row.selectedDefects.filter((_, i) => i !== idx);
      return { ...prev, [line]: { ...row, selectedDefects: nextDefects } };
    });
  };

  const changeDefectQty = (line, idx, value) => {
    setRowsMap((prev) => {
      const row = { ...emptyRow(), ...prev[line] };
      const nextDefects = row.selectedDefects.map((d, i) => (i === idx ? { ...d, quantity: value } : d));
      return { ...prev, [line]: { ...row, selectedDefects: nextDefects } };
    });
  };

  const buildPayload = (line) => {
    const row = { ...emptyRow(), ...rowsMap[line] };
    return {
      hour: selectedHour,
      line,
      inspectedQty: Number(row.inspectedQty || 0),
      passedQty: Number(row.passedQty || 0),
      defectivePcs: Number(row.defectivePcs || 0),
      afterRepair: Number(row.afterRepair || 0),
      selectedDefects: row.selectedDefects.map((d) => ({ name: d.name, quantity: Number(d.quantity || 0) })),
    };
  };

  // A line counts toward "filled" if it has data AND we're actually going
  // to submit it — either it's brand new, or it's an existing line the user
  // deliberately unlocked via Edit.
  const filledCount = useMemo(
    () =>
      lineOptions.filter(
        (line) => rowHasData(rowsMap[line]) && (!existingRows[line] || editingLines.has(line))
      ).length,
    [rowsMap, existingRows, editingLines]
  );

  const saveAll = async () => {
    if (!selectedHour) { showToast("Please select an hour first.", "error"); return; }
    if (!userId) { showToast("Missing user identity (auth).", "error"); return; }
    if (!building) { showToast("Building information is missing. Please login again.", "error"); return; }
    if (!factory) { showToast("Factory information is missing. Please login again.", "error"); return; }

    const linesToCreate = lineOptions.filter((line) => rowHasData(rowsMap[line]) && !existingRows[line]);
    const linesToUpdate = lineOptions.filter((line) => rowHasData(rowsMap[line]) && editingLines.has(line));

    if (linesToCreate.length === 0 && linesToUpdate.length === 0) {
      showToast("Please enter data for at least one line before saving.", "error");
      return;
    }

    try {
      setSaving(true);
      let createdCount = 0;
      let createFailed = [];
      let updatedCount = 0;
      let updateFailed = [];

      // New lines — one bulk POST.
      if (linesToCreate.length > 0) {
        const entries = linesToCreate.map((line) => buildPayload(line));
        const res = await fetch("/api/hourly-inspections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            userName: auth?.user_name || auth?.user?.user_name || "User",
            building,
            factory,
            reportDate: selectedDate,
            entries,
          }),
        });
        const json = await res.json();
        if (!res.ok && !json.success) throw new Error(json.message || "Failed to save new entries.");

        const failedLines = new Set((json.failed || []).map((f) => f.line));
        createFailed = [...failedLines];
        const savedLines = linesToCreate.filter((line) => !failedLines.has(line));
        createdCount = savedLines.length;

        const savedDocsByLine = {};
        (json.data || []).forEach((doc) => { savedDocsByLine[doc.line] = doc; });

        setRowsMap((prev) => {
          const next = { ...prev };
          savedLines.forEach((line) => { delete next[line]; });
          return next;
        });
        setExistingRows((prev) => {
          const next = { ...prev };
          savedLines.forEach((line) => { if (savedDocsByLine[line]) next[line] = savedDocsByLine[line]; });
          return next;
        });
      }

      // Unlocked/edited lines — PATCH one at a time (each needs its own _id).
      if (linesToUpdate.length > 0) {
        const results = await Promise.allSettled(
          linesToUpdate.map(async (line) => {
            const id = existingRows[line]?._id;
            if (!id) throw new Error(`Missing id for ${line}`);
            const payload = { ...buildPayload(line), building, factory, reportDate: selectedDate };
            const url = `/api/hourly-inspections?id=${id}${factory ? `&factory=${encodeURIComponent(factory)}` : ""}`;
            const res = await fetch(url, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || `Failed to update ${line}`);
            return { line, data: json.data };
          })
        );

        results.forEach((r, idx) => {
          const line = linesToUpdate[idx];
          if (r.status === "fulfilled") {
            updatedCount += 1;
            setRowsMap((prev) => { const next = { ...prev }; delete next[line]; return next; });
            setEditingLines((prev) => { const next = new Set(prev); next.delete(line); return next; });
            setExistingRows((prev) => ({ ...prev, [line]: r.value.data }));
          } else {
            updateFailed.push(line);
          }
        });
      }

      const totalSaved = createdCount + updatedCount;
      const totalFailed = createFailed.length + updateFailed.length;

      if (totalFailed > 0) {
        showToast(
          `Saved ${totalSaved} line(s) for ${selectedHour}. ${totalFailed} failed — ${[...createFailed, ...updateFailed].join(", ")}.`,
          "info"
        );
      } else {
        showToast(`Saved ${totalSaved} line(s) for ${selectedHour}, ${selectedDateLabel}.`, "success");
      }
    } catch (e) {
      showToast(e.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {toastState && (
        <div className="fixed right-4 top-4 z-50">
          <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg max-w-sm ${
            toastState.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
            : toastState.type === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/60 dark:text-red-300"
            : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-300"}`}>
            <span className="text-lg">{toastState.type === "success" ? "✅" : toastState.type === "error" ? "⚠️" : "ℹ️"}</span>
            <div className="text-sm"><p className="font-medium">{toastState.message}</p></div>
            <button type="button" onClick={() => setToastState(null)} className="ml-2 text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl p-4 md:p-6">
        {/* Header / controls */}
        <div className="card bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden mb-4">
          <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-sky-500" />
          <div className="px-4 py-3 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Date</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayKeyDhaka())}
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 text-[12px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Today
                </button>
              </div>
              <span className="text-[11px] bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full px-2.5 py-0.5 w-fit">
                {selectedDateLabel}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Hour (applies to all lines)</span>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400 min-w-[160px]"
              >
                <option value="">Select Hour</option>
                {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
              <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold">Bulk Hour Entry</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-md px-2.5 py-1 font-semibold">
                  {auth?.user_name || "User"}
                </span>
                {factory && (
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md px-2.5 py-1">
                    Factory <strong className="text-slate-800 dark:text-slate-200 font-semibold">{factory}</strong>
                  </span>
                )}
                {building && (
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md px-2.5 py-1">
                    Floor <strong className="text-slate-800 dark:text-slate-200 font-semibold">{building}</strong>
                  </span>
                )}
                {loadingExisting && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Checking existing entries…</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={saveAll}
              disabled={!selectedHour || saving || filledCount === 0}
              className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {saving ? "Saving..." : `Save All${filledCount ? ` (${filledCount})` : ""}`}
            </button>
          </div>
        </div>

        {!selectedHour ? (
          <div className="rounded border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Select an hour above to start entering data for all lines.
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {/* Column headers (desktop) */}
            <div className="hidden md:grid grid-cols-[110px_1fr_1fr_1fr_1fr_90px] gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <div>Line</div>
              <div>Inspected</div>
              <div>Passed</div>
              <div>Defective</div>
              <div>After Repair</div>
              <div>Defects</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {lineOptions.map((line) => {
                const row = { ...emptyRow(), ...rowsMap[line] };
                const hasExisting = !!existingRows[line];
                const isEditing = editingLines.has(line);
                const disabled = hasExisting && !isEditing;
                const isExpanded = expandedLine === line;

                return (
                  <div key={line} className={disabled ? "bg-gray-50 dark:bg-gray-900/40" : isEditing ? "bg-amber-50/60 dark:bg-amber-900/10" : ""}>
                    <div className="grid grid-cols-2 md:grid-cols-[110px_1fr_1fr_1fr_1fr_90px] gap-2 px-3 py-2 items-center">
                      <div className="col-span-2 md:col-span-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{line}</span>
                        {disabled && (
                          <>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full px-2 py-0.5 whitespace-nowrap">
                              Already saved
                            </span>
                            <button
                              type="button"
                              onClick={() => startEdit(line)}
                              className="text-[11px] text-blue-600 dark:text-blue-400 underline whitespace-nowrap"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        {isEditing && (
                          <>
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full px-2 py-0.5 whitespace-nowrap">
                              Editing
                            </span>
                            <button
                              type="button"
                              onClick={() => cancelEdit(line)}
                              className="text-[11px] text-gray-500 dark:text-gray-400 underline whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>

                      <input
                        type="number" min="0" placeholder="Inspected"
                        value={row.inspectedQty} disabled={disabled}
                        onChange={(e) => updateRow(line, "inspectedQty", e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <input
                        type="number" min="0" placeholder="Passed"
                        value={row.passedQty} disabled={disabled}
                        onChange={(e) => updateRow(line, "passedQty", e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <input
                        type="number" min="0" placeholder="Defective"
                        value={row.defectivePcs} disabled={disabled}
                        onChange={(e) => updateRow(line, "defectivePcs", e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <input
                        type="number" min="0" placeholder="After Repair"
                        value={row.afterRepair} disabled={disabled}
                        onChange={(e) => updateRow(line, "afterRepair", e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setExpandedLine(isExpanded ? null : line)}
                        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 whitespace-nowrap"
                      >
                        {row.selectedDefects.length > 0 ? `${row.selectedDefects.length} defect(s)` : "+ Defect"}
                      </button>
                    </div>

                    {isExpanded && !disabled && (
                      <div className="px-3 pb-3 pt-0 md:pl-[122px]">
                        <div className="rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 p-2 space-y-2">
                          <SearchableDefectPicker
                            options={defectOptions}
                            onSelect={(name) => addDefect(line, name)}
                          />
                          {row.selectedDefects.length > 0 && (
                            <div className="space-y-1">
                              {row.selectedDefects.map((d, i) => (
                                <div key={`${d.name}-${i}`} className="flex items-center gap-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1">
                                  <span className="flex-1 truncate text-xs font-medium text-gray-800 dark:text-gray-200">{d.name}</span>
                                  <input
                                    type="number" min="0" placeholder="Qty" value={d.quantity}
                                    onChange={(e) => changeDefectQty(line, i, e.target.value)}
                                    className="w-16 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 text-xs"
                                  />
                                  <button
                                    type="button" onClick={() => removeDefect(line, i)}
                                    className="rounded border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                  >×</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}