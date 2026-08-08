import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
  Link,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

import { useApp } from "../context/AppContext";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export default function PublicLayout() {
  const { settings, mode, toggleMode, user } = useApp();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const socials = [
    ["GitHub", settings?.github_url],
    ["LinkedIn", settings?.linkedin_url],
    ["Twitter", settings?.twitter_url],
  ].filter(([, url]) => Boolean(url));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: "saturate(180%) blur(12px)",
          bgcolor: (t) =>
            t.palette.mode === "dark" ? "rgba(17,17,20,.85)" : "rgba(255,255,255,.85)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Typography
              component={RouterLink}
              to="/"
              variant="h6"
              sx={{ textDecoration: "none", color: "text.primary", flexGrow: 1 }}
            >
              {settings?.full_name || "Personal Website"}
            </Typography>

            {!isMobile && (
              <Stack direction="row" spacing={1}>
                {NAV.map((item) => (
                  <Button
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    sx={{
                      color: isActive(item.to) ? "primary.main" : "text.secondary",
                      fontWeight: isActive(item.to) ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            )}

            <IconButton onClick={toggleMode} aria-label="Toggle theme">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 220 }}>
          {NAV.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={isActive(item.to)}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} {settings?.full_name || ""}. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={2}>
              {socials.map(([label, url]) => (
                <Link
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  {label}
                </Link>
              ))}
              {user && (
                <Link
                  component={RouterLink}
                  to="/admin"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  Admin
                </Link>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
