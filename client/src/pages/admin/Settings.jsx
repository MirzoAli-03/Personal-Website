import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { api } from "../../api";
import { useApp } from "../../context/AppContext";
import { Loading } from "../../components/PageState";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function Settings() {
  useDocumentTitle("Site settings — Admin");
  const { settings, refreshSettings } = useApp();

  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm({
      full_name: settings.full_name || "",
      hero_heading: settings.hero_heading || "",
      tagline: settings.tagline || "",
      bio: settings.bio || "",
      skills: (settings.skills || []).join(", "),
      email: settings.email || "",
      github_url: settings.github_url || "",
      linkedin_url: settings.linkedin_url || "",
      twitter_url: settings.twitter_url || "",
    });
  }, [settings]);

  if (!form) return <Loading minHeight={300} />;

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.updateSettings(form);
      await refreshSettings();
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 760 }}>
      <Typography variant="h4" gutterBottom>
        Site settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        These fields drive the text on your public pages.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Identity
        </Typography>
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <TextField
            label="Your name"
            value={form.full_name}
            onChange={set("full_name")}
            required
            fullWidth
            helperText="Shown in the nav, footer, and page titles"
          />
          <TextField
            label="Home page heading"
            value={form.hero_heading}
            onChange={set("hero_heading")}
            fullWidth
          />
          <TextField
            label="Tagline"
            value={form.tagline}
            onChange={set("tagline")}
            multiline
            rows={2}
            fullWidth
            helperText="The paragraph under your heading"
          />
          <TextField label="About me" value={form.bio} onChange={set("bio")} multiline rows={4} fullWidth />
          <TextField
            label="Skills"
            value={form.skills}
            onChange={set("skills")}
            fullWidth
            placeholder="JavaScript, Node.js, PostgreSQL"
            helperText="Comma separated. Leave blank to hide the skills row."
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Links
        </Typography>
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <TextField label="Email" type="email" value={form.email} onChange={set("email")} fullWidth />
          <TextField label="GitHub URL" type="url" value={form.github_url} onChange={set("github_url")} fullWidth placeholder="https://github.com/you" />
          <TextField label="LinkedIn URL" type="url" value={form.linkedin_url} onChange={set("linkedin_url")} fullWidth placeholder="https://linkedin.com/in/you" />
          <TextField label="Twitter URL" type="url" value={form.twitter_url} onChange={set("twitter_url")} fullWidth placeholder="https://twitter.com/you" />
          <Typography variant="caption" color="text.secondary">
            Empty links are hidden from the footer.
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? "Saving…" : "Save settings"}
            </Button>
            <Button href="/" target="_blank" rel="noopener" variant="outlined" endIcon={<OpenInNewIcon />}>
              Preview site
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Snackbar
        open={saved}
        autoHideDuration={2500}
        onClose={() => setSaved(false)}
        message="Settings saved"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
