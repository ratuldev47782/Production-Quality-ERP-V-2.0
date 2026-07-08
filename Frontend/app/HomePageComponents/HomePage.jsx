// Frontend\app\HomePageComponents\HomePage.jsx
// app/page.js
"use client";

import { useAuth } from "@/app/hooks/useAuth";
import {
  Activity,
  ArrowRight,
  BarChart2,
  BookOpen,
  ClipboardList,
  GitCompare,
  ImageIcon,
  MonitorCloud,
  PanelLeftRightDashed,
  Table2,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import SignInOut from "../AuthComponents/SignInOut";

// ── Excel SVG Icon ─────────────────────────────────────────────────────────
function ExcelIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="14" height="18" rx="2" fill="#1D6F42" />
      <rect x="10" y="3" width="12" height="18" rx="2" fill="#21A366" />
      <rect x="9" y="3" width="7" height="18" rx="1" fill="#107C41" />
      <path
        d="M5.5 8.5L8.5 15.5M8.5 8.5L5.5 15.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="8"
        x2="19"
        y2="8"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
      <line
        x1="12"
        y1="11"
        x2="19"
        y2="11"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
      <line
        x1="12"
        y1="14"
        x2="19"
        y2="14"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

// ── Info Pill ──────────────────────────────────────────────────────────────
function InfoPill({ label, value }) {
  return (
    <span className="
      inline-flex items-center gap-1.5 rounded-full 
      border border-slate-300/50 dark:border-white/12
      bg-slate-100/40 dark:bg-white/8
      px-3 py-1 text-[11px] font-medium 
      text-slate-700 dark:text-white/90
      backdrop-blur
      transition-colors duration-200
    ">
      <span className="text-slate-500 dark:text-white/55">{label}:</span>
      <span className="text-slate-900 dark:text-white font-semibold">{value || "-"}</span>
    </span>
  );
}

// ── Compact Module Tile ────────────────────────────────────────────────────
function Tile({ href, icon: Icon, title, desc, tone = "sky" }) {
  const toneMap = {
    sky: "from-sky-100/60 to-sky-50/40 border-sky-200/60 hover:border-sky-300/80 dark:from-sky-500/10 dark:to-sky-500/3 dark:border-sky-400/20 dark:hover:border-sky-300/40",
    emerald: "from-emerald-100/60 to-emerald-50/40 border-emerald-200/60 hover:border-emerald-300/80 dark:from-emerald-500/10 dark:to-emerald-500/3 dark:border-emerald-400/20 dark:hover:border-emerald-300/40",
    amber: "from-amber-100/60 to-amber-50/40 border-amber-200/60 hover:border-amber-300/80 dark:from-amber-500/10 dark:to-amber-500/3 dark:border-amber-400/20 dark:hover:border-amber-300/40",
    violet: "from-violet-100/60 to-violet-50/40 border-violet-200/60 hover:border-violet-300/80 dark:from-violet-500/10 dark:to-violet-500/3 dark:border-violet-400/20 dark:hover:border-violet-300/40",
    rose: "from-rose-100/60 to-rose-50/40 border-rose-200/60 hover:border-rose-300/80 dark:from-rose-500/10 dark:to-rose-500/3 dark:border-rose-400/20 dark:hover:border-rose-300/40",
    slate: "from-slate-200/50 to-slate-100/30 border-slate-300/60 hover:border-slate-400/80 dark:from-slate-400/10 dark:to-slate-400/3 dark:border-slate-300/15 dark:hover:border-slate-200/35",
    green: "from-green-100/60 to-green-50/40 border-green-200/60 hover:border-green-300/80 dark:from-green-500/10 dark:to-green-500/3 dark:border-green-400/20 dark:hover:border-green-300/40",
    orange: "from-orange-100/60 to-orange-50/40 border-orange-200/60 hover:border-orange-300/80 dark:from-orange-500/10 dark:to-orange-500/3 dark:border-orange-400/20 dark:hover:border-orange-300/40",
  };

  return (
    <Link
      href={href}
      className={`
        group relative overflow-hidden rounded-xl border 
        bg-gradient-to-br ${toneMap[tone]}
        p-3 transition-all duration-200
        hover:-translate-y-0.5 active:scale-[0.98]
      `}
    >
      <div className="flex items-start gap-2.5">
        <div className="
          grid h-8 w-8 flex-shrink-0 place-items-center 
          rounded-lg border 
          border-slate-300/40 dark:border-white/10
          bg-slate-100/50 dark:bg-white/8
          text-slate-700 dark:text-white
          transition-colors duration-200
        ">
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="
              truncate text-[11px] font-semibold 
              text-slate-900 dark:text-white
              leading-tight transition-colors duration-200
            ">
              {title}
            </h3>
            <ArrowRight
              size={10}
              className="
                ml-auto 
                text-slate-400/50 dark:text-white/40
                opacity-0 group-hover:opacity-100 
                transition-opacity flex-shrink-0 duration-200
              "
            />
          </div>
          <p className="
            mt-0.5 line-clamp-1 text-[10px] 
            text-slate-600 dark:text-white/45
            transition-colors duration-200
          ">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const { auth } = useAuth();

  const userName = useMemo(
    () => auth?.user?.user_name || auth?.user_name || "User",
    [auth],
  );
  const factory = useMemo(
    () => auth?.factory || auth?.user?.factory || auth?.assigned_factory || "",
    [auth],
  );
  const building = useMemo(
    () =>
      auth?.assigned_building ||
      auth?.user?.assigned_building ||
      auth?.building ||
      "",
    [auth],
  );

  return (
    /*
      Layout strategy per breakpoint:
      - Mobile  (<640px):  single-column, scrollable, sidebar offset removed
      - Tablet  (640–1023): 2-col hero, 3-col tiles grid
      - Desktop (1024–1535): 2-col hero, 5-col tiles grid, fixed-height layout
      - TV/4K   (1536px+): same as desktop but wider max-w, larger text scale
      
      Theme support:
      - Standard mode: Soft warm white (#F8F6F1) with refined pastels
      - Dark mode:     Deep navy (#070A12) with vibrant accent glows
    */
    <main
      className="
      min-h-screen 
      bg-[#F8F6F1] dark:bg-[#070A12]
      text-slate-900 dark:text-white
      pl-0 sm:pl-14
      flex flex-col
      overflow-x-hidden
      transition-colors duration-300
    "
    >
      {/* ── Ambient background - Standard Mode ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 dark:hidden">
        <div className="absolute -top-32 left-[-8%] h-[500px] w-[500px] rounded-full bg-emerald-300/8 blur-[100px]" />
        <div className="absolute -top-28 right-[-10%] h-[520px] w-[520px] rounded-full bg-blue-300/8 blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[15%] h-[480px] w-[480px] rounded-full bg-violet-300/6 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      {/* ── Ambient background - Dark Mode ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block">
        <div className="absolute -top-24 left-[-10%] h-[480px] w-[480px] rounded-full bg-emerald-500/12 blur-[80px]" />
        <div className="absolute -top-28 right-[-12%] h-[500px] w-[500px] rounded-full bg-sky-500/12 blur-[80px]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[480px] w-[480px] rounded-full bg-violet-500/10 blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      {/* ── Header ── */}
      <header className="
        shrink-0 border-b 
        border-slate-200/40 dark:border-white/10
        bg-white/50 dark:bg-[#070A12]/70
        backdrop-blur z-30 sticky top-0
        transition-colors duration-300
      ">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5">
          {/* Logo + name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="
              h-8 w-8 sm:h-9 sm:w-9 rounded-xl 
              bg-slate-100 dark:bg-white
              border border-slate-300/40 dark:border-white/15
              flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0
              transition-colors duration-200
            ">
              <Image
                src="/HKD_LOGO.png"
                alt="HKD OUTDOOR INNOVATIONS LTD."
                width={30}
                height={30}
                className="object-contain"
                priority
              />
            </div>
            <div className="leading-tight min-w-0">
              <p className="
                text-[11px] sm:text-[12px] font-semibold 
                text-slate-900 dark:text-white/95
                truncate transition-colors duration-200
              ">
                HKD OUTDOOR INNOVATIONS LTD.
              </p>
              <p className="
                text-[9px] sm:text-[10px] 
                text-slate-500 dark:text-white/50
                hidden xs:block truncate transition-colors duration-200
              ">
                Production & Quality Management System
              </p>
            </div>
          </div>

          {/* Desktop right side: sign in + pills */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <div className="-mt-2 origin-right scale-[0.75]">
              <SignInOut />
            </div>
            <InfoPill label="Factory" value={factory} />
            <InfoPill label="Floor" value={building} />
          </div>

          {/* Mobile right side: manual link */}
          <div className="md:hidden flex-shrink-0">
            <Link
              href="/user-manual"
              className="
                inline-flex items-center gap-1.5 rounded-xl 
                border border-slate-300/60 dark:border-white/15
                bg-slate-100/70 dark:bg-white/10
                px-2.5 py-1.5 text-[10px] sm:text-[11px] font-semibold 
                text-slate-700 dark:text-white/90
                hover:bg-slate-100/90 dark:hover:bg-white/14
                transition-colors duration-200
              "
            >
              <BookOpen size={12} /> Manual
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <div
        className="
        flex-1 flex flex-col mx-auto w-full
        max-w-[1920px]
        px-3 sm:px-5 2xl:px-10
        py-4 sm:py-5
        gap-4 sm:gap-5
      "
      >
        {/* ══ HERO ROW ══════════════════════════════════════════════════════ */}
        <div
          className="
          grid gap-4 sm:gap-6 lg:gap-8 items-center shrink-0
          grid-cols-1 sm:grid-cols-2
        "
        >
          {/* LEFT — Hero text */}
          <div className="flex flex-col gap-2.5 sm:gap-3 order-2 sm:order-1">
            <div className="
              inline-flex items-center gap-2 rounded-full 
              border border-slate-300/50 dark:border-white/10
              bg-slate-100/40 dark:bg-white/5
              px-3 py-1 text-[10px] sm:text-[11px] 
              text-slate-600 dark:text-white/60
              w-fit transition-colors duration-200
            ">
              <span className="
                h-1.5 w-1.5 rounded-full 
                bg-emerald-500 dark:bg-emerald-400
                shrink-0
              " />
              Live dashboards • Fast entry • Clean tracking
            </div>

            <h1
              className="
              font-bold leading-tight
              text-[22px] xs:text-[26px] sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px] 2xl:text-[48px]
              text-slate-900 dark:text-white
              transition-colors duration-200
            "
            >
              YOUR DAILY{" "}
              <span className="
                bg-gradient-to-r 
                from-emerald-600 to-blue-600 dark:from-emerald-300 dark:to-sky-300
                bg-clip-text text-transparent
              ">
                PRODUCTION & QUALITY
              </span>{" "}
              CONTROL CENTER.
            </h1>

            <p className="
              text-[11px] sm:text-[12px] 2xl:text-[14px] 
              leading-relaxed 
              text-slate-600 dark:text-white/60
              max-w-sm 2xl:max-w-md
              transition-colors duration-200
            ">
              Open modules from the tiles below. Track hourly production,
              quality inspections, machine inventory, and line layouts - all in
              one system.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/floor-dashboard"
                className="
                  inline-flex items-center gap-1.5 rounded-xl 
                  bg-emerald-600 dark:bg-emerald-500
                  px-3 sm:px-3.5 py-1.5 sm:py-2 
                  text-[11px] sm:text-[12px] font-semibold 
                  text-white dark:text-emerald-950
                  shadow-[0_4px_12px_rgba(22,163,74,0.2)] dark:shadow-[0_8px_24px_rgba(16,185,129,0.25)]
                  hover:bg-emerald-700 dark:hover:bg-emerald-400
                  transition-colors duration-200
                "
              >
                <MonitorCloud size={13} />
                Floor Dashboard
              </Link>
              <Link
                href="/ProductionInput"
                className="
                  inline-flex items-center gap-1.5 rounded-xl 
                  border border-slate-300/60 dark:border-white/15
                  bg-slate-100/60 dark:bg-white/8
                  px-3 sm:px-3.5 py-1.5 sm:py-2 
                  text-[11px] sm:text-[12px] font-semibold 
                  text-slate-700 dark:text-white/85
                  hover:bg-slate-100/80 dark:hover:bg-white/14
                  transition-colors duration-200
                "
              >
                <ClipboardList size={13} />
                Production Input
              </Link>
              <Link
                href="/user-manual"
                className="
                  inline-flex items-center gap-1.5 rounded-xl 
                  border border-slate-300/60 dark:border-white/15
                  bg-slate-100/60 dark:bg-white/8
                  px-3 sm:px-3.5 py-1.5 sm:py-2 
                  text-[11px] sm:text-[12px] font-semibold 
                  text-slate-700 dark:text-white/85
                  hover:bg-slate-100/80 dark:hover:bg-white/14
                  transition-colors duration-200
                "
              >
                <BookOpen size={13} />
                User Manual
              </Link>
            </div>

            {/* Mobile-only info pills */}
            <div className="flex flex-wrap gap-2 md:hidden mt-1">
              <InfoPill label="User" value={userName} />
              <InfoPill label="Factory" value={factory} />
              <InfoPill label="Floor" value={building} />
            </div>
          </div>

          <div className="
            relative flex items-center justify-center 
            order-1 sm:order-2 
            h-[180px] xs:h-[220px] sm:h-[260px] md:h-[280px] lg:h-[320px] xl:h-[360px] 2xl:h-[420px] 
            w-full
          ">
            <Image
              src="/ChatGPT_Image_Mar_17__2026__09_57_46_AM-removebg-preview.png"
              alt="Factory"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="
            h-px flex-1 
            bg-slate-300/30 dark:bg-white/7
            transition-colors duration-200
          " />
          <span className="
            text-[9px] font-bold tracking-widest uppercase 
            text-slate-400/50 dark:text-white/25
            transition-colors duration-200
          ">
            All Modules
          </span>
          <div className="
            h-px flex-1 
            bg-slate-300/30 dark:bg-white/7
            transition-colors duration-200
          " />
        </div>

        {/* ══ TILES GRID ════════════════════════════════════════════════════
            Mobile:   2 cols
            Tablet:   3 cols  (sm)
            Laptop:   4 cols  (md)
            Desktop:  5 cols  (lg+)
            TV/4K:    5 cols  (xl/2xl) — tiles just grow with the grid
        ════════════════════════════════════════════════════════════════════ */}
        <div
          className="
          grid gap-2 sm:gap-2.5
          grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
          flex-1 content-start
        "
        >
          <Tile
            href="/floor-dashboard"
            icon={MonitorCloud}
            title="Floor Dashboard"
            desc="Live line performance"
            tone="sky"
          />
          <Tile
            href="/floor-summary"
            icon={BarChart2}
            title="Floor Summary"
            desc="Day charts & comparisons"
            tone="violet"
          />
          <Tile
            href="/floor-compare"
            icon={GitCompare}
            title="Floor Compare"
            desc="Side-by-side floors"
            tone="slate"
          />
          <Tile
            href="/ProductionInput"
            icon={Activity}
            title="Production Input"
            desc="Hourly production entry"
            tone="emerald"
          />
          <Tile
            href="/QualityInput"
            icon={ClipboardList}
            title="Quality Input"
            desc="Inspection & defects"
            tone="amber"
          />
          <Tile
            href="/QualitySummaryTable"
            icon={Table2}
            title="Quality Summary"
            desc="Hourly quality totals"
            tone="slate"
          />
          <Tile
            href="/style-media-register"
            icon={ImageIcon}
            title="Style Media"
            desc="Buyer/Style/Color media"
            tone="rose"
          />
          <Tile
            href="/IEDepartment/MachineInventory"
            icon={ExcelIcon}
            title="Machine Inventory"
            desc="Machine register & export"
            tone="green"
          />
          <Tile
            href="/IEDepartment/LineLayout"
            icon={PanelLeftRightDashed}
            title="Line Layout"
            desc="IE dept line plans"
            tone="violet"
          />
          <Tile
            href="/IEDepartment/MachineInventory"
            icon={Wrench}
            title="Maintenance"
            desc="Repair & work orders"
            tone="orange"
          />
        </div>

        {/* ── Footer strip ── */}
        <div className="
          shrink-0 flex items-center justify-between 
          border-t border-slate-200/40 dark:border-white/6
          pt-2 pb-2 sm:pb-0
          transition-colors duration-200
        ">
          <p className="
            text-[10px] 
            text-slate-400/60 dark:text-white/25
            transition-colors duration-200
          ">
            © {new Date().getFullYear()} HKD OUTDOOR INNOVATIONS LTD.
          </p>
          <p className="
            text-[10px] 
            text-slate-400/60 dark:text-white/25
            hidden sm:block
            transition-colors duration-200
          ">
            Floor visibility • Quality • Production
          </p>
        </div>
      </div>
    </main>
  );
}