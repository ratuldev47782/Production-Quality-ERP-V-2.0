"use client";

import { useAuth } from "@/app/hooks/useAuth";
import {
  Activity,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  FileText,
  GitCompare,
  LogIn,
  LogOut,
  MonitorCloud,
  Package,
  PanelLeftRightDashed,
  Table2,
  User,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";
const COLLAPSED_W = 56;
const EXPANDED_W = 220;

// ── Excel SVG Icon ─────────────────────────────────────────────────────────
function ExcelIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
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
      <line
        x1="12"
        y1="17"
        x2="19"
        y2="17"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

// ── Colorful icon wrapper ──────────────────────────────────────────────────
// Maps each nav label to a color class
const ICON_COLORS = {
  "Floor Dashboard": "text-sky-400",
  "Floor Summary": "text-violet-400",
  "Floor Compare": "text-fuchsia-400",
  "Management View": "text-violet-400",
  Production: "text-amber-400",
  "Production Input": "text-amber-400",
  Quality: "text-rose-400",
  "Quality Input": "text-rose-400",
  "Quality Summary Table": "text-pink-400",
  "Style Media Register": "text-cyan-400",
  "Maintenance Department": "text-green-400",
  "Machine Inventory": "text-green-400",
  "IE Department": "text-orange-400",
  "Line Layout": "text-orange-400",
 "Finishing Department": "text-teal-400",
"FG Warehouse": "text-teal-400",
};

// ── Nav structure ──────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Floor Dashboard",
    icon: MonitorCloud,
    group: "common",
    href: "/floor-dashboard",
    children: [],
  },
  {
    label: "Management View",
    icon: ChartNoAxesCombined,
    group: "common",
    children: [
      {
        label: "Floor Summary",
        href: "/floor-summary",
        icon: ChartNoAxesCombined,
      },
      { label: "Floor Compare", href: "/floor-compare", icon: GitCompare },
    ],
  },
  {
    label: "Production",
    icon: Activity,
    group: "production",
    children: [
      { label: "Production Input", href: "/ProductionInput", icon: Activity },
    ],
  },
  {
    label: "Quality",
    icon: ClipboardList,
    group: "quality",
    children: [
      { label: "Quality Input", href: "/QualityInput", icon: ClipboardList },
      {
        label: "Quality Summary Table",
        href: "/QualitySummaryTable",
        icon: Table2,
      },
    ],
  },
  {
    label: "Style Media Register",
    icon: FileText,
    group: "tracker",
    children: [
      {
        label: "Style Media Register",
        href: "/style-media-register",
        icon: FileText,
      },
    ],
  },
  {
    label: "Maintenance Department",
    icon: ExcelIcon, // Excel icon for the group
    group: "maintenance",
    children: [
      {
        label: "Machine Inventory",
        href: "/IEDepartment/MachineInventory",
        icon: ExcelIcon,
      },
    ],
  },
  {
    label: "IE Department",
    icon: PanelLeftRightDashed,
    group: "ie",
    children: [
      {
        label: "Line Layout",
        href: "/IEDepartment/LineLayout",
        icon: PanelLeftRightDashed,
      },
    ],
  },
  {
  label: "Finishing Department",
  icon: Package,
  group: "finishing",
  children: [
    {
      label: "FG Warehouse",
      href: "https://192.169.10.4:3003",
      icon: Warehouse,
      external: true,
    },
  ],
},
];

// ── role → allowed groups ──────────────────────────────────────────────────
function getAllowedGroups(role, trackerType) {
  if (role === "Management" || role === "Developer" || role === "Others") {
    return ["common", "production", "quality", "tracker", "ie", "maintenance", "finishing"];
  }
  if (role === "Data tracker") {
    if (trackerType === "Quality") return ["common", "quality", "tracker"];
    if (trackerType === "Production")
      return ["common", "production", "tracker"];
    if (trackerType === "Maintenance") return ["common", "maintenance"];
    if (trackerType === "IE") return ["common", "ie"];
    return ["common"];
  }
  return [];
}

