"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { Save, Search, Trash2, X, Image as ImageIcon, Video, Plus, RefreshCw } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useTheme } from "@/app/providers/ThemeProvider";

const buyers = [
  "Decathlon - knit",
  "Decathlon - woven",
  "walmart",
  "Columbia",
  "ZXY",
  "CTC",
  "DIESEL",
  "Sports Group Denmark",
  "Identity",
  "Fifth Avenur",
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const makeEmptyForm = () => ({
  factory: "",
  assigned_building: "",
  buyer: "",
  style: "",
  color_model: "",
  effectiveFrom: todayIso(),
  imageSrc: "",
  videoSrc: "",
});

export default function StyleMediaRegisterPage() {
  const { auth } = useAuth();
  const { theme } = useTheme();

  const [formValues, setFormValues] = useState(makeEmptyForm());
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [listDate, setListDate] = useState(todayIso());

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // file + preview
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagePreview(formValues.imageSrc || "");
  }, [imageFile, formValues.imageSrc]);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setVideoPreview(formValues.videoSrc || "");
  }, [videoFile, formValues.videoSrc]);

  useEffect(() => {
    if (!auth) return;
    if (!auth.factory || !auth.assigned_building) {
      setLoading(false);
      return;
    }
    setFormValues((p) => ({
      ...p,
      factory: auth.factory,
      assigned_building: auth.assigned_building,
    }));
    fetchRecords(auth.factory, auth.assigned_building, listDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.factory, auth?.assigned_building]);

  useEffect(() => {
    if (!auth?.factory || !auth?.assigned_building) return;
    fetchRecords(auth.factory, auth.assigned_building, listDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listDate]);

  const fetchRecords = async (factory, assigned_building, date) => {
    if (!factory || !assigned_building) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ factory, assigned_building });
      if (date) params.set("date", date);
      const res = await fetch(`/api/style-media?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) setRecords(json.data || []);
      else toast.error(json.message || "Failed to load list");
    } catch (err) {
      console.error("fetch style-media error:", err);
      toast.error("Failed to load style media list");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setImageFile(null);
    setVideoFile(null);
    setFormValues({
      ...makeEmptyForm(),
      factory: auth?.factory || "",
      assigned_building: auth?.assigned_building || "",
    });
  };

  const validate = () => {
    const keys = ["factory", "assigned_building", "buyer", "style", "color_model", "effectiveFrom"];
    for (const k of keys) if (!formValues[k]) return false;
    return true;
  };

  const handleSave = async () => {
    if (!auth) return toast.error("Please login.");
    if (saving) return;
    if (!validate()) return toast.error("Please fill required fields.");
    setSaving(true);
    const loadingToastId = toast.loading(editingId ? "Updating..." : "Saving...");
    try {
      const userId = auth._id || auth.id || auth.user?.id || auth.user?._id || "";
      const method = editingId ? "PATCH" : "POST";
      const fd = new FormData();
      fd.append("factory", auth.factory);
      fd.append("assigned_building", auth.assigned_building);
      fd.append("buyer", formValues.buyer);
      fd.append("style", formValues.style);
      fd.append("color_model", (formValues.color_model || "").toUpperCase());
      fd.append("effectiveFrom", formValues.effectiveFrom);
      fd.append("imageSrc", formValues.imageSrc || "");
      fd.append("videoSrc", formValues.videoSrc || "");
      fd.append("userId", userId);
      fd.append("userName", auth.user_name || auth.user?.user_name || "");
      if (editingId) fd.append("id", editingId);
      if (imageFile) fd.append("imageFile", imageFile);
      if (videoFile) fd.append("videoFile", videoFile);
      const res = await fetch("/api/style-media", { method, body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
      toast.success(json.message || "Saved!", { id: loadingToastId });
      await fetchRecords(auth.factory, auth.assigned_building, listDate);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Save failed", { id: loadingToastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (!confirm("Delete this style media?")) return;
    const loadingToastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/style-media?id=${editingId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
      toast.success(json.message || "Deleted", { id: loadingToastId });
      await fetchRecords(auth.factory, auth.assigned_building, listDate);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed", { id: loadingToastId });
    }
  };

  const handleEditClick = (r) => {
    setEditingId(r._id);
    setImageFile(null);
    setVideoFile(null);
    setFormValues({
      factory: r.factory || auth?.factory || "",
      assigned_building: r.assigned_building || auth?.assigned_building || "",
      buyer: r.buyer || "",
      style: r.style || "",
      color_model: r.color_model || "",
      effectiveFrom: r.effectiveFrom || todayIso(),
      imageSrc: r.imageSrc || "",
      videoSrc: r.videoSrc || "",
    });
  };

  // ── Filtered records based on search query ──
  const filteredRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.style || "").toLowerCase().includes(q) ||
      (r.color_model || "").toLowerCase().includes(q) ||
      (r.buyer || "").toLowerCase().includes(q)
    );
  });

  if (!auth) {
    return (
      <section className="max-w-3xl mx-auto mt-12 text-center text-gray-600 dark:text-gray-400">
        Please login to access this page.
      </section>
    );
  }

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-h-[400px] shadow-lg rounded-2xl mt-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-500 dark:text-blue-400" size={28} />
          <span className="text-gray-500 dark:text-gray-400 text-sm">Loading records…</span>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl rounded-2xl mt-0 overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      {/* ── Header ── */}
      <div className="relative flex items-center gap-4 px-5 py-4 overflow-hidden"
        style={{ background: theme === "dark" ? "linear-gradient(135deg, #1a2e4a 0%, #0f1e36 60%, #0a1520 100%)" : "linear-gradient(135deg, #1d4ed8 0%, #1e40af 60%, #1e3a8a 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10 bg-white" />
        <div className="absolute top-2 right-16 w-16 h-16 rounded-full opacity-10 bg-white" />

        <div className="relative w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0">
          <Image src="/HKD_LOGO.png" alt="HKD Logo" width={36} height={36} priority />
        </div>

        <div className="relative">
          <h1 className="text-lg font-bold text-white leading-tight tracking-tight">
            HKD Outdoor Innovations Ltd.
          </h1>
          <p className="text-blue-200 dark:text-blue-300 text-xs mt-0.5">
            Style Media Register &mdash; <span className="text-white font-semibold">{auth.assigned_building}</span>
          </p>
          <p className="text-blue-300 dark:text-blue-200 text-[11px] mt-0.5">
            Factory: <span className="text-blue-100 font-medium">{auth.factory}</span>
            &nbsp;·&nbsp;
            Inputter: <span className="text-blue-100 font-medium">{auth.user_name}</span>
          </p>
        </div>
      </div>

      <div className="px-5 py-5 grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── LEFT: Record List ── */}
        <aside className="lg:col-span-2 flex flex-col gap-3">

          {/* Date filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={listDate}
              onChange={(e) => setListDate(e.target.value)}
              className="h-8 flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-600 px-2 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setListDate(todayIso())}
              className="h-8 text-xs px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 font-medium whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="h-8 text-xs px-3 rounded-lg bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-semibold flex items-center gap-1 shadow-sm whitespace-nowrap"
            >
              <Plus size={13} /> New
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by style, color, buyer…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-xl border border-gray-200 dark:border-gray-600 pl-8 pr-8 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* List count */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Active on {listDate}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {filteredRecords.length} of {records.length} record{records.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Records */}
          <div className="flex-1 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 overflow-hidden">
            {filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400 dark:text-gray-500">
                <Search size={22} className="opacity-40" />
                <p className="text-xs">
                  {records.length === 0 ? "No records for this date." : "No matches found."}
                </p>
              </div>
            ) : (
              <ul className="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-600"
                style={{ maxHeight: "calc(100vh - 320px)", minHeight: "220px" }}>
                {filteredRecords.map((r) => (
                  <li
                    key={r._id}
                    onClick={() => handleEditClick(r)}
                    className={`group px-3 py-2.5 cursor-pointer transition-colors ${
                      editingId === r._id
                        ? "bg-blue-50 dark:bg-blue-900/30 border-l-[3px] border-l-blue-500"
                        : "hover:bg-white dark:hover:bg-gray-600/50 border-l-[3px] border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <span className="font-semibold text-gray-800 dark:text-gray-100 text-xs truncate leading-tight">
                        {highlightMatch(r.style, searchQuery)}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
                        {r.effectiveFrom}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                        {highlightMatch(r.buyer, searchQuery)}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        {highlightMatch(r.color_model, searchQuery)}
                      </span>
                    </div>

                    {(r.imageSrc || r.videoSrc) && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {r.imageSrc && <ImageIcon size={10} className="text-emerald-500 dark:text-emerald-400" />}
                        {r.videoSrc && <Video size={10} className="text-purple-500 dark:text-purple-400" />}
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">media attached</span>
                      </div>
                    )}

                    {!r.effectiveTo && (
                      <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* ── RIGHT: Form ── */}
        <form
          className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm content-start"
          onSubmit={(e) => { e.preventDefault(); handleSave(); }}
        >
          {/* Section label */}
          <div className="md:col-span-2 flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
              {editingId ? "Edit Record" : "New Record"}
            </span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
          </div>

          <Field label="Assigned Building">
            <input
              type="text"
              value={auth.assigned_building || ""}
              disabled
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm"
            />
          </Field>

          <Field label="Factory">
            <input
              type="text"
              value={auth.factory || ""}
              disabled
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm"
            />
          </Field>

          <Field label="Buyer">
            <SearchableDropdown
              options={buyers}
              value={formValues.buyer}
              onChange={(val) => setFormValues({ ...formValues, buyer: val })}
              placeholder="Select buyer"
            />
          </Field>

          <Field label="Effective From">
            <input
              type="date"
              value={formValues.effectiveFrom}
              onChange={(e) => setFormValues({ ...formValues, effectiveFrom: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none text-sm"
            />
          </Field>

          <Field label="Style Number">
            <input
              type="text"
              placeholder="e.g. ST-2024-001"
              value={formValues.style}
              onChange={(e) => setFormValues({ ...formValues, style: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none text-sm"
            />
          </Field>

          <Field label="Color / Model">
            <input
              type="text"
              placeholder="e.g. RED-XL"
              value={formValues.color_model}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, color_model: (e.target.value || "").toUpperCase() }))
              }
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none text-sm uppercase font-mono"
            />
          </Field>

          {/* Media fields */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            {/* Image */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <ImageIcon size={13} className="text-emerald-500 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Image</span>
              </div>
              <input
                type="url"
                placeholder="https://…/image.jpg"
                value={formValues.imageSrc}
                onChange={(e) => {
                  setFormValues({ ...formValues, imageSrc: e.target.value });
                  if (e.target.value) setImageFile(null);
                }}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none"
              />
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Choose file
                </span>
                {imageFile && <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">{imageFile.name}</span>}
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-28 object-cover rounded-lg border border-gray-100 dark:border-gray-600" />
              ) : (
                <div className="w-full h-28 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-700">
                  <ImageIcon size={24} className="text-gray-200 dark:text-gray-600" />
                </div>
              )}
            </div>

            {/* Video */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Video size={13} className="text-purple-500 dark:text-purple-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Video</span>
              </div>
              <input
                type="url"
                placeholder="https://…/video.mp4"
                value={formValues.videoSrc}
                onChange={(e) => {
                  setFormValues({ ...formValues, videoSrc: e.target.value });
                  if (e.target.value) setVideoFile(null);
                }}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none"
              />
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Choose file
                </span>
                {videoFile && <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">{videoFile.name}</span>}
                <input type="file" accept="video/*" className="hidden"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              </label>
              {videoPreview ? (
                <video src={videoPreview} className="w-full h-28 rounded-lg border border-gray-100 dark:border-gray-600 object-cover" controls muted />
              ) : (
                <div className="w-full h-28 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-700">
                  <Video size={24} className="text-gray-200 dark:text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="md:col-span-2 flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
              >
                <Save size={13} />
                {saving ? "Saving…" : editingId ? "Update" : "Save"}
              </button>
            </div>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="text-xs px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 font-medium transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-right text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 tracking-wide font-medium">
        HKD OUTDOOR INNOVATIONS LTD. &copy; {new Date().getFullYear()}
      </div>
    </section>
  );
}

/* ── Highlight matching text ── */
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-200 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ── Field wrapper ── */
function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

/* ── Searchable Dropdown ── */
function SearchableDropdown({ options, value, onChange, placeholder }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          placeholder={placeholder}
          value={query || value}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none text-sm"
        />
        <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 max-h-44 w-full overflow-auto rounded-xl border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-xl text-xs py-1">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <li
                key={opt}
                onMouseDown={() => { onChange(opt); setQuery(opt); setOpen(false); }}
                className={`cursor-pointer px-3 py-2 hover:bg-blue-600 hover:text-white transition-colors ${
                  opt === value ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium" : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-400 dark:text-gray-500 italic">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}