"use client";
// app/IEDepartment/LineLayout/components.jsx
// ─── Shared Modals, Pickers, and UI primitives ────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import {
  Trash2, X, Check, Ban, Plus, ChevronUp, ChevronDown,
  GripVertical, AlertTriangle, Search, RefreshCw,
} from "lucide-react";

export const FACTORY_OPTIONS = ["K-2", "K-3", "K-4", "Others"];
export const FLOOR_OPTIONS   = ["A-2","B-2","A-3","B-3","A-4","B-4","A-5","B-5","A-6","B-6","C-4","K-3","SMD/CAD","Others"];
export const LINE_OPTIONS    = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0"));
export const BUYER_OPTIONS   = ["Decathlon - knit","Decathlon - woven","Walmart","Columbia","ZXY","CTC","DIESEL","Sports Group Denmark","Identity","Fifth Avenue","Others"];
export const HOURS_OPTIONS   = Array.from({ length: 14 }, (_, i) => i + 1);
export const SERIAL_OPTIONS  = Array.from({ length: 60 }, (_, i) => i + 1);

export const MACHINE_TYPES = [
  "SINGLE NDL (PLAIN M/C)", "SINGLE NDL (TOP FEED) M/C", "SINGLE NDL (NDL FEED) M/C",
  "SINGLE NDL (CUFFS) M/C", "DLM SINGLE NEEDLE VERTICAL CUTTER", "DOUBLE NDL",
  "POCKET WELL (APW) M/C", "3/8 T CHAIN STITCH (3 NDL) M/C", "INTER LOCK (2 NDL 5TH) M/C",
  "OVER LOCK (2 NDL 4TH) M/C", "BARTACK M/C", "KANSAI", "EYELET HOLE M/C", "HELPER",
  "BUTTON HOLE M/C", "ZIG ZAG", "FEED OF THE ARM", "PATTERN TACKER SMALL M/C",
  "PATTERN TACKER BIG M/C", "QUILTING  M/C", "LONG ARM MACHINE",
  "FLAT LOCK ( FLAT BED 3 NDL 5TH) M/C", "FLAT LOCK ( CYLINDER BED) M/C",
  "FLAT LOCK (KNIFE CYLINDER /BOTTOM) M/C", "FLAT LOCK ( BINDING 3 NDL 5TH) M/C",
  "(T) FLAT LOCK (3 NDL 5TH) M/C", "FLAT SEAM Cover stitch M/C (4 NDL 6 THREAD)",
  "EMBROIDERY MACHINE", "SNAP BUTTOM MACHINE", "PIPING CUTTER SINGLE FABRIC",
  "BIAS BINDING AND STRIP CUTTING M/C", "STRIP PIPENG CUTTING MACHINE", "CUTTING M/C",
  "END CUTTER M/C", "AUTOMATIC SPREADING  M/C", "PLASTIC STAPLE ATTACHER MACHINE",
  "LASER CUTTING MACHINE", "PIKOTING MACHING", "BAND KNIFE M/C", "Febric RELAXING MACHINE",
  "NEEDLE DETECTOR M/C", "HAND NEEDLE DETECTOR M/C", "IRON TABLE", "THREAD SUCKING M/C",
  "VELCRO CUTTER", "LEVEL CUTTER", "BUTTON PULL TEST MACHINE", "THREAD RECON MACHINE",
  "FUSING MACHINE", "CARTON BINDER MACHINE", "SEAM SEALING MACHINE H&H",
  "SEAM SEALING MACHINE NAWON", "NAWON STITCH FREE MACHINE", "ULTRASONIC WELDING MACHINE",
  "CROSS OVER PRESS M/C", "STOP MARK MACHINE", "HEAT SEAL MACHINE (BIG)",
  "HEAT SEAL MACHINE (SMALL)", "WATER PRESSURE TESTER MACHINE", "WELDING AND COLLING MACHINE",
  "AUTOMATIC PATTERN CUTTER M/C", "CLOTH DRILL", "PLOTER MACHINE", "FABRIC INSPECTION",
  "Pattern Cutter", "Acrylic Cutter Machine", "FABRIC LOADER MACHINE",
  "FILING MACHINE (REAL DOWN)", "FILING MACHINE (FAKE DOWN)", "Round Hand Cutter M/C",
];