function ActiveDot() {
  return (
    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-400 dark:bg-sky-300 shadow-[0_0_6px_rgba(56,189,248,0.9)] dark:shadow-[0_0_6px_rgba(125,211,252,0.5)] shrink-0" />
  );
}

// Renders an icon — handles both Lucide components and custom SVG components
function NavIcon({ icon: Icon, label, size = 16, className = "" }) {
  const colorClass = ICON_COLORS[label] || "text-slate-400 dark:text-slate-500";
  const combined = `shrink-0 ${colorClass} ${className}`;
  return <Icon size={size} className={combined} />;
}

export default function SideNavbar() {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [expanded, setExpanded] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const { theme, toggleTheme } = useTheme();
  // ── Sync sidebar width → CSS variable on <html> so layout.js can use it ──
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-w",
      `${expanded ? EXPANDED_W : COLLAPSED_W}px`,
    );
  }, [expanded]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-w",
      `${COLLAPSED_W}px`,
    );
  }, []);

  const handleLogout = () => {
    setAuth(null);
    router.push("/login");
  };

  const user = auth?.user || auth || {};
  const userName = user?.user_name || "";
  const userRole = user?.role || "";
  const trackerType = user?.tracker_type || "";
  const userFactory = user?.factory || "";
  const userBuilding = user?.assigned_building || user?.building || "";

  const allowedGroups = getAllowedGroups(userRole, trackerType);
  const roleLabel =
    userRole === "Data tracker" && trackerType
      ? `${trackerType} Tracker`
      : userRole || "—";

  function toggleGroup(label) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function isGroupActive(navGroup) {
    if (
      navGroup.href &&
      (pathname === navGroup.href || pathname.startsWith(navGroup.href + "/"))
    )
      return true;
    return (navGroup.children || []).some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
    );
  }

  function handleProtectedClick(e, group) {
    if (!allowedGroups.includes(group)) {
      e.preventDefault();
      router.push("/login");
    }
  }

  function fadeSlide(show) {
    return {
      opacity: show ? 1 : 0,
      maxWidth: show ? "200px" : "0px",
      transition: "opacity 180ms, max-width 280ms cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden",
      whiteSpace: "nowrap",
    };
  }

  return (
    <aside
      style={{
        width: expanded ? `${EXPANDED_W}px` : `${COLLAPSED_W}px`,
        transition: "width 280ms cubic-bezier(0.4,0,0.2,1)",
      }}
      className="fixed inset-y-0 left-0 z-40 h-full bg-slate-950 dark:bg-slate-950 border-r border-slate-800/60 dark:border-slate-800/80 flex flex-col overflow-hidden "
    >
      {/* ── Header ── */}
      <div className="flex flex-col items-center shrink-0 border-b border-slate-800/60 dark:border-slate-800/80 py-2 px-2 gap-2">
        <div className="flex items-center w-full gap-2">
          <Link
            href="/"
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-9 w-9 rounded-xl bg-white dark:bg-white flex items-center justify-center overflow-hidden shadow-[0_0_18px_rgba(15,23,42,0.9)] dark:shadow-[0_0_18px_rgba(0,0,0,0.7)]">
              <Image
                src="/HKD_LOGO.png"
                alt="HKD"
                width={30}
                height={30}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <div
            style={fadeSlide(expanded)}
            className="flex items-center justify-between flex-1 min-w-0"
          >
            <span className="text-[9px] font-extrabold text-slate-100 dark:text-slate-100 tracking-widest uppercase leading-tight max-w-[120px] whitespace-normal">
              HKD Outdoor Innovations ltd.
            </span>

            <button
              onClick={() => setExpanded(false)}
              className="h-7 w-7 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-slate-100 dark:hover:text-slate-200 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronRight size={15} className="rotate-180" />
            </button>
          </div>
        </div>
        <div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 h-8 rounded-xl px-2 border border-slate-700 dark:border-slate-700 bg-slate-800/50 dark:bg-slate-800/70 text-slate-300 dark:text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-700 hover:text-slate-100 dark:hover:text-slate-100 transition-all"
          >
            {theme === "dark" ? (
              <Sun size={14} className="shrink-0 text-amber-400 dark:text-amber-300" />
            ) : (
              <Moon size={14} className="shrink-0 text-sky-400 dark:text-sky-300" />
            )}
            <span style={fadeSlide(expanded)} className="text-[11px] font-bold">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-center h-7 w-9 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-100 dark:hover:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <div className="flex flex-col gap-[4px]">
            <span className="block h-[2px] w-[18px] bg-current rounded-full" />
            <span className="block h-[2px] w-[13px] bg-current rounded-full" />
            <span className="block h-[2px] w-[18px] bg-current rounded-full" />
          </div>
        </button>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-0.5 px-1.5 scrollbar-none">
        {NAV_GROUPS.map((navGroup) => {
          const allowed = allowedGroups.includes(navGroup.group);
          const active = isGroupActive(navGroup);
          const isOpen = openGroups[navGroup.label] ?? active;
          const hasKids = navGroup.children && navGroup.children.length > 0;

          const itemCls = [
            "flex items-center gap-2.5 h-9 rounded-xl px-2 transition-all duration-150 group relative w-full",
            active && allowed
              ? "bg-sky-500/15 dark:bg-sky-500/20 text-sky-300 dark:text-sky-300 border border-sky-500/30 dark:border-sky-500/40"
              : allowed
                ? "text-slate-400 dark:text-slate-400 hover:text-slate-100 dark:hover:text-slate-100 hover:bg-slate-800/70 dark:hover:bg-slate-800/50 border border-transparent"
                : "text-slate-600 dark:text-slate-600 opacity-40 cursor-default border border-transparent",
          ].join(" ");

          const labelEl = (
            <span
              style={fadeSlide(expanded)}
              className="text-[11px] font-bold flex-1 text-left"
            >
              {navGroup.label}
            </span>
          );

          const tooltipEl = !expanded && (
            <div className="pointer-events-none absolute left-[52px] top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
              <div className="bg-slate-800 dark:bg-slate-800 border border-slate-700 dark:border-slate-700 text-slate-100 dark:text-slate-100 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
                {navGroup.label}
              </div>
            </div>
          );

          // ── Direct link (no children) ──
          if (!hasKids) {
            return (
              <Link
                key={navGroup.label}
                href={navGroup.href}
                onClick={(e) => handleProtectedClick(e, navGroup.group)}
                className={itemCls}
              >
                <NavIcon
                  icon={navGroup.icon}
                  label={navGroup.label}
                  size={16}
                />
                {labelEl}
                {active && allowed && expanded && <ActiveDot />}
                {tooltipEl}
              </Link>
            );
          }

          // ── Group with children ──
          return (
            <div key={navGroup.label}>
              <button
                onClick={() => {
                  if (!allowed) {
                    router.push("/login");
                    return;
                  }
                  if (!expanded) setExpanded(true);
                  else toggleGroup(navGroup.label);
                }}
                className={itemCls}
              >
                <NavIcon
                  icon={navGroup.icon}
                  label={navGroup.label}
                  size={16}
                />
                {labelEl}
                {expanded && allowed && (
                  <ChevronRight
                    size={13}
                    className={`shrink-0 transition-transform duration-200 text-slate-500 dark:text-slate-500 ${isOpen ? "rotate-90" : ""}`}
                  />
                )}
                {tooltipEl}
              </button>

              {/* Animated children drawer */}
              <div
                style={{
                  maxHeight:
                    expanded && isOpen
                      ? `${navGroup.children.length * 36 + 8}px`
                      : "0px",
                  opacity: expanded && isOpen ? 1 : 0,
                  transition:
                    "max-height 240ms cubic-bezier(0.4,0,0.2,1), opacity 180ms",
                  overflow: "hidden",
                }}
              >
                <div className="ml-3 pl-3 border-l border-slate-700/50 dark:border-slate-700/70 mt-0.5 mb-1 space-y-0.5">
                  {navGroup.children.map((child) => {
  const childActive =
    pathname === child.href ||
    pathname.startsWith(child.href + "/");

  const handleChildClick = (e) => {
    handleProtectedClick(e, navGroup.group);
    if (child.external) {
      e.preventDefault();
      window.location.href = child.href;
    }
  };

  return (
    <Link
      key={child.href}
      href={child.external ? "#" : child.href}
      onClick={handleChildClick}
      className={[
        "flex items-center gap-2 h-8 rounded-lg px-2 transition-all duration-150",
        childActive
          ? "bg-sky-500/20 dark:bg-sky-500/25 text-sky-300 dark:text-sky-300 font-extrabold"
          : "text-slate-400 dark:text-slate-400 hover:text-slate-100 dark:hover:text-slate-100 hover:bg-slate-800/60 dark:hover:bg-slate-800/50 font-bold",
      ].join(" ")}
    >
      <NavIcon
        icon={child.icon}
        label={child.label}
        size={13}
        className="opacity-90"
      />
      <span className="text-[11px] whitespace-nowrap">
        {child.label}
      </span>
      {childActive && <ActiveDot />}
    </Link>
  );
})}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Bottom: user info + logout ── */}
      <div className="shrink-0 border-t border-slate-800/60 dark:border-slate-800/80 px-1.5 py-2 space-y-1">
        {auth && (
          <div className="flex items-center gap-2 px-1 group relative">
            <div className="h-7 w-7 rounded-full bg-slate-800 dark:bg-slate-700 border border-slate-600 dark:border-slate-600 flex items-center justify-center text-slate-300 dark:text-slate-300 shrink-0">
              <User size={13} />
            </div>
            <div style={fadeSlide(expanded)} className="flex flex-col min-w-0">
              <span className="text-[10px] font-extrabold text-slate-100 dark:text-slate-100 truncate leading-tight">
                {userName || "User"}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                {roleLabel}
              </span>
            </div>

            {!expanded && (
              <div className="pointer-events-none absolute left-[52px] bottom-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                <div className="rounded-xl border border-white/10 dark:border-white/5 bg-slate-900/95 dark:bg-slate-900/95 shadow-xl overflow-hidden min-w-[160px]">
                  <div className="px-3 py-2 border-b border-white/10 dark:border-white/5">
                    <div className="text-[11px] font-extrabold text-white dark:text-white">
                      {userName || "User"}
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500">{roleLabel}</div>
                  </div>
                  <div className="px-3 py-1.5 space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-500 dark:text-slate-500">Factory</span>
                      <span className="text-slate-200 dark:text-slate-300 font-semibold">
                        {userFactory || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-500 dark:text-slate-500">Building</span>
                      <span className="text-slate-200 dark:text-slate-300 font-semibold">
                        {userBuilding || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {auth ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 h-8 rounded-xl px-2 border border-rose-500/30 dark:border-rose-500/30 bg-rose-500/10 dark:bg-rose-500/15 text-rose-400 dark:text-rose-400 hover:bg-rose-500/20 dark:hover:bg-rose-500/25 hover:text-rose-200 dark:hover:text-rose-300 transition-all"
          >
            <LogOut size={14} className="shrink-0" />
            <span style={fadeSlide(expanded)} className="text-[11px] font-bold">
              Logout
            </span>
          </button>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center gap-2.5 h-8 rounded-xl px-2 border border-sky-500/30 dark:border-sky-500/30 bg-sky-500/10 dark:bg-sky-500/15 text-sky-400 dark:text-sky-400 hover:bg-sky-500/20 dark:hover:bg-sky-500/25 hover:text-sky-200 dark:hover:text-sky-300 transition-all"
          >
            <LogIn size={14} className="shrink-0" />
            <span style={fadeSlide(expanded)} className="text-[11px] font-bold">
              Login
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}