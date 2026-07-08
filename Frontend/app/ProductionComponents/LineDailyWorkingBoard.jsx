// app/ProductionComponents/LineDailyWorkingBoard.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const ALL_ACCESS_ROLES = ["Management", "Developer", "Others"];

function isPrivileged(auth) {
  const role = auth?.user?.role || auth?.role || "";
  return ALL_ACCESS_ROLES.includes(role);
}

const lineOptions = [
  "Line-1",
  "Line-2",
  "Line-3",
  "Line-4",
  "Line-5",
  "Line-6",
  "Line-7",
  "Line-8",
  "Line-9",
  "Line-10",
  "Line-11",
  "Line-12",
  "Line-13",
  "Line-14",
  "Line-15",
  "Line-16",
  "Line-17",
  "Line-18",
  "Line-19",
];

const buildingOptions = [
  "A-2",
  "B-2",
  "A-3",
  "B-3",
  "A-4",
  "B-4",
  "A-5",
  "B-5",
  "A-6",
  "B-6",
];
const factoryOptions = ["K-1", "K-2", "K-3", "Others"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(value, digits = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num.toFixed(digits);
}

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// ── Click-based dropdown ───────────────────────────────────────────────────
function ClickDropdown({
  label,
  value,
  placeholder,
  children,
  triggerClassName,
  style,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div
        className={triggerClassName}
        style={style}
        onClick={() => setOpen((o) => !o)}
      >
        {children.trigger}
        <svg
          className={`w-3 h-3 text-slate-700 dark:text-slate-300 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-0.5 rounded-lg border border-amber-400 dark:border-amber-600 bg-white dark:bg-slate-800 shadow-lg">
          {children.panel({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HourlyProductionBoard({
  selectedLine: propLine,
  setSelectedLine: propSetLine,
  selectedDate: propDate,
  setSelectedDate: propSetDate,
}) {
  const { auth, loading: authLoading } = useAuth();

  const [internalLine, setInternalLine] = useState("");
  const [internalDate, setInternalDate] = useState(todayIso());

  const selectedLine = propLine !== undefined ? propLine : internalLine;
  const selectedDate = propDate !== undefined ? propDate : internalDate;
  const setSelectedLine = propSetLine ?? setInternalLine;
  const setSelectedDate = propSetDate ?? setInternalDate;

  const [overrideBuilding, setOverrideBuilding] = useState("");
  const [overrideFactory, setOverrideFactory] = useState("");

  const [headers, setHeaders] = useState([]);
  const [loadingHeaders, setLoadingHeaders] = useState(false);
  const [error, setError] = useState("");

  const privileged = isPrivileged(auth);

  const assignedBuilding =
    auth?.assigned_building || auth?.user?.assigned_building || "";
  const assignedFactory =
    auth?.factory ||
    auth?.assigned_factory ||
    auth?.user?.factory ||
    auth?.user?.assigned_factory ||
    "";

  const effectiveBuilding = privileged
    ? overrideBuilding || assignedBuilding
    : assignedBuilding;
  const effectiveFactory = privileged
    ? overrideFactory || assignedFactory
    : assignedFactory;

  useEffect(() => {
    if (!authLoading && auth && privileged) {
      if (!overrideBuilding && assignedBuilding)
        setOverrideBuilding(assignedBuilding);
      if (!overrideFactory && assignedFactory)
        setOverrideFactory(assignedFactory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, auth]);

  useEffect(() => {
    if (authLoading) return;
    if (!effectiveBuilding || !selectedLine || !selectedDate) {
      setHeaders([]);
      return;
    }

    const controller = new AbortController();
    const fetchHeaders = async () => {
      try {
        setLoadingHeaders(true);
        setError("");
        const params = new URLSearchParams({
          assigned_building: effectiveBuilding,
          line: selectedLine,
          date: selectedDate,
        });
        if (effectiveFactory) params.set("factory", effectiveFactory);
        const res = await fetch(
          `/api/target-setter-header?${params.toString()}`,
          { cache: "no-store", signal: controller.signal },
        );
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.message || "Failed to load target headers");
        setHeaders(json.data || []);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load target headers");
        setHeaders([]);
      } finally {
        setLoadingHeaders(false);
      }
    };
    fetchHeaders();
    return () => controller.abort();
  }, [
    authLoading,
    effectiveBuilding,
    selectedLine,
    selectedDate,
    effectiveFactory,
  ]);

  if (authLoading) {
    return (
      <div className="card bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-700 shadow-sm">
        <div className="card-body py-2 px-3 text-xs text-slate-700 dark:text-white">
          Loading user...
        </div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 shadow-sm">
        <div className="card-body py-2 px-3 text-xs text-slate-700 dark:text-yellow-200">
          No user logged in. Please sign in to see hourly production.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Filter panel ── */}
      <div className="card bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-700 shadow-sm">
        <div className="card-body p-3">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
            {/* Factory */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                Factory
              </span>
              {privileged ? (
                <select
                  className="select select-xs border border-amber-500 bg-slate-100 dark:bg-slate-700 dark:text-white dark:border-amber-600 text-[11px] font-semibold text-slate-900"
                  style={{ minWidth: 80, height: 28 }}
                  value={overrideFactory}
                  onChange={(e) => {
                    setOverrideFactory(e.target.value);
                    setHeaders([]);
                  }}
                >
                  <option value="">— Any —</option>
                  {factoryOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 border border-amber-500 dark:border-amber-600 rounded px-2 text-[11px] font-semibold text-slate-900 dark:text-white"
                  style={{ height: 28 }}
                >
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                    Assigned:
                  </span>
                  <span>{effectiveFactory || "Not set"}</span>
                </div>
              )}
            </div>

            <div className="w-px bg-slate-200 dark:bg-slate-600 self-stretch mt-4" />

            {/* Building */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                Building
              </span>
              {privileged ? (
                <select
                  className="select select-xs border border-amber-500 bg-slate-100 dark:bg-slate-700 dark:text-white dark:border-amber-600 text-[11px] font-semibold text-slate-900"
                  style={{ minWidth: 80, height: 28 }}
                  value={overrideBuilding}
                  onChange={(e) => {
                    setOverrideBuilding(e.target.value);
                    setHeaders([]);
                  }}
                >
                  <option value="">— Any —</option>
                  {buildingOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 border border-amber-500 dark:border-amber-600 rounded px-2 text-[11px] font-semibold text-slate-900 dark:text-white"
                  style={{ height: 28 }}
                >
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                    Assigned:
                  </span>
                  <span>{effectiveBuilding || "Not assigned"}</span>
                </div>
              )}
            </div>

            <div className="w-px bg-slate-200 dark:bg-slate-600 self-stretch mt-4" />

            {/* Line */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                Line
              </span>
              <ClickDropdown
                triggerClassName="flex items-center gap-1.5 cursor-pointer rounded border border-amber-500 dark:border-amber-600 bg-slate-400 dark:bg-slate-600 px-2 text-[11px] font-semibold text-black dark:text-white select-none"
                style={{ height: 28, minWidth: 110 }}
              >
                {{
                  trigger: (
                    <span className="flex-1 truncate">
                      {selectedLine || "Select line"}
                    </span>
                  ),
                  panel: ({ close }) => (
                    <div className="w-36 max-h-56 overflow-y-auto">
                      <div
                        className="px-3 py-1.5 text-[11px] text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                        onClick={() => {
                          setSelectedLine("");
                          close();
                        }}
                      >
                        — clear —
                      </div>
                      {lineOptions.map((line) => (
                        <div
                          key={line}
                          onClick={() => {
                            setSelectedLine(line);
                            close();
                          }}
                          className={`px-3 py-1.5 text-[11px] font-medium cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-900 dark:hover:text-amber-300 ${
                            selectedLine === line
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-semibold"
                              : "text-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  ),
                }}
              </ClickDropdown>
            </div>

            <div className="w-px bg-slate-200 dark:bg-slate-600 self-stretch mt-4" />

            {/* Date */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                Date
              </span>
              <ClickDropdown
                triggerClassName="flex items-center gap-1.5 cursor-pointer rounded border border-amber-500 dark:border-amber-600 bg-amber-300 dark:bg-amber-800 px-2 text-[11px] font-semibold text-black dark:text-white select-none"
                style={{ height: 28, minWidth: 110 }}
              >
                {{
                  trigger: (
                    <>
                      <svg
                        className="w-3 h-3 text-slate-700 dark:text-slate-300 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="flex-1 truncate">
                        {selectedDate || "Pick date"}
                      </span>
                    </>
                  ),
                  panel: () => (
                    <div className="p-2">
                      <input
                        type="date"
                        className="input input-xs input-bordered bg-amber-50 dark:bg-slate-700 dark:text-white dark:border-amber-600 font-semibold text-xs text-black border-amber-400"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  ),
                }}
              </ClickDropdown>
            </div>

            {/* Synced badge */}
            {propLine !== undefined && (
              <div
                className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-400 dark:border-emerald-600 rounded px-2 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300"
                style={{ height: 28 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0" />
                Synced with Target Setter
              </div>
            )}

            {/* Privileged badge */}
            {privileged && (
              <div
                className="flex items-center gap-1 bg-violet-100 dark:bg-violet-900/30 border border-violet-400 dark:border-violet-600 rounded px-2 text-[10px] font-semibold text-violet-800 dark:text-violet-300"
                style={{ height: 28 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block shrink-0" />
                {auth?.user?.role || auth?.role} — All Access
              </div>
            )}
          </div>

          {error && (
            <div className="mt-2 alert alert-error py-1 px-2 text-[11px]">
              <span>{error}</span>
            </div>
          )}
          {selectedLine && !loadingHeaders && headers.length === 0 && (
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              No target headers for{" "}
              <span className="font-semibold">{effectiveFactory || "?"}</span> •{" "}
              <span className="font-semibold">{effectiveBuilding}</span> •{" "}
              <span className="font-semibold">{selectedLine}</span> •{" "}
              <span className="font-semibold">{selectedDate}</span>
            </p>
          )}
          {loadingHeaders && (
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="loading loading-spinner loading-xs" />
              Loading target headers...
            </p>
          )}
        </div>
      </div>

      {headers.map((header) => (
        <HourlyHeaderCard
          key={header._id}
          header={header}
          auth={auth}
          privileged={privileged}
        />
      ))}

      {headers.length === 0 && !loadingHeaders && !error && selectedLine && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          When you create target headers for this factory, line &amp; date, they
          will show here with hourly input cards.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function HourlyHeaderCard({ header, auth, privileged }) {
  const [selectedHour, setSelectedHour] = useState(1);
  const [achievedInput, setAchievedInput] = useState("");
  const [hourlyRecords, setHourlyRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [totalInput, setTotalInput] = useState("");
  const [totalInputSaving, setTotalInputSaving] = useState(false);
  const [totalInputLoading, setTotalInputLoading] = useState(false);
  const [wipInfo, setWipInfo] = useState(null);
  const [wipLoading, setWipLoading] = useState(false);

  const [dayInput, setDayInput] = useState("");
  const [dayInputSaving, setDayInputSaving] = useState(false);

  const [cycleStartDate, setCycleStartDate] = useState(null);

  const productionUserId =
    auth?.user?.id || auth?.user?._id || auth?.id || auth?._id || "";
  const factory =
    header?.factory ||
    auth?.factory ||
    auth?.assigned_factory ||
    auth?.user?.factory ||
    auth?.user?.assigned_factory ||
    "";

  const buildWipParams = () =>
    new URLSearchParams({
      factory,
      assigned_building: header.assigned_building,
      line: header.line,
      buyer: header.buyer,
      style: header.style,
      date: header.date,
    });

  const refreshWip = async () => {
    if (!header || !factory) return;
    setWipLoading(true);
    try {
      const res = await fetch(`/api/style-wip?${buildWipParams().toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setWipInfo(json.data);
        setCycleStartDate(json.data?.cycleStartDate || null);
      } else {
        setWipInfo(null);
        setCycleStartDate(null);
      }
    } catch (err) {
      console.error("refreshWip error:", err);
      setWipInfo(null);
      setCycleStartDate(null);
    } finally {
      setWipLoading(false);
    }
  };

  useEffect(() => {
    setSelectedHour(1);
    setAchievedInput("");
    setHourlyRecords([]);
    setEditingRecordId(null);
    setError("");
    setMessage("");
    setTotalInput("");
    setWipInfo(null);
    setCycleStartDate(null);
    setDayInput("");
  }, [header?._id]);

  const buildRecordParams = () => {
    const p = new URLSearchParams({ headerId: header._id });
    if (!privileged && productionUserId)
      p.set("productionUserId", productionUserId);
    return p;
  };

  useEffect(() => {
    if (!header?._id) return;
    if (!privileged && !productionUserId) return;
    const controller = new AbortController();
    const fetchRecords = async () => {
      try {
        setLoadingRecords(true);
        setError("");
        setMessage("");
        const res = await fetch(
          `/api/hourly-productions?${buildRecordParams().toString()}`,
          { cache: "no-store", signal: controller.signal },
        );
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.message || "Failed to load hourly records");
        setHourlyRecords(json.data || []);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load hourly records");
        setHourlyRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchRecords();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header?._id, productionUserId, privileged]);

  useEffect(() => {
    if (!header) return;
    const controller = new AbortController();
    const fetchCapacityAndWip = async () => {
      try {
        setTotalInputLoading(true);
        setWipLoading(true);
        let detectedCycleStartDate = null;
        try {
          if (factory) {
            const resWip = await fetch(
              `/api/style-wip?${buildWipParams().toString()}`,
              { cache: "no-store", signal: controller.signal },
            );
            if (resWip.ok) {
              const jsonWip = await resWip.json();
              if (jsonWip.success) {
                setWipInfo(jsonWip.data);
                detectedCycleStartDate = jsonWip.data?.cycleStartDate || null;
                setCycleStartDate(detectedCycleStartDate);
              }
            }
          }
        } catch (err) {
          if (err.name !== "AbortError") console.error(err);
        }
        try {
          const baseParams = new URLSearchParams({
            assigned_building: header.assigned_building,
            line: header.line,
            buyer: header.buyer,
            style: header.style,
          });
          if (factory) baseParams.set("factory", factory);
          if (detectedCycleStartDate)
            baseParams.set("cycleStartDate", detectedCycleStartDate);
          const resCap = await fetch(
            `/api/style-capacities?${baseParams.toString()}`,
            { cache: "no-store", signal: controller.signal },
          );
          if (resCap.ok) {
            const jsonCap = await resCap.json();
            if (jsonCap.success) {
              const doc = jsonCap.data?.[0] || null;
              setTotalInput(doc?.capacity != null ? String(doc.capacity) : "");
            }
          }
        } catch (err) {
          if (err.name !== "AbortError") console.error(err);
        }
      } finally {
        setTotalInputLoading(false);
        setWipLoading(false);
      }
    };
    fetchCapacityAndWip();
    return () => controller.abort();
  }, [
    header?.assigned_building,
    header?.line,
    header?.buyer,
    header?.style,
    header?.date,
    header,
    factory,
  ]);

  if (!header) return null;

  const totalWorkingHours = header.working_hour ?? 1;
  const manpowerPresent = header.manpower_present ?? 0;
  const smv = header.smv ?? 1;
  const planEfficiencyPercent = header.plan_efficiency_percent ?? 0;
  const planEffDecimal = planEfficiencyPercent / 100;
  const targetFullDay = header.target_full_day ?? 0;
  const capacityFromHeader = header.capacity ?? 0;
  const plan_quantity = header.plan_quantity ?? 0;

  const hoursOptions = Array.from(
    { length: Math.max(1, totalWorkingHours) },
    (_, i) => i + 1,
  );

  const targetFromCapacity =
    manpowerPresent > 0 && smv > 0
      ? (manpowerPresent * 60 * planEffDecimal) / smv
      : 0;
  const targetFromFullDay =
    totalWorkingHours > 0 ? targetFullDay / totalWorkingHours : 0;
  const baseTargetPerHour = Math.round(
    targetFromCapacity || targetFromFullDay || 0,
  );

  const achievedThisHour = Math.round(Number(achievedInput) || 0);
  const selectedHourInt = Number(selectedHour) || 1;
  const hourlyEfficiency =
    manpowerPresent > 0 && smv > 0
      ? (achievedThisHour * smv * 100) / (manpowerPresent * 60)
      : 0;

  const recordsSorted = hourlyRecords
    .map((rec) => ({ ...rec, _hourNum: Number(rec.hour) }))
    .filter((rec) => Number.isFinite(rec._hourNum))
    .sort((a, b) => a._hourNum - b._hourNum);

  let runningAchieved = 0;
  const recordsDecorated = recordsSorted.map((rec) => {
    const hourN = rec._hourNum;
    const baselineToDatePrev = baseTargetPerHour * (hourN - 1);
    const cumulativeShortfallVsBasePrev = Math.max(
      0,
      baselineToDatePrev - runningAchieved,
    );
    const dynTarget = baseTargetPerHour + cumulativeShortfallVsBasePrev;
    const achievedRounded = Math.round(toNum(rec.achievedQty, 0));
    const perHourVarDynamic = achievedRounded - dynTarget;
    runningAchieved += achievedRounded;
    const netVarVsBaseToDate = runningAchieved - baseTargetPerHour * hourN;
    return {
      ...rec,
      _hourNum: hourN,
      _dynTargetRounded: Math.round(dynTarget),
      _achievedRounded: achievedRounded,
      _perHourVarDynamic: perHourVarDynamic,
      _netVarVsBaseToDate: netVarVsBaseToDate,
    };
  });

  const hasRecords = recordsDecorated.length > 0;
  const totalAchievedAll = hasRecords
    ? recordsDecorated.reduce((s, r) => s + (r._achievedRounded ?? 0), 0)
    : 0;
  const lastRecord = hasRecords
    ? recordsDecorated[recordsDecorated.length - 1]
    : null;
  const latestRecord = lastRecord;
  const totalNetVarVsBaseToDate = lastRecord?._netVarVsBaseToDate ?? 0;
  const totalAvgEffPercent = hasRecords
    ? toNum(lastRecord?.totalEfficiency, 0)
    : 0;

  const previousDecorated = recordsDecorated.filter(
    (r) => r._hourNum < selectedHourInt,
  );
  const achievedToDatePrev = previousDecorated.reduce(
    (s, r) => s + (r._achievedRounded ?? 0),
    0,
  );
  const baselineToDatePrevForSelected =
    baseTargetPerHour * (selectedHourInt - 1);
  const cumulativeShortfallVsBasePrevForSelected = Math.max(
    0,
    baselineToDatePrevForSelected - achievedToDatePrev,
  );
  const dynamicTargetThisHour = Math.round(
    baseTargetPerHour + cumulativeShortfallVsBasePrevForSelected,
  );

  const achievedToDatePosted = recordsDecorated
    .filter((r) => r._hourNum <= selectedHourInt)
    .reduce((s, r) => s + (r._achievedRounded ?? 0), 0);
  const netVarVsBaseToDateSelected =
    achievedToDatePosted - baseTargetPerHour * selectedHourInt;

  const previousRecord =
    previousDecorated.length > 0
      ? previousDecorated[previousDecorated.length - 1]
      : null;
  const previousVariance = previousRecord
    ? previousRecord._perHourVarDynamic
    : 0;
  const cumulativeVarianceDynamicPrev = previousDecorated.reduce(
    (s, r) => s + (r._perHourVarDynamic ?? 0),
    0,
  );

  const totalAchievedBeforeSelected = previousDecorated.reduce(
    (s, r) => s + (r._achievedRounded ?? 0),
    0,
  );
  const achieveEfficiency =
    manpowerPresent > 0 && smv > 0 && selectedHourInt > 0
      ? ((totalAchievedBeforeSelected + achievedThisHour) * smv * 100) /
        (manpowerPresent * 60 * selectedHourInt)
      : 0;

  const handleSave = async () => {
    try {
      setError("");
      setMessage("");
      if (!header?._id) throw new Error("Missing headerId");
      const hourNum = Number(selectedHour);
      const existing = hourlyRecords.find(
        (rec) => Number(rec.hour) === hourNum,
      );
      if (editingRecordId) {
        if (!latestRecord || editingRecordId !== latestRecord._id) {
          setError("Only the last saved hour can be edited.");
          return;
        }
        if (hourNum !== latestRecord._hourNum) {
          setError(`Editing is locked to hour ${latestRecord._hourNum}.`);
          return;
        }
      } else if (existing) {
        setError(
          `Hour ${hourNum} is already saved. Use "Edit last hour" to change the latest entry.`,
        );
        return;
      }
      if (!Number.isFinite(achievedThisHour) || achievedThisHour < 0)
        throw new Error("Please enter a valid achieved qty.");
      if (!productionUserId) throw new Error("Missing user id.");
      setSaving(true);
      const payload = {
        headerId: header._id,
        hour: hourNum,
        achievedQty: achievedThisHour,
        productionUser: {
          id: productionUserId,
          Production_user_name:
            auth?.user?.user_name || auth?.user_name || "Unknown",
          phone: auth?.phone || "",
          bio: auth?.role || "",
        },
      };
      const res = await fetch("/api/hourly-productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(
          json?.errors?.join(", ") || json?.message || "Failed to save",
        );
      const resList = await fetch(
        `/api/hourly-productions?${buildRecordParams().toString()}`,
      );
      const jsonList = await resList.json();
      if (resList.ok && jsonList.success) setHourlyRecords(jsonList.data || []);
      await refreshWip();
      setAchievedInput("");
      setEditingRecordId(null);
      setMessage(
        editingRecordId
          ? "Last hour updated successfully."
          : "Hourly record saved successfully.",
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save hourly record");
    } finally {
      setSaving(false);
    }
  };

  const startEditLastHour = () => {
    if (!latestRecord) {
      setError("No hourly record found to edit.");
      return;
    }
    setError("");
    setMessage("");
    setEditingRecordId(latestRecord._id);
    setSelectedHour(latestRecord._hourNum);
    setAchievedInput(
      latestRecord._achievedRounded != null
        ? String(latestRecord._achievedRounded)
        : "",
    );
    setMessage(`Editing last saved hour (${latestRecord._hourNum}).`);
  };

  const handleTotalInputSave = async () => {
    try {
      setError("");
      setMessage("");
      if (!auth) throw new Error("User not authenticated");
      if (!factory) throw new Error("Factory not set.");
      if (!cycleStartDate)
        throw new Error("Cycle start date not detected yet.");
      const capNum = Number(totalInput);
      if (!Number.isFinite(capNum) || capNum < 0)
        throw new Error("Total input must be a non-negative number.");
      const userId = auth?.user?.id || auth?.user?._id || auth?.id || auth?._id;
      if (!userId) throw new Error("Missing user id.");
      setTotalInputSaving(true);
      const payload = {
        factory,
        assigned_building: header.assigned_building,
        line: header.line,
        buyer: header.buyer,
        style: header.style,
        cycleStartDate,
        date: header.date,
        capacity: capNum,
        user: {
          id: userId,
          user_name: auth?.user?.user_name || auth?.user_name || "Unknown",
          role: auth?.user?.role || auth?.role || "",
        },
      };
      const res = await fetch("/api/style-capacities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(
          json?.errors?.join(", ") ||
            json?.message ||
            "Failed to save capacity.",
        );
      setTotalInput(
        json.data?.capacity != null ? String(json.data.capacity) : "",
      );
      await refreshWip();
      setMessage("Total input saved/updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save total input.");
    } finally {
      setTotalInputSaving(false);
    }
  };

  const handleDayInputSave = async () => {
    try {
      setError("");
      setMessage("");
      if (!auth) throw new Error("User not authenticated");
      if (!factory) throw new Error("Factory not set.");
      if (!cycleStartDate)
        throw new Error("Cycle start date not detected yet.");
      const addQty = Number(dayInput);
      if (!Number.isFinite(addQty) || addQty <= 0)
        throw new Error("Day input must be a positive number.");
      const userId = auth?.user?.id || auth?.user?._id || auth?.id || auth?._id;
      if (!userId) throw new Error("Missing user id.");
      const newTotal = toNum(totalInput, 0) + addQty;
      setDayInputSaving(true);
      const payload = {
        factory,
        assigned_building: header.assigned_building,
        line: header.line,
        buyer: header.buyer,
        style: header.style,
        cycleStartDate,
        date: header.date,
        capacity: newTotal,
        user: {
          id: userId,
          user_name: auth?.user?.user_name || auth?.user_name || "Unknown",
          role: auth?.user?.role || auth?.role || "",
        },
      };
      const res = await fetch("/api/style-capacities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(
          json?.errors?.join(", ") ||
            json?.message ||
            "Failed to update total input.",
        );
      setTotalInput(
        json.data?.capacity != null
          ? String(json.data.capacity)
          : String(newTotal),
      );
      setDayInput("");
      await refreshWip();
      setMessage(
        `Day input of ${addQty} added. Total input is now ${json.data?.capacity ?? newTotal}.`,
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add day input.");
    } finally {
      setDayInputSaving(false);
    }
  };

  return (
    <div className="card bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-700 shadow-sm">
      <div className="card-body w-full p-3 space-y-3">
        {/* ── Header info ── */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
          {/* accent bar */}
          <div className="h-[3px] bg-gradient-to-r from-sky-500 to-emerald-500" />

          <div className="p-4 flex flex-wrap gap-4">
            {/* LEFT — identity */}
            <div className="flex-1 min-w-[220px] flex flex-col gap-2.5">
              {/* line + date + factory pill */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[15px] font-semibold text-slate-900 dark:text-white">
                  {header.line}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-[13px] text-slate-500 dark:text-slate-400">
                  {header.date}
                </span>
                <span className="text-[11px] bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full px-2.5 py-0.5">
                  {factory} · {header.assigned_building}
                </span>
              </div>

              {/* buyer / style / color segmented box */}
              <div className="flex divide-x divide-slate-200 dark:divide-white/10 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden w-fit">
                {[
                  { label: "Buyer", value: header.buyer },
                  { label: "Style", value: header.style },
                  { label: "Color / Model", value: header.color_model },
                ].map(({ label, value }) => (
                  <div key={label} className="px-3.5 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">
                      {label}
                    </div>
                    <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                      {value || "-"}
                    </div>
                  </div>
                ))}
              </div>

              {/* run info pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Run day", value: header.run_day },
                  { label: "Working", value: `${header.working_hour}h` },
                  { label: "Item", value: header.Item },
                  ...(cycleStartDate
                    ? [{ label: "Cycle start : ", value: cycleStartDate }]
                    : []),
                ].map(({ label, value }) => (
                  <span
                    key={label}
                    className="text-[12px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md px-2.5 py-1"
                  >
                    {label}{" "}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {value}
                    </strong>
                  </span>
                ))}
              </div>
            </div>

            {/* divider */}
            <div className="w-px self-stretch bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* RIGHT — metrics grid */}
            <div className="grid grid-cols-3 gap-px bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden self-start">
              {[
                { label: "Present MP", value: manpowerPresent, color: "" },
                {
                  label: "Plan Eff",
                  value: `${planEfficiencyPercent}%`,
                  color: "text-sky-600 dark:text-sky-400",
                },
                { label: "SMV", value: smv, color: "" },
                {
                  label: "Day Target",
                  value: targetFullDay,
                  color: "text-emerald-600 dark:text-emerald-400",
                },
                { label: "Capacity", value: capacityFromHeader, color: "" },
                { label: "Plan Qty", value: plan_quantity, color: "" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="px-3.5 py-2.5 bg-white dark:bg-slate-950"
                >
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5 whitespace-nowrap">
                    {label}
                  </div>
                  <div
                    className={`text-[18px] font-semibold ${color || "text-slate-800 dark:text-slate-100"}`}
                  >
                    {value ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(error || message) && (
          <div className="space-y-1 text-[11px]">
            {error && (
              <div className="alert alert-error py-1 px-2">
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="alert alert-success py-1 px-2">
                <span>{message}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Live Data panel ── */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-600 pb-1">
            <span className="font-semibold text-slate-800 dark:text-white">
              Live Data
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Hour {selectedHourInt} of {totalWorkingHours}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="font-medium text-gray-700 dark:text-slate-300">
                Base Target / hr:
              </span>{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatNumber(baseTargetPerHour, 0)}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Carry (shortfall vs base up to prev):
              </span>{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {formatNumber(cumulativeShortfallVsBasePrevForSelected, 0)}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Dynamic target this hour:
              </span>{" "}
              <span className="font-semibold text-blue-700 dark:text-blue-400">
                {formatNumber(dynamicTargetThisHour, 0)}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Net variance vs base (to date):
              </span>{" "}
              <span
                className={`font-semibold ${netVarVsBaseToDateSelected >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
              >
                {formatNumber(netVarVsBaseToDateSelected, 0)}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Cumulative variance (prev vs dynamic):
              </span>{" "}
              <span
                className={`font-semibold ${cumulativeVarianceDynamicPrev >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
              >
                {formatNumber(cumulativeVarianceDynamicPrev, 0)}
              </span>
            </div>
            {previousRecord && (
              <div className="sm:col-span-2">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  Last hour variance (Δ vs dynamic):
                </span>{" "}
                <span
                  className={`font-semibold ${previousVariance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                >
                  {formatNumber(previousVariance, 0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Hourly input table ── */}
        <div className="overflow-x-auto">
          <table className="table table-xs w-full">
            <thead>
              <tr className="bg-base-200 dark:bg-slate-700 text-[11px]">
                <th className="px-2 text-amber-600 dark:text-amber-400">
                  Hour
                </th>
                <th className="px-2 text-amber-600 dark:text-amber-400">
                  Base Target / hr
                </th>
                <th className="px-2 text-amber-600 dark:text-amber-400">
                  Dynamic Target (this hour)
                </th>
                <th className="px-2 text-amber-600 dark:text-amber-400">
                  Achieved Qty (this hour)
                </th>
                <th className="px-2 text-amber-600 dark:text-amber-400">
                  Hourly Eff %
                </th>
                <th className="px-2 text-amber-600 dark:text-amber-400">
                  AVG Eff % (preview)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t dark:border-slate-700">
                <td className="px-2 align-top">
                  <select
                    className="select select-xs select-bordered dark:bg-slate-700 dark:text-white dark:border-amber-600 w-28 text-[11px] border-amber-500"
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(Number(e.target.value))}
                  >
                    {hoursOptions.map((hVal) => (
                      <option key={hVal} value={hVal}>
                        {hVal} hr
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-gray-500 dark:text-slate-400">
                    Current hour (1 ~ {totalWorkingHours})
                  </p>
                </td>
                <td className="px-2 align-top">
                  <div className="rounded border bg-gray-50 dark:bg-slate-700 dark:text-white dark:border-amber-600 px-2 py-1 text-black text-[11px] border-amber-500">
                    {formatNumber(baseTargetPerHour, 0)}
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500 dark:text-slate-400 leading-tight">
                    (MP × 60 × Plan% ÷ SMV)
                  </p>
                </td>
                <td className="px-2 align-top">
                  <div className="rounded border border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-black dark:text-amber-200 text-[11px]">
                    {formatNumber(dynamicTargetThisHour, 0)}
                  </div>
                  <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
                    Base + shortfall vs base (prev hours)
                  </p>
                </td>
                <td className="px-2 align-top">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input input-xs input-bordered dark:bg-slate-700 dark:text-white dark:border-amber-600 w-full text-[11px] border-amber-500"
                    value={achievedInput}
                    onChange={(e) => setAchievedInput(e.target.value)}
                    placeholder="Output this hour"
                  />
                  <p className="mt-1 text-[10px] text-gray-500 dark:text-slate-400">
                    Actual pieces this hour
                  </p>
                </td>
                <td className="px-2 align-top">
                  <div className="rounded border border-amber-500 dark:border-amber-600 bg-gray-50 dark:bg-slate-700 dark:text-white px-2 py-1 text-black text-[11px]">
                    {formatNumber(hourlyEfficiency)}
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500 dark:text-slate-400 leading-tight">
                    (Output × SMV × 100) ÷ (MP × 60)
                  </p>
                </td>
                <td className="px-2 align-top">
                  <div className="rounded border border-amber-500 dark:border-amber-600 bg-gray-50 dark:bg-slate-700 dark:text-white px-2 py-1 text-black text-[11px]">
                    {formatNumber(achieveEfficiency)}
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500 dark:text-slate-400 leading-tight">
                    (Total produce min ÷ Total available min) × 100
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={startEditLastHour}
            className="btn btn-xxs btn-outline border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            disabled={!latestRecord || saving}
          >
            {latestRecord
              ? `Edit last hour (${latestRecord._hourNum})`
              : "Edit last hour"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-xs btn-primary px-3"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingRecordId
                ? "Update Last Hour"
                : "Save Hour"}
          </button>
        </div>

        {/* ── Total Input / Day Input / WIP panel ── */}
        <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[11px] space-y-2">
          {/* Total Input row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
              Total Input :
            </span>
            <div className="rounded border border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 text-[13px] font-bold text-amber-900 dark:text-amber-300 min-w-[60px] text-center">
              {totalInputLoading ? "..." : totalInput !== "" ? totalInput : "0"}
            </div>
            <input
              type="number"
              min="0"
              step="1"
              className="input input-xxs input-bordered dark:bg-slate-700 dark:text-white dark:border-slate-500 w-20 h-8 text-[12px] font-bold"
              value={totalInput}
              onChange={(e) => setTotalInput(e.target.value)}
              placeholder="Set value"
            />
            <button
              type="button"
              onClick={handleTotalInputSave}
              className="btn btn-xs btn-primary"
              disabled={totalInputSaving || wipLoading || !cycleStartDate}
            >
              {totalInputSaving ? "Saving..." : "Save / Update"}
            </button>
            {!cycleStartDate && !wipLoading && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                Waiting for cycle detection…
              </span>
            )}
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-600" />

          {/* Day Input row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
              Day Input :
            </span>
            <input
              type="number"
              min="1"
              step="1"
              className="input input-xxs input-bordered dark:bg-slate-700 dark:text-white dark:border-green-600 w-20 h-8 text-[12px] font-bold border-green-500"
              value={dayInput}
              onChange={(e) => setDayInput(e.target.value)}
              placeholder="e.g. 100"
            />
            <button
              type="button"
              onClick={handleDayInputSave}
              className="btn btn-xs btn-success text-white"
              disabled={dayInputSaving || !dayInput || !cycleStartDate}
            >
              {dayInputSaving ? "Adding..." : "+ Add to Total"}
            </button>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              This qty will be added to Total Input and saved.
            </span>
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-600" />

          {/* WIP row */}
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <span className="text-slate-900 dark:text-white text-[12px] mr-1">
                Uptodate Production :
              </span>
              <span className="font-bold text-slate-900 dark:text-yellow-400">
                {wipLoading || totalInputLoading
                  ? "..."
                  : wipInfo
                    ? formatNumber(wipInfo.totalAchieved, 0)
                    : "-"}
              </span>
            </div>
            <div>
              <span className="text-slate-900 dark:text-white mr-1 font-bold">
                WIP :
              </span>
              <span
                className={`font-bold ${(wipInfo?.wip ?? 0) > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}
              >
                {wipLoading || totalInputLoading
                  ? "..."
                  : wipInfo
                    ? formatNumber(wipInfo.wip, 0)
                    : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Posted hourly records table ── */}
        <div className="mt-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <h3 className="font-semibold text-[12px] text-slate-900 dark:text-white">
              Posted hourly records
              {privileged ? (
                <span className="ml-2 text-[10px] text-violet-600 dark:text-violet-400 font-normal normal-case">
                  (all users)
                </span>
              ) : (
                <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500 font-normal normal-case">
                  (your records)
                </span>
              )}
            </h3>
            {loadingRecords && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="loading loading-spinner loading-xs" />{" "}
                Loading...
              </span>
            )}
          </div>

          {recordsDecorated.length === 0 ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              No hourly records saved yet for this header.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-xs w-full border-t dark:border-slate-700">
                <thead>
                  <tr className="bg-base-200 dark:bg-slate-700 text-[11px]">
                    <th className="px-2 dark:text-slate-300">Hour</th>
                    <th className="px-2 dark:text-slate-300">Target</th>
                    <th className="px-2 dark:text-slate-300">Achieved</th>
                    <th className="px-2 dark:text-slate-300">
                      Δ Var (hr vs dynamic)
                    </th>
                    <th className="px-2 dark:text-slate-300">
                      Net Var vs Base (to date)
                    </th>
                    <th className="px-2 dark:text-slate-300">Hourly Eff %</th>
                    <th className="px-2 dark:text-slate-300">AVG Eff %</th>
                    <th className="px-2 dark:text-slate-300">Updated At</th>
                    {privileged && (
                      <th className="px-2 dark:text-slate-300">Posted By</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recordsDecorated.map((rec) => (
                    <tr
                      key={rec._id}
                      className="border-b dark:border-slate-700 text-[11px] dark:text-slate-300"
                    >
                      <td className="px-2 py-1">{rec._hourNum}</td>
                      <td className="px-2 py-1">
                        {formatNumber(rec._dynTargetRounded, 0)}
                      </td>
                      <td className="px-2 py-1">{rec._achievedRounded}</td>
                      <td
                        className={`px-2 py-1 ${(rec._perHourVarDynamic ?? 0) >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                      >
                        {formatNumber(rec._perHourVarDynamic ?? 0, 0)}
                      </td>
                      <td
                        className={`px-2 py-1 ${(rec._netVarVsBaseToDate ?? 0) >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                      >
                        {formatNumber(rec._netVarVsBaseToDate ?? 0, 0)}
                      </td>
                      <td className="px-2 py-1">
                        {formatNumber(rec.hourlyEfficiency)}
                      </td>
                      <td className="px-2 py-1">
                        {formatNumber(rec.totalEfficiency)} %
                      </td>
                      <td className="px-2 py-1">
                        {rec.updatedAt
                          ? new Date(rec.updatedAt).toLocaleTimeString()
                          : "-"}
                      </td>
                      {privileged && (
                        <td className="px-2 py-1 text-slate-500 dark:text-slate-400 text-[10px]">
                          {rec.productionUser?.Production_user_name ||
                            rec.productionUser?.id ||
                            "-"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                {hasRecords && (
                  <tfoot>
                    <tr className="bg-amber-300 dark:bg-amber-800/60 text-[12px] font-bold">
                      <td className="px-2 py-1 dark:text-white">Total</td>
                      <td className="px-2 py-1 dark:text-white">-</td>
                      <td className="px-1 py-1 dark:text-white">
                        {formatNumber(totalAchievedAll, 0)}
                      </td>
                      <td className="px-2 py-1 dark:text-white">-</td>
                      <td
                        className={`px-2 py-1 ${totalNetVarVsBaseToDate >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                      >
                        {formatNumber(totalNetVarVsBaseToDate, 0)}
                      </td>
                      <td className="px-2 py-1 dark:text-white">-</td>
                      <td className="px-2 py-1 dark:text-white">
                        {formatNumber(totalAvgEffPercent)} %
                      </td>
                      <td className="px-2 py-1 dark:text-white">-</td>
                      {privileged && (
                        <td className="px-2 py-1 dark:text-white">-</td>
                      )}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
