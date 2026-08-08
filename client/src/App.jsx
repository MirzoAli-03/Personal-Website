import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useApp } from "./context/AppContext";
import PublicLayout from "./components/PublicLayout";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Blog from "./pages/Blog";
import Post from "./pages/Post";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// The admin panel is loaded on demand — visitors reading the blog should not
// download the editor, tables, and dialogs they can never reach.
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminPosts = lazy(() => import("./pages/admin/AdminPosts"));
const PostForm = lazy(() => import("./pages/admin/PostForm"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const ProjectForm = lazy(() => import("./pages/admin/ProjectForm"));
const Images = lazy(() => import("./pages/admin/Images"));
const Settings = lazy(() => import("./pages/admin/Settings"));

function Fallback() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  const { ready } = useApp();

  // Routing waits for the session check so a refresh on an admin URL doesn't
  // flash the login screen before the cookie is verified.
  if (!ready) return <Fallback />;

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<PostForm />} />
        <Route path="posts/:id/edit" element={<PostForm />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id/edit" element={<ProjectForm />} />
        <Route path="images" element={<Images />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Post />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      </Routes>
    </Suspense>
  );
}
