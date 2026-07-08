"use client";
// app/IEDepartment/MachineInventory/page.js

import { useAuth } from "@/app/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import MachineInventoryForm from "./MachineInventoryForm";
import MachineInventoryTable from "./MachineInventoryTable";

const FACTORY_OPTIONS = ["K-2", "K-3", "K-4", "Others"];

// Sidebar width in px (must match layout.js --sidebar-w)
const SIDEBAR_W = 56;

// The "design width" — what the layout was designed for before scaling
const DESIGN_WIDTH = 1440;

export default function Page() {
  const { auth, loading: authLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterFactory, setFilterFactory] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  const userFactory = auth?.factory ?? "";
  const isAdmin = auth?.role === "Admin" || auth?.role === "IE";
  const effectiveFactory = isAdmin ? filterFactory || "" : userFactory;

  // Recalculate scale whenever the available width changes
  useEffect(() => {
    function recalc() {
      // Available width = viewport - sidebar
      const available = window.innerWidth - SIDEBAR_W;
      // Scale so the design fits perfectly; never scale above 1 (no upscale on huge screens)
      const next = Math.min(available / DESIGN_WIDTH, 1);
      setScale(next);
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  if (authLoading) {
    return (
      <div className="h-screen bg-[rgb(15,17,23)] flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse font-mono">
          লোড হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#0f1117] overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Scale wrapper — fills full available width at every screen size */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${(1 / scale) * 100}%`,
          height: `${(1 / scale) * 100}vh`,
        }}
        className="flex flex-col"
      >
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 bg-cyan-400 rounded-full" />
            <div>
              <p className="text-[10px] tracking-[0.3em] text-cyan-400 uppercase font-mono">
                Maintenance Department
              </p>
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                Machine Inventory
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Add / Edit toggle */}
            <button
              onClick={() => setFormOpen((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all font-mono
                ${
                  formOpen
                    ? "bg-cyan-900 border-cyan-600 text-cyan-300 hover:bg-cyan-800"
                    : "bg-[#161b27] border-slate-700 text-slate-400 hover:border-cyan-600 hover:text-cyan-300"
                }`}
            >
              <span
                className="text-base leading-none inline-block transition-transform duration-200"
                style={{
                  transform: formOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                ＋
              </span>
              {formOpen ? "বন্ধ করুন" : "Add / Edit"}
            </button>

            {/* Factory filter / badge */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                  Factory
                </span>
                <div className="relative">
                  <select
                    value={filterFactory}
                    onChange={(e) => {
                      setFilterFactory(e.target.value);
                      setRefreshKey((k) => k + 1);
                    }}
                    className="bg-[#161b27] border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-cyan-500 appearance-none"
                  >
                    <option value="">সব Factory</option>
                    {FACTORY_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    ▾
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-sm bg-cyan-950 border border-cyan-800 text-cyan-300 px-3 py-1.5 rounded-lg font-semibold font-mono">
                🏭 {userFactory || "—"}
              </span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Full-width table */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <MachineInventoryTable
              refreshKey={refreshKey}
              factory={effectiveFactory}
            />
          </div>

          {/* Backdrop */}
          {formOpen && (
            <div
              className="absolute inset-0 bg-black/40 z-20"
              onClick={() => setFormOpen(false)}
            />
          )}

          {/* Slide-over form panel */}
          <div
            className={`absolute top-0 right-0 h-full z-30 flex flex-col
              bg-[#0f1117] border-l border-slate-800 shadow-2xl overflow-y-auto
              transition-all duration-300 ease-in-out
              ${formOpen ? "w-[440px] opacity-100" : "w-0 opacity-0 pointer-events-none"}`}
          >
            {formOpen && (
              <>
                <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
                    Add / Edit Machine
                  </span>
                  <button
                    onClick={() => setFormOpen(false)}
                    className="text-slate-500 hover:text-slate-300 text-lg font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all"
                  >
                    ✕
                  </button>
                </div>
                <MachineInventoryForm
                  factory={effectiveFactory}
                  onSaveSuccess={() => setRefreshKey((k) => k + 1)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
