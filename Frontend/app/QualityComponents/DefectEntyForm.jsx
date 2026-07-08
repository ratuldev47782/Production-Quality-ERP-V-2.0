// DefectEntyForm.jsx
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

const lineOptions = [
  "Line-1","Line-2","Line-3","Line-4","Line-5","Line-6","Line-7","Line-8",
  "Line-9","Line-10","Line-11","Line-12","Line-13","Line-14","Line-15",
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

function getUserIdFromAuth(auth) {
  return auth?.user?.id || auth?.user?._id || auth?.id || auth?._id || null;
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
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
          {filtered.length ? (
            filtered.map((opt, idx) => (
              <button
                type="button"
                key={opt}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectValue(opt)}
                className={`block w-full text-left px-2 py-1.5 text-sm ${
                  idx === hi
                    ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EndlineDashboard() {
  const { auth } = useAuth();
  const userId = useMemo(() => getUserIdFromAuth(auth), [auth]);
  const building = useMemo(() => auth?.assigned_building || auth?.building || "", [auth]);
  const factory = useMemo(() => auth?.factory || auth?.assigned_factory || "", [auth]);

  const [selectedDate, setSelectedDate] = useState(() => todayKeyDhaka());
  const selectedDateLabel = useMemo(() => dateKeyToLabel(selectedDate), [selectedDate]);

  const [form, setForm] = useState({
    hour: "", line: "", selectedDefects: [],
    inspectedQty: "", passedQty: "", defectivePcs: "", afterRepair: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [toastState, setToastState] = useState(null);

  const showToast = (message, type = "info") => {
    setToastState({ message, type });
    setTimeout(() => setToastState(null), 4000);
  };

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = useCallback(() => {
    setForm({ hour: "", line: "", selectedDefects: [], inspectedQty: "", passedQty: "", defectivePcs: "", afterRepair: "" });
    setEditingId(null);
  }, []);

  const fetchByDate = useCallback(async (dateKey) => {
    try {
      setLoading(true); setError("");
      let url = `/api/hourly-inspections?date=${encodeURIComponent(dateKey)}&limit=500`;
      if (userId) url += `&userId=${userId}`;
      if (building) url += `&building=${encodeURIComponent(building)}`;
      if (factory) url += `&factory=${encodeURIComponent(factory)}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load data");
      setRows(json?.data || []);
    } catch (e) {
      setError(e.message || "Load error");
      showToast(e.message || "Load error", "error");
    } finally { setLoading(false); }
  }, [userId, building, factory]);

  useEffect(() => {
    if (!auth) return;
    resetForm();
    fetchByDate(selectedDate);
  }, [auth, selectedDate, fetchByDate, resetForm]);

  const handleDefectQty = (index, value) => {
    setForm((prev) => {
      const updatedDefects = [...prev.selectedDefects];
      updatedDefects[index].quantity = value;
      return { ...prev, selectedDefects: updatedDefects };
    });
  };

  const handleSelectDefect = (defect) => {
    if (!defect) return;
    setForm((prev) => {
      const currentDefects = prev.selectedDefects || [];
      if (!currentDefects.some((d) => d.name === defect)) {
        return { ...prev, selectedDefects: [...currentDefects, { name: defect, quantity: "" }] };
      }
      return prev;
    });
  };

  const removeDefect = (index) => {
    setForm((prev) => {
      const updatedDefects = [...prev.selectedDefects];
      updatedDefects.splice(index, 1);
      return { ...prev, selectedDefects: updatedDefects };
    });
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setForm({
      hour: row.hourLabel || "", line: row.line || "",
      selectedDefects: Array.isArray(row.selectedDefects)
        ? row.selectedDefects.map((d) => ({ name: d.name || "", quantity: String(d.quantity || "") }))
        : [],
      inspectedQty: String(row.inspectedQty || ""), passedQty: String(row.passedQty || ""),
      defectivePcs: String(row.defectivePcs || ""), afterRepair: String(row.afterRepair || ""),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      setDeleting(id);
      const url = `/api/hourly-inspections?id=${id}${factory ? `&factory=${encodeURIComponent(factory)}` : ""}`;
      const res = await fetch(url, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to delete");
      showToast("Entry deleted successfully!", "success");
      await fetchByDate(selectedDate);
    } catch (e) { showToast(e.message || "Delete failed", "error"); }
    finally { setDeleting(null); }
  };

  const validate = () => {
    if (!selectedDate) return "Please select date.";
    if (!form.hour) return "Please select Working Hour.";
    if (!form.line) return "Please select Line.";
    return "";
  };

  const save = async () => {
    const msg = validate();
    if (msg) { showToast(msg, "error"); return; }
    const isDuplicate = rows.some(
      (row) => row.hourLabel === form.hour && row.line === form.line && row.building === building && row._id !== editingId
    );
    if (isDuplicate && !editingId) {
      showToast(`An entry for ${form.hour} - ${form.line} already exists on ${selectedDate}. Please edit the existing entry.`, "error");
      return;
    }
    if (!userId) { showToast("Missing user identity (auth).", "error"); return; }
    if (!building) { showToast("Building information is missing. Please login again.", "error"); return; }
    if (!factory) { showToast("Factory information is missing. Please login again.", "error"); return; }

    try {
      setSaving(true);
      const payload = {
        hour: form.hour, line: form.line, building, factory,
        inspectedQty: Number(form.inspectedQty || 0), passedQty: Number(form.passedQty || 0),
        defectivePcs: Number(form.defectivePcs || 0), afterRepair: Number(form.afterRepair || 0),
        selectedDefects: (form.selectedDefects || []).map((d) => ({ name: d.name, quantity: Number(d.quantity || 0) })),
      };
      let res;
      if (editingId) {
        const url = `/api/hourly-inspections?id=${editingId}${factory ? `&factory=${encodeURIComponent(factory)}` : ""}`;
        res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to update");
        showToast("Entry updated successfully!", "success");
      } else {
        const requestBody = {
          userId, userName: auth?.user_name || auth?.user?.user_name || "User",
          building, factory, entries: [payload], reportDate: selectedDate,
        };
        res = await fetch("/api/hourly-inspections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to save");
        showToast("Entry created successfully!", "success");
      }
      await fetchByDate(selectedDate);
      resetForm();
    } catch (e) { showToast(e.message || "Save failed", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Toast */}
      {toastState && (
        <div className="fixed right-4 top-4 z-50">
          <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg ${
            toastState.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
            : toastState.type === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/60 dark:text-red-300"
            : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-300"}`}>
            <span className="text-lg">{toastState.type === "success" ? "✅" : toastState.type === "error" ? "⚠️" : "ℹ️"}</span>
            <div className="text-sm"><p className="font-medium">{toastState.message}</p></div>
            <button type="button" onClick={() => setToastState(null)} className="ml-2 text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          {/* Header card */}
          <div className="card bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden mb-3 flex-1">
  <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-sky-500" />

  <div className="px-4 py-3 flex flex-wrap items-center gap-4">

    {/* LEFT — date filter */}
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

    {/* divider */}
    <div className="w-px self-stretch bg-slate-200 dark:bg-white/10 hidden sm:block" />

    {/* RIGHT — identity */}
    <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold">
          Live quality view
        </span>
      </div>

      <h1 className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
        Quality Hourly Dashboard
      </h1>

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
      </div>
    </div>

  </div>
</div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => fetchByDate(selectedDate)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left: Form */}
          <div className="md:sticky md:top-4 md:h-fit">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {editingId ? "Edit Hour Entry" : "Add New Hour Entry"}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline">
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* Line Picker */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Select Line</label>
                <select
                  value={form.line}
                  onChange={(e) => setField("line", e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Select Line</option>
                  {lineOptions.map((line) => <option key={line} value={line}>{line}</option>)}
                </select>
              </div>

              {/* Hour Picker */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Working Hour</label>
                <select
                  value={form.hour}
                  onChange={(e) => setField("hour", e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Select Hour</option>
                  {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Add Defect */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Add Defect</label>
                <SearchableDefectPicker options={defectOptions} onSelect={handleSelectDefect} />
              </div>

              {/* Selected Defects */}
              {form.selectedDefects.length > 0 && (
                <div className="mb-3 space-y-1">
                  {form.selectedDefects.map((d, i) => (
                    <div key={`${d.name}-${i}`} className="flex items-center gap-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1">
                      <span className="flex-1 truncate text-xs font-medium text-gray-800 dark:text-gray-200">{d.name}</span>
                      <input
                        type="number" min="0" placeholder="Qty" value={d.quantity}
                        onChange={(e) => handleDefectQty(i, e.target.value)}
                        className="w-16 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 text-xs"
                      />
                      <button
                        type="button" onClick={() => removeDefect(i)}
                        className="rounded border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Fields */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Inspected Qty", field: "inspectedQty" },
                  { label: "Passed Qty", field: "passedQty" },
                  { label: "Defective Pcs", field: "defectivePcs" },
                  { label: "After Repair", field: "afterRepair" },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <input
                      type="number" min="0" value={form[field]}
                      onChange={(e) => setField(field, e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button" onClick={save} disabled={saving}
                  className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
                <button
                  type="button" onClick={resetForm}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right: Entries */}
          <div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Entries ({rows.length}) — {selectedDateLabel}
                </h2>
                {loading && <span className="text-xs text-gray-500 dark:text-gray-400">Loading...</span>}
              </div>

              {rows.length === 0 ? (
                <div className="rounded border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No entries yet for {selectedDateLabel}.
                </div>
              ) : (
                <div className="space-y-6">
                  {lineOptions.map((line) => {
                    const lineEntries = rows.filter((r) => r.line === line);
                    if (lineEntries.length === 0) return null;
                    const lineInspected = lineEntries.reduce((acc, r) => acc + (r.inspectedQty || 0), 0);
                    const linePassed = lineEntries.reduce((acc, r) => acc + (r.passedQty || 0), 0);
                    const lineDefects = lineEntries.reduce((acc, r) => acc + (r.totalDefects || 0), 0);
                    const lineRFT = lineInspected > 0 ? ((linePassed / lineInspected) * 100).toFixed(1) : 0;

                    return (
                      <div key={line} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                        <div className="mb-3 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/30 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{line} - Hourly Entries</h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                {lineEntries.length} {lineEntries.length === 1 ? "entry" : "entries"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              <div className="text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Inspected</div>
                                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">{lineInspected}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Passed</div>
                                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{linePassed}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Defects</div>
                                <div className="text-sm font-semibold text-red-600 dark:text-red-400">{lineDefects}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400">RFT%</div>
                                <div className={`text-sm font-semibold ${Number(lineRFT) >= 95 ? "text-emerald-600 dark:text-emerald-400" : Number(lineRFT) >= 90 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                                  {lineRFT}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <ul className="space-y-3">
                          {lineEntries.map((r) => (
                            <li key={r._id} className={`rounded border p-3 ${
                              editingId === r._id
                                ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}>
                              <div className="mb-1 flex items-center justify-between">
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {r.hourLabel}{r.building && ` (${r.building})`}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(r.updatedAt || r.createdAt).toLocaleTimeString()}
                                  </span>
                                  <button onClick={() => handleEdit(r)} className="rounded bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60">
                                    Edit
                                  </button>
                                  <button onClick={() => handleDelete(r._id)} disabled={deleting === r._id} className="rounded bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50">
                                    {deleting === r._id ? "..." : "Delete"}
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 md:grid-cols-5">
                                <div><span className="text-gray-500 dark:text-gray-400">Inspected:</span> {r.inspectedQty}</div>
                                <div><span className="text-gray-500 dark:text-gray-400">Passed:</span> {r.passedQty}</div>
                                <div><span className="text-gray-500 dark:text-gray-400">Def.Pcs:</span> {r.defectivePcs}</div>
                                <div><span className="text-gray-500 dark:text-gray-400">After Repair:</span> {r.afterRepair}</div>
                                <div><span className="text-gray-500 dark:text-gray-400">Total Defects:</span> {r.totalDefects}</div>
                              </div>
                              {Array.isArray(r.selectedDefects) && r.selectedDefects.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {r.selectedDefects.map((d, i) => (
                                    <span key={`${d.name}-${i}`} className="rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 text-[11px]">
                                      {d.name}: {d.quantity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}