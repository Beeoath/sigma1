import { useState } from "react";
import { LogOut, Save, ShieldCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { mascotFor } from "../lib/brand";

export default function Profile() {
  const { profile, setProfile, logout } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const mascot = mascotFor(2);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await api("/auth/me", { method: "PUT", body: { full_name: name.trim() } });
      setProfile({ ...profile, full_name: updated.full_name });
      toast.success("Nama diperbarui.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <p className="overline-label">Profil</p>
        <h1 className="mt-3 font-display text-2xl font-black text-white sm:text-4xl">
          {profile?.full_name}
        </h1>
      </header>

      <div className="flex items-center gap-6 rounded-3xl glass p-7">
        <img src={mascot.img} alt="" className="anim-float h-20 w-20 rounded-2xl object-cover" />
        <div className="min-w-0">
          <p className="mono flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.18em] text-sigma-cyan">
            {profile?.role === "teacher" ? <ShieldCheck size={13} /> : <User size={13} />}
            {profile?.role === "teacher" ? "Guru pendamping" : "Siswa Kelas 11"}
          </p>
          <p className="mt-2 truncate text-sm text-slate-300" data-testid="profile-email">
            {profile?.email}
          </p>
          {profile?.classes?.name && (
            <p className="mt-1 text-sm text-slate-400">{profile.classes.name}</p>
          )}
        </div>
      </div>

      <form onSubmit={save} className="rounded-3xl glass p-7" data-testid="profile-form">
        <label htmlFor="pname" className="overline-label mb-3 block">
          Nama lengkap (digunakan di forum diskusi)
        </label>
        <input
          id="pname"
          className="field"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="profile-name-input"
        />
        <button type="submit" disabled={busy} className="btn-sigma mt-5 text-xs" data-testid="profile-save-button">
          <Save size={15} /> Simpan
        </button>
      </form>

      <button
        onClick={() => {
          logout();
          nav("/");
        }}
        className="btn-ghost"
        data-testid="profile-logout-button"
      >
        <LogOut size={15} /> Keluar dari SIGMA
      </button>
    </div>
  );
}
