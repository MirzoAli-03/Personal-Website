import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  MenuItem,
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
import ImagePicker from "../../components/ImagePicker";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function Settings() {
  const { settings, refreshSettings, t } = useApp();
  useDocumentTitle(`${t("settings.title")} — Admin`);

  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadImages = () => api.listImages().then(setImages);

  useEffect(() => {
    loadImages().catch(() => {});
  }, []);

  useEffect(() => {
    if (!settings) return;
    setForm({
      full_name: settings.full_name || "",
      role: settings.role || "",
      location: settings.location || "",
      avatar_image_id: settings.avatar_image_id ?? "",
      background_style: settings.background_style || "none",
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
      await api.updateSettings({ ...form, avatar_image_id: form.avatar_image_id || null });
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
        {t("settings.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("settings.subtitle")}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("settings.identity")}
        </Typography>
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="flex-start">
            <Box sx={{ flex: "none", textAlign: "center" }}>
              <Avatar
                src={form.avatar_image_id ? `/images/${form.avatar_image_id}` : undefined}
                sx={{ width: 96, height: 96, mb: 1, fontSize: "2rem" }}
              >
                {form.full_name?.[0]?.toUpperCase() || "?"}
              </Avatar>
              <Button size="small" onClick={() => setPickerOpen(true)}>
                {form.avatar_image_id ? t("settings.changePhoto") : t("settings.addPhoto")}
              </Button>
              {form.avatar_image_id && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => setForm((p) => ({ ...p, avatar_image_id: "" }))}
                >
                  {t("settings.removePhoto")}
                </Button>
              )}
            </Box>

            <Stack spacing={2.5} sx={{ flexGrow: 1, width: "100%" }}>
              <TextField
                label={t("settings.name")}
                value={form.full_name}
                onChange={set("full_name")}
                required
                fullWidth
                helperText={t("settings.nameHelp")}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label={t("settings.role")}
                  value={form.role}
                  onChange={set("role")}
                  fullWidth
                />
                <TextField
                  label={t("settings.location")}
                  value={form.location}
                  onChange={set("location")}
                  fullWidth
                />
              </Stack>
            </Stack>
          </Stack>

          <TextField
            label={t("settings.heading")}
            value={form.hero_heading}
            onChange={set("hero_heading")}
            fullWidth
          />
          <TextField
            label={t("settings.tagline")}
            value={form.tagline}
            onChange={set("tagline")}
            multiline
            rows={2}
            fullWidth
            helperText={t("settings.taglineHelp")}
          />
          <TextField label={t("settings.bio")} value={form.bio} onChange={set("bio")} multiline rows={4} fullWidth />
          <TextField
            label={t("settings.skills")}
            value={form.skills}
            onChange={set("skills")}
            fullWidth
            placeholder="JavaScript, Node.js, PostgreSQL"
            helperText={t("settings.skillsHelp")}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("settings.background")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("settings.backgroundHelp")}
        </Typography>
        <TextField
          select
          value={form.background_style}
          onChange={set("background_style")}
          fullWidth
          sx={{ maxWidth: 340 }}
        >
          <MenuItem value="none">{t("settings.bgNone")}</MenuItem>
          <MenuItem value="mesh">{t("settings.bgMesh")}</MenuItem>
          <MenuItem value="particles">{t("settings.bgParticles")}</MenuItem>
          <MenuItem value="contours">{t("settings.bgContours")}</MenuItem>
        </TextField>
        {(form.background_style === "particles" || form.background_style === "contours") && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
            {t("settings.bgParticlesNote")}
          </Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("settings.links")}
        </Typography>
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <TextField label={t("settings.email")} type="email" value={form.email} onChange={set("email")} fullWidth />
          <TextField label={t("settings.github")} type="url" value={form.github_url} onChange={set("github_url")} fullWidth placeholder="https://github.com/you" />
          <TextField label={t("settings.linkedin")} type="url" value={form.linkedin_url} onChange={set("linkedin_url")} fullWidth placeholder="https://linkedin.com/in/you" />
          <TextField label={t("settings.twitter")} type="url" value={form.twitter_url} onChange={set("twitter_url")} fullWidth placeholder="https://twitter.com/you" />
          <Typography variant="caption" color="text.secondary">
            {t("settings.linksHelp")}
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? t("common.saving") : t("settings.save")}
            </Button>
            <Button href="/" target="_blank" rel="noopener" variant="outlined" endIcon={<OpenInNewIcon />}>
              {t("settings.preview")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <ImagePicker
        open={pickerOpen}
        images={images}
        onSelect={(id) => {
          setForm((p) => ({ ...p, avatar_image_id: id }));
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
        onUploaded={loadImages}
      />

      <Snackbar
        open={saved}
        autoHideDuration={2500}
        onClose={() => setSaved(false)}
        message={t("settings.saved")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
