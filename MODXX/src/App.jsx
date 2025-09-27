import ProjectTask from "./pages/ProjectTask";
import ProjectMessagesList from "./pages/ProjectMessagesList";
import ProjectMessages from "./pages/ProjectMessages";
import ApplyJoinSystem from "./pages/ApplyJoinSystem";
import GeminiDreamTeam from "./pages/GeminiDreamTeam";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./pages/navbar";
import Login from "./pages/login";
import SignupPage from "./pages/signup";
import Home from "./components/home";
import Features from "./components/features";
import About from "./components/about";
import ExploreProjects from "./pages/client/explore";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";
import Profile from "./pages/profile";
import UserProfile from "./pages/profile";
import ProjectCreation from "./pages/projectCreate";
import ProjectEdit from "./pages/ProjectEdit";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import ProjectDetails from "./pages/projectDetails";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/explore";

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? "" : "pt-16"}>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreProjects />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/project-messages" element={<ProjectMessagesList />} />
            <Route
              path="/project-messages/:projectId"
              element={<ProjectMessages />}
            />
            <Route
              path="/project/create"
              element={
                <ProtectedRoute>
                  <ProjectCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Public Project Details Route (for exploration) */}
            <Route
              path="/project/public/:projectId"
              element={<ProjectDetails />}
            />
            {/* Protected Project Details Route (for members) */}
            <Route
              path="/project/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:projectId/tasks"
              element={
                <ProtectedRoute>
                  <ProjectTask />
                </ProtectedRoute>
              }
            />

            <Route
              path="/project/:projectId/edit"
              element={
                <ProtectedRoute>
                  <ProjectEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply-join-system"
              element={
                <ProtectedRoute>
                  <ApplyJoinSystem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dream-team-ai"
              element={
                <ProtectedRoute>
                  <GeminiDreamTeam />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
