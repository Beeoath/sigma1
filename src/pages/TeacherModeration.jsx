import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Pin, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { MASCOTS } from "../lib/brand";
import { EmptyState, Loader } from "../components/Primitives";
import { Reveal } from "../components/Reveal";

const when = (iso) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function TeacherModeration() {
  const [threads, setThreads] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api("/discussions/recent").then(setThreads).catch(() => setThreads([]));
  }, []);

  if (!threads) return <Loader label="Memuat forum kelas..." />;

  const shown =
    filter === "unpinned" ? threads.filter((t) => !t.has_pinned && t.reply_count > 0) : threads;

  return (
    <div className="space-y-8">
      <header>
        <p className="overline-label">Moderasi diskusi</p>
        <h1 className="mt-3 font-display text-2xl font-black text-white sm:text-4xl">
          Forum seluruh modul
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          Balas pertanyaan siswa, sematkan jawaban paling membantu, dan hapus balasan yang tidak
          sesuai. Semua tindakan dilakukan manual.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "Semua diskusi" },
          { id: "unpinned", label: "Belum ada sematan" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            data-testid={`moderation-filter-${f.id}`}
            className={`rounded-full px-4 py-2 font-display text-[0.68rem] font-bold uppercase tracking-[0.09em] transition-colors ${
              filter === f.id
                ? "bg-sigma-cyan/15 text-sigma-cyan"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          testid="moderation-empty-state"
          mascot={MASCOTS.beta.img}
          title="Tidak ada diskusi pada filter ini"
          body="Forum akan terisi ketika siswa mulai membuka topik pada modul mereka."
        />
      ) : (
        <div className="space-y-4">
          {shown.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <Link
                to={`/app/discussions/${t.id}`}
                data-testid={`moderation-thread-${i + 1}`}
                className="group block rounded-3xl border border-white/10 bg-sigma-panel/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sigma-cyan/50"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="mono rounded-full bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-slate-400">
                    Modul {t.modules?.order_index} · {t.modules?.district_name}
                  </span>
                  {t.has_pinned ? (
                    <span className="mono inline-flex items-center gap-1.5 rounded-full bg-sigma-yellow/15 px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-sigma-yellow">
                      <Pin size={10} /> sudah disematkan
                    </span>
                  ) : (
                    <span className="mono inline-flex items-center gap-1.5 rounded-full bg-sigma-magenta/15 px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-sigma-magenta">
                      <ShieldCheck size={10} /> perlu ditinjau
                    </span>
                  )}
                  <span className="mono ml-auto text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                    {when(t.created_at)}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-white transition-colors group-hover:text-sigma-cyan">
                  {t.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{t.body}</p>
                <div className="mt-5 flex items-center gap-4 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{t.author?.full_name}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare size={13} /> {t.reply_count} balasan
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
