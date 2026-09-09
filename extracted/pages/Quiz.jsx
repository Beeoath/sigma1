import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { accentFor, mascotFor } from "../lib/brand";
import { Loader } from "../components/Primitives";
import { MathText } from "../components/MathText";

const fmt = (s) => {
  const m = Math.floor(Math.max(s, 0) / 60);
  const r = Math.max(s, 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export default function Quiz() {
  const { moduleId } = useParams();
  const nav = useNavigate();
  const [state, setState] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  const load = useCallback(async () => {
    const s = await api(`/modules/${moduleId}/quiz/state`);
    setState(s);
    if (s.active_attempt_id) {
      try {
        const a = await api(`/attempts/${s.active_attempt_id}`);
        setAttempt(a);
        setAnswers(a.answers || {});
        setLeft(a.remaining_seconds);
      } catch {
        setAttempt(null);
      }
    }
  }, [moduleId]);

  useEffect(() => {
    load().catch(() => nav(`/app/modul/${moduleId}`));
  }, [load, nav, moduleId]);

  const submit = useCallback(
    async (auto = false) => {
      if (submitting.current || !attempt) return;
      submitting.current = true;
      setBusy(true);
      try {
        const res = await api(`/attempts/${attempt.attempt_id}/submit`, { method: "POST" });
        if (auto) toast.warning("Waktu habis — jawabanmu dikumpulkan otomatis.");
        nav(`/app/hasil/${res.attempt.id}`, { replace: true });
      } catch (e) {
        toast.error(e.message);
        submitting.current = false;
        setBusy(false);
      }
    },
    [attempt, nav]
  );

  useEffect(() => {
    if (!attempt) return;
    const id = setInterval(() => {
      const remaining = Math.round((new Date(attempt.expires_at) - new Date()) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        submit(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [attempt, submit]);

  if (!state) return <Loader label="Memeriksa status kuis..." />;

  const accent = accentFor(1);
  const mascot = mascotFor(1);

  /* ---------- GATE: must review material ---------- */
  if (!attempt && state.must_review_material) {
    return (
      <div className="mx-auto max-w-2xl space-y-8" data-testid="quiz-review-gate">
        <Link to={`/app/modul/${moduleId}`} className="btn-ghost">
          <ArrowLeft size={15} /> Modul
        </Link>
        <div className="rounded-[2rem] border border-sigma-magenta/40 bg-sigma-magenta/10 p-9 text-center">
          <AlertTriangle size={30} className="mx-auto text-sigma-magenta" />
          <h1 className="mt-5 font-display text-2xl font-black text-white">
            Tinjau materi sebelum mencoba lagi
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
            Nilai kuis terakhirmu {state.last_attempt?.score} — masih di bawah 75. Buka kembali
            materi modul ini sampai slide terakhir, lalu kuis akan aktif kembali.
          </p>
          <Link
            to={`/app/modul/${moduleId}/materi`}
            className="btn-sigma btn-magenta mt-8 text-xs"
            data-testid="gate-review-material-button"
          >
            <FileText size={15} /> Review Material
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- ALREADY COMPLETED ---------- */
  if (!attempt && state.module_status === "completed") {
    return (
      <div className="mx-auto max-w-2xl space-y-8" data-testid="quiz-completed-state">
        <Link to={`/app/modul/${moduleId}`} className="btn-ghost">
          <ArrowLeft size={15} /> Modul
        </Link>
        <div className="rounded-[2rem] border border-sigma-emerald/40 bg-sigma-emerald/10 p-9 text-center">
          <CheckCircle2 size={30} className="mx-auto text-sigma-emerald" />
          <h1 className="mt-5 font-display text-2xl font-black text-white">Modul ini sudah selesai</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
            Nilai terakhirmu {state.last_attempt?.score} / 100. Kamu bisa meninjau materi kapan saja.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {state.last_attempt && (
              <Link to={`/app/hasil/${state.last_attempt.id}`} className="btn-sigma text-xs">
                Lihat Hasil
              </Link>
            )}
            <Link to={`/app/modul/${moduleId}/materi`} className="btn-ghost">
              Review Material
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- BRIEFING ---------- */
  if (!attempt) {
    const start = async () => {
      setBusy(true);
      try {
        const a = await api(`/modules/${moduleId}/quiz/start`, { method: "POST" });
        setAttempt(a);
        setAnswers(a.answers || {});
        setLeft(a.remaining_seconds);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setBusy(false);
      }
    };
    return (
      <div className="mx-auto max-w-2xl space-y-8" data-testid="quiz-briefing">
        <Link to={`/app/modul/${moduleId}`} className="btn-ghost">
          <ArrowLeft size={15} /> Modul
        </Link>
        <div className="rounded-[2rem] glass p-8 sm:p-11">
          <div className="flex items-start gap-5">
            <img src={mascot.img} alt="" className="anim-float h-20 w-20 rounded-2xl object-cover" />
            <div>
              <p className="overline-label">Aturan kuis</p>
              <h1 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl">
                {state.quiz.question_count} soal · {state.quiz.time_limit_minutes} menit
              </h1>
            </div>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {[
              `${state.questions_ready} soal pilihan ganda tersedia untuk modul ini.`,
              `Waktu ${state.quiz.time_limit_minutes} menit berjalan sejak kamu menekan mulai dan tetap berjalan meski halaman disegarkan.`,
              "Jawaban dikumpulkan otomatis ketika waktu habis.",
              "Kunci jawaban dan skor hanya muncul setelah kuis dikumpulkan.",
              `Nilai minimal ${state.quiz.passing_score} untuk menyelesaikan modul dan membuka distrik berikutnya.`,
              "Jika nilaimu kurang, kamu wajib meninjau materi sebelum mencoba lagi.",
            ].map((t, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="mono text-sigma-cyan">{String(idx + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          {state.attempt_count > 0 && (
            <p className="mono mt-7 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
              Percobaan sebelumnya: {state.attempt_count}x · nilai terakhir {state.last_attempt?.score}
            </p>
          )}

          <button
            onClick={start}
            disabled={busy || !state.can_start}
            className="btn-sigma btn-yellow mt-9 w-full text-xs"
            data-testid="quiz-begin-button"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
            Mulai Kuis Sekarang
          </button>
        </div>
      </div>
    );
  }

  /* ---------- RUNNER ---------- */
  const answered = Object.keys(answers).length;
  const total = attempt.questions.length;
  const danger = left <= 120;

  const pick = async (questionId, optionId) => {
    setAnswers((a) => ({ ...a, [questionId]: optionId }));
    try {
      await api(`/attempts/${attempt.attempt_id}/answer`, {
        method: "POST",
        body: { question_id: questionId, option_id: optionId },
      });
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-7">
      <div className="sticky top-16 z-30 -mx-4 border-b border-white/10 bg-sigma-deep/95 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="overline-label">Kuis berlangsung</p>
            <p className="mt-1 font-display text-sm font-bold text-white">
              Terjawab{" "}
              <span className="text-sigma-cyan" data-testid="quiz-answered-count">
                {answered} / {total}
              </span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div
              className={`mono flex items-center gap-2 rounded-full px-4 py-2 text-lg font-bold tabular-nums ${
                danger ? "bg-sigma-magenta/15 text-sigma-magenta" : "bg-sigma-cyan/12 text-sigma-cyan"
              }`}
              data-testid="quiz-timer"
              aria-live="polite"
            >
              <Clock size={16} /> {fmt(left)}
            </div>
            <button
              onClick={() => submit(false)}
              disabled={busy}
              className="btn-sigma text-xs"
              data-testid="quiz-submit-button"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Kumpulkan
            </button>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sigma-cyan to-sigma-yellow"
            animate={{ width: `${(answered / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {attempt.questions.map((q, qi) => (
          <div
            key={q.id}
            className="rounded-3xl border border-white/10 bg-sigma-panel/55 p-6 sm:p-8"
            data-testid={`quiz-question-${qi + 1}`}
          >
            <div className="flex gap-4">
              <span
                className="mono grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold"
                style={{ background: `${accent.hex}1f`, color: accent.hex }}
              >
                {qi + 1}
              </span>
              <MathText className="mono flex-1 text-base leading-relaxed text-white">
                {q.question_text}
              </MathText>
            </div>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {q.quiz_options.map((o, oi) => {
                const selected = answers[q.id] === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => pick(q.id, o.id)}
                    data-testid={`quiz-option-${qi + 1}-${oi + 1}`}
                    aria-pressed={selected}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors duration-200 ${
                      selected
                        ? "border-sigma-cyan bg-sigma-cyan/12 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    <span
                      className={`mono grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                        selected ? "bg-sigma-cyan text-sigma-void" : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <MathText as="span" className="mono text-sm">
                      {o.option_text}
                    </MathText>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-sigma-panel/55 p-7 text-center">
        <p className="text-sm text-slate-400">
          Sudah yakin? Umpan balik dan nilai muncul setelah kamu mengumpulkan.
        </p>
        <button
          onClick={() => submit(false)}
          disabled={busy}
          className="btn-sigma btn-yellow mt-5 text-xs"
          data-testid="quiz-submit-bottom-button"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
          Kumpulkan Jawaban
        </button>
      </div>
    </div>
  );
}
