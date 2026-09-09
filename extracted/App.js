import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { SigmaBackground } from "@/components/SigmaBackground";
import { Loader } from "@/components/Primitives";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Journey from "@/pages/Journey";
import ModuleDetail from "@/pages/ModuleDetail";
import Material from "@/pages/Material";
import Quiz from "@/pages/Quiz";
import QuizResult from "@/pages/QuizResult";
import Discussions from "@/pages/Discussions";
import ThreadDetail from "@/pages/ThreadDetail";
import StudentDashboard from "@/pages/StudentDashboard";
import Profile from "@/pages/Profile";
import TeacherDashboard from "@/pages/TeacherDashboard";
import TeacherModeration from "@/pages/TeacherModeration";
import TeacherContent from "@/pages/TeacherContent";

const Protected = ({ children, role }) => {
  const { profile, loading } = useAuth();
  if (loading) return <Loader label="Memverifikasi sesi..." />;
  if (!profile) return <Navigate to="/masuk" replace />;
  if (role && profile.role !== role)
    return <Navigate to={profile.role === "teacher" ? "/teacher" : "/app"} replace />;
  return (
    <>
      <SigmaBackground density={26} glyphs={10} />
      <AppShell>{children}</AppShell>
    </>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/masuk" element={<Login />} />

            <Route path="/app" element={<Protected role="student"><Journey /></Protected>} />
            <Route path="/app/dashboard" element={<Protected role="student"><StudentDashboard /></Protected>} />
            <Route path="/app/discussions" element={<Protected><Discussions /></Protected>} />
            <Route path="/app/discussions/:threadId" element={<Protected><ThreadDetail /></Protected>} />
            <Route path="/app/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/app/modul/:moduleId" element={<Protected role="student"><ModuleDetail /></Protected>} />
            <Route path="/app/modul/:moduleId/materi" element={<Protected><Material /></Protected>} />
            <Route path="/app/modul/:moduleId/kuis" element={<Protected role="student"><Quiz /></Protected>} />
            <Route path="/app/modul/:moduleId/diskusi" element={<Protected><Discussions /></Protected>} />
            <Route path="/app/hasil/:attemptId" element={<Protected role="student"><QuizResult /></Protected>} />

            <Route path="/teacher" element={<Protected role="teacher"><TeacherDashboard /></Protected>} />
            <Route path="/teacher/moderation" element={<Protected role="teacher"><TeacherModeration /></Protected>} />
            <Route path="/teacher/content" element={<Protected role="teacher"><TeacherContent /></Protected>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: "#140D36",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
