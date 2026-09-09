import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "../lib/auth";

const STUDENT_LINKS = [
  { to: "/app", label: "Journey", icon: Map, testid: "nav-journey" },
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/app/discussions", label: "Diskusi", icon: MessageSquare, testid: "nav-discussions" },
  { to: "/app/profile", label: "Profil", icon: User, testid: "nav-profile" },
];

const TEACHER_LINKS = [
  { to: "/teacher", label: "Dashboard", icon: LayoutDashboard, testid: "nav-teacher-dashboard" },
  { to: "/teacher/moderation", label: "Moderasi", icon: ShieldCheck, testid: "nav-teacher-moderation" },
  { to: "/teacher/content", label: "Konten", icon: BookOpen, testid: "nav-teacher-content" },
  { to: "/app/profile", label: "Profil", icon: User, testid: "nav-profile" },
];

export const AppShell = ({ children }) => {
  const { profile, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isTeacher = profile?.role === "teacher";
  const links = isTeacher ? TEACHER_LINKS : STUDENT_LINKS;

  const active = (to) =>
    to === "/app" || to === "/teacher" ? pathname === to : pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to={isTeacher ? "/teacher" : "/app"} className="group flex items-center gap-3" data-testid="nav-logo">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sigma-cyan font-display text-lg font-black text-sigma-void transition-transform duration-300 group-hover:rotate-[-8deg]">
              Σ
            </span>
            <span className="leading-none">
              <span className="block font-display text-[0.6rem] font-bold tracking-[0.3em] text-sigma-cyan">
                MATEMATIKA
              </span>
              <span className="block font-display text-base font-black tracking-tight text-white">
                SIGMA
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                data-testid={l.testid}
                className={`rounded-full px-4 py-2 font-display text-[0.7rem] font-bold uppercase tracking-[0.09em] transition-colors duration-200 ${
                  active(l.to)
                    ? "bg-sigma-cyan/15 text-sigma-cyan"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:ml-4">
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-sm font-semibold text-white">{profile?.full_name}</span>
              <span className="overline-label">{isTeacher ? "Guru" : "Siswa Kelas 11"}</span>
            </span>
            <button
              onClick={handleLogout}
              data-testid="logout-button"
              aria-label="Keluar"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-slate-300 transition-colors duration-200 hover:border-sigma-magenta hover:text-sigma-magenta"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-16">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 md:hidden">
        <div className="flex items-stretch">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`${l.testid}-mobile`}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[0.62rem] font-bold uppercase tracking-wider transition-colors duration-200 ${
                  active(l.to) ? "text-sigma-cyan" : "text-slate-400"
                }`}
              >
                <Icon size={19} />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
