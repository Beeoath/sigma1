import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FileText, Map, XCircle } from "lucide-react";
import { api } from "../lib/api";
import { mascotFor } from "../lib/brand";
import { Loader, StatTile } from "../components/Primitives";

export default function QuizResult() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api(`/attempts/${attemptId}/result`)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [attemptId]);

  if (err) return <p className="text-slate-300">{err}</p>;
  if (!data) return <Loader label="Menghitung hasil..." />;

  const { attempt, module, total_questions, incorrect_count, passing_score, next_module } = data;
  const passed = attempt.passed;
  const mascot = mascotFor(module?.order_index || 1);
  const color = passed ? "#10B981" : "#FF007A";

  return (
    <div className="mx-auto max-w-3xl space-y-9">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] border p-8 text-center sm:p-12"
        style={{
          borderColor: `${color}55`,
          background: `linear-gradient(160deg, ${color}1c, rgba(11,7,30,0.92))`,
        }}
        data-testid="quiz-result-card"
      >
        <img
          src={mascot.img}
          alt=""
          className="anim-float mx-auto h-24 w-24 rounded-2xl object-cover"
        />
        <p className="overline-label mt-6" style={{ color }}>
          {module?.district_name}
        </p>
        <h1 className="mt-3 font-display text-3xl font-black text-white sm:text-5xl">
          {passed ? "Quiz Completed!" : "Keep Going!"}
        </h1>

        <div className="mt-8">
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mono text-6xl font-bold tabular-nums sm:text-7xl"
            style={{ color }}
            data-testid="result-score"
          >
            {attempt.score}
          </motion.p>
          <p className="mono mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
            dari 100 · batas lulus {passing_score}
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Benar"
            value={`${attempt.correct_count} / ${total_questions}`}
            accent="#10B981"
            testid="result-correct"
          />
          <StatTile
            label="Salah"
            value={incorrect_count}
            accent="#FF007A"
            testid="result-incorrect"
          />
          <StatTile
            label="Status"
            value={passed ? "PASSED" : "FAILED"}
            accent={color}
            testid="result-status"
          />
        </div>

        {attempt.status === "expired" && (
          <p className="mono mt-6 text-xs uppercase tracking-[0.18em] text-sigma-yellow">
            dikumpulkan otomatis karena waktu habis
          </p>
        )}
      </motion.div>

      <div
        className="rounded-3xl border p-7"
        style={{ borderColor: `${color}44`, background: `${color}0f` }}
        data-testid="result-next-step"
      >
        {passed ? (
          <>
            <p className="flex items-center gap-3 font-display text-lg font-bold text-white">
              <CheckCircle2 size={20} style={{ color }} /> Modul {module?.order_index} selesai
            </p>
            <p className="mt-3 text-sm text-slate-300">
              {next_module
                ? `Modul ${next_module.order_index} — ${next_module.title} sekarang terbuka.`
                : "Kamu telah menyelesaikan seluruh distrik SIGMA City. Luar biasa!"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {next_module && (
                <Link
                  to={`/app/modul/${next_module.id}`}
                  className="btn-sigma text-xs"
                  data-testid="result-next-module-button"
                >
                  Buka Modul Berikutnya <ArrowRight size={15} />
                </Link>
              )}
              <Link to="/app" className="btn-ghost">
                <Map size={15} /> Peta SIGMA City
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="flex items-center gap-3 font-display text-lg font-bold text-white">
              <XCircle size={20} style={{ color }} /> Nilai minimal {passing_score} belum tercapai
            </p>
            <p className="mt-3 text-sm text-slate-300">
              Tinjau kembali materi modul ini sebelum mencoba kuis lagi. Kuis akan aktif setelah
              kamu menyelesaikan peninjauan materi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/app/modul/${module?.id}/materi`}
                className="btn-sigma btn-magenta text-xs"
                data-testid="result-review-material-button"
              >
                <FileText size={15} /> Review Material
              </Link>
              <Link to={`/app/modul/${module?.id}/diskusi`} className="btn-ghost">
                Tanya di Diskusi
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
