"use client";
// app/IEDepartment/MachineInventory/MachineInventoryForm.jsx

import { useCallback, useEffect, useRef, useState } from "react";

const MACHINE_NAMES = [
  "SINGLE NDL (PLAIN M/C)",
  "SINGLE NDL (TOP FEED) M/C",
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

const FLOOR_OPTIONS = [
  { value: "A-2", label: "A-2" },
  { value: "B-2", label: "B-2" },
  { value: "A-3", label: "A-3" },
  { value: "B-3", label: "B-3" },
  { value: "A-4", label: "A-4" },
  { value: "B-4", label: "B-4" },
  { value: "A-5", label: "A-5" },
  { value: "B-5", label: "B-5" },
  { value: "A-6", label: "A-6" },
  { value: "B-6", label: "B-6" },
  { value: "C-4", label: "C-4" },
  { value: "K-3", label: "K-3" },
  { value: "SMD/CAD", label: "SMD/CAD" },
  { value: "New", label: "New" },
  { value: "Others", label: "Others" },
];

const STATUS_OPTIONS = [
  { value: "Running", label: "Running", icon: "▶" },
  { value: "Idle", label: "Idle", icon: "⏸" },
  { value: "Repairable", label: "Repairable", icon: "🔧" },
  { value: "Damage", label: "Damage", icon: "✕" },
];

const STATUS_STYLE = {
  Running: {
    badge: "bg-emerald-950 border-emerald-700 text-emerald-300",
    ring: "focus:border-emerald-500 focus:ring-emerald-500/20",
    border: "border-emerald-800",
  },
  Idle: {
    badge: "bg-amber-950 border-amber-700 text-amber-300",
    ring: "focus:border-amber-500 focus:ring-amber-500/20",
    border: "border-amber-800",
  },
  Repairable: {
    badge: "bg-orange-950 border-orange-700 text-orange-300",
    ring: "focus:border-orange-500 focus:ring-orange-500/20",
    border: "border-orange-800",
  },
  Damage: {
    badge: "bg-red-950 border-red-700 text-red-300",
    ring: "focus:border-red-500 focus:ring-red-500/20",
    border: "border-red-800",
  },
};

const STATUS_TEXT_COLOR = {
  Running: "text-emerald-400",
  Idle: "text-amber-400",
  Repairable: "text-orange-400",
  Damage: "text-red-400",
};

const STATUS_BADGE_MINI = {
  Running: "bg-emerald-950 border-emerald-800 text-emerald-300",
  Idle: "bg-amber-950 border-amber-800 text-amber-300",
  Repairable: "bg-orange-950 border-orange-800 text-orange-300",
  Damage: "bg-red-950 border-red-800 text-red-300",
};

const STATUS_DOT = {
  Running: "#10b981",
  Idle: "#f59e0b",
  Repairable: "#f97316",
  Damage: "#ef4444",
};

const MACHINE_COLORS = {
  "SINGLE NDL (PLAIN M/C)": {
    bg: "#dbeafe",
    accent: "#1d4ed8",
    text: "#1e3a5f",
    badge: "#1d4ed8",
  },
  "SINGLE NDL (TOP FEED) M/C": {
    bg: "#dbeafe",
    accent: "#1d4ed8",
    text: "#1e3a5f",
    badge: "#1d4ed8",
  },
  "SINGLE NDL (NDL FEED) M/C": {
    bg: "#dbeafe",
    accent: "#1d4ed8",
    text: "#1e3a5f",
    badge: "#1d4ed8",
  },
  "SINGLE NDL (CUFFS) M/C": {
    bg: "#dbeafe",
    accent: "#1d4ed8",
    text: "#1e3a5f",
    badge: "#1d4ed8",
  },
  "DLM SINGLE NEEDLE VERTICAL CUTTER": {
    bg: "#ede9fe",
    accent: "#7c3aed",
    text: "#3b1a6e",
    badge: "#7c3aed",
  },
  "DOUBLE NDL": {
    bg: "#e0e7ff",
    accent: "#4338ca",
    text: "#1e1b4b",
    badge: "#4338ca",
  },
  "POCKET WELL (APW) M/C": {
    bg: "#d1fae5",
    accent: "#059669",
    text: "#064e3b",
    badge: "#059669",
  },
  "3/8 T CHAIN STITCH (3 NDL) M/C": {
    bg: "#d1fae5",
    accent: "#059669",
    text: "#064e3b",
    badge: "#059669",
  },
  "INTER LOCK (2 NDL 5TH) M/C": {
    bg: "#ccfbf1",
    accent: "#0d9488",
    text: "#134e4a",
    badge: "#0d9488",
  },
  "OVER LOCK (2 NDL 4TH) M/C": {
    bg: "#ccfbf1",
    accent: "#0d9488",
    text: "#134e4a",
    badge: "#0d9488",
  },
  "BARTACK M/C": {
    bg: "#fce7f3",
    accent: "#be185d",
    text: "#500724",
    badge: "#be185d",
  },
  KANSAI: {
    bg: "#fae8ff",
    accent: "#a21caf",
    text: "#3b0764",
    badge: "#a21caf",
  },
  "EYELET HOLE M/C": {
    bg: "#ffedd5",
    accent: "#c2410c",
    text: "#431407",
    badge: "#c2410c",
  },
  HELPER: {
    bg: "#f1f5f9",
    accent: "#475569",
    text: "#334155",
    badge: "#475569",
  },
  default: {
    bg: "#e0f2fe",
    accent: "#0369a1",
    text: "#0c4a6e",
    badge: "#0369a1",
  },
};
function mc(type) {
  return MACHINE_COLORS[type] || MACHINE_COLORS["default"];
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border transition-all duration-300 ${
        toast.type === "success"
          ? "bg-emerald-950 border-emerald-500 text-emerald-300"
          : "bg-red-950 border-red-500 text-red-300"
      }`}
    >
      {toast.type === "success" ? "✓ " : "✕ "}
      {toast.msg}
    </div>
  );
}

// ─── ProcessCard ──────────────────────────────────────────────────────────────
function ProcessCard({ proc, searchedSerial, isMatched }) {
  const c = mc(proc.machineType);
  const serials = (proc.machines || [])
    .map((m) => m.serialNumber)
    .filter(Boolean);

  if (isMatched) {
    return (
      <div
        style={{
          background: "#fefce8",
          border: "2px solid #f59e0b",
          borderRadius: 8,
          boxShadow: "0 0 0 3px #fde68a, 0 4px 16px #f59e0b55",
          padding: "10px 12px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -1,
            right: 8,
            background: "#f59e0b",
            color: "#fff",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "1px 7px",
            borderRadius: "0 0 6px 6px",
            textTransform: "uppercase",
          }}
        >
          ◉ This Machine
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 6,
            marginTop: 8,
          }}
        >
          <span
            style={{
              background: "#f59e0b",
              color: "#fff",
              fontSize: 10,
              fontWeight: 900,
              padding: "1px 8px",
              borderRadius: 4,
            }}
          >
            #{proc.serialNo}
          </span>
          {serials.map((sn) => {
            const isThis =
              sn.toUpperCase() === (searchedSerial || "").toUpperCase();
            return (
              <span
                key={sn}
                style={{
                  fontFamily: "monospace",
                  fontSize: isThis ? 11 : 10,
                  fontWeight: 900,
                  padding: isThis ? "2px 10px" : "1px 7px",
                  borderRadius: 20,
                  background: isThis ? "#f59e0b" : "#fde68a",
                  color: isThis ? "#fff" : "#92400e",
                  border: isThis ? "2px solid #d97706" : "1px solid #fcd34d",
                  boxShadow: isThis ? "0 0 0 2px #fde68a" : "none",
                }}
              >
                {isThis ? `◉ ${sn}` : sn}
              </span>
            );
          })}
        </div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#78350f",
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          {proc.processName}
        </p>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#d97706",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {proc.machineType}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: c.bg,
        borderLeft: `4px solid ${c.accent}`,
        border: `1px solid ${c.accent}20`,
        borderLeftWidth: 4,
        borderLeftStyle: "solid",
        borderLeftColor: c.accent,
        borderRadius: 6,
        padding: "8px 10px",
        opacity: 0.82,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexWrap: "wrap",
          marginBottom: 5,
        }}
      >
        <span
          style={{
            background: c.badge,
            color: "#fff",
            fontSize: 10,
            fontWeight: 900,
            padding: "1px 7px",
            borderRadius: 4,
          }}
        >
          #{proc.serialNo}
        </span>
        {serials.map((sn) => (
          <span
            key={sn}
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: 4,
              background: `${c.accent}18`,
              color: c.accent,
              border: `1px solid ${c.accent}30`,
            }}
          >
            {sn}
          </span>
        ))}
      </div>
      <p
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: c.text,
          lineHeight: 1.3,
          marginBottom: 3,
        }}
      >
        {proc.processName}
      </p>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: c.accent,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {proc.machineType}
      </p>
    </div>
  );
}

// ─── Line Layout Info Modal ───────────────────────────────────────────────────
function LineLayoutModal({ serialNumber, factory, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    (async () => {
      try {
        const qs = new URLSearchParams({ serialNumber });
        if (factory) qs.set("factory", factory);
        const res = await fetch(`/api/line-layouts?${qs}`);
        const json = await res.json();
        if (!cancelled) setData(json.success ? json.data : null);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serialNumber, factory]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const layout = data?.layout;
  const matchedProcessId = data?.matchedProcessId;
  const sorted = layout
    ? [...(layout.processes || [])].sort((a, b) => a.serialNo - b.serialNo)
    : [];
  const pairs = [];
  for (let i = 0; i < sorted.length; i += 2)
    pairs.push([sorted[i], sorted[i + 1] ?? null]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 pointer-events-none">
        <div
          className="pointer-events-auto flex flex-col bg-[#0a0d14] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden font-mono"
          style={{ width: "min(780px, 96vw)", maxHeight: "92vh" }}
        >
          <div className="h-0.5 w-full shrink-0 bg-gradient-to-r from-violet-500 via-amber-400 to-cyan-400" />
          <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">📐</span>
              <div>
                <p className="text-[10px] text-violet-400 uppercase tracking-widest">
                  Line Layout — Full View
                </p>
                <p className="text-white font-bold text-sm">
                  Searching:{" "}
                  <span className="text-amber-300 font-mono">
                    {serialNumber}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all font-bold text-base"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-xs animate-pulse">
                  Searching line layouts...
                </p>
              </div>
            )}
            {!loading && !data && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-5xl">📭</span>
                <p className="text-slate-300 text-sm font-bold">
                  Not assigned to any line
                </p>
                <p className="text-slate-600 text-xs text-center">
                  <span className="font-mono text-slate-400">
                    {serialNumber}
                  </span>{" "}
                  is not in any active line layout.
                </p>
              </div>
            )}
            {!loading && data && layout && (
              <div>
                <div className="px-5 py-3 border-b border-slate-800 bg-[#0d111c]">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {layout.factory && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-950 border border-violet-700 text-violet-300">
                        🏭 {layout.factory}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300">
                      Floor {layout.floor}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-950 border border-blue-700 text-blue-300">
                      Line {layout.lineNo}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-300">
                      {layout.processes?.length || 0} processes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                    {[
                      ["Buyer", layout.buyer],
                      ["Style", layout.style],
                      ["Item", layout.item],
                      ["SMV", layout.smv],
                      ["Eff.", `${layout.planEfficiency}%`],
                      ["Manpower", layout.manpower],
                      [`Daily (${layout.workingHours}h)`, layout.dailyTarget],
                    ].map(([label, val]) =>
                      val != null && val !== "" ? (
                        <div key={label} className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                            {label}:
                          </span>
                          <span className="text-[11px] text-slate-200 font-bold">
                            {val}
                          </span>
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
                <div className="px-5 py-2.5 border-b border-slate-800 flex items-center gap-4 bg-[#0a0d14]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-amber-400" />
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">
                      Searched machine
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-700 opacity-50" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      Other processes
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 ml-auto">
                    Left ← Serial → Right
                  </span>
                </div>
                <div className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg bg-blue-900/60 text-blue-300 border border-blue-800">
                      ← LEFT SIDE
                    </div>
                    <div className="text-center text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                      RIGHT SIDE →
                    </div>
                  </div>
                  <div className="space-y-2">
                    {pairs.map(([left, right], rowIdx) => (
                      <div key={rowIdx} className="grid grid-cols-2 gap-3">
                        <div>
                          {left ? (
                            <ProcessCard
                              proc={left}
                              searchedSerial={serialNumber}
                              isMatched={String(left._id) === matchedProcessId}
                            />
                          ) : (
                            <div className="h-full min-h-[54px] border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center">
                              <span className="text-[10px] text-slate-700">
                                Empty
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          {right ? (
                            <ProcessCard
                              proc={right}
                              searchedSerial={serialNumber}
                              isMatched={String(right._id) === matchedProcessId}
                            />
                          ) : (
                            <div className="h-full min-h-[54px] border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center">
                              <span className="text-[10px] text-slate-700">
                                Empty
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {sorted.length === 0 && (
                    <p className="text-center text-slate-600 text-xs py-8">
                      No processes in this layout.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="px-5 pb-4 pt-3 border-t border-slate-800 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Suggestion Dropdown Portal ───────────────────────────────────────────────
// Renders as a fixed overlay so it is NEVER clipped by any parent overflow/height.
function SuggestionDropdown({
  suggestions,
  highlightIdx,
  query,
  onPick,
  onHover,
  dropdownRef,
  anchorRef,
}) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  // Reposition whenever visible
  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const maxH = Math.max(Math.min(spaceBelow, 400), Math.min(spaceAbove, 400));
    const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;

    setPos({
      left: rect.left,
      width: rect.width,
      top: openUpward ? undefined : rect.bottom + 6,
      bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
      maxHeight: Math.max(maxH, 200),
      openUpward,
    });
  }, [suggestions, anchorRef]);

  if (!suggestions.length) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        bottom: pos.bottom,
        width: pos.width,
        maxHeight: pos.maxHeight,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
      className="bg-[#12161f] border border-slate-600/80 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.7)] overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/60 bg-[#0d1017] shrink-0">
        <div className="flex items-center gap-2">
          <svg
            className="w-3 h-3 text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
            {suggestions.length} result{suggestions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-slate-600">
          <kbd className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-500">
            ↑↓
          </kbd>
          <span>navigate</span>
          <kbd className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-500">
            ↵
          </kbd>
          <span>select</span>
        </div>
      </div>

      {/* Scrollable list — takes all remaining height */}
      <div
        className="overflow-y-auto flex-1 overscroll-contain"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#334155 transparent",
        }}
      >
        {suggestions.map((u, idx) => {
          const c = mc(u.machineName);
          const q = query.trim().toUpperCase();
          const sn = u.serialNumber.toUpperCase();
          const pos2 = sn.indexOf(q);
          const before =
            pos2 >= 0 ? u.serialNumber.slice(0, pos2) : u.serialNumber;
          const match =
            pos2 >= 0 ? u.serialNumber.slice(pos2, pos2 + q.length) : "";
          const after = pos2 >= 0 ? u.serialNumber.slice(pos2 + q.length) : "";
          const isHi = idx === highlightIdx;

          return (
            <button
              key={u.serialNumber}
              type="button"
              onMouseEnter={() => onHover(idx)}
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(u);
              }}
              style={{
                borderLeft: isHi
                  ? `3px solid ${c.accent}`
                  : "3px solid transparent",
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-slate-800/50 last:border-0 focus:outline-none
                ${isHi ? "bg-slate-700/50" : "hover:bg-slate-800/40"}`}
            >
              {/* Accent dot */}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-offset-1 ring-offset-[#12161f]"
                style={{ background: c.accent, ringColor: c.accent }}
              />

              {/* Serial number with highlighted match */}
              <div className="flex-1 min-w-0">
                <div className="font-mono font-bold text-sm mb-0.5">
                  <span className="text-slate-300">{before}</span>
                  {match && (
                    <span
                      className="rounded px-0.5 mx-px"
                      style={{
                        color: "#fbbf24",
                        background: "rgba(251,191,36,0.15)",
                      }}
                    >
                      {match}
                    </span>
                  )}
                  <span className="text-slate-300">{after}</span>
                </div>
                {/* Machine name */}
                <div className="text-[10px] text-slate-500 truncate">
                  {u.machineName}
                </div>
              </div>

              {/* Right side: floor + status */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  {u.floorName}
                </span>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
                  style={{
                    color: STATUS_DOT[u.status],
                    borderColor: `${STATUS_DOT[u.status]}40`,
                    background: `${STATUS_DOT[u.status]}12`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: STATUS_DOT[u.status] }}
                  />
                  {u.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-1.5 border-t border-slate-800/60 bg-[#0d1017] shrink-0 flex items-center justify-between">
        <span className="text-[9px] text-slate-600">
          Click or press Enter to load
        </span>
        <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[9px] text-slate-500">
          Esc
        </kbd>
      </div>
    </div>
  );
}

// ─── Serial Search Tab ────────────────────────────────────────────────────────
function SerialSearchTab({ factory, onSaveSuccess, showToast }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [editFloor, setEditFloor] = useState("");
  const [editStatus, setEditStatus] = useState("Running");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchedSerial, setSearchedSerial] = useState("");

  const [allUnits, setAllUnits] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const anchorRef = useRef(null); // wraps the input row — used for positioning
  const searchGuard = useRef(false);

  // ── Load all units once ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingUnits(true);
      try {
        const qs = factory ? `?factory=${encodeURIComponent(factory)}` : "";
        const res = await fetch(`/api/machines${qs}`);
        const json = await res.json();
        if (!cancelled && json.success) {
          const flat = [];
          for (const machine of json.data || []) {
            for (const unit of machine.units || []) {
              flat.push({
                serialNumber: unit.serialNumber,
                machineName: machine.machineName,
                floorName: unit.floorName,
                status: unit.status,
              });
            }
          }
          flat.sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
          setAllUnits(flat);
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoadingUnits(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [factory]);

  // ── Filter on keystroke ───────────────────────────────────────────────────
  useEffect(() => {
    const q = query.trim().toUpperCase();
    if (!q) {
      setSuggestions([]);
      setShowSuggest(false);
      setHighlightIdx(-1);
      return;
    }
    const matched = allUnits.filter((u) =>
      u.serialNumber.toUpperCase().includes(q),
    );
    setSuggestions(matched);
    setShowSuggest(matched.length > 0);
    setHighlightIdx(-1);
  }, [query, allUnits]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function h(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        setShowSuggest(false);
      }
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Core search ───────────────────────────────────────────────────────────
  const doSearch = useCallback(
    async (sn) => {
      const serial = (sn || "").trim().toUpperCase();
      if (!serial || searchGuard.current) return;
      searchGuard.current = true;
      setShowSuggest(false);
      setSearching(true);
      setResult(null);
      setNotFound(false);
      setSearchedSerial("");
      setShowModal(false);
      try {
        const qs = factory ? `?factory=${encodeURIComponent(factory)}` : "";
        const res = await fetch(`/api/machines${qs}`);
        const json = await res.json();
        if (!json.success) {
          setNotFound(true);
          return;
        }
        let found = null;
        for (const machine of json.data || []) {
          const unit = (machine.units || []).find(
            (u) => u.serialNumber.toUpperCase() === serial,
          );
          if (unit) {
            found = { machine, unit };
            break;
          }
        }
        if (found) {
          setResult(found);
          setEditFloor(found.unit.floorName);
          setEditStatus(found.unit.status);
          setSearchedSerial(serial);
        } else {
          setNotFound(true);
        }
      } finally {
        setSearching(false);
        searchGuard.current = false;
      }
    },
    [factory],
  );

  const pickSuggestion = useCallback(
    (u) => {
      setQuery(u.serialNumber);
      setSuggestions([]);
      setShowSuggest(false);
      setHighlightIdx(-1);
      doSearch(u.serialNumber);
    },
    [doSearch],
  );

  const handleKeyDown = (e) => {
    if (!showSuggest || !suggestions.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        doSearch(query);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((p) => Math.max(p - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && suggestions[highlightIdx])
        pickSuggestion(suggestions[highlightIdx]);
      else doSearch(query);
    } else if (e.key === "Escape") {
      setShowSuggest(false);
      setHighlightIdx(-1);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factory,
          machineName: result.machine.machineName,
          serialNumber: result.unit.serialNumber,
          floorName: editFloor,
          status: editStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Update successful.");
        setResult((prev) => ({
          ...prev,
          unit: { ...prev.unit, floorName: editFloor, status: editStatus },
        }));
        if (onSaveSuccess) onSaveSuccess();
      } else showToast("error", json.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!result || !confirm(`Delete "${result.unit.serialNumber}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/machines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factory,
          machineName: result.machine.machineName,
          serialNumber: result.unit.serialNumber,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Machine deleted successfully.");
        setResult(null);
        setQuery("");
        setSearchedSerial("");
        if (onSaveSuccess) onSaveSuccess();
      } else showToast("error", json.message);
    } finally {
      setDeleting(false);
    }
  };

  const statusStyle = STATUS_STYLE[editStatus] || STATUS_STYLE.Running;
  const changed =
    result &&
    (editFloor !== result.unit.floorName || editStatus !== result.unit.status);

  return (
    <>
      {showModal && searchedSerial && (
        <LineLayoutModal
          serialNumber={searchedSerial}
          factory={factory}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="p-6 space-y-5">
        {/* ── SEARCH BOX ─────────────────────────────────────────────────── */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2.5">
            Serial Number Search
          </label>

          {/* Anchor wrapper — used to calculate dropdown position */}
          <div ref={anchorRef} className="relative">
            {/* Input + button row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                {/* Search icon */}
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {searching ? (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    setQuery(v);
                    setResult(null);
                    setNotFound(false);
                    setSearchedSerial("");
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                  placeholder="Type to search serial…"
                  autoComplete="off"
                  spellCheck={false}
                  className={`w-full bg-[#0c1018] border text-white rounded-xl pl-10 pr-9 py-3.5 text-sm font-mono uppercase tracking-wide transition-all placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal focus:outline-none
                    ${
                      showSuggest
                        ? "border-cyan-500/70 ring-2 ring-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.08)]"
                        : result
                          ? "border-emerald-600/60 ring-1 ring-emerald-600/20"
                          : notFound
                            ? "border-red-700/60 ring-1 ring-red-700/20"
                            : "border-slate-700/70 hover:border-slate-600 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/15"
                    }`}
                />

                {/* Clear × */}
                {query && !searching && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResult(null);
                      setNotFound(false);
                      setSearchedSerial("");
                      setSuggestions([]);
                      setShowSuggest(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white text-xs transition-all"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Search button */}
              <button
                type="button"
                onClick={() => doSearch(query)}
                disabled={searching || !query.trim()}
                className="px-5 py-3.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-sm transition-all shrink-0 border border-cyan-500/30 disabled:border-slate-700"
              >
                {searching ? "…" : "Search"}
              </button>
            </div>

            {/* Suggestion dropdown — fixed portal, never clipped */}
            {showSuggest && (
              <SuggestionDropdown
                suggestions={suggestions}
                highlightIdx={highlightIdx}
                query={query}
                onPick={pickSuggestion}
                onHover={setHighlightIdx}
                dropdownRef={dropdownRef}
                anchorRef={anchorRef}
              />
            )}
          </div>

          {/* Status line below input */}
          <div className="mt-1.5 flex items-center gap-2 px-1">
            {loadingUnits ? (
              <span className="text-[10px] text-cyan-400/60 animate-pulse font-mono">
                Loading serial index…
              </span>
            ) : query && !showSuggest && !searching && !result && !notFound ? (
              <span className="text-[10px] text-slate-600 font-mono">
                Press Enter or Search to look up
              </span>
            ) : !query ? (
              <span className="text-[10px] text-slate-600 font-mono">
                {allUnits.length} serial{allUnits.length !== 1 ? "s" : ""}{" "}
                indexed
              </span>
            ) : null}
          </div>
        </div>

        {/* ── NOT FOUND ────────────────────────────────────────────────────── */}
        {notFound && (
          <div className="flex items-center gap-4 bg-red-950/30 border border-red-800/50 rounded-xl px-4 py-4">
            <span className="text-2xl shrink-0">🔍</span>
            <div>
              <p className="text-red-300 text-sm font-bold">No machine found</p>
              <p className="text-red-400/60 text-xs mt-0.5 font-mono">
                {query.trim().toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {/* ── RESULT CARD ──────────────────────────────────────────────────── */}
        {result && (
          <div className="space-y-4">
            {/* Info card */}
            <div className="rounded-2xl border border-slate-700/50 overflow-hidden bg-[#0c1018]">
              {/* Card header accent */}
              <div className="h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500" />

              <div className="p-4 space-y-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono mb-1">
                      Found
                    </p>
                    <p className="text-white font-mono font-bold text-lg leading-none">
                      {result.unit.serialNumber}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5"
                    style={{
                      color: STATUS_DOT[result.unit.status],
                      borderColor: `${STATUS_DOT[result.unit.status]}50`,
                      background: `${STATUS_DOT[result.unit.status]}15`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: STATUS_DOT[result.unit.status] }}
                    />
                    {result.unit.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-px bg-slate-800/60 rounded-xl overflow-hidden border border-slate-800/60">
                  {[
                    ["Machine", result.machine.machineName],
                    ["Floor", result.unit.floorName],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-[#0c1018] px-3 py-2.5">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">
                        {label}
                      </p>
                      <p className="text-slate-200 text-xs font-semibold leading-snug">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Line Layout button */}
                <div className="pt-3 mt-3 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-violet-700/40 bg-violet-950/20 hover:bg-violet-900/40 hover:border-violet-600/60 text-violet-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📐</span>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">
                          View Line Layout
                        </p>
                        <p className="text-[10px] text-violet-400/50 leading-tight mt-0.5">
                          See all processes · machine highlighted
                        </p>
                      </div>
                    </div>
                    <span className="text-violet-500 group-hover:translate-x-1 group-hover:text-violet-300 transition-all">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Edit section */}
            <div className="rounded-2xl border border-slate-700/50 overflow-hidden bg-[#0c1018]">
              <div className="h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="p-4 space-y-3">
                <p className="text-[10px] text-amber-400/80 uppercase tracking-widest font-mono">
                  Edit
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Floor
                    </label>
                    <div className="relative">
                      <select
                        value={editFloor}
                        onChange={(e) => setEditFloor(e.target.value)}
                        className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                      >
                        <option value="">— Floor —</option>
                        {FLOOR_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                        ▾
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className={`w-full bg-[#0a0d14] border text-white rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-1 transition-colors ${statusStyle.ring} ${statusStyle.border}`}
                      >
                        {STATUS_OPTIONS.map(({ value, label, icon }) => (
                          <option key={value} value={value}>
                            {icon} {label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                        ▾
                      </div>
                    </div>
                  </div>
                </div>

                {changed && (
                  <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-xs font-mono">
                    <span className="text-slate-500 shrink-0">Preview:</span>
                    <span className="text-slate-400">
                      {result.unit.floorName}
                    </span>
                    <span className="text-slate-600">→</span>
                    <span className="text-white font-bold">{editFloor}</span>
                    <span className="text-slate-700 mx-1">·</span>
                    <span className="text-slate-400">{result.unit.status}</span>
                    <span className="text-slate-600">→</span>
                    <span
                      className="font-bold"
                      style={{ color: STATUS_DOT[editStatus] }}
                    >
                      {editStatus}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !editFloor || !changed}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 text-[#0a0d14] font-bold py-2.5 rounded-xl text-sm transition-all border border-cyan-400/20 disabled:border-slate-700"
                  >
                    {saving ? "Saving…" : "✓ Update"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 bg-transparent border border-red-900 hover:border-red-600 text-red-500 hover:text-red-300 hover:bg-red-950/40 font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
                  >
                    {deleting ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Add / Edit by Machine Tab ────────────────────────────────────────────────
function MachineEditTab({ factory, onSaveSuccess, showToast }) {
  const [machineName, setMachineName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [floorName, setFloorName] = useState("");
  const [status, setStatus] = useState("Running");
  const [existingUnits, setExistingUnits] = useState([]);
  const [fetchingUnits, setFetchingUnits] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadMachineUnits = useCallback(
    async (name) => {
      if (!name) {
        setExistingUnits([]);
        return;
      }
      setFetchingUnits(true);
      try {
        const qs = new URLSearchParams({ name });
        if (factory) qs.set("factory", factory);
        const res = await fetch(`/api/machines?${qs}`);
        const json = await res.json();
        setExistingUnits(
          json.success && json.data ? (json.data.units ?? []) : [],
        );
      } catch {
        setExistingUnits([]);
      } finally {
        setFetchingUnits(false);
      }
    },
    [factory],
  );

  useEffect(() => {
    loadMachineUnits(machineName);
    setSerialNumber("");
    setFloorName("");
    setStatus("Running");
    setCurrentUnit(null);
    setUnitSearch("");
    setStatusFilter("ALL");
  }, [machineName, loadMachineUnits]);

  useEffect(() => {
    if (!serialNumber.trim()) {
      setCurrentUnit(null);
      return;
    }
    const found = existingUnits.find(
      (u) => u.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase(),
    );
    if (found) {
      setCurrentUnit(found);
      setFloorName(found.floorName);
      setStatus(found.status);
    } else {
      setCurrentUnit(null);
    }
  }, [serialNumber, existingUnits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!machineName || !serialNumber.trim() || !floorName || !status) {
      showToast("error", "All fields are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factory,
          machineName,
          serialNumber: serialNumber.trim().toUpperCase(),
          floorName,
          status,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", json.message || "Successfully saved.");
        await loadMachineUnits(machineName);
        setSerialNumber("");
        setFloorName("");
        setStatus("Running");
        setCurrentUnit(null);
        if (onSaveSuccess) onSaveSuccess();
      } else showToast("error", json.message || "There was a problem saving.");
    } catch {
      showToast("error", "Network issue.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUnit || !confirm(`Delete "${serialNumber}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/machines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factory,
          machineName,
          serialNumber: serialNumber.trim().toUpperCase(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Machine unit deleted successfully.");
        await loadMachineUnits(machineName);
        setSerialNumber("");
        setFloorName("");
        setStatus("Running");
        setCurrentUnit(null);
        if (onSaveSuccess) onSaveSuccess();
      } else showToast("error", json.message);
    } catch {
      showToast("error", "Network issue.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUnits = existingUnits.filter((u) => {
    const matchesSearch = u.serialNumber
      .toLowerCase()
      .includes(unitSearch.toLowerCase().trim());
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unitStats = existingUnits.reduce((acc, u) => {
    acc[u.status] = (acc[u.status] || 0) + 1;
    return acc;
  }, {});
  const isNew = serialNumber.trim() && !currentUnit;
  const statusStyle = STATUS_STYLE[status] || STATUS_STYLE.Running;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2">
          Machine Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="w-full bg-[#0c1018] border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm appearance-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          >
            <option value="">— Select Machine —</option>
            {MACHINE_NAMES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            ▾
          </div>
        </div>
      </div>

      {machineName && (
        <div className="bg-[#0c1018] border border-slate-700/60 rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-slate-800/60">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                {fetchingUnits ? (
                  <span className="text-cyan-400 animate-pulse">
                    Loading...
                  </span>
                ) : (
                  <span>
                    Total{" "}
                    <span className="text-white font-bold">
                      {existingUnits.length}
                    </span>{" "}
                    units
                  </span>
                )}
              </p>
              <div className="flex gap-1.5 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${statusFilter === "ALL" ? "bg-slate-600 border-slate-400 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}`}
                >
                  ALL {existingUnits.length > 0 && `(${existingUnits.length})`}
                </button>
                {STATUS_OPTIONS.map(({ value, label }) => {
                  const count = unitStats[value] || 0;
                  if (!count) return null;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setStatusFilter(statusFilter === value ? "ALL" : value)
                      }
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${statusFilter === value ? STATUS_BADGE_MINI[value] : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                placeholder="Search serial..."
                className="w-full bg-[#0a0d14] border border-slate-700/60 text-white rounded-lg pl-8 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors placeholder:text-slate-600"
              />
              {unitSearch && (
                <button
                  type="button"
                  onClick={() => setUnitSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {fetchingUnits ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-cyan-400 text-xs animate-pulse font-mono">
                  Loading...
                </span>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-600 gap-2">
                <span className="text-2xl">📭</span>
                <span className="text-xs">
                  {unitSearch || statusFilter !== "ALL"
                    ? "No results"
                    : "No units added"}
                </span>
              </div>
            ) : (
              <div className="p-3 grid grid-cols-1 gap-1">
                {filteredUnits.map((u) => {
                  const isSelected = serialNumber === u.serialNumber;
                  return (
                    <button
                      key={u.serialNumber}
                      type="button"
                      onClick={() => setSerialNumber(u.serialNumber)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${isSelected ? "bg-cyan-900/50 border-cyan-500/60" : "bg-[#0a0d14] border-slate-800/60 hover:border-slate-600 hover:bg-slate-800/40"}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`text-xs font-mono font-bold shrink-0 ${isSelected ? "text-cyan-300" : "text-slate-200"}`}
                        >
                          {u.serialNumber}
                        </span>
                        <span
                          className={`text-[10px] shrink-0 ${isSelected ? "text-cyan-400/70" : "text-slate-500"}`}
                        >
                          {u.floorName}
                        </span>
                      </div>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ml-2 flex items-center gap-1"
                        style={{
                          color: STATUS_DOT[u.status],
                          borderColor: `${STATUS_DOT[u.status]}40`,
                          background: `${STATUS_DOT[u.status]}12`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: STATUS_DOT[u.status] }}
                        />
                        {u.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {(unitSearch || statusFilter !== "ALL") && !fetchingUnits && (
            <div className="px-4 py-2 border-t border-slate-800/60 text-[10px] text-slate-600 font-mono">
              {filteredUnits.length} / {existingUnits.length} showing
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2">
          Serial Number <span className="text-red-400">*</span>
          {isNew && (
            <span className="ml-2 text-cyan-400 normal-case tracking-normal font-normal text-xs">
              — New unit
            </span>
          )}
          {currentUnit && (
            <span className="ml-2 text-amber-400 normal-case tracking-normal font-normal text-xs">
              — Will update
            </span>
          )}
        </label>
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="e.g. SN-001, M-042"
          className={`w-full bg-[#0c1018] border text-white rounded-xl px-4 py-3.5 text-sm font-mono uppercase focus:outline-none focus:ring-1 transition-colors placeholder:text-slate-600 placeholder:normal-case ${currentUnit ? "border-amber-700/60 focus:border-amber-500 focus:ring-amber-500/20" : "border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
        />
        {currentUnit && (
          <div className="mt-2 flex items-center gap-3 bg-[#0c1018] border border-amber-900/30 rounded-xl px-4 py-2.5">
            <span className="text-slate-500 text-xs">Current:</span>
            <span className="text-white text-xs font-semibold">
              {currentUnit.floorName}
            </span>
            <span className="text-slate-700">·</span>
            <span
              className="text-xs font-bold"
              style={{ color: STATUS_DOT[currentUnit.status] }}
            >
              {currentUnit.status}
            </span>
            <span className="text-slate-600 ml-auto text-xs">
              → change below
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2">
            Floor <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              className="w-full bg-[#0c1018] border border-slate-700 text-white rounded-xl px-4 py-3.5 text-sm appearance-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
            >
              <option value="">— Floor —</option>
              {FLOOR_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              ▾
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2">
            Status <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full bg-[#0c1018] border text-white rounded-xl px-4 py-3.5 text-sm appearance-none focus:outline-none focus:ring-1 transition-colors ${statusStyle.ring} ${statusStyle.border}`}
            >
              {STATUS_OPTIONS.map(({ value, label, icon }) => (
                <option key={value} value={value}>
                  {icon} {label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              ▾
            </div>
          </div>
        </div>
      </div>

      {machineName && serialNumber.trim() && floorName && status && (
        <div className={`border rounded-xl p-4 ${statusStyle.badge}`}>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mb-2">
            {currentUnit ? "Update preview" : "New entry"}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            {[
              ["Machine", machineName, "max-w-[160px] truncate text-xs"],
              [
                "Serial",
                serialNumber.trim().toUpperCase(),
                "font-mono text-sm",
              ],
              ["Floor", floorName, "text-xs"],
              ["Status", status, "text-xs"],
            ].map(([l, v, cls]) => (
              <div key={l}>
                <span className="text-[9px] opacity-50 block mb-0.5 uppercase tracking-widest">
                  {l}
                </span>
                <p className={`font-bold ${cls}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-[#0a0d14] font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition-all border border-cyan-400/20 disabled:border-slate-700"
        >
          {saving ? "Saving..." : currentUnit ? "Update" : "Add"}
        </button>
        {currentUnit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 bg-transparent border border-red-900 hover:border-red-600 text-red-500 hover:text-red-300 hover:bg-red-950/30 font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-40"
          >
            {deleting ? "…" : "Delete"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setMachineName("");
            setSerialNumber("");
            setFloorName("");
            setStatus("Running");
            setExistingUnits([]);
            setCurrentUnit(null);
            setUnitSearch("");
            setStatusFilter("ALL");
          }}
          className="px-5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 font-semibold py-3 rounded-xl text-sm uppercase tracking-wider transition-all"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function MachineInventoryForm({ onSaveSuccess, factory = "" }) {
  const [tab, setTab] = useState("search");
  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="bg-[#0a0d14] font-mono pb-6 min-h-full">
      <Toast toast={toast} />

      {/* Header */}
      <div className="px-6 pt-7 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-7 w-0.5 bg-cyan-400 rounded-full" />
          <span className="text-[10px] tracking-[0.3em] text-cyan-400 uppercase">
            Maintenance Department
          </span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Machine Inventory
        </h1>
        <p className="text-slate-600 text-xs mt-1">
          Track serial numbers and status of each machine unit.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex mx-6 mt-5 bg-[#0c1018] border border-slate-800/60 rounded-xl overflow-hidden p-1 gap-1">
        {[
          { key: "search", icon: "🔍", label: "Find Serial" },
          { key: "machine", icon: "＋", label: "Machine Based" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
              ${
                tab === t.key
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
              }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mx-6 mt-4 bg-[#0d1117] border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-px w-full bg-gradient-to-r from-cyan-500/60 via-blue-500/60 to-violet-500/60" />
        {tab === "search" ? (
          <SerialSearchTab
            factory={factory}
            onSaveSuccess={onSaveSuccess}
            showToast={showToast}
          />
        ) : (
          <MachineEditTab
            factory={factory}
            onSaveSuccess={onSaveSuccess}
            showToast={showToast}
          />
        )}
      </div>

      <p className="text-center text-slate-700 text-[10px] mt-4 font-mono">
        {tab === "search"
          ? "Type any part of a serial number to search instantly."
          : "Select machine type · enter serial · save or update."}
      </p>
    </div>
  );
}