export const MACHINE_COLORS = {
  "SINGLE NDL (PLAIN M/C)":            { bg:"#dbeafe", accent:"#1d4ed8", text:"#1e3a5f", badge:"#1d4ed8", badgeText:"#fff" },
  "SINGLE NDL (TOP FEED) M/C":         { bg:"#dbeafe", accent:"#1d4ed8", text:"#1e3a5f", badge:"#1d4ed8", badgeText:"#fff" },
  "SINGLE NDL (NDL FEED) M/C":         { bg:"#dbeafe", accent:"#1d4ed8", text:"#1e3a5f", badge:"#1d4ed8", badgeText:"#fff" },
  "SINGLE NDL (CUFFS) M/C":            { bg:"#dbeafe", accent:"#1d4ed8", text:"#1e3a5f", badge:"#1d4ed8", badgeText:"#fff" },
  "DLM SINGLE NEEDLE VERTICAL CUTTER": { bg:"#ede9fe", accent:"#7c3aed", text:"#3b1a6e", badge:"#7c3aed", badgeText:"#fff" },
  "DOUBLE NDL":                         { bg:"#e0e7ff", accent:"#4338ca", text:"#1e1b4b", badge:"#4338ca", badgeText:"#fff" },
  "POCKET WELL (APW) M/C":             { bg:"#d1fae5", accent:"#059669", text:"#064e3b", badge:"#059669", badgeText:"#fff" },
  "3/8 T CHAIN STITCH (3 NDL) M/C":    { bg:"#d1fae5", accent:"#059669", text:"#064e3b", badge:"#059669", badgeText:"#fff" },
  "INTER LOCK (2 NDL 5TH) M/C":        { bg:"#ccfbf1", accent:"#0d9488", text:"#134e4a", badge:"#0d9488", badgeText:"#fff" },
  "OVER LOCK (2 NDL 4TH) M/C":         { bg:"#ccfbf1", accent:"#0d9488", text:"#134e4a", badge:"#0d9488", badgeText:"#fff" },
  "BARTACK M/C":                        { bg:"#fce7f3", accent:"#be185d", text:"#500724", badge:"#be185d", badgeText:"#fff" },
  "KANSAI":                             { bg:"#fae8ff", accent:"#a21caf", text:"#3b0764", badge:"#a21caf", badgeText:"#fff" },
  "EYELET HOLE M/C":                    { bg:"#ffedd5", accent:"#c2410c", text:"#431407", badge:"#c2410c", badgeText:"#fff" },
  "HELPER":                             { bg:"#f1f5f9", accent:"#475569", text:"#334155", badge:"#475569", badgeText:"#fff" },
  "default":                            { bg:"#e0f2fe", accent:"#0369a1", text:"#0c4a6e", badge:"#0369a1", badgeText:"#fff" },
};

export function mc(type) { return MACHINE_COLORS[type] || MACHINE_COLORS["default"]; }

