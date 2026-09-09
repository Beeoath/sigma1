import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUp, Pin, PinOff, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Loader } from "../components/Primitives";
import { MathText } from "../components/MathText";

const when = (iso) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ThreadDetail() {
  const { threadId } = useParams();
  const { profile } = useAuth();
  const isTeacher = profile?.role === "teacher";
  const [data, setData] = useState(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api(`/threads/${threadId}`).then(setData).catch(() => setData({ thread: null, replies: [] }));
  }, [threadId]);

  useEffect(load, [load]);

  if (!data) return <Loader label="Memuat diskusi..." />;
  if (!data.thread) return <p className="text-slate-300">Diskusi tidak ditemukan.</p>;

  const { thread, replies } = data;

  const reply = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/threads/${threadId}/replies`, { method: "POST", body: { body } });
      setBody("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const upvote = async (id) => {
    try {
      await api(`/replies/${id}/upvote`, { method: "POST" });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pin = async (id, pinned) => {
    try {
      await api(`/replies/${id}/pin`, { method: "POST", body: { pinned } });
      toast.success(pinned ? "Jawaban disematkan." : "Sematan dilepas.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/replies/${id}`, { method: "DELETE" });
      toast.success("Balasan dihapus.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <Link to="/app/discussions" className="btn-ghost" data-testid="thread-back-button">
        <ArrowLeft size={15} /> Semua diskusi
      </Link>

      <article className="rounded-3xl glass p-7 sm:p-9" data-testid="thread-detail">
        <h1 className="font-display text-2xl font-black leading-snug text-white sm:text-3xl">
          <MathText as="span">{thread.title}</MathText>
        </h1>
        <MathText className="mt-4 text-sm leading-relaxed text-slate-300">{thread.body}</MathText>
        <p className="mono mt-6 text-[0.64rem] uppercase tracking-[0.16em] text-slate-500">
          {thread.author?.full_name} · {when(thread.created_at)}
        </p>
      </article>

      <section className="space-y-4">
        <p className="overline-label" data-testid="reply-count">
          {replies.length} balasan
        </p>
        {replies.map((r, i) => (
          <div
            key={r.id}
            data-testid={`reply-card-${i + 1}`}
            className={`rounded-3xl border p-6 transition-colors duration-300 ${
              r.is_pinned
                ? "border-sigma-yellow/60 bg-sigma-yellow/[0.07]"
                : "border-white/10 bg-sigma-panel/50"
            }`}
          >
            {r.is_pinned && (
              <p className="mono mb-3 inline-flex items-center gap-1.5 rounded-full bg-sigma-yellow/18 px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-sigma-yellow">
                <Pin size={10} /> jawaban disematkan guru
              </p>
            )}
            <MathText className="text-sm leading-relaxed text-slate-200">{r.body}</MathText>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">
                {r.author?.full_name}
                {r.author?.role === "teacher" && (
                  <span className="mono ml-2 rounded bg-sigma-cyan/15 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-sigma-cyan">
                    guru
                  </span>
                )}
              </span>
              <span className="mono text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                {when(r.created_at)}
              </span>

              <div className="ml-auto flex items-center gap-2">
                {!isTeacher && (
                  <button
                    onClick={() => upvote(r.id)}
                    data-testid={`reply-upvote-${i + 1}`}
                    aria-pressed={r.upvoted_by_me}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors duration-200 ${
                      r.upvoted_by_me
                        ? "border-sigma-cyan bg-sigma-cyan/15 text-sigma-cyan"
                        : "border-white/15 text-slate-400 hover:border-sigma-cyan/60 hover:text-sigma-cyan"
                    }`}
                  >
                    <ArrowUp size={13} /> {r.upvotes}
                  </button>
                )}
                {isTeacher && (
                  <>
                    <span className="mono text-xs text-slate-400">{r.upvotes} suara</span>
                    <button
                      onClick={() => pin(r.id, !r.is_pinned)}
                      data-testid={`reply-pin-${i + 1}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-sigma-yellow hover:text-sigma-yellow"
                    >
                      {r.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
                      {r.is_pinned ? "Lepas" : "Sematkan"}
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      data-testid={`reply-delete-${i + 1}`}
                      aria-label="Hapus balasan"
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-slate-400 transition-colors hover:border-sigma-magenta hover:text-sigma-magenta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      <form onSubmit={reply} className="rounded-3xl glass p-6" data-testid="reply-form">
        <label htmlFor="reply-body" className="overline-label mb-3 block">
          Tulis balasan sebagai {profile?.full_name}
        </label>
        <textarea
          id="reply-body"
          className="field min-h-28"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Bantu jelaskan dengan langkah-langkah yang runtut."
          data-testid="reply-body-input"
        />
        <p className="mono mt-2 text-[0.64rem] text-slate-500">
          Tulis rumus di antara $...$ — contoh: $x^2 + 2x - 3 = 0$
        </p>
        <button type="submit" disabled={busy} className="btn-sigma mt-4 text-xs" data-testid="reply-submit-button">
          <Send size={15} /> Kirim Balasan
        </button>
      </form>
    </div>
  );
}
