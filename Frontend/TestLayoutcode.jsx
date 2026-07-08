"use client";
// app/IEDepartment/LineLayout/page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/app/hooks/useAuth";

// ─── Constants ────────────────────────────────────────────────────────────────
const FACTORY_OPTIONS = ["K-2", "K-3", "K-4", "Others"];
const FLOOR_OPTIONS   = ["A-2","B-2","A-3","B-3","A-4","B-4","A-5","B-5","A-6","B-6","C-4","K-3","SMD/CAD","Others"];
const LINE_OPTIONS    = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0"));
const BUYER_OPTIONS   = ["Decathlon - knit","Decathlon - woven","Walmart","Columbia","ZXY","CTC","DIESEL","Sports Group Denmark","Identity","Fifth Avenue","Others"];
const HOURS_OPTIONS   = Array.from({ length: 14 }, (_, i) => i + 1);
const SERIAL_OPTIONS  = Array.from({ length: 60 }, (_, i) => i + 1);

const MACHINE_TYPES = [
  "SINGLE NDL (PLAIN M/C)",
  "SINGLE NDL (TOP FEED) M/C)",
  "SINGLE NDL (NDL FEED) M/C",
  "SINGLE NDL (CUFFS) M/C",
  "DLM SINGLE NEEDLE VERTICAL CUTTER",
  "DOUBLE NDL",
  "POCKET WELL (APW) M/C",
  "3/8 T CHAIN STITCH (3 NDL) M/C",
  "INTER LOCK (2 NDL 5TH) M/C",
  "OVER LOCK (2 NDL 4TH) M/C",
  "BARTACK M/C",
  "KANSAI",
  "EYELET HOLE M/C",
  "HELPER",
  "BUTTON HOLE M/C",
  "ZIG ZAG",
  "FEED OF THE ARM",
  "PATTERN TACKER SMALL M/C",
  "PATTERN TACKER BIG M/C",
  "QUILTING  M/C",
  "LONG ARM MACHINE",
  "FLAT LOCK ( FLAT BED 3 NDL 5TH) M/C",
  "FLAT LOCK ( CYLINDER BED) M/C",
  "FLAT LOCK (KNIFE CYLINDER /BOTTOM) M/C",
  "FLAT LOCK ( BINDING 3 NDL 5TH) M/C",
  "(T) FLAT LOCK (3 NDL 5TH) M/C",
  "FLAT SEAM Cover stitch M/C (4 NDL 6 THREAD)",
  "EMBROIDERY MACHINE",
  "SNAP BUTTOM MACHINE",
  "PIPING CUTTER SINGLE FABRIC",
  "BIAS BINDING AND STRIP CUTTING M/C",
  "STRIP PIPENG CUTTING MACHINE",
  "CUTTING M/C",
  "END CUTTER M/C",
  "AUTOMATIC SPREADING  M/C",
  "PLASTIC STAPLE ATTACHER MACHINE",
  "LASER CUTTING MACHINE",
  "PIKOTING MACHING",
  "BAND KNIFE M/C",
  "Febric RELAXING MACHINE",
  "NEEDLE DETECTOR M/C",
  "HAND NEEDLE DETECTOR M/C",
  "IRON TABLE",
  "THREAD SUCKING M/C",
  "VELCRO CUTTER",
  "LEVEL CUTTER",
  "BUTTON PULL TEST MACHINE",
  "THREAD RECON MACHINE",
  "FUSING MACHINE",
  "CARTON BINDER MACHINE",
  "SEAM SEALING MACHINE H&H",
  "SEAM SEALING MACHINE NAWON",
  "NAWON STITCH FREE MACHINE",
  "ULTRASONIC WELDING MACHINE",
  "CROSS OVER PRESS M/C",
  "STOP MARK MACHINE",
  "HEAT SEAL MACHINE (BIG)",
  "HEAT SEAL MACHINE (SMALL)",
  "WATER PRESSURE TESTER MACHINE",
  "WELDING AND COLLING MACHINE",
  "AUTOMATIC PATTERN CUTTER M/C",
  "CLOTH DRILL",
  "PLOTER MACHINE",
  "FABRIC INSPECTION",
  "Pattern Cutter",
  "Acrylic Cutter Machine",
  "FABRIC LOADER MACHINE",
  "FILING MACHINE (REAL DOWN)",
  "FILING MACHINE (FAKE DOWN)",
  "Round Hand Cutter M/C",
];
const MACHINE_COLORS = {
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

function mc(type) { return MACHINE_COLORS[type] || MACHINE_COLORS["default"]; }

// ─── FIX-1: Always compute targets live from fields, never trust stored values ──
function calcTargets(smv, eff, operator, helper, seamSealing, hours) {
  const manpower = (parseInt(operator)||0) + (parseInt(helper)||0) + (parseInt(seamSealing)||0);
  const e = (parseFloat(eff) || 0) / 100;
  const s = parseFloat(smv) || 0;
  const h = parseInt(hours) || 8;
  if (s === 0 || manpower === 0) return { manpower, oneHourTarget: 0, dailyTarget: 0 };
  const dailyTarget   = Math.round((manpower * h * 60 / s) * e);
  const oneHourTarget = Math.round(dailyTarget / h);
  return { manpower, oneHourTarget, dailyTarget };
}

// ─── openPrintWindow ──────────────────────────────────────────────────────────
// Compact print: info table + image side-by-side, tiny fonts to fit 50 processes on A4
function openPrintWindow(layout) {
  if (!layout) return;

  // FIX-1: recompute targets from fields so print always shows correct values
  const computed = calcTargets(
    layout.smv, layout.planEfficiency,
    layout.operator, layout.helper, layout.seamSealing, layout.workingHours
  );

  const procs = [...(layout.processes || [])].sort((a, b) => a.serialNo - b.serialNo);

  const bySn = {};
  procs.forEach((p) => {
    if (!bySn[p.serialNo]) bySn[p.serialNo] = [];
    bySn[p.serialNo].push(p);
  });

  const maxSn = procs.length ? procs[procs.length - 1].serialNo : 0;

  const pairs = [];
  for (let sn = 1; sn <= maxSn; sn += 2) {
    const L = bySn[sn]     || null;
    const R = bySn[sn + 1] || null;
    if (!L && !R) continue;
    pairs.push({ L, R });
  }

  const machSummary = {};
  procs.forEach((p) => {
    if (!p.machineType || p.machineType === "HELPER") return;
    machSummary[p.machineType] = (machSummary[p.machineType] || 0) + (p.machines?.length || 1);
  });
  const machTotal = Object.values(machSummary).reduce((a, b) => a + b, 0);

  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Compact info rows — 5 rows × 2 col-pairs, very small font
  const infoRows = [
    ["Unit",  `${layout.floor} - LINE NO-${layout.lineNo}`, "Plan Efficiency:",                              `${layout.planEfficiency}%`],
    ["Buyer", layout.buyer,                                  "Op + Hel + Seam Sealing",                      `${layout.operator}+${layout.helper}+${layout.seamSealing}`],
    ["Style", layout.style,                                  "Manpower:",                                    computed.manpower],
    ["Item",  layout.item,                                   "1 Hour Target:",                               computed.oneHourTarget],
    ["SMV",   layout.smv,                                    `Total Daily Target (${layout.workingHours}hrs)`, computed.dailyTarget],
  ].map(([l, v, l2, v2]) => `
    <tr style="height:14px">
      <td style="border:1px solid #000;font-weight:bold;padding:1px 2px;font-size:6px">${esc(l)}</td>
      <td colspan="2" style="border:1px solid #000;padding:1px 2px;font-size:6px">${esc(v)}</td>
      <td style="border:1px solid #000;font-weight:bold;text-align:right;padding:1px 2px;font-size:6px">${esc(l2)}</td>
      <td style="border:1px solid #000;font-weight:bold;text-align:center;padding:1px 2px;font-size:6px">${esc(v2)}</td>
    </tr>`).join("");

  function cellHtml(e) {
    if (!e) return `
      <td style="border:1px solid #000;padding:1px 2px"></td>
      <td style="border:1px solid #000;padding:1px 2px"></td>
      <td style="border:1px solid #000;padding:1px 2px"></td>`;
    return `
      <td style="border:1px solid #000;text-align:center;font-weight:bold;font-size:6px;padding:1px 2px">${esc(e.serialNo)}</td>
      <td style="border:1px solid #000;font-weight:bold;font-size:6px;padding:1px 2px;white-space:normal">${esc(e.processName)}</td>
      <td style="border:1px solid #000;text-align:center;font-weight:bold;font-size:5.5px;padding:1px 2px;white-space:normal;line-height:1.1">${esc(e.machineType ?? "")}</td>`;
  }

  const processRows = pairs.map(({ L, R }) => {
    const la = L || [];
    const ra = R || [];
    const n  = Math.max(la.length, ra.length);
    let html = "";
    for (let i = 0; i < n; i++) {
      html += `<tr style="height:14px">
        ${cellHtml(la[i] ?? null)}
        <td style="border:none;width:2px"></td>
        ${cellHtml(ra[i] ?? null)}
        <td style="border:none;width:2px"></td>
      </tr>`;
    }
    return html;
  }).join("");

  const machRows = Object.entries(machSummary).map(([m, q]) =>
    `<tr style="height:12px">
      <td style="border:1px solid #000;padding:1px 2px;font-size:5.5px">${esc(m)}</td>
      <td style="border:1px solid #000;text-align:center;font-size:6px;padding:1px 2px">${q}</td>
    </tr>`
  ).join("");

  // Image placed BESIDE the info table (right cell)
  const sketchImg = layout.sketchUrl
    ? `<img src="${esc(layout.sketchUrl)}" style="max-height:60px;max-width:90px;object-fit:contain;" crossorigin="anonymous"/>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Line Layout - ${esc(layout.floor)} Line ${esc(layout.lineNo)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 5mm 6mm; font-family: Arial, sans-serif; font-size: 6px; background: #fff; }
    table { border-collapse: collapse; }
    @page { size: A4 portrait; margin: 0; }
    tr { page-break-inside: avoid; }
    thead { display: table-header-group; }
  </style>
</head>
<body>
  <div>

    <!-- Company title -->
    <table style="width:100%;margin-bottom:1px">
      <tr>
        <td style="border:1px solid #000;font-weight:bold;font-size:9px;text-align:center;padding:2px 4px">
          HKD OUTDOOR INNOVATIONS LTD
        </td>
      </tr>
    </table>

    <table style="width:100%;margin-bottom:2px">
      <tr><td style="border:1px solid #000;font-weight:bold;font-size:8px;text-align:center;padding:2px 4px;background:#FFFF00">MACHINE LAYOUT</td></tr>
    </table>

    <!-- Info table + image side by side -->
    <table style="width:100%;margin-bottom:4px;border-collapse:collapse">
      <tr>
        <!-- Info section -->
        <td style="padding:0;vertical-align:top;width:82%">
          <table style="width:100%;border-collapse:collapse">
            <colgroup>
              <col style="width:13%"><col style="width:28%"><col style="width:10%">
              <col style="width:30%"><col style="width:19%">
            </colgroup>
            <tbody>${infoRows}</tbody>
          </table>
        </td>
        <!-- Image section -->
        <td style="border:1px solid #000;text-align:center;vertical-align:middle;padding:2px;width:18%">
          ${sketchImg}
        </td>
      </tr>
    </table>

    <!-- Process table -->
    <table style="width:100%;margin-bottom:5px">
      <colgroup>
        <col style="width:4%"><col style="width:28%"><col style="width:13%"><col style="width:2%">
        <col style="width:4%"><col style="width:28%"><col style="width:13%"><col style="width:2%">
        <col style="width:6%">
      </colgroup>
      <thead>
        <tr>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6px">SL</td>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6px">Process Name</td>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6px">Machine</td>
          <td style="border:none"></td>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6px">SL</td>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6px">Process Name</td>
          <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6px">Machine</td>
          <td style="border:none"></td>
        </tr>
      </thead>
      <tbody>${processRows}</tbody>
    </table>

    <!-- Machine summary -->
    <table style="width:42%;margin-bottom:12px">
      <tr>
        <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6px">Machine Name</td>
        <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6px;width:18%">Qty</td>
      </tr>
      ${machRows}
      <tr style="height:12px">
        <td style="border:1px solid #000;font-weight:bold;padding:1px 2px;font-size:6px">Total</td>
        <td style="border:1px solid #000;font-weight:bold;text-align:center;padding:1px 2px;font-size:6px">${machTotal}</td>
      </tr>
    </table>

    <!-- Signature row -->
    <table style="width:100%">
      <colgroup><col style="width:25%"><col style="width:25%"><col style="width:25%"><col style="width:25%"></colgroup>
      <tr style="height:30px">
        <td style="border:1px solid #000;font-weight:bold;text-align:center;vertical-align:bottom;padding:2px 4px;font-size:6px">Sr. Supervisor</td>
        <td style="border:1px solid #000;font-weight:bold;text-align:center;vertical-align:bottom;padding:2px 4px;font-size:6px">Technician</td>
        <td style="border:1px solid #000;font-weight:bold;text-align:center;vertical-align:bottom;padding:2px 4px;font-size:6px">IE Executive</td>
        <td style="border:1px solid #000;font-weight:bold;text-align:center;vertical-align:bottom;padding:2px 4px;font-size:6px">Maintenance Supervisor</td>
      </tr>
    </table>

  </div>
</body>
</html>`;

  const old = document.getElementById("ll-print-iframe");
  if (old) old.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "ll-print-iframe";
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
  document.body.appendChild(iframe);

  const iDoc = iframe.contentDocument || iframe.contentWindow.document;
  iDoc.open();
  iDoc.write(html);
  iDoc.close();

  setTimeout(() => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
    catch (e) { console.error("iframe print failed:", e); }
    setTimeout(() => { iframe.remove(); }, 10000);
  }, 500);
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────
function SearchableSelect({ value, onChange, options, placeholder = "— Select —", className = "" }) {
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
        className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-3 text-base text-left flex items-center justify-between focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors">
        <span className={value ? "text-slate-800" : "text-slate-400"}>{value || placeholder}</span>
        <span className="text-slate-400 text-sm ml-2">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-slate-200">
            <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 placeholder:text-slate-400" />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-center text-slate-400 text-sm py-6">No results found</p>
              : filtered.map((o) => (
                <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                  className={"w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors " + (value === o ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700")}>
                  {o}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AddProcessNameModal ──────────────────────────────────────────────────────
function AddProcessNameModal({ onAdd, onClose }) {
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
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-lg">Add New Process Name</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input autoFocus type="text" value={name} onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Enter process name..." className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500 placeholder:text-slate-400" />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-base transition-all">{saving ? "Adding..." : "+ Add"}</button>
              <button type="button" onClick={onClose} className="px-5 border border-slate-300 hover:border-slate-400 text-slate-600 rounded-xl text-base transition-all">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-[999] px-6 py-3 rounded-xl text-base font-semibold shadow-2xl border
      ${toast.type === "success" ? "bg-emerald-50 border-emerald-400 text-emerald-800" : "bg-red-50 border-red-400 text-red-800"}`}>
      {toast.type === "success" ? "✓ " : "✕ "}{toast.msg}
    </div>
  );
}

// ─── Waste Floor Picker ───────────────────────────────────────────────────────
function WasteFloorPicker({ processEntry, layoutFloor, onConfirm, onCancel }) {
  const [wasteFloor, setWasteFloor] = useState(layoutFloor || FLOOR_OPTIONS[0]);
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🚫</span>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Waste Machine</h3>
              <p className="text-slate-500 text-base">#{processEntry.serialNo} — {processEntry.processName?.substring(0, 40)}</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-500 uppercase tracking-widest mb-2 font-semibold">Send to which floor?</label>
            <select value={wasteFloor} onChange={(e) => setWasteFloor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-400">
              {FLOOR_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {(processEntry.machines || []).length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Machines</p>
              {(processEntry.machines || []).map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-base text-slate-700 flex-1">{m.machineName}</span>
                  {m.serialNumber && <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{m.serialNumber}</span>}
                  <span className="text-sm text-amber-600">{m.fromFloor} →</span>
                  <span className="text-sm text-red-600 font-bold">{wasteFloor}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-5">
            This process will be removed and machines will become idle at <strong className="text-red-600">{wasteFloor}</strong> floor.
          </p>
          <div className="flex gap-3">
            <button onClick={() => onConfirm(wasteFloor)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-base transition-all">🚫 Confirm Waste</button>
            <button onClick={onCancel} className="px-6 border border-slate-300 hover:border-slate-400 text-slate-600 rounded-xl text-base transition-all">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Machine Serial Picker Modal ──────────────────────────────────────────────
function MachineFloorPicker({ machineType, factory = "", onConfirm, onCancel }) {
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Select Serial Number</h3>
              <p className="text-slate-400 text-sm mt-0.5">Choose from available idle machines</p>
            </div>
            <span className="text-sm text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-medium">{machineType}</span>
          </div>
          {loading ? (
            <p className="text-slate-400 text-base animate-pulse py-10 text-center">Loading...</p>
          ) : idleUnits.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-slate-500 text-base font-medium">No idle machines found.</p>
              <p className="text-slate-400 text-sm mt-1">Add idle units in Machine Inventory.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
              {Object.entries(byFloor).map(([floor, units]) => (
                <div key={floor}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Floor</span>
                    <span className="text-sm font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">{floor}</span>
                    <span className="text-xs text-slate-400">{units.length} idle</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-1">
                    {units.map((unit) => {
                      const sel = isSelected(unit);
                      return (
                        <button key={`${unit.machineId}-${unit.serialNumber}`} type="button" onClick={() => toggleUnit(unit)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-mono font-bold border-2 transition-all
                            ${sel ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-200" : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50"}`}>
                          {sel && <span className="text-xs">✓</span>}
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
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-600 uppercase tracking-widest font-bold mb-2">Selected ({selected.length})</p>
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-base transition-all">
              {selected.length > 0 ? `Add ${selected.length} machine(s) →` : "Select a serial number"}
            </button>
            <button onClick={onCancel} className="px-6 border border-slate-300 hover:border-slate-400 text-slate-600 rounded-xl text-base transition-all">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Excel-Style Layout Grid ──────────────────────────────────────────────────
function LayoutGrid({ processes, sketchUrl, onWaste, onSwapSerial, onMoveToSlot, layoutFloor, layoutInfo }) {
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

  // FIX-1: compute targets live from layoutInfo fields
  const liveTargets = layoutInfo
    ? calcTargets(layoutInfo.smv, layoutInfo.planEfficiency, layoutInfo.operator, layoutInfo.helper, layoutInfo.seamSealing, layoutInfo.workingHours)
    : { manpower: 0, oneHourTarget: 0, dailyTarget: 0 };

  const summary = {};
  sorted.forEach((p) => { const key = p.machineType || "?"; summary[key] = (summary[key] || 0) + (p.machines?.length || 1); });

  function handleDragStart(e, id)     { dragId.current = id; e.dataTransfer.effectAllowed = "move"; }
  function handleDragOverCell(e, key) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverKey(key); }
  function handleDragLeave(e)         { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverKey(null); }
  function handleDragEnd()            { setDragOverKey(null); dragId.current = null; }

  function handleDropOnProcess(e, targetId) {
    e.preventDefault(); setDragOverKey(null);
    const fromId = dragId.current; dragId.current = null;
    if (!fromId || fromId === targetId) return;
    const fromProc = processes.find((p) => p._id === fromId);
    const toProc   = processes.find((p) => p._id === targetId);
    if (fromProc && toProc) onSwapSerial(fromId, fromProc.serialNo, targetId, toProc.serialNo);
  }

  function handleDropOnSlot(e, slotSerial) {
    e.preventDefault(); setDragOverKey(null);
    const fromId = dragId.current; dragId.current = null;
    if (!fromId) return;
    const fromProc = processes.find((p) => p._id === fromId);
    if (!fromProc || fromProc.serialNo === slotSerial) return;
    onMoveToSlot(fromId, slotSerial);
  }

  function ProcessCell({ entry }) {
    const c      = mc(entry.machineType);
    const key    = `id:${entry._id}`;
    const isOver = dragOverKey === key;
    const serials = (entry.machines || []).filter((m) => m.serialNumber).map((m) => m.serialNumber);
    return (
      <div draggable onDragStart={(e) => handleDragStart(e, entry._id)}
        onDragOver={(e) => handleDragOverCell(e, key)} onDragLeave={handleDragLeave}
        onDrop={(e) => handleDropOnProcess(e, entry._id)} onDragEnd={handleDragEnd}
        className="group relative cursor-grab active:cursor-grabbing"
        style={{
          background: isOver ? "#dbeafe" : c.bg, borderLeft: `5px solid ${isOver ? "#1d4ed8" : c.accent}`,
          borderTop: isOver ? "2px solid #1d4ed8" : "1px solid rgba(0,0,0,0.08)",
          borderRight: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 4, marginBottom: 3, opacity: dragId.current === entry._id ? 0.4 : 1,
          transition: "border-color 0.1s, background 0.1s",
        }}>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-300 text-xs select-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">⣿</span>
        <button onClick={(e) => { e.stopPropagation(); setWasteTarget(entry); }} title="Waste"
          className="absolute top-1 right-1 w-6 h-6 rounded-full hidden group-hover:flex items-center justify-center text-xs font-black bg-red-100 hover:bg-red-500 text-red-600 hover:text-white transition-all z-10 shadow">✕</button>
        <div className="px-4 py-2">
          <div className="flex items-start gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black px-2 py-0.5 rounded shrink-0"
              style={{ background: isOver ? "#1d4ed8" : c.badge, color: c.badgeText }}>{entry.serialNo}</span>
            {entry.machineType !== "HELPER" && (entry.machines || []).map((m, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded font-bold shrink-0"
                style={{ background: c.accent, color: "#fff", opacity: 0.9 }}>{m.fromFloor}</span>
            ))}
          </div>
          <p className="text-sm font-semibold leading-snug mb-1.5" style={{ color: isOver ? "#1e3a5f" : c.text }}>{entry.processName}</p>
          <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: isOver ? "#1d4ed8" : c.accent }}>{entry.machineType}</p>
          {serials.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 border-t pt-1.5" style={{ borderColor: `${c.accent}30` }}>
              <span className="text-[10px] uppercase tracking-widest font-bold mr-1" style={{ color: `${c.accent}99` }}>S/N:</span>
              {serials.map((sn) => (
                <span key={sn} className="text-[11px] font-mono font-black px-2 py-0.5 rounded"
                  style={{ background: `${c.accent}18`, color: c.accent, border: `1px solid ${c.accent}40` }}>{sn}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function EmptySlot({ serialNo }) {
    const key    = `slot:${serialNo}`;
    const isOver = dragOverKey === key;
    return (
      <div onDragOver={(e) => handleDragOverCell(e, key)} onDragLeave={handleDragLeave} onDrop={(e) => handleDropOnSlot(e, serialNo)}
        style={{
          minHeight: 54, borderRadius: 4, marginBottom: 3,
          border: isOver ? "2px dashed #1d4ed8" : "2px dashed #cbd5e1",
          background: isOver ? "#eff6ff" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "border-color 0.1s, background 0.1s",
        }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: isOver ? "#1d4ed8" : "#94a3b8", letterSpacing: "0.05em" }}>
          {isOver ? `▼ Drop at slot ${serialNo}` : `# ${serialNo} — Empty`}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-white relative">
      {wasteTarget && (
        <WasteFloorPicker processEntry={wasteTarget} layoutFloor={layoutFloor}
          onConfirm={(floor) => { onWaste(wasteTarget._id, floor); setWasteTarget(null); }}
          onCancel={() => setWasteTarget(null)} />
      )}
      {layoutInfo && (
        <div className="sticky top-0 z-20 bg-[#f0f4f8] border-b-2 border-slate-300">
          <div className="text-center py-2 border-b border-slate-300 flex items-center justify-center gap-3">
            <span className="text-sm font-black uppercase tracking-widest text-slate-700">MACHINE LAYOUT</span>
            <span className="text-xs text-slate-400 font-normal normal-case tracking-normal">· drag to swap serial or move to empty slot</span>
          </div>
          <div className="flex items-stretch divide-x divide-slate-300">
            <div className="flex-1 grid grid-cols-3 divide-x divide-slate-300 text-sm">
              {[
                { label: "Unit / Floor",  value: `${layoutInfo.floor} · Line ${layoutInfo.lineNo}` },
                { label: "Buyer",         value: layoutInfo.buyer },
                { label: "Style",         value: layoutInfo.style },
                { label: "Item",          value: layoutInfo.item },
                { label: "SMV",           value: layoutInfo.smv },
                { label: "Plan Eff.",     value: `${layoutInfo.planEfficiency}%` },
                { label: "Op + Hel + SS", value: `${layoutInfo.operator}+${layoutInfo.helper}+${layoutInfo.seamSealing}` },
                // FIX-1: show live-computed targets instead of stored ones
                { label: "Manpower",      value: liveTargets.manpower },
                { label: "Working Hrs",   value: `${layoutInfo.workingHours}h` },
                { label: "1 Hour Tgt",    value: liveTargets.oneHourTarget },
                { label: `Daily Tgt (${layoutInfo.workingHours}h)`, value: liveTargets.dailyTarget },
                { label: "Processes",     value: processes.length },
              ].map(({ label, value }) => (
                <div key={label} className="px-3 py-2 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{label}:</span>
                  <span className="font-bold text-slate-800 ml-2">{value ?? "—"}</span>
                </div>
              ))}
            </div>
            {sketchUrl && (
              <div className="shrink-0 w-40 flex items-center justify-center bg-white p-2">
                <img src={sketchUrl} alt="Line Sketch" className="max-h-28 max-w-full object-contain rounded shadow-sm border border-slate-200" />
              </div>
            )}
          </div>
        </div>
      )}
      {Object.keys(summary).length > 0 && (
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-2">
          {Object.entries(summary).map(([type, count]) => {
            const c = mc(type);
            return (
              <span key={type} className="text-xs font-bold px-2.5 py-1.5 rounded border"
                style={{ background: c.bg, borderColor: c.accent, color: c.text }}>
                {type}: <strong style={{ color: c.accent }}>{count}</strong>
              </span>
            );
          })}
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
              const bandBg = rowIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
              return (
                <tr key={rowIdx}>
                  <td className="border border-slate-200 p-2 align-top" style={{ background: bandBg }}>
                    {leftSn != null && (bySerial[leftSn]
                      ? bySerial[leftSn].map((e) => <ProcessCell key={e._id} entry={e} />)
                      : <EmptySlot serialNo={leftSn} />)}
                  </td>
                  <td className="border border-slate-200 p-2 align-top" style={{ background: bandBg }}>
                    {rightSn != null && (bySerial[rightSn]
                      ? bySerial[rightSn].map((e) => <ProcessCell key={e._id} entry={e} />)
                      : <EmptySlot serialNo={rightSn} />)}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LineLayoutPage() {
  const { auth } = useAuth();
  const userFactory = auth?.factory ?? "";
  const isAdmin     = auth?.role === "Admin" || auth?.role === "IE";

  const [view, setView]               = useState("list");
  const [filterFactory, setFilterFactory] = useState("");
  const effectiveFactory = isAdmin ? (filterFactory || "") : userFactory;
  const [filterFloor, setFilterFloor] = useState("");
  const [filterLine,  setFilterLine]  = useState("");
  const [layouts, setLayouts]         = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(null);

  const [form, setForm] = useState({
    floor:"", lineNo:"", buyer:"", style:"", item:"",
    smv:"", planEfficiency:"", operator:"", helper:"",
    seamSealing:"", workingHours:8,
  });
  const [sketchFile, setSketchFile]       = useState(null);
  const [sketchPreview, setSketchPreview] = useState("");
  const [uploading, setUploading]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const fileRef = useRef();

  const [pForm, setPForm]             = useState({ serialNo:1, processName:"", machineType:"" });
  const [showPicker, setShowPicker]   = useState(false);
  const [addingProcess, setAddingProcess] = useState(false);

  const [builderTab, setBuilderTab] = useState("process");
  const [editSaving, setEditSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    buyer:"", style:"", item:"", smv:"", planEfficiency:"",
    operator:"", helper:"", seamSealing:"", workingHours:8, sketchUrl:"",
  });

  const [editSketchFile, setEditSketchFile]       = useState(null);
  const [editSketchPreview, setEditSketchPreview] = useState("");
  const [editUploading, setEditUploading]         = useState(false);
  const editFileRef = useRef();

  const editTargets = { ...calcTargets(editForm.smv, editForm.planEfficiency, editForm.operator, editForm.helper, editForm.seamSealing, editForm.workingHours) };
  const [editingProcess, setEditingProcess] = useState(null);
  const [procEditSaving, setProcEditSaving] = useState(false);
  const [showEditPicker, setShowEditPicker] = useState(false);

  const [toast, setToast] = useState(null);
  function showToast(type, msg) { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); }

  const { manpower, oneHourTarget, dailyTarget } = calcTargets(
    form.smv, form.planEfficiency, form.operator, form.helper, form.seamSealing, form.workingHours
  );
  const [processNames,  setProcessNames]  = React.useState([]);
  const [loadingPNames, setLoadingPNames] = React.useState(false);
  const [showAddPName,  setShowAddPName]  = React.useState(false);

  // ── Delete layout state ──
  // machineFloors: { "serialNumber": "floor" } — per-machine return floor
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [machineFloors, setMachineFloors] = useState({});  // key=serialNumber, val=floor
  const [deleting,      setDeleting]      = useState(false);

  // Build flat list of all machines with serial numbers from a layout
  function getAllMachines(layout) {
    const result = [];
    for (const proc of layout.processes || []) {
      for (const m of proc.machines || []) {
        if (m.serialNumber) {
          result.push({
            key:          m.serialNumber,
            serialNumber: m.serialNumber,
            machineName:  m.machineName,
            machineId:    m.machineId,
            fromFloor:    m.fromFloor,
            processName:  proc.processName,
            serialNo:     proc.serialNo,
            machineType:  proc.machineType,
          });
        }
      }
    }
    return result;
  }

  function openDeleteModal(layout) {
    setDeleteTarget(layout);
    // Pre-fill each machine's return floor with its original fromFloor
    const floors = {};
    for (const proc of layout.processes || []) {
      for (const m of proc.machines || []) {
        if (m.serialNumber) floors[m.serialNumber] = m.fromFloor || "";
      }
    }
    setMachineFloors(floors);
  }

  const loadLayouts = useCallback(async () => {
    setListLoading(true);
    try {
      const p = new URLSearchParams();
      if (effectiveFactory) p.set("factory", effectiveFactory);
      if (filterFloor) p.set("floor", filterFloor);
      if (filterLine)  p.set("lineNo", filterLine);
      const res  = await fetch(`/api/line-layouts?${p}`);
      const json = await res.json();
      setLayouts(json.success ? (json.data || []) : []);
    } finally { setListLoading(false); }
  }, [filterFloor, filterLine, effectiveFactory]);

  useEffect(() => { if (view === "list") loadLayouts(); }, [view, filterFloor, filterLine, effectiveFactory]);

  useEffect(() => {
    async function load() {
      setLoadingPNames(true);
      try {
        const res  = await fetch("/api/process-names");
        const json = await res.json();
        if (json.success) setProcessNames(json.data.map((d) => d.name));
      } finally { setLoadingPNames(false); }
    }
    load();
  }, []);

  function prefillEditForm(l) {
    setEditForm({
      buyer: l.buyer ?? "", style: l.style ?? "", item: l.item ?? "",
      smv: l.smv ?? "", planEfficiency: l.planEfficiency ?? "",
      operator: l.operator ?? "", helper: l.helper ?? "",
      seamSealing: l.seamSealing ?? "", workingHours: l.workingHours ?? 8,
      sketchUrl: l.sketchUrl ?? "",
    });
    setEditSketchFile(null);
    setEditSketchPreview("");
  }

  async function handleSketchChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSketchFile(file);
    setSketchPreview(URL.createObjectURL(file));
  }

  async function handleEditSketchChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setEditSketchFile(file);
    setEditSketchPreview(URL.createObjectURL(file));
  }

  async function uploadSketch(file) {
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    return json.success ? json.url : "";
  }

  async function handleCreateLayout(e) {
    e.preventDefault();
    if (!form.floor || !form.lineNo || !form.buyer) { showToast("error", "Floor, Line No and Buyer are required."); return; }
    setSaving(true);
    try {
      let sketchUrl = "";
      if (sketchFile) { setUploading(true); sketchUrl = await uploadSketch(sketchFile); setUploading(false); }
      const res  = await fetch("/api/line-layouts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, factory: effectiveFactory, manpower, oneHourTarget, dailyTarget, sketchUrl }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Layout created!");
        setCurrentLayout(json.data); prefillEditForm(json.data);
        setBuilderTab("process"); setView("builder");
      } else showToast("error", json.message);
    } finally { setSaving(false); }
  }

  function openPicker() {
    if (!pForm.processName || !pForm.machineType) { showToast("error", "Please select Process Name and Machine Type."); return; }
    if (pForm.machineType === "HELPER") { handleAddProcess([]); return; }
    setShowPicker(true);
  }

  async function handleAddProcess(machinesSelected) {
    setShowPicker(false);
    if (!currentLayout) return;
    setAddingProcess(true);
    try {
      const res  = await fetch(`/api/line-layouts/${currentLayout._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_process", serialNo: pForm.serialNo, processName: pForm.processName, machineType: pForm.machineType, machinesSelected }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentLayout(json.data);
        showToast("success", "Process added!");
        setPForm((p) => ({ ...p, serialNo: p.serialNo + 1, processName: "", machineType: "" }));
      } else showToast("error", json.message);
    } finally { setAddingProcess(false); }
  }

  async function handleWasteProcess(processId, wasteFloor) {
    if (!currentLayout) return;
    const res  = await fetch(`/api/line-layouts/${currentLayout._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_process", processId, wasteFloor }),
    });
    const json = await res.json();
    if (json.success) { setCurrentLayout(json.data); showToast("success", "Process wasted."); }
    else showToast("error", json.message);
  }

  async function handleSwapSerial(fromId, fromSerial, toId, toSerial) {
    if (!currentLayout) return;
    setCurrentLayout((prev) => ({
      ...prev,
      processes: prev.processes.map((p) => {
        if (p._id === fromId) return { ...p, serialNo: toSerial };
        if (p._id === toId)   return { ...p, serialNo: fromSerial };
        return p;
      }),
    }));
    try {
      const res  = await fetch(`/api/line-layouts/${currentLayout._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "swap_serial", fromId, fromSerial, toId, toSerial }),
      });
      const json = await res.json();
      if (json.success) { setCurrentLayout(json.data); }
      else showToast("error", json.message);
    } catch { showToast("error", "Failed to swap serial."); }
  }

  async function handleMoveToSlot(fromId, newSerial) {
    if (!currentLayout) return;
    setCurrentLayout((prev) => ({
      ...prev,
      processes: prev.processes.map((p) => p._id === fromId ? { ...p, serialNo: newSerial } : p),
    }));
    try {
      const res  = await fetch(`/api/line-layouts/${currentLayout._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move_to_slot", processId: fromId, newSerial }),
      });
      const json = await res.json();
      if (json.success) { setCurrentLayout(json.data); }
      else showToast("error", json.message);
    } catch { showToast("error", "Failed to update serial."); }
  }

  function handleSaveProcessEdit(e) {
    e.preventDefault();
    if (!editingProcess || !currentLayout) return;
    const machineChanged = editingProcess.machineType !== editingProcess.originalMachineType;
    if (machineChanged && editingProcess.machineType !== "HELPER") { setShowEditPicker(true); }
    else if (machineChanged && editingProcess.machineType === "HELPER") { doSaveProcessEdit([]); }
    else { doSaveProcessEdit(null); }
  }

  async function doSaveProcessEdit(machinesSelected) {
    if (!editingProcess || !currentLayout) return;
    setShowEditPicker(false);
    setProcEditSaving(true);
    try {
      const res  = await fetch(`/api/line-layouts/${currentLayout._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit_process", processId: editingProcess._id,
          serialNo: Number(editingProcess.serialNo), processName: editingProcess.processName,
          machineType: editingProcess.machineType, oldMachines: editingProcess.originalMachines,
          newMachines: machinesSelected, machineChanged: machinesSelected !== null,
        }),
      });
      const json = await res.json();
      if (json.success) { setCurrentLayout(json.data); setEditingProcess(null); showToast("success", "Process updated!"); }
      else showToast("error", json.message);
    } finally { setProcEditSaving(false); }
  }

  async function handleUpdateHeader(e) {
    e.preventDefault();
    if (!currentLayout) return;
    setEditSaving(true);
    try {
      let finalSketchUrl = editForm.sketchUrl;
      if (editSketchFile) { setEditUploading(true); finalSketchUrl = await uploadSketch(editSketchFile); setEditUploading(false); }
      const { manpower: mp, oneHourTarget: oht, dailyTarget: dt } = calcTargets(
        editForm.smv, editForm.planEfficiency, editForm.operator, editForm.helper, editForm.seamSealing, editForm.workingHours
      );
      const res  = await fetch(`/api/line-layouts/${currentLayout._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_header", buyer: editForm.buyer, style: editForm.style,
          item: editForm.item, smv: editForm.smv, planEfficiency: editForm.planEfficiency,
          operator: editForm.operator, helper: editForm.helper, seamSealing: editForm.seamSealing,
          workingHours: editForm.workingHours, sketchUrl: finalSketchUrl,
          manpower: mp, oneHourTarget: oht, dailyTarget: dt,
        }),
      });
      const json = await res.json();
      if (json.success) { setCurrentLayout(json.data); prefillEditForm(json.data); showToast("success", "Header updated!"); }
      else showToast("error", json.message);
    } finally { setEditSaving(false); setEditUploading(false); }
  }

  // ── Delete layout handler ──
  async function handleDeleteLayout() {
    if (!deleteTarget) return;
    const allMachines = getAllMachines(deleteTarget);
    // Validate: every machine must have a floor selected
    const missing = allMachines.filter((m) => !machineFloors[m.serialNumber]);
    if (missing.length > 0) {
      showToast("error", `Please select a return floor for all ${missing.length} machine(s).`);
      return;
    }
    setDeleting(true);
    try {
      // Build per-machine return list for the API
      const machineReturns = allMachines.map((m) => ({
        machineId:    m.machineId,
        serialNumber: m.serialNumber,
        returnFloor:  machineFloors[m.serialNumber],
      }));
      const res = await fetch(`/api/line-layouts/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineReturns }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Layout deleted.");
        setDeleteTarget(null);
        setMachineFloors({});
        // if we were in builder, go back to list
        if (currentLayout?._id === deleteTarget._id) setCurrentLayout(null);
        setView("list");
        loadLayouts();
      } else showToast("error", json.message);
    } finally { setDeleting(false); }
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-100">
      <div style={{
        transform: "scale(0.75)", transformOrigin: "top left",
        width: "127.33vw", height: "133.33vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }} className="font-sans text-slate-800">

        <Toast toast={toast} />

        {/* Delete Layout Modal */}
        {deleteTarget && (() => {
          const allMachines = getAllMachines(deleteTarget);
          const hasMachines = allMachines.length > 0;
          const allFilled   = allMachines.every((m) => machineFloors[m.serialNumber]);

          // "Apply all" bulk-floor setter
          function applyAllFloors(floor) {
            const next = { ...machineFloors };
            allMachines.forEach((m) => { next[m.serialNumber] = floor; });
            setMachineFloors(next);
          }

          return (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-t-2xl shrink-0" />

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-slate-200 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl shrink-0">🗑</div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">Delete Layout</h3>
                      <p className="text-slate-500 text-sm">{deleteTarget.floor} · Line {deleteTarget.lineNo} — {deleteTarget.buyer}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">

                  {/* Case A: no machines */}
                  {!hasMachines ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600">
                      This layout has <strong>{deleteTarget.processes?.length || 0} processes</strong> with no assigned machines. It will be permanently deleted.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <p className="text-sm font-bold text-amber-800 mb-0.5">⚠ {allMachines.length} machine(s) assigned — select return floor for each</p>
                        <p className="text-xs text-amber-700">Each machine will be returned to Idle on its chosen floor.</p>
                      </div>

                      {/* Bulk apply row */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest shrink-0">Apply all →</span>
                        <select
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) applyAllFloors(e.target.value); }}
                          className="flex-1 bg-white border border-slate-300 text-slate-700 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-red-400">
                          <option value="">— Set all to same floor —</option>
                          {FLOOR_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>

                      {/* Per-machine rows */}
                      <div className="space-y-2">
                        {allMachines.map((m) => {
                          const c   = mc(m.machineType);
                          const sel = machineFloors[m.serialNumber] || "";
                          return (
                            <div key={m.serialNumber}
                              className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                              style={{ background: c.bg, borderColor: `${c.accent}40` }}>

                              {/* Serial badge */}
                              <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg shrink-0"
                                style={{ background: c.accent, color: "#fff" }}>{m.serialNumber}</span>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: c.text }}>{m.processName}</p>
                                <p className="text-[10px] font-semibold opacity-70" style={{ color: c.accent }}>
                                  {m.machineType} · was on <strong>{m.fromFloor || "—"}</strong>
                                </p>
                              </div>

                              {/* Arrow */}
                              <span className="text-slate-400 text-sm shrink-0">→</span>

                              {/* Floor selector */}
                              <select
                                value={sel}
                                onChange={(e) => setMachineFloors((prev) => ({ ...prev, [m.serialNumber]: e.target.value }))}
                                className={`w-32 shrink-0 border rounded-lg px-2 py-1.5 text-sm focus:outline-none transition-colors
                                  ${sel ? "bg-white border-emerald-400 text-emerald-700 font-bold" : "bg-white border-red-300 text-red-500 font-semibold"}`}>
                                <option value="">— Floor —</option>
                                {FLOOR_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                              </select>

                              {/* Status dot */}
                              <div className={`w-2 h-2 rounded-full shrink-0 ${sel ? "bg-emerald-400" : "bg-red-400"}`} />
                            </div>
                          );
                        })}
                      </div>

                      {/* Progress summary */}
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${allMachines.length ? (Object.values(machineFloors).filter(Boolean).length / allMachines.length) * 100 : 0}%` }} />
                        </div>
                        <span className="text-slate-500 font-semibold shrink-0">
                          {Object.values(machineFloors).filter(Boolean).length}/{allMachines.length} assigned
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 pt-3 border-t border-slate-200 shrink-0 flex gap-3">
                  <button
                    onClick={handleDeleteLayout}
                    disabled={deleting || (hasMachines && !allFilled)}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-base transition-all">
                    {deleting ? "Deleting..." : "🗑 Confirm Delete"}
                  </button>
                  <button onClick={() => { setDeleteTarget(null); setMachineFloors({}); }}
                    className="px-6 border border-slate-300 hover:border-slate-400 text-slate-600 rounded-xl text-base transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {showAddPName && (
          <AddProcessNameModal onAdd={(name) => setProcessNames((prev) => [...prev, name].sort())} onClose={() => setShowAddPName(false)} />
        )}
        {showPicker && (
          <MachineFloorPicker machineType={pForm.machineType} factory={effectiveFactory} onConfirm={handleAddProcess} onCancel={() => setShowPicker(false)} />
        )}
        {showEditPicker && editingProcess && (
          <MachineFloorPicker machineType={editingProcess.machineType} factory={effectiveFactory}
            onConfirm={(machinesSelected) => doSaveProcessEdit(machinesSelected)} onCancel={() => setShowEditPicker(false)} />
        )}

        {/* Process Edit Modal */}
        {editingProcess && !showEditPicker && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-t-2xl" />
              <form onSubmit={handleSaveProcessEdit} className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-lg">✏️ Edit Process</h3>
                  <button type="button" onClick={() => setEditingProcess(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                </div>
                <LField label="Serial No">
                  <select value={editingProcess.serialNo} onChange={(e) => setEditingProcess((p) => ({ ...p, serialNo: +e.target.value }))}
                    className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-amber-500">
                    {SERIAL_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </LField>
                <LField label="Process Name">
                  <SearchableSelect value={editingProcess.processName} onChange={(v) => setEditingProcess((p) => ({ ...p, processName: v }))}
                    options={processNames} placeholder="— Select Process —" />
                </LField>
                <LField label="Machine Type">
                  <SearchableSelect value={editingProcess.machineType} onChange={(v) => setEditingProcess((p) => ({ ...p, machineType: v }))}
                    options={MACHINE_TYPES} placeholder="— Machine Type —" />
                </LField>
                {editingProcess.machineType && (() => {
                  const c = mc(editingProcess.machineType);
                  return <div className="rounded-lg px-4 py-2 border-l-4 text-sm font-bold" style={{ background: c.bg, borderLeftColor: c.accent, color: c.text }}>{editingProcess.machineType}</div>;
                })()}
                {editingProcess.machineType !== editingProcess.originalMachineType ? (
                  <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">🔄 Machine type changed — old machines will return to inventory and new serials must be selected.</p>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Machine assignment unchanged. Only serial and process name will update.</p>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={procEditSaving || !editingProcess.processName || !editingProcess.machineType}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-base transition-all">
                    {procEditSaving ? "Saving..." : editingProcess.machineType !== editingProcess.originalMachineType && editingProcess.machineType !== "HELPER" ? "✓ Next → Select Serial" : "✓ Update"}
                  </button>
                  <button type="button" onClick={() => setEditingProcess(null)} className="px-5 border border-slate-300 hover:border-slate-400 text-slate-600 rounded-xl text-base transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-300 bg-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-1.5 bg-blue-600 rounded-full" />
            <div>
              <p className="text-xs tracking-[0.3em] text-blue-600 uppercase font-bold">IE Department</p>
              <h1 className="text-2xl font-black tracking-tight leading-tight text-slate-900">Line Layout</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 uppercase tracking-widest font-bold">Factory</span>
                <select value={filterFactory} onChange={(e) => setFilterFactory(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 text-base rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                  <option value="">All Factories</option>
                  {FACTORY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-base bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg font-bold">🏭 {userFactory || "—"}</span>
            )}
            {view !== "list" && (
              <button onClick={() => setView("list")} className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-600 rounded-xl text-base font-semibold transition-all bg-white">
                ← All Layouts
              </button>
            )}
            {view === "list" && (
              <button onClick={() => { setView("form"); setForm({ floor:"", lineNo:"", buyer:"", style:"", item:"", smv:"", planEfficiency:"", operator:"", helper:"", seamSealing:"", workingHours:8 }); setSketchPreview(""); }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-all shadow-sm">
                + New Layout
              </button>
            )}
            {view === "builder" && currentLayout && (
              <button onClick={() => openPrintWindow(currentLayout)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base transition-all shadow-sm flex items-center gap-2">
                🖨 Print Layout
              </button>
            )}
            {view === "builder" && currentLayout && (
              <button onClick={() => openDeleteModal(currentLayout)}
                className="px-4 py-2.5 bg-red-50 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-600 rounded-xl text-base font-bold transition-all">
                🗑 Delete Layout
              </button>
            )}
            {view === "builder" && (
              <button onClick={() => { setView("list"); loadLayouts(); }}
                className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl text-base transition-all">
                ✓ Done
              </button>
            )}
          </div>
        </div>

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-wrap gap-3 mb-5">
              <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-base rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                <option value="">All Floors</option>
                {FLOOR_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <select value={filterLine} onChange={(e) => setFilterLine(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-base rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                <option value="">All Lines</option>
                {LINE_OPTIONS.map((l) => <option key={l} value={l}>Line {l}</option>)}
              </select>
            </div>
            {listLoading ? (
              <p className="text-slate-400 text-base animate-pulse text-center py-20">Loading...</p>
            ) : layouts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-5xl mb-3">📐</p>
                <p className="text-base">No layouts found. Create a new one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {layouts.map((l) => {
                  // FIX-1: compute live targets for list cards too
                  const live = calcTargets(l.smv, l.planEfficiency, l.operator, l.helper, l.seamSealing, l.workingHours);
                  return (
                    <div key={l._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-violet-500" />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            {l.factory && <span className="text-xs bg-blue-50 border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full font-bold mr-1">🏭 {l.factory}</span>}
                            <div className="text-base text-blue-600 font-bold mt-1">{l.floor} · Line {l.lineNo}</div>
                            <h3 className="font-black text-slate-900 text-lg mt-0.5">{l.buyer}</h3>
                            <p className="text-slate-500 text-base">{l.style} — {l.item}</p>
                          </div>
                          <span className="text-sm bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-semibold">{l.processes?.length || 0} process</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          {[
                            { label:"SMV",        val: l.smv,                  color:"text-slate-700"   },
                            { label:"Efficiency", val: `${l.planEfficiency}%`, color:"text-blue-700"    },
                            { label:"Manpower",   val: live.manpower,          color:"text-slate-700"   },
                            { label:"1Hr Target", val: live.oneHourTarget,     color:"text-emerald-700" },
                            { label:`Daily (${l.workingHours}h)`, val: live.dailyTarget, color:"text-violet-700" },
                            { label:"Op/Hel/SS",  val: `${l.operator}/${l.helper}/${l.seamSealing}`, color:"text-slate-700" },
                          ].map(({ label, val, color }) => (
                            <div key={label} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2">
                              <div className="text-xs font-bold uppercase text-slate-400">{label}</div>
                              <div className={`text-base font-black ${color}`}>{val}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setCurrentLayout(l); prefillEditForm(l); setBuilderTab("process"); setView("builder"); }}
                            className="flex-1 py-3 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-blue-700 rounded-xl text-base font-bold transition-all">
                            Open Builder →
                          </button>
                          <button onClick={() => openDeleteModal(l)}
                            className="px-4 py-3 bg-red-50 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-600 rounded-xl text-base font-bold transition-all"
                            title="Delete layout">
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FORM VIEW */}
        {view === "form" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start bg-slate-50">
            <form onSubmit={handleCreateLayout} className="w-full max-w-xl">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-violet-500" />
                <div className="p-8 space-y-5">
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Create New Line Layout</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <LField label="Floor *"><LSelect value={form.floor} onChange={(v) => setForm((p) => ({ ...p, floor:v }))} options={FLOOR_OPTIONS} placeholder="— Floor —" /></LField>
                    <LField label="Line No *"><LSelect value={form.lineNo} onChange={(v) => setForm((p) => ({ ...p, lineNo:v }))} options={LINE_OPTIONS} placeholder="— Line —" renderOption={(o) => `Line ${o}`} /></LField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <LField label="Buyer *"><LSelect value={form.buyer} onChange={(v) => setForm((p) => ({ ...p, buyer:v }))} options={BUYER_OPTIONS} placeholder="— Buyer —" /></LField>
                    <LField label="Style"><LInput value={form.style} onChange={(v) => setForm((p) => ({ ...p, style:v }))} placeholder="121058" /></LField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <LField label="Item"><LInput value={form.item} onChange={(v) => setForm((p) => ({ ...p, item:v }))} placeholder="Rain Jacket" /></LField>
                    <LField label="SMV"><LInput type="number" value={form.smv} onChange={(v) => setForm((p) => ({ ...p, smv:v }))} placeholder="43.2" /></LField>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <LField label="Plan Efficiency (%)"><LInput type="number" value={form.planEfficiency} onChange={(v) => setForm((p) => ({ ...p, planEfficiency:v }))} placeholder="70" /></LField>
                    <LField label="Working Hours">
                      <select value={form.workingHours} onChange={(e) => setForm((p) => ({ ...p, workingHours:+e.target.value }))}
                        className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500">
                        {HOURS_OPTIONS.map((h) => <option key={h} value={h}>{h} hrs</option>)}
                      </select>
                    </LField>
                    <LField label="Manpower (auto)">
                      <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-3 py-3 text-base font-black flex justify-between">
                        <span>{manpower}</span><span className="text-slate-400 text-sm font-normal">auto</span>
                      </div>
                    </LField>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[["Operator","operator"],["Helper","helper"],["Seam Sealing","seamSealing"]].map(([label, key]) => (
                      <LField key={key} label={label}><LInput type="number" value={form[key]} onChange={(v) => setForm((p) => ({ ...p, [key]:v }))} placeholder="0" /></LField>
                    ))}
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">Target Preview</p>
                    <p className="text-xs text-slate-500 mb-3 font-mono">({manpower} × {form.workingHours}h × 60 / {form.smv || "SMV"}) × {form.planEfficiency || 0}%</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-violet-50 border border-violet-300 text-violet-700 rounded-lg px-3 py-3">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Daily Target ({form.workingHours}h)</div>
                        <div className="text-2xl font-black">{dailyTarget}</div>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg px-3 py-3">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">1 Hour Target</div>
                        <div className="text-2xl font-black">{oneHourTarget}</div>
                      </div>
                    </div>
                  </div>
                  <LField label="Line Sketch / Image (optional)">
                    <div onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-5 cursor-pointer transition-all text-center bg-slate-50">
                      {sketchPreview
                        ? <img src={sketchPreview} alt="sketch" className="max-h-36 mx-auto rounded-lg object-contain" />
                        : <p className="text-slate-400 text-base">Click to select an image</p>}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSketchChange} />
                    </div>
                  </LField>
                </div>
                <div className="px-8 pb-8">
                  <button type="submit" disabled={saving || uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-xl text-base tracking-widest uppercase transition-all shadow-sm">
                    {uploading ? "Uploading image..." : saving ? "Creating..." : "Create Layout →"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* BUILDER VIEW */}
        {view === "builder" && currentLayout && (
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left panel */}
            <div className="w-[440px] shrink-0 border-r-2 border-slate-200 flex flex-col bg-white shadow-sm overflow-hidden">
              <div className="flex border-b-2 border-slate-200 shrink-0">
                {[{ key:"edit", label:"✏️ Edit" }, { key:"process", label:"＋ Process" }, { key:"list", label:"☰ List" }].map((t) => (
                  <button key={t.key} onClick={() => setBuilderTab(t.key)}
                    className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${builderTab === t.key ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-slate-500 hover:text-slate-700 bg-white"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB: EDIT */}
              {builderTab === "edit" && (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                    <span className="text-base text-blue-700 font-black">{currentLayout.floor} · Line {currentLayout.lineNo}</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center mt-2">
                      {[
                        { l:"1Hr Tgt", v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).oneHourTarget, c:"text-emerald-700" },
                        { l:`Daily(${currentLayout.workingHours}h)`, v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).dailyTarget, c:"text-violet-700" },
                        { l:"Manpower", v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).manpower, c:"text-blue-700" },
                      ].map(({ l, v, c }) => (
                        <div key={l} className="bg-white border border-slate-200 rounded-lg px-2 py-2">
                          <div className="text-xs text-slate-400 font-medium">{l}</div>
                          <div className={`text-base font-black ${c}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleUpdateHeader} className="p-4 space-y-4">
                    <p className="text-sm text-amber-600 uppercase tracking-widest font-bold">Update Style Info</p>
                    <div className="grid grid-cols-2 gap-3">
                      <LField label="Buyer"><LSelect value={editForm.buyer} onChange={(v) => setEditForm((p) => ({ ...p, buyer:v }))} options={BUYER_OPTIONS} placeholder="— Buyer —" /></LField>
                      <LField label="Style"><LInput value={editForm.style} onChange={(v) => setEditForm((p) => ({ ...p, style:v }))} placeholder="Style No" /></LField>
                    </div>
                    <LField label="Item"><LInput value={editForm.item} onChange={(v) => setEditForm((p) => ({ ...p, item:v }))} placeholder="Item Name" /></LField>
                    <div className="grid grid-cols-2 gap-3">
                      <LField label="SMV"><LInput type="number" value={editForm.smv} onChange={(v) => setEditForm((p) => ({ ...p, smv:v }))} placeholder="43.2" /></LField>
                      <LField label="Plan Efficiency (%)"><LInput type="number" value={editForm.planEfficiency} onChange={(v) => setEditForm((p) => ({ ...p, planEfficiency:v }))} placeholder="70" /></LField>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <LField label="Operator"><LInput type="number" value={editForm.operator} onChange={(v) => setEditForm((p) => ({ ...p, operator:v }))} placeholder="0" /></LField>
                      <LField label="Helper"><LInput type="number" value={editForm.helper} onChange={(v) => setEditForm((p) => ({ ...p, helper:v }))} placeholder="0" /></LField>
                      <LField label="Seam Sealing"><LInput type="number" value={editForm.seamSealing} onChange={(v) => setEditForm((p) => ({ ...p, seamSealing:v }))} placeholder="0" /></LField>
                    </div>
                    <LField label="Working Hours">
                      <select value={editForm.workingHours} onChange={(e) => setEditForm((p) => ({ ...p, workingHours:+e.target.value }))}
                        className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500">
                        {HOURS_OPTIONS.map((h) => <option key={h} value={h}>{h} hrs</option>)}
                      </select>
                    </LField>
                    <LField label="Line Sketch / Image">
                      <div className="space-y-2">
                        {(editSketchPreview || editForm.sketchUrl) && (
                          <div className="relative">
                            <img src={editSketchPreview || editForm.sketchUrl} alt="Current sketch"
                              className="w-full max-h-32 object-contain rounded-lg border border-slate-200 bg-slate-50" />
                            <button type="button" onClick={() => { setEditSketchFile(null); setEditSketchPreview(""); setEditForm((p) => ({ ...p, sketchUrl:"" })); }}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-black flex items-center justify-center shadow">✕</button>
                          </div>
                        )}
                        <div onClick={() => editFileRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-xl p-3 cursor-pointer transition-all text-center bg-slate-50">
                          <p className="text-slate-400 text-sm">{editSketchPreview || editForm.sketchUrl ? "🔄 Replace with new image" : "📎 Click to select image"}</p>
                          <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditSketchChange} />
                        </div>
                      </div>
                    </LField>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">New Target Preview</p>
                      <p className="text-[10px] text-slate-500 mb-2 font-mono">({editTargets.manpower} × {editForm.workingHours}h × 60 / {editForm.smv || "SMV"}) × {editForm.planEfficiency || 0}%</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { l:"Manpower",   v: editTargets.manpower,     c:"text-blue-700"    },
                          { l:"1Hr Target", v: editTargets.oneHourTarget, c:"text-emerald-700" },
                          { l:`Daily(${editForm.workingHours}h)`, v: editTargets.dailyTarget, c:"text-violet-700" },
                        ].map(({ l, v, c }) => (
                          <div key={l} className="bg-white border border-slate-200 rounded-lg px-2 py-2">
                            <div className="text-xs text-slate-400">{l}</div>
                            <div className={`text-lg font-black ${c}`}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={editSaving || editUploading}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-3 rounded-xl text-base uppercase tracking-widest transition-all">
                      {editUploading ? "Uploading image..." : editSaving ? "Updating..." : "✓ Update Header"}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB: ADD PROCESS */}
              {builderTab === "process" && (
                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
                  <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Add Process</p>
                  <LField label="Serial No">
                    <select value={pForm.serialNo} onChange={(e) => setPForm((p) => ({ ...p, serialNo:+e.target.value }))}
                      className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500">
                      {SERIAL_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </LField>
                  <LField label="Process Name">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <SearchableSelect value={pForm.processName} onChange={(v) => setPForm((p) => ({ ...p, processName:v }))}
                          options={loadingPNames ? [] : processNames} placeholder={loadingPNames ? "Loading..." : "— Select Process —"} />
                      </div>
                      <button type="button" onClick={() => setShowAddPName(true)} title="Add new process name"
                        className="px-3 py-3 bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-600 rounded-lg text-base font-bold transition-all shrink-0">+</button>
                    </div>
                  </LField>
                  <LField label="Machine Type">
                    <SearchableSelect value={pForm.machineType} onChange={(v) => setPForm((p) => ({ ...p, machineType:v }))}
                      options={MACHINE_TYPES} placeholder="— Machine Type —" />
                  </LField>
                  {pForm.machineType && (() => {
                    const c = mc(pForm.machineType);
                    return <div className="rounded-lg px-4 py-3 border-l-4 text-base font-bold" style={{ background: c.bg, borderLeftColor: c.accent, color: c.text }}>{pForm.machineType}</div>;
                  })()}
                  <button onClick={openPicker} disabled={addingProcess || !pForm.processName || !pForm.machineType}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-3.5 rounded-xl text-base uppercase tracking-wider transition-all shadow-sm">
                    {addingProcess ? "Adding..." : pForm.machineType === "HELPER" ? "+ Add HELPER" : "+ Select Serial & Add"}
                  </button>
                </div>
              )}

              {/* TAB: PROCESS LIST */}
              {builderTab === "list" && (
                <div className="flex-1 overflow-y-auto min-h-0 p-4">
                  <p className="text-sm text-slate-400 uppercase tracking-widest mb-3 font-bold">Added Processes ({currentLayout.processes?.length || 0})</p>
                  {(currentLayout.processes?.length || 0) === 0 ? (
                    <p className="text-slate-400 text-base text-center py-10">No processes added.</p>
                  ) : (
                    <div className="space-y-2">
                      {[...currentLayout.processes].sort((a, b) => a.serialNo - b.serialNo).map((p) => {
                        const c = mc(p.machineType);
                        const serials = (p.machines || []).filter((m) => m.serialNumber).map((m) => m.serialNumber);
                        return (
                          <div key={p._id} className="rounded-lg px-3 py-2.5 border-l-4"
                            style={{ background: c.bg, borderLeftColor: c.accent, borderTop:"1px solid rgba(0,0,0,0.07)", borderRight:"1px solid rgba(0,0,0,0.07)", borderBottom:"1px solid rgba(0,0,0,0.07)" }}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  <span className="text-xs font-black px-2 py-0.5 rounded shrink-0" style={{ background: c.badge, color: c.badgeText }}>#{p.serialNo}</span>
                                  <span className="text-sm font-bold truncate" style={{ color: c.text }}>{p.processName}</span>
                                </div>
                                <div className="text-xs font-semibold mb-1" style={{ color: c.accent }}>{p.machineType} · {p.machines?.map((m) => m.fromFloor).join(", ") || "No machine"}</div>
                                {serials.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {serials.map((sn) => (
                                      <span key={sn} className="text-[10px] font-mono font-black px-2 py-0.5 rounded"
                                        style={{ background: `${c.accent}18`, color: c.accent, border: `1px solid ${c.accent}35` }}>{sn}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => setEditingProcess({
                                  _id: p._id, serialNo: p.serialNo, processName: p.processName,
                                  machineType: p.machineType, originalMachineType: p.machineType, originalMachines: p.machines || [],
                                })} className="px-2.5 py-1 rounded-lg text-sm font-bold text-amber-600 border border-amber-200 hover:bg-amber-50 transition-all bg-white">✏️</button>
                                <button onClick={() => handleWasteProcess(p._id, currentLayout.floor)}
                                  className="px-2.5 py-1 rounded-lg text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all bg-white">✕</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — Layout Grid */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white">
              <div className="px-4 py-2.5 border-b-2 border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 uppercase tracking-widest font-bold">Layout</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-base text-slate-700 font-bold">{currentLayout.style} — {currentLayout.item}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  {[
                    { l:"Buyer", v: currentLayout.buyer,                                                   c:"text-blue-700"    },
                    { l:"1Hr",   v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).oneHourTarget, c:"text-emerald-700" },
                    { l:"Daily", v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).dailyTarget,   c:"text-violet-700"  },
                    { l:"MP",    v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).manpower,      c:"text-amber-700"   },
                  ].map(({ l, v, c }) => (
                    <span key={l} className="bg-white border border-slate-200 px-3 py-1 rounded-full">
                      <span className="text-slate-400">{l}: </span>
                      <span className={`font-black ${c}`}>{v}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <LayoutGrid
                  processes={currentLayout.processes || []}
                  sketchUrl={currentLayout.sketchUrl}
                  layoutFloor={currentLayout.floor}
                  layoutInfo={currentLayout}
                  onWaste={handleWasteProcess}
                  onSwapSerial={handleSwapSerial}
                  onMoveToSlot={handleMoveToSlot}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );
}
function LInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors placeholder:text-slate-400" />
  );
}
function LSelect({ value, onChange, options, placeholder, renderOption }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-3 text-base appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{renderOption ? renderOption(o) : o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">▾</span>
    </div>
  );
}