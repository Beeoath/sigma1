import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { MASCOTS } from "../lib/brand";
import { SigmaBackground } from "../components/SigmaBackground";

export default function Login() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "daftar" ? "daftar" : "masuk");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const { profile, login, register } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (profile) nav(profile.role === "teacher" ? "/teacher" : "/app", { replace: true });
  }, [profile, nav]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const me =
        mode === "masuk"
          ? await login(form.email.trim(), form.password)
          : await register(form.full_name.trim(), form.email.trim(), form.password);
      toast.success(`Selamat datang, ${me.full_name}!`);
      nav(me.role === "teacher" ? "/teacher" : "/app", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <SigmaBackground density={30} glyphs={12} />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2">
        <div className="hidden lg:block">
          <Link to="/" className="btn-ghost mb-10" data-testid="back-home-link">
            <ArrowLeft size={16} /> Beranda
          </Link>
          <p className="poster-sub text-xs tracking-[0.5em]">MATEMATIKA</p>
          <h1 className="poster-title mt-2 text-[7rem] leading-[0.8]">SIGMA</h1>
          <p className="poster-sub mt-2 text-3xl">KELAS 11</p>
          <p className="mt-1 font-display text-xl font-extrabold text-white">MA DARUNNAJAH 9</p>
          <p className="mt-8 max-w-md text-sm text-slate-400">
            Masuk untuk melanjutkan perjalananmu menembus lima distrik SIGMA City dan bersiap
            menghadapi TKA.
          </p>
          <img
            src={MASCOTS.beta.img}
            alt=""
            className="anim-float mt-10 w-44 rounded-[1.8rem] object-cover shadow-[0_30px_70px_-25px_rgba(255,0,122,0.6)]"
          />
        </div>

        <div className="rounded-[2rem] glass p-7 sm:p-10">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-xs text-slate-400 lg:hidden">
            <ArrowLeft size={14} /> Beranda
          </Link>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-sigma-cyan font-display text-xl font-black text-sigma-void">
            Σ
          </span>
          <h2 className="mt-5 font-display text-2xl font-black text-white">
            {mode === "masuk" ? "Masuk ke SIGMA" : "Daftar akun siswa"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "masuk"
              ? "Gunakan email dan password yang terdaftar."
              : "Akun baru otomatis terdaftar sebagai siswa Kelas 11."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="auth-form">
            {mode === "daftar" && (
              <div>
                <label htmlFor="full_name" className="overline-label mb-2 block">
                  Nama lengkap
                </label>
                <input
                  id="full_name"
                  className="field"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Nama sesuai absen kelas"
                  value={form.full_name}
                  onChange={set("full_name")}
                  data-testid="register-fullname-input"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="overline-label mb-2 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field"
                required
                autoComplete="email"
                placeholder="nama@sekolah.id"
                value={form.email}
                onChange={set("email")}
                data-testid="auth-email-input"
              />
            </div>
            <div>
              <label htmlFor="password" className="overline-label mb-2 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field"
                required
                minLength={6}
                autoComplete={mode === "masuk" ? "current-password" : "new-password"}
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={set("password")}
                data-testid="auth-password-input"
              />
            </div>

            <button type="submit" disabled={busy} className="btn-sigma w-full" data-testid="auth-submit-button">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
              {mode === "masuk" ? "Masuk" : "Buat akun"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "masuk" ? "daftar" : "masuk")}
            className="mt-6 w-full text-center text-sm text-slate-400 transition-colors hover:text-sigma-cyan"
            data-testid="auth-toggle-mode"
          >
            {mode === "masuk" ? "Belum punya akun? Daftar di sini" : "Sudah punya akun? Masuk"}
          </button>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-sigma-void/50 p-4">
            <GraduationCap size={18} className="mt-0.5 shrink-0 text-sigma-yellow" />
            <p className="text-xs leading-relaxed text-slate-400">
              Akun guru dibuat oleh pengelola kelas. Hubungi pendamping UNPAM jika kamu seorang
              pengajar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
