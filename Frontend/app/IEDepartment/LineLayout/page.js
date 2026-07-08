"use client";
// app/IEDepartment/LineLayout/page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  Trash2, X, Check, Printer, Ruler, ClipboardList,
  Pencil, Menu, Plus, ArrowLeft, ChevronRight,
  AlertTriangle, Factory, RefreshCw,
  Paperclip, Settings, ShieldAlert,
} from "lucide-react";

import {
  FACTORY_OPTIONS, FLOOR_OPTIONS, LINE_OPTIONS, BUYER_OPTIONS,
  HOURS_OPTIONS, SERIAL_OPTIONS, MACHINE_TYPES,
  calcTargets, mc,
  SearchableSelect, Toast, AddProcessNameModal,
  WasteFloorPicker, MachineFloorPicker, DeleteLayoutModal,
  LayoutGrid, LField, LInput, LSelect,
} from "./components";

// ─── openPrintWindow ──────────────────────────────────────────────────────────
function openPrintWindow(layout) {
  if (!layout) return;

  const computed = calcTargets(
    layout.smv, layout.planEfficiency,
    layout.operator, layout.helper, layout.seamSealing, layout.workingHours
  );

  const procs = [...(layout.processes || [])].sort((a, b) => a.serialNo - b.serialNo);

  const bySn = {};
  procs.forEach((p) => { if (!bySn[p.serialNo]) bySn[p.serialNo] = []; bySn[p.serialNo].push(p); });

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

  const infoRows = [
    ["Unit",  `${layout.floor} - LINE NO-${layout.lineNo}`, "Plan Efficiency:",                              `${layout.planEfficiency}%`],
    ["Buyer", layout.buyer,                                  "Op + Hel + Seam Sealing",                      `${layout.operator}+${layout.helper}+${layout.seamSealing}`],
    ["Style", layout.style,                                  "Manpower:",                                    computed.manpower],
    ["Item",  layout.item,                                   "1 Hour Target:",                               computed.oneHourTarget],
    ["SMV",   layout.smv,                                    `Total Daily Target (${layout.workingHours}hrs)`, computed.dailyTarget],
  ].map(([l, v, l2, v2]) => `
    <tr>
      <td style="border:1px solid #000;font-weight:bold;padding:1px 3px;font-size:6.5px;white-space:nowrap">${esc(l)}</td>
      <td colspan="2" style="border:1px solid #000;padding:1px 3px;font-size:6.5px">${esc(v)}</td>
      <td style="border:1px solid #000;font-weight:bold;text-align:right;padding:1px 3px;font-size:6.5px;white-space:nowrap">${esc(l2)}</td>
      <td style="border:1px solid #000;font-weight:bold;text-align:center;padding:1px 3px;font-size:6.5px">${esc(v2)}</td>
    </tr>`).join("");

  function cellHtml(entries) {
    if (!entries || entries.length === 0) {
      return `<td style="border:1px solid #000;padding:1px 2px"></td>
        <td style="border:1px solid #000;padding:1px 2px"></td>
        <td style="border:1px solid #000;padding:1px 2px"></td>`;
    }
    if (entries.length === 1) {
      const e = entries[0];
      return `
        <td style="border:1px solid #000;text-align:center;font-weight:bold;font-size:6.5px;padding:1px 2px;white-space:nowrap">${esc(e.serialNo)}</td>
        <td style="border:1px solid #000;font-weight:bold;font-size:6.5px;padding:1px 3px;word-break:break-word">${esc(e.processName)}</td>
        <td style="border:1px solid #000;text-align:center;font-size:6px;padding:1px 2px;word-break:break-word;line-height:1.15">${esc(e.machineType ?? "")}</td>`;
    }
    const pStack = entries.map((e, i) =>
      `<div style="font-size:6.5px;font-weight:bold;line-height:1.3;word-break:break-word;${i > 0 ? "border-top:1px dashed #bbb;margin-top:1px;padding-top:1px;" : ""}">${esc(e.processName)}</div>`
    ).join("");
    const mStack = entries.map((e, i) =>
      `<div style="font-size:6px;line-height:1.2;word-break:break-word;${i > 0 ? "border-top:1px dashed #bbb;margin-top:1px;padding-top:1px;" : ""}">${esc(e.machineType ?? "")}</div>`
    ).join("");
    return `
      <td style="border:1px solid #000;text-align:center;font-weight:bold;font-size:6.5px;padding:1px 2px;vertical-align:top;white-space:nowrap">${esc(entries[0].serialNo)}</td>
      <td style="border:1px solid #000;padding:1px 3px;vertical-align:top">${pStack}</td>
      <td style="border:1px solid #000;text-align:center;padding:1px 2px;vertical-align:top">${mStack}</td>`;
  }

  const processRows = pairs.map(({ L, R }) =>
    `<tr style="height:13px">${cellHtml(L)}<td style="border:none;width:3px;background:#fff"></td>${cellHtml(R)}</tr>`
  ).join("");

  const machRows = Object.entries(machSummary).map(([m, q]) =>
    `<tr><td style="border:1px solid #000;padding:1px 3px;font-size:6.5px">${esc(m)}</td><td style="border:1px solid #000;text-align:center;font-size:6.5px;font-weight:bold;padding:1px 3px">${q}</td></tr>`
  ).join("");

  const sketchImg = layout.sketchUrl
    ? `<img src="${esc(layout.sketchUrl)}" style="max-height:58px;max-width:100%;object-fit:contain;" crossorigin="anonymous"/>`
    : `<span style="font-size:5.5px;color:#aaa">No sketch</span>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Line Layout - ${esc(layout.floor)} Line ${esc(layout.lineNo)}</title>
<style>
  * { box-sizing:border-box;margin:0;padding:0; }
  body { padding:4mm 5mm;font-family:Arial,sans-serif;font-size:6.5px;background:#fff;width:210mm; }
  table { border-collapse:collapse;width:100%; }
  @page { size:A4 portrait;margin:0; }
  tr { page-break-inside:avoid; }
  thead { display:table-header-group; }
</style></head>
<body>
  <table style="margin-bottom:1px"><tr><td style="border:1px solid #000;font-weight:bold;font-size:9px;text-align:center;padding:2px 4px">HKD OUTDOOR INNOVATIONS LTD</td></tr></table>
  <table style="margin-bottom:2px"><tr><td style="border:1px solid #000;font-weight:bold;font-size:8px;text-align:center;padding:2px 4px;background:#FFFF00">MACHINE LAYOUT</td></tr></table>
  <table style="margin-bottom:3px;table-layout:fixed">
    <colgroup><col style="width:82%"><col style="width:18%"></colgroup>
    <tr>
      <td style="padding:0;vertical-align:top">
        <table style="width:100%;border-collapse:collapse;table-layout:fixed">
          <colgroup><col style="width:12%"><col style="width:26%"><col style="width:8%"><col style="width:32%"><col style="width:22%"></colgroup>
          <tbody>${infoRows}</tbody>
        </table>
      </td>
      <td style="border:1px solid #000;text-align:center;vertical-align:middle;padding:2px">${sketchImg}</td>
    </tr>
  </table>
  <table style="margin-bottom:3px;table-layout:fixed">
    <colgroup>
      <col style="width:4%"><col style="width:30.5%"><col style="width:13.5%"><col style="width:3%">
      <col style="width:4%"><col style="width:30.5%"><col style="width:14.5%">
    </colgroup>
    <thead><tr>
      <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6.5px">SL</td>
      <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6.5px">Process Name</td>
      <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6.5px">Machine</td>
      <td style="border:none;background:#fff"></td>
      <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6.5px">SL</td>
      <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6.5px">Process Name</td>
      <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 2px;font-size:6.5px">Machine</td>
    </tr></thead>
    <tbody>${processRows}</tbody>
  </table>
  <table style="table-layout:fixed">
    <colgroup><col style="width:38%"><col style="width:4%"><col style="width:58%"></colgroup>
    <tr style="vertical-align:top">
      <td style="padding:0;vertical-align:top">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 3px;font-size:6.5px">Machine Name</td>
            <td style="border:1px solid #000;font-weight:bold;text-align:center;background:#FFFF00;padding:1px 3px;font-size:6.5px;width:16%">Qty</td>
          </tr>
          ${machRows}
          <tr>
            <td style="border:1px solid #000;font-weight:bold;padding:1px 3px;font-size:6.5px">Total</td>
            <td style="border:1px solid #000;font-weight:bold;text-align:center;padding:1px 3px;font-size:6.5px">${machTotal}</td>
          </tr>
        </table>
      </td>
      <td style="padding:0"></td>
      <td style="padding:0;vertical-align:bottom">
        <table style="width:100%;border-collapse:collapse">
          <tr style="height:28px">
            <td style="border:1px solid #000;font-weight:bold;text-align:center;vertical-align:bottom;padding:2px 3px;font-size:6.5px">Sr. Supervisor</td>
            <td style="border:1px solid #000;font-weight:bold;text-align:center;vertical-align:bottom;padding:2px 3px;font-size:6.5px">Technician</td>
            <td style="border:1px solid #000;font-weight:bold;text-align:center;vertical-align:bottom;padding:2px 3px;font-size:6.5px">IE Executive</td>
            <td style="border:1px solid #000;font-weight:bold;text-align:center;vertical-align:bottom;padding:2px 3px;font-size:6.5px">Maintenance Supervisor</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body></html>`;

  const old = document.getElementById("ll-print-iframe");
  if (old) old.remove();
  const iframe = document.createElement("iframe");
  iframe.id = "ll-print-iframe";
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
  document.body.appendChild(iframe);
  const iDoc = iframe.contentDocument || iframe.contentWindow.document;
  iDoc.open(); iDoc.write(html); iDoc.close();
  setTimeout(() => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
    catch (e) { console.error("iframe print failed:", e); }
    setTimeout(() => { iframe.remove(); }, 10000);
  }, 500);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LineLayoutPage() {
  const { auth } = useAuth();
  const userFactory  = auth?.factory          ?? "";
  const userBuilding = auth?.assigned_building ?? "";
  const userRole     = auth?.role              ?? "";
  const isAdmin      = userRole === "Admin" || userRole === "IE";

  const [filterFactory, setFilterFactory] = useState("");
  const effectiveFactory = isAdmin ? (filterFactory || "") : userFactory;
  const allowedFloors = isAdmin ? FLOOR_OPTIONS : (userBuilding ? [userBuilding] : FLOOR_OPTIONS);

  const [filterFloor, setFilterFloor] = useState("");
  const [filterLine,  setFilterLine]  = useState("");
  const [layouts, setLayouts]         = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [view, setView] = useState("list");

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
  function showToast(type, msg) { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); }

  const { manpower, oneHourTarget, dailyTarget } = calcTargets(
    form.smv, form.planEfficiency, form.operator, form.helper, form.seamSealing, form.workingHours
  );
  const [processNames,  setProcessNames]  = React.useState([]);
  const [loadingPNames, setLoadingPNames] = React.useState(false);
  const [showAddPName,  setShowAddPName]  = React.useState(false);

  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [machineFloors, setMachineFloors] = useState({});
  const [deleting,      setDeleting]      = useState(false);

  const scopeWarning = !isAdmin && !userBuilding
    ? "Your account has no assigned building. Please contact an administrator."
    : null;

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

  function openDeleteModal(layout) {
    setDeleteTarget(layout);
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
    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    return json.success ? { url: json.url, publicId: json.publicId } : { url: "", publicId: "" };
  }

  async function handleCreateLayout(e) {
    e.preventDefault();
    if (!form.floor || !form.lineNo || !form.buyer) {
      showToast("error", "Floor, Line No and Buyer are required.");
      return;
    }
    if (!isAdmin) {
      if (userBuilding && form.floor !== userBuilding) {
        showToast("error", `You can only create layouts for your assigned building: "${userBuilding}".`);
        return;
      }
    }
    setSaving(true);
    try {
      let sketchUrl = "", sketchPublicId = "";
      if (sketchFile) {
        setUploading(true);
        const uploaded = await uploadSketch(sketchFile);
        sketchUrl = uploaded.url; sketchPublicId = uploaded.publicId;
        setUploading(false);
      }
      const res = await fetch("/api/line-layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, factory: effectiveFactory,
          manpower, oneHourTarget, dailyTarget,
          sketchUrl, sketchPublicId,
          _authRole: userRole, _authFactory: userFactory, _authBuilding: userBuilding,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Layout created!");
        setCurrentLayout(json.data);
        prefillEditForm(json.data);
        setBuilderTab("process");
        setView("builder");
      } else { showToast("error", json.message); }
    } finally { setSaving(false); setUploading(false); }
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
      let finalSketchUrl = editForm.sketchUrl, finalSketchPublicId = currentLayout.sketchPublicId || "";
      if (editSketchFile) {
        setEditUploading(true);
        const uploaded = await uploadSketch(editSketchFile);
        finalSketchUrl = uploaded.url; finalSketchPublicId = uploaded.publicId;
        setEditUploading(false);
      }
      if (!editForm.sketchUrl && !editSketchFile) { finalSketchUrl = ""; finalSketchPublicId = ""; }

      const { manpower: mp, oneHourTarget: oht, dailyTarget: dt } = calcTargets(
        editForm.smv, editForm.planEfficiency, editForm.operator,
        editForm.helper, editForm.seamSealing, editForm.workingHours
      );

      const res = await fetch(`/api/line-layouts/${currentLayout._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_header",
          buyer: editForm.buyer, style: editForm.style, item: editForm.item,
          smv: editForm.smv, planEfficiency: editForm.planEfficiency,
          operator: editForm.operator, helper: editForm.helper,
          seamSealing: editForm.seamSealing, workingHours: editForm.workingHours,
          sketchUrl: finalSketchUrl, sketchPublicId: finalSketchPublicId,
          manpower: mp, oneHourTarget: oht, dailyTarget: dt,
        }),
      });
      const json = await res.json();
      if (json.success) { setCurrentLayout(json.data); prefillEditForm(json.data); showToast("success", "Header updated!"); }
      else { showToast("error", json.message); }
    } finally { setEditSaving(false); setEditUploading(false); }
  }

  async function handleDeleteLayout() {
    if (!deleteTarget) return;
    const allMachines = getAllMachines(deleteTarget);
    const missing = allMachines.filter((m) => !machineFloors[m.serialNumber]);
    if (missing.length > 0) {
      showToast("error", `Please select a return floor for all ${missing.length} machine(s).`);
      return;
    }
    setDeleting(true);
    try {
      const machineReturns = allMachines.map((m) => ({
        machineId: m.machineId, serialNumber: m.serialNumber, returnFloor: machineFloors[m.serialNumber],
      }));
      const res = await fetch(`/api/line-layouts/${deleteTarget._id}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineReturns }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Layout deleted.");
        setDeleteTarget(null); setMachineFloors({});
        if (currentLayout?._id === deleteTarget._id) setCurrentLayout(null);
        setView("list"); loadLayouts();
      } else showToast("error", json.message);
    } finally { setDeleting(false); }
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div style={{
        transform: "scale(0.75)", transformOrigin: "top left",
        width: "126vw", height: "133.33vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }} className="font-sans text-slate-800 dark:text-slate-100">

        <Toast toast={toast} />

        {/* Delete Modal */}
        {deleteTarget && (
          <DeleteLayoutModal
            deleteTarget={deleteTarget}
            machineFloors={machineFloors}
            setMachineFloors={setMachineFloors}
            deleting={deleting}
            onConfirm={handleDeleteLayout}
            onCancel={() => { setDeleteTarget(null); setMachineFloors({}); }}
          />
        )}

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
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-t-2xl" />
              <form onSubmit={handleSaveProcessEdit} className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                    <Pencil size={18} className="text-amber-500" /> Edit Process
                  </h3>
                  <button type="button" onClick={() => setEditingProcess(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <LField label="Serial No">
                  <select value={editingProcess.serialNo} onChange={(e) => setEditingProcess((p) => ({ ...p, serialNo: +e.target.value }))}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-amber-500">
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
                  <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 flex items-center gap-1.5">
                    <RefreshCw size={12} /> Machine type changed — old machines will return to inventory and new serials must be selected.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                    Machine assignment unchanged. Only serial and process name will update.
                  </p>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={procEditSaving || !editingProcess.processName || !editingProcess.machineType}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3 rounded-xl text-base transition-all flex items-center justify-center gap-2">
                    <Check size={16} />{procEditSaving ? "Saving..." : editingProcess.machineType !== editingProcess.originalMachineType && editingProcess.machineType !== "HELPER" ? "Next → Select Serial" : "Update"}
                  </button>
                  <button type="button" onClick={() => setEditingProcess(null)}
                    className="px-5 border border-slate-300 dark:border-slate-600 hover:border-slate-400 text-slate-600 dark:text-slate-400 rounded-xl text-base transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-1.5 bg-blue-600 rounded-full" />
            <div>
              <p className="text-xs tracking-[0.3em] text-blue-600 uppercase font-bold">IE Department</p>
              <h1 className="text-2xl font-black tracking-tight leading-tight text-slate-900 dark:text-slate-100">Line Layout</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Factory</span>
                <select value={filterFactory} onChange={(e) => setFilterFactory(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-base rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                  <option value="">All Factories</option>
                  {FACTORY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-base bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg font-bold flex items-center gap-1.5">
                <Factory size={15} /> {userFactory || "—"}
                {userBuilding && <span className="ml-1 text-blue-500">· {userBuilding}</span>}
              </span>
            )}
            {view !== "list" && (
              <button onClick={() => setView("list")}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:border-slate-400 text-slate-600 dark:text-slate-300 rounded-xl text-base font-semibold transition-all bg-white dark:bg-slate-800 flex items-center gap-1.5">
                <ArrowLeft size={16} /> All Layouts
              </button>
            )}
            {view === "list" && (
              <button onClick={() => {
                setView("form");
                setForm({ floor: isAdmin ? "" : (userBuilding || ""), lineNo:"", buyer:"", style:"", item:"", smv:"", planEfficiency:"", operator:"", helper:"", seamSealing:"", workingHours:8 });
                setSketchPreview("");
              }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-all shadow-sm flex items-center gap-2">
                <Plus size={16} /> New Layout
              </button>
            )}
            {view === "builder" && currentLayout && (
              <button onClick={() => openPrintWindow(currentLayout)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base transition-all shadow-sm flex items-center gap-2">
                <Printer size={16} /> Print Layout
              </button>
            )}
            {view === "builder" && currentLayout && (
              <button onClick={() => openDeleteModal(currentLayout)}
                className="px-4 py-2.5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-600 dark:text-red-400 rounded-xl text-base font-bold transition-all flex items-center gap-1.5">
                <Trash2 size={15} /> Delete Layout
              </button>
            )}
            {view === "builder" && (
              <button onClick={() => { setView("list"); loadLayouts(); }}
                className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl text-base transition-all flex items-center gap-2">
                <Check size={16} /> Done
              </button>
            )}
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-wrap gap-3 mb-5">
              <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-base rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                <option value="">All Floors</option>
                {FLOOR_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <select value={filterLine} onChange={(e) => setFilterLine(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-base rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                <option value="">All Lines</option>
                {LINE_OPTIONS.map((l) => <option key={l} value={l}>Line {l}</option>)}
              </select>
            </div>
            {listLoading ? (
              <p className="text-slate-400 text-base animate-pulse text-center py-20">Loading...</p>
            ) : layouts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Ruler size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-base">No layouts found. Create a new one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {layouts.map((l) => {
                  const live = calcTargets(l.smv, l.planEfficiency, l.operator, l.helper, l.seamSealing, l.workingHours);
                  return (
                    <div key={l._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
                      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-violet-500" />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            {l.factory && (
                              <span className="text-xs bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold mr-1 inline-flex items-center gap-1">
                                <Factory size={10} /> {l.factory}
                              </span>
                            )}
                            <div className="text-base text-blue-600 dark:text-blue-400 font-bold mt-1">{l.floor} · Line {l.lineNo}</div>
                            <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg mt-0.5">{l.buyer}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-base">{l.style} — {l.item}</p>
                          </div>
                          <span className="text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full font-semibold">{l.processes?.length || 0} process</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          {[
                            { label:"SMV",        val: l.smv,                  color:"text-slate-700 dark:text-slate-300"   },
                            { label:"Efficiency", val: `${l.planEfficiency}%`, color:"text-blue-700 dark:text-blue-400"     },
                            { label:"Manpower",   val: live.manpower,          color:"text-slate-700 dark:text-slate-300"   },
                            { label:"1Hr Target", val: live.oneHourTarget,     color:"text-emerald-700 dark:text-emerald-400" },
                            { label:`Daily (${l.workingHours}h)`, val: live.dailyTarget, color:"text-violet-700 dark:text-violet-400" },
                            { label:"Op/Hel/SS",  val: `${l.operator}/${l.helper}/${l.seamSealing}`, color:"text-slate-700 dark:text-slate-300" },
                          ].map(({ label, val, color }) => (
                            <div key={label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2">
                              <div className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">{label}</div>
                              <div className={`text-base font-black ${color}`}>{val}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setCurrentLayout(l); prefillEditForm(l); setBuilderTab("process"); setView("builder"); }}
                            className="flex-1 py-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-blue-700 dark:text-blue-300 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2">
                            Open Builder <ChevronRight size={16} />
                          </button>
                          <button onClick={() => openDeleteModal(l)}
                            className="px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-600 dark:text-red-400 rounded-xl text-base font-bold transition-all"
                            title="Delete layout">
                            <Trash2 size={16} />
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

        {/* ── FORM VIEW ── */}
        {view === "form" && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start bg-slate-50 dark:bg-slate-950">
            <form onSubmit={handleCreateLayout} className="w-full max-w-xl">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-violet-500" />
                <div className="p-8 space-y-5">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">Create New Line Layout</h2>

                  {!isAdmin && (
                    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 border text-sm
                      ${scopeWarning
                        ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                        : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"}`}>
                      <ShieldAlert size={18} className={`shrink-0 mt-0.5 ${scopeWarning ? "text-red-500" : "text-blue-500"}`} />
                      <div>
                        {scopeWarning
                          ? <p className="font-bold">{scopeWarning}</p>
                          : <>
                              <p className="font-bold">Your scope: <span className="font-black">{userFactory}</span> — <span className="font-black">{userBuilding}</span></p>
                              <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">You can only create layouts for your assigned factory and building.</p>
                            </>}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <LField label="Floor *">
                      {isAdmin
                        ? <LSelect value={form.floor} onChange={(v) => setForm((p) => ({ ...p, floor:v }))} options={FLOOR_OPTIONS} placeholder="— Floor —" />
                        : userBuilding
                          ? (
                            <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-3 text-base font-bold flex items-center justify-between">
                              <span>{userBuilding}</span>
                              <span className="text-xs text-slate-400 font-normal">locked</span>
                            </div>
                          )
                          : <LSelect value={form.floor} onChange={(v) => setForm((p) => ({ ...p, floor:v }))} options={FLOOR_OPTIONS} placeholder="— Floor —" />
                      }
                    </LField>
                    <LField label="Line No *">
                      <LSelect value={form.lineNo} onChange={(v) => setForm((p) => ({ ...p, lineNo:v }))} options={LINE_OPTIONS} placeholder="— Line —" renderOption={(o) => `Line ${o}`} />
                    </LField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <LField label="Buyer *">
                      <LSelect value={form.buyer} onChange={(v) => setForm((p) => ({ ...p, buyer:v }))} options={BUYER_OPTIONS} placeholder="— Buyer —" />
                    </LField>
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
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500">
                        {HOURS_OPTIONS.map((h) => <option key={h} value={h}>{h} hrs</option>)}
                      </select>
                    </LField>
                    <LField label="Manpower (auto)">
                      <div className="w-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg px-3 py-3 text-base font-black flex justify-between">
                        <span>{manpower}</span><span className="text-slate-400 text-sm font-normal">auto</span>
                      </div>
                    </LField>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[["Operator","operator"],["Helper","helper"],["Seam Sealing","seamSealing"]].map(([label, key]) => (
                      <LField key={key} label={label}><LInput type="number" value={form[key]} onChange={(v) => setForm((p) => ({ ...p, [key]:v }))} placeholder="0" /></LField>
                    ))}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">Target Preview</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-mono">({manpower} × {form.workingHours}h × 60 / {form.smv || "SMV"}) × {form.planEfficiency || 0}%</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-violet-50 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 rounded-lg px-3 py-3">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Daily Target ({form.workingHours}h)</div>
                        <div className="text-2xl font-black">{dailyTarget}</div>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg px-3 py-3">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">1 Hour Target</div>
                        <div className="text-2xl font-black">{oneHourTarget}</div>
                      </div>
                    </div>
                  </div>
                  <LField label="Line Sketch / Image (optional)">
                    <div onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 rounded-xl p-5 cursor-pointer transition-all text-center bg-slate-50 dark:bg-slate-800">
                      {sketchPreview
                        ? <img src={sketchPreview} alt="sketch" className="max-h-36 mx-auto rounded-lg object-contain" />
                        : <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Paperclip size={24} className="text-slate-300" />
                            <p className="text-base">Click to select an image</p>
                          </div>}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSketchChange} />
                    </div>
                  </LField>
                </div>
                <div className="px-8 pb-8">
                  <button type="submit" disabled={saving || uploading || !!scopeWarning}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-black py-4 rounded-xl text-base tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-2">
                    {uploading ? "Uploading image..." : saving ? "Creating..." : <><Plus size={18} /> Create Layout</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── BUILDER VIEW ── */}
        {view === "builder" && currentLayout && (
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left panel */}
            <div className="w-[440px] shrink-0 border-r-2 border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="flex border-b-2 border-slate-200 dark:border-slate-700 shrink-0">
                {[
                  { key:"edit",    label:"Edit",    Icon: Settings },
                  { key:"process", label:"Process", Icon: Plus     },
                  { key:"list",    label:"List",    Icon: Menu     },
                ].map((t) => (
                  <button key={t.key} onClick={() => setBuilderTab(t.key)}
                    className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-1.5
                      ${builderTab === t.key
                        ? "border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-white dark:bg-slate-900"}`}>
                    <t.Icon size={14} />{t.label}
                  </button>
                ))}
              </div>

              {/* Edit Tab */}
              {builderTab === "edit" && (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                    <span className="text-base text-blue-700 dark:text-blue-300 font-black">{currentLayout.floor} · Line {currentLayout.lineNo}</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center mt-2">
                      {[
                        { l:"1Hr Tgt",   v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).oneHourTarget, c:"text-emerald-700 dark:text-emerald-400" },
                        { l:`Daily(${currentLayout.workingHours}h)`, v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).dailyTarget, c:"text-violet-700 dark:text-violet-400" },
                        { l:"Manpower",  v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).manpower, c:"text-blue-700 dark:text-blue-400" },
                      ].map(({ l, v, c }) => (
                        <div key={l} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2">
                          <div className="text-xs text-slate-400 font-medium">{l}</div>
                          <div className={`text-base font-black ${c}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleUpdateHeader} className="p-4 space-y-4">
                    <p className="text-sm text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">Update Style Info</p>
                    <div className="grid grid-cols-2 gap-3">
                      <LField label="Buyer">
                        <LSelect value={editForm.buyer} onChange={(v) => setEditForm((p) => ({ ...p, buyer:v }))} options={BUYER_OPTIONS} placeholder="— Buyer —" />
                      </LField>
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
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500">
                        {HOURS_OPTIONS.map((h) => <option key={h} value={h}>{h} hrs</option>)}
                      </select>
                    </LField>
                    <LField label="Line Sketch / Image">
                      <div className="space-y-2">
                        {(editSketchPreview || editForm.sketchUrl) && (
                          <div className="relative">
                            <img src={editSketchPreview || editForm.sketchUrl} alt="Current sketch"
                              className="w-full max-h-32 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                            <button type="button" onClick={() => { setEditSketchFile(null); setEditSketchPreview(""); setEditForm((p) => ({ ...p, sketchUrl:"" })); }}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow">
                              <X size={12} />
                            </button>
                          </div>
                        )}
                        <div onClick={() => editFileRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-400 rounded-xl p-3 cursor-pointer transition-all text-center bg-slate-50 dark:bg-slate-800 flex items-center justify-center gap-2 text-slate-400">
                          {editSketchPreview || editForm.sketchUrl
                            ? <><RefreshCw size={14} /><span className="text-sm">Replace with new image</span></>
                            : <><Paperclip size={14} /><span className="text-sm">Click to select image</span></>}
                          <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditSketchChange} />
                        </div>
                      </div>
                    </LField>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-semibold">New Target Preview</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-mono">({editTargets.manpower} × {editForm.workingHours}h × 60 / {editForm.smv || "SMV"}) × {editForm.planEfficiency || 0}%</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { l:"Manpower",   v: editTargets.manpower,     c:"text-blue-700 dark:text-blue-400"    },
                          { l:"1Hr Target", v: editTargets.oneHourTarget, c:"text-emerald-700 dark:text-emerald-400" },
                          { l:`Daily(${editForm.workingHours}h)`, v: editTargets.dailyTarget, c:"text-violet-700 dark:text-violet-400" },
                        ].map(({ l, v, c }) => (
                          <div key={l} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2">
                            <div className="text-xs text-slate-400">{l}</div>
                            <div className={`text-lg font-black ${c}`}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={editSaving || editUploading}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-black py-3 rounded-xl text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Check size={16} />{editUploading ? "Uploading image..." : editSaving ? "Updating..." : "Update Header"}
                    </button>
                  </form>
                </div>
              )}

              {/* Process Tab */}
              {builderTab === "process" && (
                <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Add Process</p>
                  <LField label="Serial No">
                    <select value={pForm.serialNo} onChange={(e) => setPForm((p) => ({ ...p, serialNo:+e.target.value }))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500">
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
                        className="px-3 py-3 bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-all shrink-0">
                        <Plus size={18} />
                      </button>
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
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-black py-3.5 rounded-xl text-base uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2">
                    <Plus size={18} />{addingProcess ? "Adding..." : pForm.machineType === "HELPER" ? "Add HELPER" : "Select Serial & Add"}
                  </button>
                </div>
              )}

              {/* List Tab */}
              {builderTab === "list" && (
                <div className="flex-1 overflow-y-auto min-h-0 p-4">
                  <p className="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 font-bold">
                    Added Processes ({currentLayout.processes?.length || 0})
                  </p>
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
                                <div className="text-xs font-semibold mb-1" style={{ color: c.accent }}>
                                  {p.machineType} · {p.machines?.map((m) => m.fromFloor).join(", ") || "No machine"}
                                </div>
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
                                })} className="p-1.5 rounded-lg text-amber-600 border border-amber-200 hover:bg-amber-50 transition-all bg-white">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleWasteProcess(p._id, currentLayout.floor)}
                                  className="p-1.5 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-all bg-white">
                                  <X size={14} />
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
            </div>

            {/* Right panel — Layout Grid */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white dark:bg-slate-950">
              <div className="px-4 py-2.5 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Layout</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-base text-slate-700 dark:text-slate-300 font-bold">{currentLayout.style} — {currentLayout.item}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  {[
                    { l:"Buyer", v: currentLayout.buyer, c:"text-blue-700 dark:text-blue-400" },
                    { l:"1Hr",   v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).oneHourTarget, c:"text-emerald-700 dark:text-emerald-400" },
                    { l:"Daily", v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).dailyTarget, c:"text-violet-700 dark:text-violet-400" },
                    { l:"MP",    v: calcTargets(currentLayout.smv, currentLayout.planEfficiency, currentLayout.operator, currentLayout.helper, currentLayout.seamSealing, currentLayout.workingHours).manpower, c:"text-amber-700 dark:text-amber-400" },
                  ].map(({ l, v, c }) => (
                    <span key={l} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
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