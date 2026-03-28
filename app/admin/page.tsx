"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, GraduationCap, Wifi, Utensils, Building2, ShieldCheck,
  FlaskConical, Bus, CheckCircle2, Clock3, XCircle, MessageSquare,
  Hash, CalendarDays, RefreshCw, AlertCircle, ChevronLeft,
  Send, Inbox, Users, TrendingUp, ShieldAlert, X, Trash2,
} from "lucide-react";

type StatusType = "menunggu" | "diterima" | "ditolak";

interface Feedback {
  id: string; kategori: string; nama: string; nim: string;
  judul: string; deskripsi: string; status: StatusType;
  createdAt: string; balasan?: string | null;
}

const KATEGORI_LIST = [
  { value: "akademik",     label: "Akademik",              icon: GraduationCap, color: "#3b82f6" },
  { value: "perpustakaan", label: "Perpustakaan",          icon: BookOpen,      color: "#8b5cf6" },
  { value: "internet",     label: "Internet & Teknologi",  icon: Wifi,          color: "#06b6d4" },
  { value: "kantin",       label: "Kantin & Konsumsi",     icon: Utensils,      color: "#f97316" },
  { value: "gedung",       label: "Gedung & Ruang Kelas",  icon: Building2,     color: "#64748b" },
  { value: "keamanan",     label: "Keamanan & Ketertiban", icon: ShieldCheck,   color: "#ef4444" },
  { value: "laboratorium", label: "Laboratorium",          icon: FlaskConical,  color: "#10b981" },
  { value: "transportasi", label: "Transportasi & Parkir", icon: Bus,           color: "#f59e0b" },
];

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  menunggu: { label: "Menunggu", color: "#b45309", bg: "#fef3c7", border: "#fcd34d", icon: Clock3 },
  diterima: { label: "Diterima", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", icon: CheckCircle2 },
  ditolak:  { label: "Ditolak",  color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", icon: XCircle },
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function getKategori(value: string) { return KATEGORI_LIST.find((k) => k.value === value) ?? KATEGORI_LIST[0]; }

function StatusBadge({ status }: { status: StatusType }) {
  const cfg = STATUS_CONFIG[status]; const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <Icon size={11} />{cfg.label}
    </span>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({ fb, onClose, onUpdate }: {
  fb: Feedback;
  onClose: () => void;
  onUpdate: (id: string, status: StatusType, balasan: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<StatusType>(fb.status);
  const [balasan, setBalasan] = useState(fb.balasan ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const kat = getKategori(fb.kategori);
  const KatIcon = kat.icon;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(fb.id, status, balasan);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,27,45,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: kat.color + "18", color: kat.color }}>
              <KatIcon size={16} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{kat.label}</p>
              <h3 className="font-semibold text-slate-800 text-sm">{fb.judul}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Info pelapor */}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Nama", value: fb.nama }, { label: "NIM", value: fb.nim },
              { label: "ID Aduan", value: fb.id.slice(0,8).toUpperCase() }, { label: "Tanggal", value: formatTanggal(fb.createdAt) }
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-medium text-slate-700">{value}</p>
              </div>
            ))}
          </div>

          {/* Deskripsi */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Deskripsi Aduan</p>
            <p className="text-sm text-slate-700 leading-relaxed">{fb.deskripsi}</p>
          </div>

          {/* Ubah Status */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ubah Status</p>
            <div className="grid grid-cols-3 gap-2">
              {(["menunggu", "diterima", "ditolak"] as StatusType[]).map((s) => {
                const cfg = STATUS_CONFIG[s]; const Icon = cfg.icon; const sel = status === s;
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all"
                    style={{
                      borderColor: sel ? cfg.color : "#e2e8f0",
                      backgroundColor: sel ? cfg.bg : "white",
                      color: sel ? cfg.color : "#94a3b8",
                    }}>
                    <Icon size={18} />{cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balasan */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              {status === "diterima" ? "Balasan / Tindak Lanjut" : status === "ditolak" ? "Alasan Penolakan" : "Catatan (opsional)"}
            </label>
            <textarea value={balasan} onChange={(e) => setBalasan(e.target.value)} rows={4}
              placeholder={status === "diterima" ? "Jelaskan tindak lanjut yang akan/sudah dilakukan..."
                : status === "ditolak" ? "Jelaskan alasan penolakan aduan ini..."
                : "Tambahkan catatan jika diperlukan..."}
              className="w-full px-3 py-2.5 rounded-xl border text-sm transition-all outline-none resize-none"
              style={{ borderColor: "#e2e8f0" }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: saved ? "#10b981" : "#0f1b2d", color: "white" }}>
            {saving ? <RefreshCw size={15} className="animate-spin" />
              : saved ? <CheckCircle2 size={15} />
              : <Send size={15} />}
            {saving ? "Menyimpan..." : saved ? "Tersimpan!" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/feedback");
      if (!res.ok) throw new Error();
      setFeedbacks(await res.json());
    } catch { setError("Gagal memuat data. Periksa koneksi database."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const handleUpdate = async (id: string, status: StatusType, balasan: string) => {
    const res = await fetch(`/api/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, balasan }),
    });
    if (!res.ok) throw new Error();
    const updated: Feedback = await res.json();
    setFeedbacks((prev) => prev.map((f) => f.id === id ? updated : f));
    setSelected(updated);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    setDeleteConfirm(null);
    if (selected?.id === id) setSelected(null);
  };

  const stats = {
    total: feedbacks.length,
    menunggu: feedbacks.filter((f) => f.status === "menunggu").length,
    diterima: feedbacks.filter((f) => f.status === "diterima").length,
    ditolak:  feedbacks.filter((f) => f.status === "ditolak").length,
  };

  const filtered = feedbacks.filter((f) => filterStatus === "semua" || f.status === filterStatus);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f2f5" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#0f1b2d" }} className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs">
              <ChevronLeft size={14} />Kembali ke Portal
            </a>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0d9488" }}>
                <ShieldAlert size={15} className="text-white" />
              </div>
              <span className="text-white font-semibold text-sm serif">Admin Panel</span>
            </div>
          </div>
          <button onClick={fetchFeedbacks} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <RefreshCw size={12} />Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Aduan",    value: stats.total,    color: "#0f1b2d", bg: "#fff", icon: Users },
            { label: "Menunggu",       value: stats.menunggu, color: "#b45309", bg: "#fef3c7", icon: Clock3 },
            { label: "Diterima",       value: stats.diterima, color: "#065f46", bg: "#d1fae5", icon: CheckCircle2 },
            { label: "Ditolak",        value: stats.ditolak,  color: "#991b1b", bg: "#fee2e2", icon: XCircle },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-4 shadow-sm border border-slate-100" style={{ backgroundColor: bg }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</p>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="text-3xl font-bold serif" style={{ color }}>{value}</p>
              {stats.total > 0 && (
                <div className="mt-2 h-1 rounded-full bg-black/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(value / stats.total) * 100}%`, backgroundColor: color }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-slate-400" />
          <div className="flex items-center gap-2">
            {(["semua", "menunggu", "diterima", "ditolak"] as const).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={filterStatus === s
                  ? { backgroundColor: "#0f1b2d", color: "white" }
                  : { backgroundColor: "white", color: "#64748b", border: "1px solid #e2e8f0" }}>
                {s === "semua" ? `Semua (${stats.total})` : `${STATUS_CONFIG[s as StatusType].label} (${feedbacks.filter(f => f.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 mb-4 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Inbox size={40} className="text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm">Tidak ada aduan</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* Table head */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50">
                <p className="col-span-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ID</p>
                <p className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aduan</p>
                <p className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pelapor</p>
                <p className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kategori</p>
                <p className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal</p>
                <p className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
              </div>

              {filtered.map((fb) => {
                const kat = getKategori(fb.kategori); const KatIcon = kat.icon;
                return (
                  <div key={fb.id}
                    className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group items-center"
                    onClick={() => setSelected(fb)}>
                    {/* ID */}
                    <div className="col-span-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                        <Hash size={10} />{fb.id.slice(0,6).toUpperCase()}
                      </span>
                    </div>
                    {/* Judul */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-700 transition-colors">{fb.judul}</p>
                      <p className="text-xs text-slate-400 truncate">{fb.deskripsi.slice(0, 50)}...</p>
                    </div>
                    {/* Pelapor */}
                    <div className="col-span-2 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{fb.nama}</p>
                      <p className="text-xs text-slate-400">{fb.nim}</p>
                    </div>
                    {/* Kategori */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: kat.color + "15", color: kat.color }}>
                        <KatIcon size={11} />{kat.label}
                      </span>
                    </div>
                    {/* Tanggal */}
                    <div className="col-span-2">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <CalendarDays size={11} />{formatTanggal(fb.createdAt)}
                      </span>
                    </div>
                    {/* Status + Actions */}
                    <div className="col-span-2 flex items-center gap-2">
                      <StatusBadge status={fb.status} />
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(fb.id); }}
                        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 text-slate-300 hover:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <MessageSquare size={13} className="text-slate-400" />
          <p className="text-xs text-slate-400">Klik pada baris untuk mengubah status dan menambahkan balasan</p>
        </div>
      </main>

      {/* Detail Panel Modal */}
      {selected && (
        <DetailPanel
          fb={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,27,45,0.6)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fade-up">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: "#fee2e2" }}>
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="serif text-lg text-slate-800 text-center mb-2">Hapus Aduan?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Tindakan ini tidak dapat dibatalkan. Data aduan akan dihapus permanen dari database.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#ef4444" }}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
