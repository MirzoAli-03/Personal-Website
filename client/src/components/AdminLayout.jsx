import { Outlet, Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
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

const SECTIONS = [
  { label: "Dashboard", to: "/admin" },
  { label: "Posts", to: "/admin/posts" },
  { label: "Projects", to: "/admin/projects" },
  { label: "Images", to: "/admin/images" },
  { label: "Settings", to: "/admin/settings" },
];

export default function AdminLayout() {
  const { mode, toggleMode, logout } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} color="transparent"
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: "wrap" }}>
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
              View site
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={toggleMode} aria-label="Toggle theme">
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <Button variant="outlined" size="small" onClick={handleLogout}>
                Sign out
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
              <Tab key={s.to} label={s.label} value={s.to} component={RouterLink} to={s.to} />
            ))}
          </Tabs>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
