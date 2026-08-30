"use client";

import { useAuth } from "@/app/hooks/useAuth";
import React, { useCallback, useEffect, useMemo, useState } from "react";

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

const lineOptions = Array.from({ length: 30 }, (_, i) => `Line-${i + 1}`);

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

function getUserIdFromAuth(auth) {
  return auth?.user?.id || auth?.user?._id || auth?.id || auth?._id || null;
}

function emptyRow() {
  return { _id: null, inspectedQty: "", passedQty: "", defectivePcs: "", afterRepair: "", selectedDefects: [] };
}

// row-এ অন্তত একটা field-এ কিছু লেখা আছে কিনা
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

// save হওয়ার জন্য ৪টা core field সবগুলোই থাকতে হবে
function rowIsComplete(row) {
  return (
    !!row &&
    row.inspectedQty !== "" &&
    row.passedQty !== "" &&
    row.defectivePcs !== "" &&
    row.afterRepair !== ""
  );
}

// ---------- Defect picker (reused, same as single-entry page) ----------
function SearchableDefectPicker({ options, onSelect, excludeNames = [], placeholder = "Search defect by name..." }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const inputRef = React.useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = options.filter((o) => !excludeNames.includes(o));
    if (!q) return pool.slice(0, 50);
    return pool.filter((o) => o.toLowerCase().includes(q)).slice(0, 50);
  }, [query, options, excludeNames]);

  useEffect(() => { setHi(0); }, [query, open]);

  const selectValue = (val) => {
    onSelect(val);
    setQuery("");
    setHi(0);
    // dropdown খোলাই থাকবে — একের পর এক defect select করা যাবে, ক্লিক করে আবার খোলার দরকার নেই
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter")) setOpen(true);
          if (!filtered.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => Math.min(i + 1, filtered.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(i - 1, 0)); }
          if (e.key === "Enter") { e.preventDefault(); if (filtered[hi]) selectValue(filtered[hi]); }
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder={placeholder}
      />
      {open && (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
          {filtered.length ? (
            filtered.map((opt, idx) => (
              <button
                type="button" key={opt}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectValue(opt)}
                className={`block w-full text-left px-2 py-1.5 text-sm ${
                  idx === hi
                    ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >{opt}</button>
            ))
          ) : (
            <div className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Defects cell — lives directly inside the table row, no popup ----------
function InlineDefectsCell({ line, defects, onAdd, onUpdateQty, onRemove }) {
  return (
    <div className="min-w-[340px] max-w-[420px]">
      <SearchableDefectPicker
        options={defectOptions}
        excludeNames={defects.map((d) => d.name)}
        placeholder="Defect search & select..."
        onSelect={(name) => onAdd(line, name)}
      />
      {defects.length > 0 && (
        <div className="mt-1.5 max-h-32 space-y-1 overflow-auto pr-1">
          {defects.map((d, i) => (
            <div
              key={`${d.name}-${i}`}
              className="flex items-center gap-1.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-1.5 py-1"
            >
              <span className="flex-1 truncate text-[11px] font-medium text-gray-800 dark:text-gray-200">{d.name}</span>
              <input
                type="number" min="0" placeholder="Qty" value={d.quantity}
                onChange={(e) => onUpdateQty(line, i, e.target.value)}
                className="w-12 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 text-[11px]"
              />
              <button
                type="button" onClick={() => onRemove(line, i)}
                className="rounded border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 text-[11px] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// একটা hour-এর জন্য rows বানায়: আগে থেকে save করা লাইনগুলো পপুলেট করে, তারপর draft থাকলে সেটা override করে
function buildRowsForHour(hourVal, existingEntries, draftForHour) {
  const base = Object.fromEntries(lineOptions.map((l) => [l, emptyRow()]));
  if (!hourVal) return base;

  existingEntries
    .filter((e) => e.hourLabel === hourVal)
    .forEach((entry) => {
      if (!entry.line) return;
      base[entry.line] = {
        _id: entry._id,
        inspectedQty: entry.inspectedQty === undefined || entry.inspectedQty === null ? "" : String(entry.inspectedQty),
        passedQty: entry.passedQty === undefined || entry.passedQty === null ? "" : String(entry.passedQty),
        defectivePcs: entry.defectivePcs === undefined || entry.defectivePcs === null ? "" : String(entry.defectivePcs),
        afterRepair: entry.afterRepair === undefined || entry.afterRepair === null ? "" : String(entry.afterRepair),
        selectedDefects: Array.isArray(entry.selectedDefects)
          ? entry.selectedDefects.map((d) => ({ name: d.name || "", quantity: String(d.quantity ?? "") }))
          : [],
      };
    });

  if (draftForHour) {
    for (const line of lineOptions) {
      if (draftForHour[line]) base[line] = draftForHour[line];
    }
  }

  return base;
}

export default function BulkHourlyEntryPage() {
  const { auth } = useAuth();
  const userId = useMemo(() => getUserIdFromAuth(auth), [auth]);
  const building = useMemo(() => auth?.assigned_building || auth?.building || "", [auth]);
  const factory = useMemo(() => auth?.factory || auth?.assigned_factory || "", [auth]);

  const [selectedDate, setSelectedDate] = useState(() => todayKeyDhaka());
  const [hour, setHour] = useState("");
  const [rowsByLine, setRowsByLine] = useState(() =>
    Object.fromEntries(lineOptions.map((l) => [l, emptyRow()]))
  );
  const [existingEntries, setExistingEntries] = useState([]); // already-saved entries for selectedDate
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // draft object shape: { [hourLabel]: { [line]: rowObject } }
  const draftAllRef = React.useRef({});

  const draftStorageKey = useMemo(
    () => `bulk-hourly-draft:${factory || "f"}:${building || "b"}:${selectedDate}`,
    [factory, building, selectedDate]
  );

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const persistDraft = useCallback(() => {
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(draftAllRef.current));
    } catch {
      // storage full / disabled — silently ignore, form still works in-memory
    }
  }, [draftStorageKey]);

  // ---- date বদলালে draft (সব hour-এর) লোড হবে, hour রিসেট হবে ----
  useEffect(() => {
    let stored = {};
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (raw) stored = JSON.parse(raw) || {};
    } catch {
      stored = {};
    }
    draftAllRef.current = stored;
    setHour("");
    setRowsByLine(Object.fromEntries(lineOptions.map((l) => [l, emptyRow()])));
  }, [draftStorageKey]);

  // ---- fetch already-saved entries for this date ----
  const fetchExisting = useCallback(async () => {
    try {
      setLoadingExisting(true);
      let url = `/api/hourly-inspections?date=${encodeURIComponent(selectedDate)}&limit=500`;
      if (userId) url += `&userId=${userId}`;
      if (building) url += `&building=${encodeURIComponent(building)}`;
      if (factory) url += `&factory=${encodeURIComponent(factory)}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load existing entries");
      setExistingEntries(json?.data || []);
    } catch (e) {
      showToast(e.message || "Load error", "error");
    } finally {
      setLoadingExisting(false);
    }
  }, [selectedDate, userId, building, factory]);

  useEffect(() => {
    if (!auth) return;
    fetchExisting();
  }, [auth, fetchExisting]);

  // ---- hour বদলালে বা existingEntries রিফ্রেশ হলে rows আবার বানাও (saved data + draft merge) ----
  useEffect(() => {
    if (!hour) {
      setRowsByLine(Object.fromEntries(lineOptions.map((l) => [l, emptyRow()])));
      return;
    }
    setRowsByLine(buildRowsForHour(hour, existingEntries, draftAllRef.current[hour]));
  }, [hour, existingEntries]);

  // ---- প্রতিটা পরিবর্তনেই draft অটোসেভ ----
  useEffect(() => {
    if (!hour) return;
    const hasAnyData = Object.values(rowsByLine).some(rowHasData);
    if (hasAnyData) {
      draftAllRef.current = { ...draftAllRef.current, [hour]: rowsByLine };
    } else {
      const next = { ...draftAllRef.current };
      delete next[hour];
      draftAllRef.current = next;
    }
    persistDraft();
  }, [rowsByLine, hour, persistDraft]);

  const updateRow = (line, field, value) => {
    setRowsByLine((prev) => {
      const current = prev[line] || emptyRow();
      const next = { ...current, [field]: value };
      // Inspected/Passed বদলালে Defective Pcs অটো ক্যালকুলেট হবে
      if (field === "inspectedQty" || field === "passedQty") {
        const insp = Number(next.inspectedQty);
        const pass = Number(next.passedQty);
        if (next.inspectedQty !== "" && next.passedQty !== "" && Number.isFinite(insp) && Number.isFinite(pass)) {
          next.defectivePcs = String(Math.max(insp - pass, 0));
        }
      }
      return { ...prev, [line]: next };
    });
  };

  const addDefect = (line, name) => {
    if (!name) return;
    setRowsByLine((prev) => {
      const current = prev[line] || emptyRow();
      if (current.selectedDefects.some((d) => d.name === name)) return prev;
      return {
        ...prev,
        [line]: { ...current, selectedDefects: [...current.selectedDefects, { name, quantity: "" }] },
      };
    });
  };

  const updateDefectQty = (line, idx, value) => {
    setRowsByLine((prev) => {
      const current = prev[line] || emptyRow();
      const nextDefects = [...current.selectedDefects];
      nextDefects[idx] = { ...nextDefects[idx], quantity: value };
      return { ...prev, [line]: { ...current, selectedDefects: nextDefects } };
    });
  };

  const removeDefect = (line, idx) => {
    setRowsByLine((prev) => {
      const current = prev[line] || emptyRow();
      return {
        ...prev,
        [line]: { ...current, selectedDefects: current.selectedDefects.filter((_, i) => i !== idx) },
      };
    });
  };

  // Inspected/Passed/Defective Pcs তিনটাই থাকলে, মিলছে কিনা চেক
  const isRowInvalid = (row) => {
    if (row.inspectedQty === "" || row.passedQty === "" || row.defectivePcs === "") return false;
    const expected = Number(row.inspectedQty) - Number(row.passedQty);
    return Number(row.defectivePcs) !== expected;
  };

  // ready: ৪টা field-ই পূর্ণ এবং হিসাব মিলছে -> submit হবে
  const readyLines = useMemo(
    () => lineOptions.filter((l) => rowIsComplete(rowsByLine[l]) && !isRowInvalid(rowsByLine[l])),
    [rowsByLine]
  );
  // incomplete: কিছু data আছে কিন্তু ৪টা field পূর্ণ না
  const incompleteLines = useMemo(
    () => lineOptions.filter((l) => rowHasData(rowsByLine[l]) && !rowIsComplete(rowsByLine[l])),
    [rowsByLine]
  );
  // mismatch: ৪টা field পূর্ণ কিন্তু Defective Pcs হিসাব মিলছে না
  const mismatchLines = useMemo(
    () => lineOptions.filter((l) => rowIsComplete(rowsByLine[l]) && isRowInvalid(rowsByLine[l])),
    [rowsByLine]
  );

  const toCreateCount = useMemo(
    () => readyLines.filter((l) => !rowsByLine[l]._id).length,
    [readyLines, rowsByLine]
  );
  const toUpdateCount = readyLines.length - toCreateCount;

  const resetAll = () => {
    const next = { ...draftAllRef.current };
    delete next[hour];
    draftAllRef.current = next;
    persistDraft();
    setRowsByLine(buildRowsForHour(hour, existingEntries, null));
  };

  const submitAll = async () => {
    if (!hour) return showToast("Working Hour সিলেক্ট করুন।", "error");
    if (!userId) return showToast("Missing user identity (auth).", "error");
    if (!building) return showToast("Building information missing. আবার login করুন।", "error");
    if (!factory) return showToast("Factory information missing. আবার login করুন।", "error");
    if (readyLines.length === 0) {
      return showToast("অন্তত একটা Line-এ চারটা field (Inspected, Passed, Defective Pcs, After Repair) পূরণ করুন।", "error");
    }

    const toCreate = readyLines.filter((l) => !rowsByLine[l]._id);
    const toUpdate = readyLines.filter((l) => rowsByLine[l]._id);

    try {
      setSubmitting(true);

      if (toCreate.length > 0) {
        const entries = toCreate.map((line) => {
          const row = rowsByLine[line];
          return {
            hour,
            line,
            building,
            factory,
            inspectedQty: Number(row.inspectedQty || 0),
            passedQty: Number(row.passedQty || 0),
            defectivePcs: Number(row.defectivePcs || 0),
            afterRepair: Number(row.afterRepair || 0),
            selectedDefects: (row.selectedDefects || []).map((d) => ({
              name: d.name,
              quantity: Number(d.quantity || 0),
            })),
          };
        });
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
        if (!res.ok) throw new Error(json?.message || "নতুন entry create করতে ব্যর্থ হয়েছে।");
      }

      if (toUpdate.length > 0) {
        const updateResults = await Promise.all(
          toUpdate.map(async (line) => {
            const row = rowsByLine[line];
            const url = `/api/hourly-inspections?id=${row._id}${factory ? `&factory=${encodeURIComponent(factory)}` : ""}`;
            const res = await fetch(url, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                hour,
                line,
                building,
                factory,
                inspectedQty: Number(row.inspectedQty || 0),
                passedQty: Number(row.passedQty || 0),
                defectivePcs: Number(row.defectivePcs || 0),
                afterRepair: Number(row.afterRepair || 0),
                selectedDefects: (row.selectedDefects || []).map((d) => ({
                  name: d.name,
                  quantity: Number(d.quantity || 0),
                })),
              }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.message || `${line} আপডেট করতে ব্যর্থ হয়েছে।`);
            return json;
          })
        );
        void updateResults;
      }

      showToast(
        `${toCreate.length} টা নতুন + ${toUpdate.length} টা আপডেট — সফলভাবে save হয়েছে!`,
        "success"
      );

      const next = { ...draftAllRef.current };
      delete next[hour];
      draftAllRef.current = next;
      persistDraft();

      await fetchExisting();
    } catch (e) {
      showToast(e.message || "Save failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg ${
            toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
            : toast.type === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/60 dark:text-red-300"
            : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-300"}`}>
            <span className="text-lg">{toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
            <p className="text-sm font-medium">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1800px] p-4 md:p-6">
        {/* Header */}
        <div className="mb-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-sky-500" />
          <div className="px-4 py-3 flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">Date</span>
              <input
                type="date" value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{dateKeyToLabel(selectedDate)}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">Working Hour</span>
              <select
                value={hour} onChange={(e) => setHour(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Select Hour</option>
                {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <h1 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">Bulk Hourly Entry (Excel style)</h1>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {factory && <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md px-2 py-1">Factory <b>{factory}</b></span>}
                {building && <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md px-2 py-1">Floor <b>{building}</b></span>}
                <span className="text-[11px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-md px-2 py-1">
                  Draft auto-saving ✓
                </span>
                <span className="text-[11px] bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded-md px-2 py-1">
                  Saved entries editable ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {!hour && (
          <div className="mb-4 rounded-md border border-dashed border-gray-300 dark:border-gray-600 p-4 text-sm text-gray-500 dark:text-gray-400">
            আগে উপরে থেকে <b>Working Hour</b> সিলেক্ট করুন, তারপর নিচের টেবিলে সব Line-এর ডাটা দিন।
          </div>
        )}

        {hour && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left w-28">Line</th>
                    <th className="px-4 py-3 text-left w-32">Inspected</th>
                    <th className="px-4 py-3 text-left w-32">Passed</th>
                    <th className="px-4 py-3 text-left w-40">Defective Pcs</th>
                    <th className="px-4 py-3 text-left w-32">After Repair</th>
                    <th className="px-4 py-3 text-left">Defects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {lineOptions.map((line) => {
                    const row = rowsByLine[line] || emptyRow();
                    const isSaved = !!row._id;
                    const complete = rowIsComplete(row);
                    const invalid = isRowInvalid(row);
                    const partial = rowHasData(row) && !complete;
                    return (
                      <tr
                        key={line}
                        className={
                          invalid
                            ? "bg-red-50 dark:bg-red-900/20"
                            : partial
                            ? "bg-amber-50/60 dark:bg-amber-900/10"
                            : complete
                            ? isSaved
                              ? "bg-sky-50/60 dark:bg-sky-900/10"
                              : "bg-emerald-50/40 dark:bg-emerald-900/10"
                            : ""
                        }
                      >
                        <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap align-top">
                          {line}
                          {isSaved && (
                            <span className="ml-2 rounded bg-sky-200 dark:bg-sky-800 px-1.5 py-0.5 text-[10px] text-sky-800 dark:text-sky-200">
                              Saved
                            </span>
                          )}
                          {partial && (
                            <span className="ml-2 rounded bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 text-[10px] text-amber-800 dark:text-amber-200">
                              Incomplete
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <input
                            type="number" min="0" value={row.inspectedQty}
                            onChange={(e) => updateRow(line, "inspectedQty", e.target.value)}
                            className="w-24 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <input
                            type="number" min="0" value={row.passedQty}
                            onChange={(e) => updateRow(line, "passedQty", e.target.value)}
                            className="w-24 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <input
                            type="number" min="0" value={row.defectivePcs}
                            onChange={(e) => updateRow(line, "defectivePcs", e.target.value)}
                            className={`w-24 rounded border px-2 py-1.5 text-sm ${
                              invalid
                                ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            }`}
                          />
                          {invalid && (
                            <div className="mt-0.5 text-[10px] text-red-600 dark:text-red-400">
                              হবে {Number(row.inspectedQty) - Number(row.passedQty)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <input
                            type="number" min="0" value={row.afterRepair}
                            onChange={(e) => updateRow(line, "afterRepair", e.target.value)}
                            className="w-24 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <InlineDefectsCell
                            line={line}
                            defects={row.selectedDefects || []}
                            onAdd={addDefect}
                            onUpdateQty={updateDefectQty}
                            onRemove={removeDefect}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(incompleteLines.length > 0 || mismatchLines.length > 0) && (
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 space-y-1">
                {incompleteLines.length > 0 && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <b>এন্ট্রি বাকি আছে</b> ({incompleteLines.length}): {incompleteLines.join(", ")} — ৪টা field (Inspected, Passed, Defective Pcs, After Repair) পূরণ না হলে save হবে না।
                  </p>
                )}
                {mismatchLines.length > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    <b>হিসাব মিলছে না</b> ({mismatchLines.length}): {mismatchLines.join(", ")} — Defective Pcs = Inspected − Passed হতে হবে।
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700 px-4 py-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {loadingExisting
                  ? "Loading saved entries..."
                  : `${toCreateCount} নতুন + ${toUpdateCount} আপডেট = ${readyLines.length} line ready to upload`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button" onClick={resetAll}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Reset This Hour
                </button>
                <button
                  type="button" onClick={submitAll} disabled={submitting || readyLines.length === 0}
                  className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Uploading..." : `Upload All (${readyLines.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}