export function calcTargets(smv, eff, operator, helper, seamSealing, hours) {
  const manpower = (parseInt(operator)||0) + (parseInt(helper)||0) + (parseInt(seamSealing)||0);
  const e = (parseFloat(eff) || 0) / 100;
  const s = parseFloat(smv) || 0;
  const h = parseInt(hours) || 8;
  if (s === 0 || manpower === 0) return { manpower, oneHourTarget: 0, dailyTarget: 0 };
  const dailyTarget   = Math.round((manpower * h * 60 / s) * e);
  const oneHourTarget = Math.round(dailyTarget / h);
  return { manpower, oneHourTarget, dailyTarget };
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────
export function SearchableSelect({ value, onChange, options, placeholder = "— Select —", className = "" }) {
  const [open,  setOpen]  = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef(null);
  React.useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  return (
    <div ref={ref} className={"relative " + className}>
      <button type="button" onClick={() => { setOpen((o) => !o); setQuery(""); }}
        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-3 text-base text-left flex items-center justify-between focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900 transition-colors">
        <span className={value ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}>{value || placeholder}</span>
        {open ? <ChevronUp size={14} className="text-slate-400 ml-2 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 ml-2 shrink-0" />}
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 placeholder:text-slate-400" />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-center text-slate-400 text-sm py-6">No results found</p>
              : filtered.map((o) => (
                <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                  className={"w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors " + (value === o ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold" : "text-slate-700 dark:text-slate-300")}>
                  {o}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-[999] px-6 py-3 rounded-xl text-base font-semibold shadow-2xl border flex items-center gap-2
      ${toast.type === "success"
        ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
        : "bg-red-50 dark:bg-red-950 border-red-400 dark:border-red-700 text-red-800 dark:text-red-300"}`}>
      {toast.type === "success"
        ? <Check size={16} className="text-emerald-600 shrink-0" />
        : <X size={16} className="text-red-600 shrink-0" />}
      {toast.msg}
    </div>
  );
}

// ─── AddProcessNameModal ──────────────────────────────────────────────────────
export function AddProcessNameModal({ onAdd, onClose }) {
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter a name."); return; }
    setSaving(true);
    try {
      const res  = await fetch("/api/process-names", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
      const json = await res.json();
      if (json.success) { onAdd(json.data.name); onClose(); }
      else setError(json.message);
    } finally { setSaving(false); }
  }
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Add New Process Name</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input autoFocus type="text" value={name} onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Enter process name..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-base transition-all flex items-center justify-center gap-2">
                <Plus size={16} />{saving ? "Adding..." : "Add"}
              </button>
              <button type="button" onClick={onClose}
                className="px-5 border border-slate-300 dark:border-slate-600 hover:border-slate-400 text-slate-600 dark:text-slate-400 rounded-xl text-base transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── WasteFloorPicker ─────────────────────────────────────────────────────────
export function WasteFloorPicker({ processEntry, layoutFloor, onConfirm, onCancel }) {
  const [wasteFloor, setWasteFloor] = useState(layoutFloor || FLOOR_OPTIONS[0]);
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Ban size={24} className="text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Waste Machine</h3>
              <p className="text-slate-500 dark:text-slate-400 text-base">#{processEntry.serialNo} — {processEntry.processName?.substring(0, 40)}</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 font-semibold">Send to which floor?</label>
            <select value={wasteFloor} onChange={(e) => setWasteFloor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-400">
              {FLOOR_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {(processEntry.machines || []).length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Machines</p>
              {(processEntry.machines || []).map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-base text-slate-700 dark:text-slate-300 flex-1">{m.machineName}</span>
                  {m.serialNumber && <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{m.serialNumber}</span>}
                  <span className="text-sm text-amber-600 dark:text-amber-400">{m.fromFloor} →</span>
                  <span className="text-sm text-red-600 dark:text-red-400 font-bold">{wasteFloor}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 mb-5">
            This process will be removed and machines will become idle at <strong className="text-red-600 dark:text-red-400">{wasteFloor}</strong> floor.
          </p>
          <div className="flex gap-3">
            <button onClick={() => onConfirm(wasteFloor)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-base transition-all flex items-center justify-center gap-2">
              <Ban size={16} /> Confirm Waste
            </button>
            <button onClick={onCancel}
              className="px-6 border border-slate-300 dark:border-slate-600 hover:border-slate-400 text-slate-600 dark:text-slate-400 rounded-xl text-base transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MachineFloorPicker ───────────────────────────────────────────────────────
export function MachineFloorPicker({ machineType, factory = "", onConfirm, onCancel }) {
  const [idleUnits, setIdleUnits] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const url  = factory ? `/api/machines?factory=${encodeURIComponent(factory)}` : "/api/machines";
        const res  = await fetch(url);
        const json = await res.json();
        if (json.success) {
          const allIdle = [];
          for (const machine of (json.data || [])) {
            if (machineType !== "HELPER" && machine.machineName !== machineType) continue;
            for (const unit of (machine.units || [])) {
              if (unit.status === "Idle") {
                allIdle.push({ machineId: machine._id, machineName: machine.machineName, serialNumber: unit.serialNumber, fromFloor: unit.floorName });
              }
            }
          }
          allIdle.sort((a, b) => a.machineName.localeCompare(b.machineName) || a.serialNumber.localeCompare(b.serialNumber));
          setIdleUnits(allIdle);
        }
      } finally { setLoading(false); }
    })();
  }, [machineType, factory]);

  function toggleUnit(unit) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.machineId === unit.machineId && s.serialNumber === unit.serialNumber);
      return exists
        ? prev.filter((s) => !(s.machineId === unit.machineId && s.serialNumber === unit.serialNumber))
        : [...prev, unit];
    });
  }
  function isSelected(unit) { return selected.some((s) => s.machineId === unit.machineId && s.serialNumber === unit.serialNumber); }

  const byFloor = idleUnits.reduce((acc, unit) => {
    if (!acc[unit.fromFloor]) acc[unit.fromFloor] = [];
    acc[unit.fromFloor].push(unit);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Select Serial Number</h3>
              <p className="text-slate-400 text-sm mt-0.5">Choose from available idle machines</p>
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full font-medium">{machineType}</span>
          </div>
          {loading ? (
            <p className="text-slate-400 text-base animate-pulse py-10 text-center">Loading...</p>
          ) : idleUnits.length === 0 ? (
            <div className="py-10 text-center">
              <Search size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-base font-medium">No idle machines found.</p>
              <p className="text-slate-400 text-sm mt-1">Add idle units in Machine Inventory.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
              {Object.entries(byFloor).map(([floor, units]) => (
                <div key={floor}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Floor</span>
                    <span className="text-sm font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">{floor}</span>
                    <span className="text-xs text-slate-400">{units.length} idle</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-1">
                    {units.map((unit) => {
                      const sel = isSelected(unit);
                      return (
                        <button key={`${unit.machineId}-${unit.serialNumber}`} type="button" onClick={() => toggleUnit(unit)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-mono font-bold border-2 transition-all
                            ${sel
                              ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
                              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"}`}>
                          {sel && <Check size={12} />}
                          <span>{unit.serialNumber}</span>
                          {machineType === "HELPER" && (
                            <span className={`text-[10px] font-sans font-normal ${sel ? "text-blue-200" : "text-slate-400"}`}>
                              {unit.machineName.split(" ").slice(0, 2).join(" ")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selected.length > 0 && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold mb-2">Selected ({selected.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.map((s) => (
                  <span key={`${s.machineId}-${s.serialNumber}`} className="text-xs font-mono font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg">
                    {s.serialNumber}<span className="ml-1 text-blue-300 font-normal">{s.fromFloor}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-5">
            <button disabled={selected.length === 0} onClick={() => onConfirm(selected)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-base transition-all flex items-center justify-center gap-2">
              {selected.length > 0 ? <><Check size={16} /> Add {selected.length} machine(s)</> : "Select a serial number"}
            </button>
            <button onClick={onCancel}
              className="px-6 border border-slate-300 dark:border-slate-600 hover:border-slate-400 text-slate-600 dark:text-slate-400 rounded-xl text-base transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DeleteLayoutModal ────────────────────────────────────────────────────────
export function DeleteLayoutModal({ deleteTarget, machineFloors, setMachineFloors, deleting, onConfirm, onCancel }) {
  function getAllMachines(layout) {
    const result = [];
    for (const proc of layout.processes || []) {
      for (const m of proc.machines || []) {
        if (m.serialNumber) {
          result.push({
            key: m.serialNumber, serialNumber: m.serialNumber, machineName: m.machineName,
            machineId: m.machineId, fromFloor: m.fromFloor,
            processName: proc.processName, serialNo: proc.serialNo, machineType: proc.machineType,
          });
        }
      }
    }
    return result;
  }

  const allMachines = getAllMachines(deleteTarget);
  const hasMachines = allMachines.length > 0;
  const allFilled   = allMachines.every((m) => machineFloors[m.serialNumber]);

  function applyAllFloors(floor) {
    const next = { ...machineFloors };
    allMachines.forEach((m) => { next[m.serialNumber] = floor; });
    setMachineFloors(next);
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-t-2xl shrink-0" />
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
              <Trash2 size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">Delete Layout</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{deleteTarget.floor} · Line {deleteTarget.lineNo} — {deleteTarget.buyer}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {!hasMachines ? (
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
              This layout has <strong>{deleteTarget.processes?.length || 0} processes</strong> with no assigned machines. It will be permanently deleted.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-0.5 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> {allMachines.length} machine(s) assigned — select return floor for each
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Each machine will be returned to Idle on its chosen floor.</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest shrink-0">Apply all →</span>
                <select defaultValue="" onChange={(e) => { if (e.target.value) applyAllFloors(e.target.value); }}
                  className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-red-400">
                  <option value="">— Set all to same floor —</option>
                  {FLOOR_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                {allMachines.map((m) => {
                  const c   = mc(m.machineType);
                  const sel = machineFloors[m.serialNumber] || "";
                  return (
                    <div key={m.serialNumber} className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                      style={{ background: c.bg, borderColor: `${c.accent}40` }}>
                      <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg shrink-0"
                        style={{ background: c.accent, color: "#fff" }}>{m.serialNumber}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: c.text }}>{m.processName}</p>
                        <p className="text-[10px] font-semibold opacity-70" style={{ color: c.accent }}>
                          {m.machineType} · was on <strong>{m.fromFloor || "—"}</strong>
                        </p>
                      </div>
                      <span className="text-slate-400 text-sm shrink-0">→</span>
                      <select value={sel}
                        onChange={(e) => setMachineFloors((prev) => ({ ...prev, [m.serialNumber]: e.target.value }))}
                        className={`w-32 shrink-0 border rounded-lg px-2 py-1.5 text-sm focus:outline-none transition-colors
                          ${sel
                            ? "bg-white dark:bg-slate-800 border-emerald-400 text-emerald-700 dark:text-emerald-400 font-bold"
                            : "bg-white dark:bg-slate-800 border-red-300 dark:border-red-700 text-red-500 font-semibold"}`}>
                        <option value="">— Floor —</option>
                        {FLOOR_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${sel ? "bg-emerald-400" : "bg-red-400"}`} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${allMachines.length ? (Object.values(machineFloors).filter(Boolean).length / allMachines.length) * 100 : 0}%` }} />
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                  {Object.values(machineFloors).filter(Boolean).length}/{allMachines.length} assigned
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 pb-5 pt-3 border-t border-slate-200 dark:border-slate-700 shrink-0 flex gap-3">
          <button onClick={onConfirm} disabled={deleting || (hasMachines && !allFilled)}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-base transition-all flex items-center justify-center gap-2">
            <Trash2 size={16} />{deleting ? "Deleting..." : "Confirm Delete"}
          </button>
          <button onClick={onCancel}
            className="px-6 border border-slate-300 dark:border-slate-600 hover:border-slate-400 text-slate-600 dark:text-slate-400 rounded-xl text-base transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LayoutGrid ───────────────────────────────────────────────────────────────
export function LayoutGrid({ processes, sketchUrl, onWaste, onSwapSerial, onMoveToSlot, layoutFloor, layoutInfo }) {
  const [wasteTarget, setWasteTarget] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);
  const dragId = useRef(null);

  const sorted = [...processes].sort((a, b) => a.serialNo - b.serialNo);
  const bySerial = {};
  sorted.forEach((p) => { if (!bySerial[p.serialNo]) bySerial[p.serialNo] = []; bySerial[p.serialNo].push(p); });

  const maxSerial = sorted.length > 0 ? sorted[sorted.length - 1].serialNo : 0;
  const allSlots  = Array.from({ length: maxSerial }, (_, i) => i + 1);

  const rowMap = new Map();
  allSlots.forEach((sn) => {
    const rowIdx = Math.ceil(sn / 2) - 1;
    if (!rowMap.has(rowIdx)) rowMap.set(rowIdx, { left: null, right: null });
    if (sn % 2 !== 0) rowMap.get(rowIdx).left  = sn;
    else               rowMap.get(rowIdx).right = sn;
  });
  const rows = Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  const liveTargets = layoutInfo
    ? calcTargets(layoutInfo.smv, layoutInfo.planEfficiency, layoutInfo.operator, layoutInfo.helper, layoutInfo.seamSealing, layoutInfo.workingHours)
    : { manpower: 0, oneHourTarget: 0, dailyTarget: 0 };

  const summary = {};
  sorted.forEach((p) => { const key = p.machineType || "?"; summary[key] = (summary[key] || 0) + (p.machines?.length || 1); });

  const serialProcessMap = {};
  sorted.forEach((p) => {
    (p.machines || []).forEach((m) => {
      if (!m.serialNumber) return;
      if (!serialProcessMap[m.serialNumber]) serialProcessMap[m.serialNumber] = [];
      serialProcessMap[m.serialNumber].push(p._id);
    });
  });
  const duplicateSerials = new Set(
    Object.entries(serialProcessMap).filter(([, ids]) => ids.length > 1).map(([sn]) => sn)
  );

  function handleDragStart(e, id)     { dragId.current = id; e.dataTransfer.effectAllowed = "move"; }
  function handleDragOverCell(e, key) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverKey(key); }
  function handleDragLeave(e)         { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverKey(null); }
  function handleDragEnd()            { setDragOverKey(null); dragId.current = null; }

  function handleDropOnSlot(e, slotSerial) {
    e.preventDefault(); setDragOverKey(null);
    const fromId = dragId.current; dragId.current = null;
    if (!fromId) return;
    const fromProc = processes.find((p) => p._id === fromId);
    if (!fromProc || fromProc.serialNo === slotSerial) return;
    onMoveToSlot(fromId, slotSerial);
  }

  function GroupedCell({ serialNo }) {
    const entries = bySerial[serialNo];
    const key     = `sn:${serialNo}`;
    const isOver  = dragOverKey === key;

    if (!entries) {
      return (
        <div
          onDragOver={(e) => handleDragOverCell(e, key)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnSlot(e, serialNo)}
          style={{
            minHeight: 54, borderRadius: 4, marginBottom: 3,
            border: isOver ? "2px dashed #1d4ed8" : "2px dashed #cbd5e1",
            background: isOver ? "#eff6ff" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.1s, background 0.1s",
          }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: isOver ? "#1d4ed8" : "#94a3b8", letterSpacing: "0.05em" }}>
            {isOver ? `Drop at slot ${serialNo}` : `# ${serialNo} — Empty`}
          </span>
        </div>
      );
    }

    const c = mc(entries[0].machineType);

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, entries[0]._id)}
        onDragOver={(e) => handleDragOverCell(e, key)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          e.preventDefault(); setDragOverKey(null);
          const fromId = dragId.current; dragId.current = null;
          if (!fromId) return;
          const fromProc = processes.find((p) => p._id === fromId);
          if (!fromProc || fromProc.serialNo === serialNo) return;
          onSwapSerial(fromId, fromProc.serialNo, entries[0]._id, serialNo);
        }}
        onDragEnd={handleDragEnd}
        className="group relative cursor-grab active:cursor-grabbing"
        style={{
          background: isOver ? "#dbeafe" : c.bg,
          borderLeft: `5px solid ${isOver ? "#1d4ed8" : c.accent}`,
          borderTop: isOver ? "2px solid #1d4ed8" : "1px solid rgba(0,0,0,0.08)",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 4, marginBottom: 3,
          opacity: dragId.current === entries[0]._id ? 0.4 : 1,
          transition: "border-color 0.1s, background 0.1s",
        }}>
        <GripVertical size={12} className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-300 select-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="px-4 py-2">
          <div className="flex items-start gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black px-2 py-0.5 rounded shrink-0"
              style={{ background: isOver ? "#1d4ed8" : c.badge, color: c.badgeText }}>
              {serialNo}
            </span>
            {entries[0].machineType !== "HELPER" && entries.flatMap((e) => e.machines || []).map((m, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded font-bold shrink-0"
                style={{ background: c.accent, color: "#fff", opacity: 0.9 }}>{m.fromFloor}</span>
            ))}
          </div>
          {entries.map((entry, idx) => {
            const serials = (entry.machines || []).filter((m) => m.serialNumber).map((m) => m.serialNumber);
            return (
              <div key={entry._id}
                style={{
                  marginBottom:  idx < entries.length - 1 ? 6 : 0,
                  paddingBottom: idx < entries.length - 1 ? 6 : 0,
                  borderBottom:  idx < entries.length - 1 ? `1px dashed ${c.accent}40` : "none",
                  position: "relative",
                }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setWasteTarget(entry); }}
                  title="Waste"
                  className="absolute top-0 right-0 w-6 h-6 rounded-full hidden group-hover:flex items-center justify-center bg-red-100 hover:bg-red-500 text-red-600 hover:text-white transition-all z-10 shadow">
                  <X size={12} />
                </button>
                {entries.length > 1 && (
                  <div className="text-[9px] font-black uppercase tracking-widest mb-0.5"
                    style={{ color: `${c.accent}80` }}>Process {idx + 1}</div>
                )}
                <p className="text-sm font-semibold leading-snug mb-1.5" style={{ color: isOver ? "#1e3a5f" : c.text }}>
                  {entry.processName}
                </p>
                <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: isOver ? "#1d4ed8" : c.accent }}>
                  {entry.machineType}
                </p>
                {serials.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 border-t pt-1.5" style={{ borderColor: `${c.accent}30` }}>
                    <span className="text-[10px] uppercase tracking-widest font-bold mr-1" style={{ color: `${c.accent}99` }}>S/N:</span>
                    {serials.map((sn) => {
                      const isDup = duplicateSerials.has(sn);
                      return isDup ? (
                        <span key={sn} className="text-[11px] font-mono font-black px-2 py-0.5 rounded flex items-center gap-1 animate-pulse"
                          style={{ background: "#fef3c7", color: "#b45309", border: "2px solid #f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.5)" }}>
                          <AlertTriangle size={10} /> {sn}
                        </span>
                      ) : (
                        <span key={sn} className="text-[11px] font-mono font-black px-2 py-0.5 rounded"
                          style={{ background: `${c.accent}18`, color: c.accent, border: `1px solid ${c.accent}40` }}>{sn}</span>
                      );
                    })}
                  </div>
                )}
                {serials.some((sn) => duplicateSerials.has(sn)) && (
                  <div className="mt-1.5 flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded px-2 py-1">
                    <AlertTriangle size={10} className="text-amber-600 shrink-0" />
                    <span className="text-[10px] font-bold text-amber-700">Duplicate serial — also used in another process</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-white dark:bg-slate-950 relative">
      {wasteTarget && (
        <WasteFloorPicker processEntry={wasteTarget} layoutFloor={layoutFloor}
          onConfirm={(floor) => { onWaste(wasteTarget._id, floor); setWasteTarget(null); }}
          onCancel={() => setWasteTarget(null)} />
      )}
      {layoutInfo && (
        <div className="sticky top-0 z-20 bg-[#f0f4f8] dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-700">
          <div className="text-center py-2 border-b border-slate-300 dark:border-slate-700 flex items-center justify-center gap-3">
            <span className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">MACHINE LAYOUT</span>
            <span className="text-xs text-slate-400 font-normal normal-case tracking-normal">· drag to swap serial or move to empty slot</span>
          </div>
          <div className="flex items-stretch divide-x divide-slate-300 dark:divide-slate-700">
            <div className="flex-1 grid grid-cols-3 divide-x divide-slate-300 dark:divide-slate-700 text-sm">
              {[
                { label: "Unit / Floor",  value: `${layoutInfo.floor} · Line ${layoutInfo.lineNo}` },
                { label: "Buyer",         value: layoutInfo.buyer },
                { label: "Style",         value: layoutInfo.style },
                { label: "Item",          value: layoutInfo.item },
                { label: "SMV",           value: layoutInfo.smv },
                { label: "Plan Eff.",     value: `${layoutInfo.planEfficiency}%` },
                { label: "Op + Hel + SS", value: `${layoutInfo.operator}+${layoutInfo.helper}+${layoutInfo.seamSealing}` },
                { label: "Manpower",      value: liveTargets.manpower },
                { label: "Working Hrs",   value: `${layoutInfo.workingHours}h` },
                { label: "1 Hour Tgt",    value: liveTargets.oneHourTarget },
                { label: `Daily Tgt (${layoutInfo.workingHours}h)`, value: liveTargets.dailyTarget },
                { label: "Processes",     value: processes.length },
              ].map(({ label, value }) => (
                <div key={label} className="px-3 py-2 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{label}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 ml-2">{value ?? "—"}</span>
                </div>
              ))}
            </div>
            {sketchUrl && (
              <div className="shrink-0 w-40 flex items-center justify-center bg-white dark:bg-slate-800 p-2">
                <img src={sketchUrl} alt="Line Sketch" className="max-h-28 max-w-full object-contain rounded shadow-sm border border-slate-200 dark:border-slate-700" />
              </div>
            )}
          </div>
        </div>
      )}
      {Object.keys(summary).length > 0 && (
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-wrap gap-2 items-center">
          {Object.entries(summary).map(([type, count]) => {
            const c = mc(type);
            return (
              <span key={type} className="text-xs font-bold px-2.5 py-1.5 rounded border"
                style={{ background: c.bg, borderColor: c.accent, color: c.text }}>
                {type}: <strong style={{ color: c.accent }}>{count}</strong>
              </span>
            );
          })}
          {duplicateSerials.size > 0 && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border-2 border-amber-400 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 animate-pulse">
              <AlertTriangle size={12} /> {duplicateSerials.size} duplicate serial{duplicateSerials.size > 1 ? "s" : ""}: {[...duplicateSerials].join(", ")}
            </span>
          )}
        </div>
      )}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
          <span className="text-4xl">📋</span>
          <p className="text-base">Add processes to see the layout here</p>
        </div>
      ) : (
        <table className="w-full border-collapse relative z-10" style={{ tableLayout: "fixed" }}>
          <colgroup><col style={{ width: "50%" }}/><col style={{ width: "50%" }}/></colgroup>
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="text-center text-sm font-black py-3 px-3 border-2 border-slate-400 bg-[#1d4ed8] text-white tracking-widest uppercase">← LEFT SIDE</th>
              <th className="text-center text-sm font-black py-3 px-3 border-2 border-slate-400 bg-[#1e3a5f] text-white tracking-widest uppercase">RIGHT SIDE →</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ left: leftSn, right: rightSn }, rowIdx) => {
              const bandBg = rowIdx % 2 === 0 ? undefined : "#f8fafc";
              return (
                <tr key={rowIdx}>
                  <td className="border border-slate-200 dark:border-slate-700 p-2 align-top"
                    style={bandBg ? { background: bandBg } : {}}>
                    {leftSn != null && <GroupedCell serialNo={leftSn} />}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2 align-top"
                    style={bandBg ? { background: bandBg } : {}}>
                    {rightSn != null && <GroupedCell serialNo={rightSn} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Primitive form helpers ───────────────────────────────────────────────────
export function LField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function LInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500" />
  );
}

export function LSelect({ value, onChange, options, placeholder, renderOption }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-3 text-base appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900 transition-colors">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{renderOption ? renderOption(o) : o}</option>)}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}