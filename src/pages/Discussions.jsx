import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, Pin, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { MASCOTS, accentFor } from "../lib/brand";
import { EmptyState, Loader } from "../components/Primitives";
import { Reveal } from "../components/Reveal";

const when = (iso) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Discussions() {
  const { moduleId } = useParams();
  const { profile } = useAuth();
  const isTeacher = profile?.role === "teacher";
  const [threads, setThreads] = useState(null);
  const [module, setModule] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (moduleId) {
      api(`/modules/${moduleId}`).then((d) => setModule(d.module)).catch(() => {});
      api(`/modules/${moduleId}/threads`).then(setThreads).catch(() => setThreads([]));
    } else {
      api("/discussions/recent").then(setThreads).catch(() => setThreads([]));
    }
  };

  useEffect(load, [moduleId]);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/modules/${moduleId}/threads`, { method: "POST", body: form });
      toast.success("Diskusi dibuat.");
      setForm({ title: "", body: "" });
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!threads) return <Loader label="Memuat diskusi..." />;

  const accent = accentFor(module?.order_index || 1);

  return (
    <div className="space-y-8">
      {moduleId ? (
        <Link to={`/app/modul/${moduleId}`} className="btn-ghost" data-testid="discussion-back-button">
          <ArrowLeft size={15} /> Modul
        </Link>
      ) : null}

      <header className="flex flex-wrap items-end gap-5">
        <div className="min-w-0 flex-1">
          <p className="overline-label" style={{ color: accent.hex }}>
            {module ? `Modul ${module.order_index} · ${module.district_name}` : "Semua modul"}
          </p>
          <h1 className="mt-3 font-display text-2xl font-black text-white sm:text-4xl">
            {module ? "Ruang Diskusi" : "Diskusi SIGMA City"}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-400">
            Forum belajar dengan nama asli. Bertanya, menjelaskan, dan saling membantu — jawaban
            terbaik akan disematkan guru.
          </p>
        </div>
        {moduleId && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="btn-sigma btn-magenta text-xs"
            data-testid="new-thread-button"
          >
            <Plus size={15} /> Buat Diskusi
          </button>
        )}
      </header>

      {open && moduleId && (
        <form
          onSubmit={create}
          className="space-y-4 rounded-3xl glass p-7"
          data-testid="new-thread-form"
        >
          <div>
            <label htmlFor="t-title" className="overline-label mb-2 block">
              Judul pertanyaan
            </label>
            <input
              id="t-title"
              className="field"
              required
              minLength={3}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Kenapa diskriminan negatif tidak punya akar real?"
              data-testid="thread-title-input"
            />
          </div>
          <div>
            <label htmlFor="t-body" className="overline-label mb-2 block">
              Penjelasan
            </label>
            <textarea
              id="t-body"
              className="field min-h-32"
              required
              minLength={3}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Tuliskan soal atau bagian materi yang membuatmu bingung."
              data-testid="thread-body-input"
            />
            <p className="mono mt-2 text-[0.64rem] text-slate-500">
              Tulis rumus di antara $...$ — contoh: $\sqrt{"{b^2-4ac}"}$
            </p>
          </div>
          <button type="submit" disabled={busy} className="btn-sigma text-xs" data-testid="thread-submit-button">
            <Send size={15} /> Kirim
          </button>
        </form>
      )}

      {threads.length === 0 ? (
        <EmptyState
          testid="discussion-empty-state"
          mascot={MASCOTS.gamma.img}
          title="Belum ada diskusi di sini"
          body={
            moduleId
              ? "Jadilah yang pertama bertanya. Pertanyaanmu mungkin juga menjadi pertanyaan temanmu."
              : "Diskusi akan muncul di sini setelah ada yang membuka topik di salah satu modul."
          }
        />
      ) : (
        <div className="space-y-4">
          {threads.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <Link
                to={`/app/discussions/${t.id}`}
                data-testid={`thread-card-${i + 1}`}
                className="group block rounded-3xl border border-white/10 bg-sigma-panel/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sigma-magenta/50"
              >
                <div className="flex flex-wrap items-center gap-3">
                  {t.modules && (
                    <span className="mono rounded-full bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-slate-400">
                      Modul {t.modules.order_index}
                    </span>
                  )}
                  {t.has_pinned && (
                    <span className="mono inline-flex items-center gap-1.5 rounded-full bg-sigma-yellow/15 px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-sigma-yellow">
                      <Pin size={10} /> ada jawaban disematkan
                    </span>
                  )}
                  <span className="mono ml-auto text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                    {when(t.created_at)}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-white transition-colors group-hover:text-sigma-magenta">
                  {t.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{t.body}</p>
                <div className="mt-5 flex items-center gap-4 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {t.author?.full_name || "Anonim"}
                    {t.author?.role === "teacher" && (
                      <span className="mono ml-2 rounded bg-sigma-cyan/15 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-sigma-cyan">
                        guru
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare size={13} /> {t.reply_count} balasan
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {isTeacher && (
        <p className="mono text-xs uppercase tracking-[0.16em] text-slate-500">
          Gunakan halaman Moderasi untuk menyematkan jawaban terbaik.
        </p>
      )}
    </div>
  );
}
