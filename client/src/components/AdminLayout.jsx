import { Outlet, Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useApp } from "../context/AppContext";
import LanguageSwitcher from "./LanguageSwitcher";
import MeshBackground from "./MeshBackground";
import ProfileModal from "./ProfileModal";
import { useScrolled } from "../hooks/useScrolled";

const SECTIONS = [
  { key: "admin.dashboard", to: "/admin" },
  { key: "admin.posts", to: "/admin/posts" },
  { key: "admin.projects", to: "/admin/projects" },
  { key: "admin.images", to: "/admin/images" },
  { key: "admin.settings", to: "/admin/settings" },
];

export default function AdminLayout() {
  const { mode, toggleMode, logout, t, settings } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [profileOpen, setProfileOpen] = useState(false);

  // Transparent until content scrolls beneath, matching the public header.
  const scrolled = useScrolled();

  // Longest matching prefix, so /admin/posts/3/edit still selects "Posts"
  // rather than falling back to the "/admin" index.
  const current =
    SECTIONS.map((s) => s.to)
      .filter((to) => (to === "/admin" ? pathname === "/admin" : pathname.startsWith(to)))
      .sort((a, b) => b.length - a.length)[0] || "/admin";

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <MeshBackground subtle />
      {/* Own stacking context so the panel sits above the mesh. */}
      <Box sx={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          bgcolor: (th) =>
            scrolled
              ? th.palette.mode === "dark"
                ? "rgba(17,18,20,.78)"
                : "rgba(255,255,255,.78)"
              : "transparent",
          backdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
          borderBottom: 1,
          borderColor: scrolled ? "divider" : "transparent",
          transition: "background-color .25s ease, border-color .25s ease",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: "wrap" }}>
            <Tooltip title={settings?.full_name || ""}>
              <IconButton
                onClick={() => setProfileOpen(true)}
                size="small"
                aria-label={settings?.full_name || "Profile"}
                sx={{ p: 0.25 }}
              >
                <Avatar
                  src={
                    settings?.avatar_image_id ? `/images/${settings.avatar_image_id}` : undefined
                  }
                  alt=""
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: ".9rem",
                    border: 2,
                    borderColor: "transparent",
                    transition: "border-color .15s ease",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  {settings?.full_name?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Admin
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              target="_blank"
              size="small"
              endIcon={<OpenInNewIcon fontSize="small" />}
            >
              {t("admin.viewSite")}
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <LanguageSwitcher size="small" />
              <IconButton onClick={toggleMode} aria-label={t("nav.toggleTheme")}>
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <Button variant="outlined" size="small" onClick={handleLogout}>
                {t("admin.signOut")}
              </Button>
            </Stack>
          </Toolbar>

          <Tabs
            value={current}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {SECTIONS.map((s) => (
              <Tab key={s.to} label={t(s.key)} value={s.to} component={RouterLink} to={s.to} />
            ))}
          </Tabs>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
      </Box>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </Box>
  );
}
