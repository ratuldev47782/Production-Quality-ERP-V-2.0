// app/FloorDashBoardComponents/FloorDashBoardTvView.jsx
"use client";

import { useAuth } from "@/app/hooks/useAuth";
import {
  Activity,
  AlertTriangle,
  Gauge,
  TrendingDown,
  TrendingUp,
  Monitor,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  HEADER_REFRESH_MS,
  KpiPie,
  KpiTile,
  REFRESH_INTERVAL_TV_MS,
  VarianceBarChart,
  buildingOptions,
  clampPercent,
  factoryOptions,
  formatNumber,
  getDefaultFactoryBuilding,
  lineOptions,
  makeSegmentKey,
  makeStyleMediaKey,
  pickLatest,
  sortRowsByLineAndStyle,
  toNumber,
  todayKeyDhaka,
} from "./floorDashboardShared";

export default function FloorDashBoardTvView() {
  const { auth } = useAuth();
  const initRef = useRef(false);

  const [factory, setFactory] = useState("K-2");
  const [building, setBuilding] = useState("A-2");
  const [date, setDate] = useState(() => todayKeyDhaka());
  const [line, setLine] = useState("ALL");

  const [rows, setRows] = useState([]);
  const [headerMap, setHeaderMap] = useState({});
  const [styleMediaMap, setStyleMediaMap] = useState({});
  const [currentWip, setCurrentWip] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [refreshTick, setRefreshTick] = useState(0);
  const [headerTick, setHeaderTick] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    if (initRef.current) return;
    const { factory: f, building: b } = getDefaultFactoryBuilding(auth);
    setFactory(f || "K-2");
    setBuilding(b || "A-2");
    initRef.current = true;
  }, [auth]);

  const sortedRows = useMemo(() => sortRowsByLineAndStyle(rows), [rows]);

  useEffect(() => {
    const id = setInterval(
      () => setRefreshTick((p) => p + 1),
      REFRESH_INTERVAL_TV_MS,
    );
    const onFocus = () => setRefreshTick((p) => p + 1);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setHeaderTick((p) => p + 1),
      HEADER_REFRESH_MS,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!factory || !building || !date) return;
    const controller = new AbortController();
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({ factory, building, date });
        if (line && line !== "ALL") params.append("line", line);
        const res = await fetch(`/api/floor-dashboard?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.message || "Failed to load dashboard.");
        setRows(json.lines || []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Failed to load dashboard.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    return () => controller.abort();
  }, [factory, building, date, line, refreshTick]);

  useEffect(() => {
    if (!factory || !building || !date) return;
    let cancelled = false;
    const fetchHeaders = async () => {
      try {
        const params = new URLSearchParams({
          factory,
          assigned_building: building,
          date,
        });
        if (line && line !== "ALL") params.append("line", line);
        const res = await fetch(
          `/api/target-setter-header?${params.toString()}`,
          { cache: "no-store" },
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          if (!cancelled) setHeaderMap({});
          return;
        }
        const list = json.data || json.headers || json.items || [];
        const map = {};
        for (const h of list) {
          const segKey = makeSegmentKey(h.line, h.buyer, h.style);
          map[segKey] = map[segKey] ? pickLatest(map[segKey], h) : h;
        }
        if (!cancelled) setHeaderMap(map);
      } catch (e) {
        console.error(e);
        if (!cancelled) setHeaderMap({});
      }
    };
    fetchHeaders();
    return () => {
      cancelled = true;
    };
  }, [factory, building, date, line, headerTick]);

  useEffect(() => {
    if (!factory || !building || !date) return;
    let cancelled = false;
    const fetchMedia = async () => {
      try {
        const params = new URLSearchParams({
          factory,
          assigned_building: building,
          date,
        });
        const res = await fetch(`/api/style-media?${params.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          if (!cancelled) setStyleMediaMap({});
          return;
        }
        const list = json.data || [];
        const map = {};
        for (const doc of list) {
          const buyer = doc?.buyer || "";
          const style = doc?.style || "";
          const colorModel =
            doc?.color_model || doc?.colorModel || doc?.color || "";
          const k = makeStyleMediaKey(
            factory,
            building,
            buyer,
            style,
            colorModel,
          );
          if (!map[k]) map[k] = doc;
        }
        if (!cancelled) setStyleMediaMap(map);
      } catch (e) {
        console.error(e);
        if (!cancelled) setStyleMediaMap({});
      }
    };
    fetchMedia();
    return () => {
      cancelled = true;
    };
  }, [factory, building, date]);

  useEffect(
    () => setCurrentCardIndex(0),
    [sortedRows.length, factory, building, date, line],
  );

  useEffect(() => {
    if (sortedRows.length <= 1) return;
    const id = setInterval(() => {
      setCurrentCardIndex((prev) =>
        sortedRows.length === 0 ? 0 : (prev + 1) % sortedRows.length,
      );
    }, 10000);
    return () => clearInterval(id);
  }, [sortedRows.length]);

  const hasData = sortedRows.length > 0;
  const safeIndex =
    sortedRows.length > 0 ? currentCardIndex % sortedRows.length : 0;
  const currentRow = sortedRows[safeIndex];

  useEffect(() => {
    if (!factory || !building || !date || !currentRow) {
      setCurrentWip(null);
      return;
    }
    const segKey = makeSegmentKey(
      currentRow.line,
      currentRow.buyer,
      currentRow.style,
    );
    const header = headerMap[segKey];
    const buyer = header?.buyer || currentRow.buyer || "";
    const style = header?.style || currentRow.style || "";
    if (!currentRow.line || !buyer || !style) {
      setCurrentWip(null);
      return;
    }
    const controller = new AbortController();
    const fetchWip = async () => {
      try {
        const params = new URLSearchParams({
          factory,
          assigned_building: building,
          line: currentRow.line,
          buyer,
          style,
          date,
        });
        const res = await fetch(`/api/style-wip?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await res.json();
        if (res.ok && json.success) setCurrentWip(json.data || null);
        else setCurrentWip(null);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setCurrentWip(null);
      }
    };
    fetchWip();
    return () => controller.abort();
  }, [factory, building, date, currentRow, headerMap, refreshTick]);

  return (
    <div
      className="h-screen overflow-hidden
      bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900
      dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
      text-slate-50 dark:text-slate-50
      py-1 px-2"
    >
      <div className="max-w-[1700px] mx-auto flex flex-col gap-1.5 h-full">
        {/* Filter Panel */}
        <div
          className="card
          bg-base-300/10 dark:bg-base-300/10
          border border-slate-800/80 dark:border-slate-800/80
          shadow-[0_8px_28px_rgba(0,0,0,0.9)]"
        >
          <div className="card-body p-1.5 md:p-2 text-xs space-y-1.5">
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-0.5">
                <label
                  className="block text-[11px] font-semibold uppercase
                  text-amber-700 dark:text-amber-100"
                >
                  Factory
                </label>
                <select
                  className="select select-xs
                    bg-amber-100 text-slate-900
                    dark:bg-amber-300/95 dark:text-slate-900
                    select-bordered min-w-[120px]"
                  value={factory}
                  onChange={(e) => setFactory(e.target.value)}
                >
                  {factoryOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5">
                <label
                  className="block text-[11px] font-semibold uppercase
                  text-amber-700 dark:text-amber-100"
                >
                  Floor
                </label>
                <select
                  className="select select-xs
                    bg-amber-100 text-slate-900
                    dark:bg-amber-300/95 dark:text-slate-900
                    select-bordered min-w-[120px]"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                >
                  {buildingOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5">
                <label
                  className="block text-[11px] font-semibold uppercase
                  text-amber-700 dark:text-amber-100"
                >
                  Date
                </label>
                <input
                  type="date"
                  className="input input-xs input-bordered
                    bg-amber-100 text-slate-900
                    dark:bg-amber-300/95 dark:text-slate-900"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-0.5">
                <label
                  className="block text-[11px] font-semibold uppercase
                  text-amber-700 dark:text-amber-100"
                >
                  Line
                </label>
                <select
                  className="select select-xs
                    bg-amber-100 text-slate-900
                    dark:bg-amber-300/95 dark:text-slate-900
                    select-bordered min-w-[110px]"
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                >
                  {lineOptions.map((ln) => (
                    <option key={ln} value={ln}>
                      {ln}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href="/floor-dashboard"
                  className="
                                  group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                                  bg-cyan-600 border border-cyan-500 text-white
                                  hover:bg-cyan-500 hover:shadow-[0_0_16px_rgba(34,211,238,0.4)]
                                  dark:bg-cyan-600 dark:border-cyan-400 dark:text-slate-950
                                  dark:hover:bg-cyan-500 dark:hover:shadow-[0_0_16px_rgba(34,211,238,0.5)]
                                  transition-all duration-200 text-[11px] font-semibold uppercase tracking-wide
                                "
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>TV View</span>
                </Link>
                <Link
                  href="/floor-dashboard/full"
                  className="
                                  inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                                  bg-amber-100 border border-amber-300 text-amber-800
                                  hover:bg-amber-200 hover:border-amber-400
                                  dark:bg-slate-800/80 dark:border-slate-600 dark:text-slate-100
                                  dark:hover:bg-violet-600/90 dark:hover:border-violet-400 dark:hover:text-white
                                  transition-all duration-200 text-[11px] font-semibold uppercase tracking-wide
                                "
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Full View</span>
                </Link>
              </div>
              {loading && (
                <span
                  className="flex items-center gap-1 text-[10px]
                  text-zinc-500 dark:text-slate-400"
                >
                  <span className="loading loading-spinner loading-xs" /> Auto
                  updating...
                </span>
              )}
            </div>
            {error && (
              <div className="alert alert-error py-1 px-2 text-[11px]">
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {!hasData && !loading && !error && (
            <div
              className="w-full h-full rounded-3xl
              border-2 border-zinc-300/60 dark:border-slate-700/60
              bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50
              dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
              shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col
              min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]"
            >
              <div
                className="border-b
                border-zinc-200/70 dark:border-slate-800/70
                px-4 py-2 flex items-center justify-between"
              >
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Buyer",
                    "Style",
                    "Run Day",
                    "SMV",
                    "Man Power",
                    "Color/Model",
                    "Item",
                  ].map((lbl) => (
                    <span
                      key={lbl}
                      className="badge badge-lg
                        border-zinc-300/60 bg-zinc-100/40 text-zinc-400
                        dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-600"
                    >
                      {lbl}:&nbsp;
                      <span className="text-zinc-400 dark:text-slate-700">
                        —
                      </span>
                    </span>
                  ))}
                </div>
                <div className="text-right">
                  <div
                    className="text-[11px] uppercase tracking-wide
                    text-zinc-400 dark:text-slate-600"
                  >
                    Line
                  </div>
                  <div
                    className="text-3xl font-semibold
                    text-zinc-400 dark:text-slate-700"
                  >
                    —
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
                <div
                  className="w-12 h-12 rounded-2xl border-2 border-dashed
                  border-zinc-300 dark:border-slate-700
                  flex items-center justify-center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-zinc-400 dark:text-slate-600"
                  >
                    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                    <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <p
                  className="text-base font-black uppercase tracking-widest
                  text-zinc-400 dark:text-slate-500"
                >
                  No Data Entered
                </p>
                <p
                  className="text-[11px] text-center
                  text-zinc-400 dark:text-slate-600"
                >
                  No production data found for
                  <br />
                  <span
                    className="font-semibold
                    text-zinc-500 dark:text-slate-500"
                  >
                    {factory} · {building} · {date}
                  </span>
                </p>
              </div>
              <div
                className="border-t
                border-zinc-200/50 dark:border-slate-800/50
                px-4 py-1.5 flex items-center justify-center gap-1"
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full
                      bg-zinc-300 dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>
          )}
          {hasData && currentRow && (
            <div className="flex-1 min-h-0 flex flex-col space-y-1.5">
              <div className="flex-1 min-h-0">
                {(() => {
                  const segKey = makeSegmentKey(
                    currentRow.line,
                    currentRow.buyer,
                    currentRow.style,
                  );
                  const header = headerMap[segKey];
                  const buyerForMedia =
                    header?.buyer || currentRow?.buyer || "";
                  const styleForMedia =
                    header?.style || currentRow?.style || "";
                  const colorForMedia =
                    header?.color_model ||
                    header?.colorModel ||
                    header?.color ||
                    header?.color_model_name ||
                    currentRow?.colorModel ||
                    currentRow?.color ||
                    "";
                  const mediaKey = makeStyleMediaKey(
                    factory,
                    building,
                    buyerForMedia,
                    styleForMedia,
                    colorForMedia,
                  );
                  return (
                    <TvLineCard
                      lineData={currentRow}
                      header={header}
                      styleMedia={styleMediaMap[mediaKey]}
                      wipData={currentWip}
                      factory={factory}
                      building={building}
                      date={date}
                      refreshTick={refreshTick}
                    />
                  );
                })()}
              </div>

              {/* dots */}
              <div
                className="flex flex-col items-center gap-0.5 text-[9px]
                text-zinc-500 dark:text-slate-400 pb-0.5"
              >
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {sortedRows.map((row, idx) => {
                    const segKey = makeSegmentKey(
                      row.line,
                      row.buyer,
                      row.style,
                    );
                    return (
                      <button
                        key={`${segKey}__${idx}`}
                        type="button"
                        onClick={() => setCurrentCardIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === safeIndex
                            ? "w-5 bg-sky-400 dark:bg-sky-400"
                            : "w-1.5 bg-zinc-400 hover:bg-zinc-500 dark:bg-slate-600 dark:hover:bg-slate-400"
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="text-center">
                  Showing{" "}
                  <span className="mx-1 font-semibold text-sky-500 dark:text-sky-300">
                    {safeIndex + 1}
                  </span>{" "}
                  of{" "}
                  <span
                    className="mx-1 font-semibold
                    text-zinc-700 dark:text-slate-200"
                  >
                    {sortedRows.length}
                  </span>{" "}
                  segments • Auto slide every 10s
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TV CARD
══════════════════════════════════════════════════════════ */
function TvLineCard({
  lineData,
  header,
  styleMedia,
  wipData,
  factory,
  building,
  date,
  refreshTick,
}) {
  const { line, quality, production } = lineData || {};

  const buyer = header?.buyer || lineData?.buyer || "-";
  const style = header?.style || lineData?.style || "-";
  const item = header?.item || header?.style_item || header?.Item || "Item";
  const colorModel =
    header?.color_model ||
    header?.colorModel ||
    header?.color ||
    header?.color_model_name ||
    "-";
  const runDay = header?.run_day ?? header?.runDay ?? "-";
  const smv = header?.smv ?? "-";

  const imageSrc = styleMedia?.imageSrc || "";
  const videoSrc = styleMedia?.videoSrc || "";

  const targetQty = production?.targetQty ?? 0;
  const achievedQty = production?.achievedQty ?? 0;
  const rawPlan = targetQty > 0 ? (achievedQty / targetQty) * 100 : 0;
  const planPercent = clampPercent(rawPlan);
  const varianceQty = production?.varianceQty ?? 0;

  const prevWorkingDate = production?.prevWorkingDate || null;
  const prevWorkingAchievedQty = production?.prevWorkingAchievedQty ?? 0;

  const rft = clampPercent(quality?.rftPercent ?? 0);
  const dhu = clampPercent(quality?.dhuPercent ?? 0);
  const defectRate = clampPercent(quality?.defectRatePercent ?? 0);

  const hourlyEff = clampPercent(production?.currentHourEfficiency ?? 0);
  const avgEff = clampPercent(production?.avgEffPercent ?? 0);

  const qualityHourLabel = quality?.currentHour ?? "-";
  const prodHourLabel = production?.currentHour ?? "-";

  const manpowerPresent =
    production?.manpowerPresent ??
    header?.manpower_present ??
    header?.manpowerPresent ??
    0;

  const totalInput = wipData?.capacity ?? 0;
  const wip = wipData?.wip ?? 0;
  const totalAchieved = wipData?.totalAchieved ?? 0;

  const isBehind = varianceQty < 0;
  const headerId = header?._id || header?.id || "";

  const [varianceLoading, setVarianceLoading] = useState(false);
  const [varianceChartData, setVarianceChartData] = useState([]);
  const [topDefectsForLine, setTopDefectsForLine] = useState([]);
  const [defectsLoading, setDefectsLoading] = useState(false);

  const getHourNum = (rec) => {
    const h =
      rec?.hour ??
      rec?.hourIndex ??
      rec?.hour_no ??
      rec?.hourNo ??
      rec?.hourNumber ??
      rec?.index ??
      null;
    const hn = toNumber(h, null);
    return Number.isFinite(hn) ? hn : null;
  };

  const getVarianceNum = (rec) => {
    const v =
      rec?.varianceQty ??
      rec?.variance ??
      rec?.variance_qty ??
      rec?.varianceQuantity ??
      rec?.varianceThisHour ??
      rec?.variance_this_hour ??
      rec?.production?.varianceQty ??
      rec?.production?.variance ??
      0;
    return toNumber(v, 0);
  };

  const ordinal = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return "";
    const j = x % 10,
      k = x % 100;
    if (j === 1 && k !== 11) return `${x}st`;
    if (j === 2 && k !== 12) return `${x}nd`;
    if (j === 3 && k !== 13) return `${x}rd`;
    return `${x}th`;
  };

  useEffect(() => {
    if (!factory || !building || !line || !date) {
      setVarianceChartData([]);
      return;
    }
    const controller = new AbortController();
    const fetchVariance = async () => {
      try {
        setVarianceLoading(true);
        const params = new URLSearchParams();
        if (headerId) params.set("headerId", headerId);
        else {
          params.set("assigned_building", building);
          params.set("line", line);
          params.set("date", date);
          if (factory) params.set("factory", factory);
        }
        const res = await fetch(
          `/api/hourly-productions?${params.toString()}`,
          { cache: "no-store", signal: controller.signal },
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          setVarianceChartData([]);
          return;
        }
        const list = json.data || [];
        const normalized = list
          .map((rec) => {
            const hour = getHourNum(rec);
            const variance = Math.round(getVarianceNum(rec));
            return {
              hour,
              hourLabel: hour != null ? `${ordinal(hour)} Hour` : "-",
              varianceQty: variance,
            };
          })
          .filter((d) => d.hour != null)
          .sort((a, b) => a.hour - b.hour);
        setVarianceChartData(normalized);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setVarianceChartData([]);
      } finally {
        setVarianceLoading(false);
      }
    };
    fetchVariance();
    return () => controller.abort();
  }, [factory, building, line, date, headerId, refreshTick]);

  useEffect(() => {
    if (!factory || !building || !line || !date) {
      setTopDefectsForLine([]);
      return;
    }
    const controller = new AbortController();
    const fetchDefects = async () => {
      try {
        setDefectsLoading(true);
        const dateIso = new Date(date + "T00:00:00").toISOString();
        const params = new URLSearchParams({
          factory,
          building,
          date: dateIso,
          limit: "1000",
        });
        const res = await fetch(
          `/api/hourly-inspections?${params.toString()}`,
          { cache: "no-store", signal: controller.signal },
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          setTopDefectsForLine([]);
          return;
        }
        const rows = (json.data || []).filter((r) => r.line === line);
        const defectMap = {};
        rows.forEach((row) => {
          if (!Array.isArray(row.selectedDefects)) return;
          row.selectedDefects.forEach((d) => {
            if (!d?.name) return;
            const qty = Number(d.quantity || 0);
            defectMap[d.name] = (defectMap[d.name] || 0) + qty;
          });
        });
        const top3 = Object.entries(defectMap)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 3);
        setTopDefectsForLine(top3);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setTopDefectsForLine([]);
      } finally {
        setDefectsLoading(false);
      }
    };
    fetchDefects();
    return () => controller.abort();
  }, [factory, building, line, date, refreshTick]);

  const planColor =
    planPercent >= 90 ? "#34d399" : planPercent >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div
      className={`relative w-full h-full rounded-2xl border-2
        shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden
        bg-gradient-to-br from-zinc-100 via-zinc-50 to-white
        dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
        ${
          isBehind
            ? "border-rose-400/70 dark:border-rose-500/70"
            : "border-emerald-400/70 dark:border-emerald-500/70"
        }`}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10
        bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(45,212,191,0.08),transparent),radial-gradient(1000px_500px_at_100%_0%,rgba(56,189,248,0.08),transparent)]
        dark:bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(45,212,191,0.25),transparent),radial-gradient(1000px_500px_at_100%_0%,rgba(56,189,248,0.25),transparent)]"
      />
      <div className="relative flex flex-col gap-2 p-2.5 md:p-3 text-xs md:text-sm h-full">
        {/* TOP meta row */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5
          border-b border-zinc-200/70 dark:border-slate-800/70 pb-1.5"
        >
          <div className="flex flex-wrap gap-1">
            <span
              className="badge
              border-zinc-300 bg-zinc-100/80 text-amber-700
              dark:border-slate-600 dark:bg-slate-900/80 dark:text-amber-100"
            >
              Buyer:&nbsp;
              <span className="font-semibold text-amber-600 dark:text-amber-300">
                {buyer}
              </span>
            </span>
            <span
              className="badge
              border-fuchsia-400/70 bg-fuchsia-50 text-fuchsia-700
              dark:border-fuchsia-500/70 dark:bg-fuchsia-500/10 dark:text-fuchsia-100"
            >
              Style:&nbsp;
              <span className="font-semibold text-fuchsia-600 dark:text-fuchsia-300">
                {style}
              </span>
            </span>
            <span
              className="badge
              border-emerald-400/70 bg-emerald-50 text-emerald-700
              dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:text-emerald-100"
            >
              Run Day:&nbsp;
              <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                {runDay}
              </span>
            </span>
            <span
              className="badge
              border-emerald-400/70 bg-emerald-50 text-emerald-700
              dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:text-emerald-100"
            >
              SMV:&nbsp;
              <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                {smv}
              </span>
            </span>
            <span
              className="badge
              border-emerald-400/70 bg-emerald-50 text-emerald-700
              dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:text-emerald-100"
            >
              Man Power:&nbsp;
              <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                {manpowerPresent}
              </span>
            </span>
            <span
              className="badge
              border-fuchsia-300/70 bg-fuchsia-50 text-fuchsia-600/70
              dark:border-fuchsia-300/70 dark:bg-emerald-500/10 dark:text-fuchsia-500/70"
            >
              Color/Model:&nbsp;
              <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                {colorModel}
              </span>
            </span>
            <span
              className="badge
              border-emerald-400/70 bg-emerald-50 text-emerald-700
              dark:border-emerald-500/70 dark:bg-emerald-500/10 dark:text-emerald-100"
            >
              Item:&nbsp;
              <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                {item}
              </span>
            </span>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-[10px] uppercase tracking-wide
              text-zinc-500 dark:text-slate-400"
            >
              Line
            </div>
            <div
              className="text-2xl md:text-3xl font-semibold
              text-cyan-500 dark:text-cyan-300
              drop-shadow-[0_0_24px_rgba(34,211,238,0.9)]"
            >
              {line}
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="grid flex-1 min-h-0 gap-2 md:grid-cols-2 lg:grid-cols-12">
          {/* IMAGE */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col min-h-0">
            <div
              className="flex-1 min-h-[130px] lg:min-h-0 rounded-xl
              border border-cyan-400/70 dark:border-cyan-500/70
              bg-white/95 dark:bg-slate-950/95
              overflow-hidden flex flex-col"
            >
              <div
                className="px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]
                text-cyan-600 dark:text-cyan-200
                bg-gradient-to-r from-cyan-100/80 to-transparent dark:from-cyan-500/25 dark:to-transparent
                border-b border-cyan-300/40 dark:border-cyan-500/40
                flex items-center justify-between"
              >
                <span>STYLE IMAGE</span>
                <span className="text-[10px] text-cyan-500/70 dark:text-cyan-200/70">
                  View
                </span>
              </div>
              <div className="relative flex-1 bg-zinc-100/90 dark:bg-black/90">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={`${line} image`}
                    className="absolute inset-0 m-auto max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-zinc-400 dark:text-slate-500">
                      No image attached
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VIDEO */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col min-h-0">
            <div
              className="flex-1 min-h-[130px] lg:min-h-0 rounded-xl
              border border-emerald-400/70 dark:border-emerald-500/70
              bg-white/95 dark:bg-slate-950/95
              overflow-hidden flex flex-col"
            >
              <div
                className="px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]
                text-emerald-600 dark:text-emerald-200
                bg-gradient-to-r from-emerald-100/80 to-transparent dark:from-emerald-500/25 dark:to-transparent
                border-b border-emerald-300/40 dark:border-emerald-500/40
                flex items-center justify-between"
              >
                <span>LIVE VIDEO</span>
                <span className="text-[10px] text-emerald-500/70 dark:text-emerald-200/70">
                  Auto Play
                </span>
              </div>
              <div className="relative flex-1 bg-zinc-100/90 dark:bg-black/90">
                {videoSrc ? (
                  <video
                    src={videoSrc}
                    className="absolute inset-0 m-auto max-w-full max-h-full object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-zinc-400 dark:text-slate-500">
                      No video attached
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STATS + VARIANCE + TOP 3 DEFECTS */}
          <div className="md:col-span-2 lg:col-span-6 flex flex-col gap-2 min-h-0">
            {/* Plan vs Achieved */}
            <div
              className="rounded-xl
              border border-sky-400/60 dark:border-sky-700/60 
              bg-gradient-to-br from-sky-50/60 via-white to-zinc-50/95
              dark:bg-gradient-to-br dark:from-sky-950/60 dark:via-slate-950 dark:to-slate-900/95
              p-2.5 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-0.5 rounded-full bg-sky-400" />
                  <span
                    className="text-[10px] font-black uppercase tracking-widest
                    text-sky-600 dark:text-sky-300"
                  >
                    Plan vs Achieved
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-1.5 w-14 rounded-full
                    bg-zinc-200 dark:bg-slate-800    overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${planPercent}%`,
                        background: planColor,
                      }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-black tabular-nums"
                    style={{ color: planColor }}
                  >
                    {formatNumber(planPercent, 1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="shrink-0">
                  <KpiPie
                    value={planPercent}
                    label=""
                    color="#22d3ee"
                    size={84}
                    animate={false}
                  />
                </div>
                <div className="flex-1 grid grid-cols-3 gap-1.5 min-w-0">
                  <KpiTile
                    label="TARGET"
                    value={formatNumber(targetQty, 0)}
                    tone="sky"
                    icon={Gauge}
                  />
                  <KpiTile
                    label="ACHIEVED"
                    value={formatNumber(achievedQty, 0)}
                    tone="emerald"
                    icon={TrendingUp}
                  />
                  <KpiTile
                    label="VARIANCE"
                    value={formatNumber(varianceQty, 0)}
                    tone={varianceQty >= 0 ? "emerald" : "red"}
                    icon={varianceQty >= 0 ? TrendingUp : TrendingDown}
                  />
                  <KpiTile
                    label="TOTAL INPUT"
                    value={formatNumber(totalInput || 0, 0)}
                    tone="sky"
                    icon={Activity}
                  />
                  <KpiTile
                    label="WIP"
                    value={formatNumber(wip || 0, 0)}
                    tone="purple"
                    icon={Activity}
                  />
                  <KpiTile
                    label="UPTO DATE"
                    value={formatNumber(totalAchieved || 0, 0)}
                    tone="amber"
                    icon={TrendingUp}
                  />
                </div>
              </div>

              <div
                className="flex items-center justify-between rounded-lg
                border border-zinc-200/50 dark:border-slate-700/50
                bg-zinc-100/30 dark:bg-slate-800/30
                px-2.5 py-1"
              >
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-slate-500" />
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest
                    text-zinc-500 dark:text-slate-400"
                  >
                    Last Day
                    {prevWorkingDate && (
                      <span
                        className="ml-1 normal-case tracking-normal font-normal
                        text-zinc-400 dark:text-slate-500"
                      >
                        ({prevWorkingDate})
                      </span>
                    )}
                  </span>
                </div>
                <span
                  className="text-sm font-black tabular-nums
                  text-zinc-800 dark:text-slate-200"
                >
                  {formatNumber(prevWorkingAchievedQty || 0, 0)}
                </span>
              </div>
            </div>

            {/* Production & Quality */}
            <div
              className="rounded-xl
              border border-amber-500 dark:border-amber-600
              bg-gradient-to-br from-amber-50/40 via-white to-zinc-50/95
              dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/95
              p-2.5 flex flex-col gap-1.5 min-h-0"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className="uppercase tracking-wide
                  text-amber-600 dark:text-amber-200"
                >
                  Production & Quality
                </span>
                <div className="flex flex-wrap gap-1">
                  <span
                    className="badge
                    border-emerald-400/60 bg-emerald-50 text-emerald-700
                    dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-100
                    text-[10px]"
                  >
                    Q Hour:{" "}
                    <span className="font-semibold">{qualityHourLabel}</span>
                  </span>
                  <span
                    className="badge
                    border-sky-400/60 bg-sky-50 text-sky-700
                    dark:border-sky-500/60 dark:bg-sky-500/10 dark:text-sky-100
                    text-[10px]"
                  >
                    P Hour:{" "}
                    <span className="font-semibold">{prodHourLabel}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                <KpiTile
                  label="RFT%"
                  value={`${formatNumber(rft, 1)}%`}
                  tone="emerald"
                  icon={Gauge}
                />
                <KpiTile
                  label="DEFECT RATE%"
                  value={`${formatNumber(defectRate, 1)}%`}
                  tone="red"
                  icon={AlertTriangle}
                />
                <KpiTile
                  label="DHU%"
                  value={`${formatNumber(dhu, 1)}%`}
                  tone="amber"
                  icon={Activity}
                />
                <KpiTile
                  label="HOURLY EFF%"
                  value={`${formatNumber(hourlyEff, 1)}%`}
                  tone="sky"
                  icon={Gauge}
                />
                <KpiTile
                  label="AVG EFF%"
                  value={`${formatNumber(avgEff, 1)}%`}
                  tone="purple"
                  icon={TrendingUp}
                />
              </div>

              <div className="min-h-0">
                <div
                  className="flex items-center justify-between text-[10px]
                  text-zinc-700 dark:text-slate-200 mb-1"
                >
                  <span
                    className="uppercase tracking-wide
                    text-amber-600 dark:text-amber-200"
                  >
                    Hourly Variance
                  </span>
                  {varianceLoading ? (
                    <span
                      className="flex items-center gap-1 text-[10px]
                      text-zinc-400 dark:text-slate-400"
                    >
                      <span className="loading loading-spinner loading-xs" />{" "}
                      Loading...
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 dark:text-slate-400">
                      Green = ahead · Red = behind
                    </span>
                  )}
                </div>

                <div className="flex gap-2 h-20 sm:h-24 md:h-28">
                  <div className="flex-1 min-w-0">
                    <VarianceBarChart data={varianceChartData} />
                  </div>

                  {/* Top 3 Defects */}
                  <div
                    className="w-[145px] sm:w-[160px] shrink-0 rounded-xl
                    border border-rose-400/50 dark:border-rose-500/50
                    bg-rose-50/60 dark:bg-rose-950/60
                    flex flex-col overflow-hidden"
                  >
                    <div
                      className="px-2 py-0.5 flex items-center justify-between
                      border-b border-rose-300/30 dark:border-rose-500/30
                      bg-rose-100/40 dark:bg-rose-500/15"
                    >
                      <span
                        className="text-[9px] uppercase tracking-widest font-bold
                        text-rose-600 dark:text-rose-300"
                      >
                        Top 3 Defects
                      </span>
                      {defectsLoading && (
                        <span className="loading loading-spinner loading-[10px] text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-around px-2 py-1 gap-0.5">
                      {topDefectsForLine.length === 0 ? (
                        <div
                          className="flex items-center justify-center h-full text-[10px]
                          text-zinc-400 dark:text-slate-500 text-center"
                        >
                          {defectsLoading ? "Loading…" : "No defects recorded"}
                        </div>
                      ) : (
                        topDefectsForLine.map((d, idx) => {
                          const palette = [
                            {
                              bar: "bg-rose-400",
                              text: "text-rose-600 dark:text-rose-200",
                              badge:
                                "bg-rose-100 border-rose-300 dark:bg-rose-500/25 dark:border-rose-400/50",
                              glow: "shadow-[0_0_6px_rgba(251,113,133,0.5)]",
                            },
                            {
                              bar: "bg-amber-400",
                              text: "text-amber-600 dark:text-amber-200",
                              badge:
                                "bg-amber-100 border-amber-300 dark:bg-amber-500/25 dark:border-amber-400/50",
                              glow: "shadow-[0_0_6px_rgba(251,191,36,0.4)]",
                            },
                            {
                              bar: "bg-orange-400",
                              text: "text-orange-600 dark:text-orange-200",
                              badge:
                                "bg-orange-100 border-orange-300 dark:bg-orange-500/25 dark:border-orange-400/50",
                              glow: "shadow-[0_0_6px_rgba(251,146,60,0.4)]",
                            },
                          ];
                          const c = palette[idx] || palette[2];
                          const max = topDefectsForLine[0]?.qty || 1;
                          const pct = Math.round((d.qty / max) * 100);
                          const rankLabels = ["1st", "2nd", "3rd"];
                          return (
                            <div key={d.name} className="flex flex-col gap-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span
                                    className={`text-[8px] font-black uppercase ${c.text} shrink-0`}
                                  >
                                    {rankLabels[idx]}
                                  </span>
                                  <span
                                    className={`text-[9px] font-semibold ${c.text} truncate`}
                                    title={d.name}
                                  >
                                    {d.name}
                                  </span>
                                </div>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${c.badge} ${c.text} ${c.glow} shrink-0`}
                                >
                                  {d.qty}
                                </span>
                              </div>
                              <div
                                className="h-1 w-full rounded-full
                                bg-zinc-200/80 dark:bg-slate-800/80 overflow-hidden"
                              >
                                <div
                                  className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
