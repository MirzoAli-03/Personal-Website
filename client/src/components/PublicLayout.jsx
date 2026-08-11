import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
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
import LanguageSwitcher from "./LanguageSwitcher";
import ProfileModal from "./ProfileModal";
import SiteBackground from "./SiteBackground";
import { useScrolled } from "../hooks/useScrolled";

const NAV = [
  { key: "nav.home", to: "/" },
  { key: "nav.projects", to: "/projects" },
  { key: "nav.blog", to: "/blog" },
  { key: "nav.contact", to: "/contact" },
];

export default function PublicLayout() {
  const { settings, mode, toggleMode, user, t } = useApp();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Transparent over the hero, then a backdrop once content scrolls beneath —
  // without it the nav becomes unreadable the moment a card passes under it.
  const scrolled = useScrolled();

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const socials = [
    ["GitHub", settings?.github_url],
    ["LinkedIn", settings?.linkedin_url],
    ["Twitter", settings?.twitter_url],
  ].filter(([, url]) => Boolean(url));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <SiteBackground />

      {/* Own stacking context so content always sits above the background. */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          bgcolor: (t) =>
            scrolled
              ? t.palette.mode === "dark"
                ? "rgba(17,17,20,.72)"
                : "rgba(255,255,255,.72)"
              : "transparent",
          backdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
          borderBottom: 1,
          borderColor: scrolled ? "divider" : "transparent",
          transition: "background-color .25s ease, border-color .25s ease",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flexGrow: 1 }}>
              <Typography
                component={RouterLink}
                to="/"
                variant="h6"
                sx={{ textDecoration: "none", color: "text.primary" }}
              >
                {settings?.full_name || "Personal Website"}
              </Typography>

              <Tooltip title={settings?.full_name || ""}>
                <IconButton
                  onClick={() => setProfileOpen(true)}
                  size="small"
                  aria-label={settings?.full_name || "Profile"}
                  sx={{ p: 0.25 }}
                >
                  <Avatar
                    src={
                      settings?.avatar_image_id
                        ? `/images/${settings.avatar_image_id}`
                        : undefined
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
            </Stack>

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
                    {t(item.key)}
                  </Button>
                ))}
              </Stack>
            )}

            <LanguageSwitcher size="small" />

            <IconButton onClick={toggleMode} aria-label={t("nav.toggleTheme")}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} aria-label={t("nav.openMenu")}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* The background runs inside the drawer rather than showing through it.
          A fixed layer would sit behind the drawer's own scrim and never be
          visible, so this one fills the panel instead. */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              // Explicit width: the drawer sized itself from its content, and
              // an absolutely positioned background layer gives it none.
              width: 264,
              position: "relative",
              overflow: "hidden",
              bgcolor: "background.default",
              backgroundImage: "none",
              borderLeft: 1,
              borderColor: "divider",
            },
          },
        }}
      >
        <SiteBackground contained />
        <List sx={{ pt: 3, position: "relative", zIndex: 1 }}>
          {NAV.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={isActive(item.to)}
              onClick={() => setDrawerOpen(false)}
              sx={{ py: 1.25 }}
            >
              <ListItemText
                primary={t(item.key)}
                slotProps={{
                  primary: {
                    sx: {
                      // Display serif, matching the headings rather than the
                      // body text — the menu is a set of titles, not prose.
                      fontFamily: (th) => th.typography.h3.fontFamily,
                      fontSize: "1.3rem",
                      fontWeight: 600,
                      letterSpacing: "-.02em",
                      color: isActive(item.to) ? "primary.main" : "text.primary",
                    },
                  },
                }}
              />
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
              © {new Date().getFullYear()} {settings?.full_name || ""}. {t("footer.rights")}
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
                  {t("nav.admin")}
                </Link>
              )}
            </Stack>
          </Stack>
        </Container>
        </Box>
      </Box>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </Box>
  );
}
