import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink, Navigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useApp } from "../../context/AppContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function Login() {
  const { login, user, t } = useApp();
  useDocumentTitle(`${t("login.title")} — Admin`);

  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const destination = location.state?.from || "/admin";

  if (user) return <Navigate to={destination} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh", p: 3 }}>
      <Paper variant="outlined" sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" gutterBottom>
          {t("login.title")}
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
          {t("login.subtitle")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label={t("login.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              fullWidth
            />
            <TextField
              label={t("login.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={busy} fullWidth>
              {busy ? t("login.submitting") : t("login.submit")}
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          <Link component={RouterLink} to="/" color="text.secondary" underline="hover">
            ← {t("common.backToSite")}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
