import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { api } from "../../api";
import { useApp } from "../../context/AppContext";
import ImagePicker from "../../components/ImagePicker";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Loading, ErrorState } from "../../components/PageState";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const EMPTY = {
  title: "",
  description: "",
  tags: "",
  url: "",
  link_label: "View",
  year: "",
  cover_image_id: "",
  featured: false,
  sort_order: 0,
};

export default function ProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t } = useApp();
  useDocumentTitle(
    `${isEdit ? t("projectForm.editTitle") : t("projectForm.newTitle")} — Admin`
  );

  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadImages = () => api.listImages().then(setImages);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [project] = await Promise.all([
          isEdit ? api.getAdminProject(id) : Promise.resolve(null),
          loadImages(),
        ]);
        if (cancelled) return;
        if (project) {
          setForm({
            title: project.title,
            description: project.description,
            tags: (project.tags || []).join(", "),
            url: project.url,
            link_label: project.link_label,
            year: project.year,
            cover_image_id: project.cover_image_id ?? "",
            featured: project.featured,
            sort_order: project.sort_order,
          });
        }
      } catch (err) {
        if (!cancelled) setLoadError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setSaveError(null);
    try {
      const payload = { ...form, cover_image_id: form.cover_image_id || null };
      if (isEdit) await api.updateProject(id, payload);
      else await api.createProject(payload);
      navigate("/admin/projects");
    } catch (err) {
      setSaveError(err.message);
      setBusy(false);
    }
  }

  async function handleDelete() {
    setConfirmOpen(false);
    await api.deleteProject(id);
    navigate("/admin/projects", { replace: true });
  }

  if (loading) return <Loading minHeight={300} />;
  if (loadError) return <ErrorState error={loadError} />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 760 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Typography variant="h4">
          {isEdit ? t("projectForm.editTitle") : t("projectForm.newTitle")}
        </Typography>
        <Button component={RouterLink} to="/admin/projects" startIcon={<ArrowBackIcon />}>
          {t("projectForm.allProjects")}
        </Button>
      </Stack>

      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <TextField label={t("projectForm.title")} value={form.title} onChange={set("title")} required fullWidth size="medium" />
          <TextField
            label={t("projectForm.description")}
            value={form.description}
            onChange={set("description")}
            multiline
            rows={3}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label={t("projectForm.tags")}
                value={form.tags}
                onChange={set("tags")}
                fullWidth
                placeholder="React, Node.js"
                helperText={t("projectForm.tagsHelp")}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label={t("projectForm.year")} value={form.year} onChange={set("year")} fullWidth placeholder="2026" />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField label={t("projectForm.url")} type="url" value={form.url} onChange={set("url")} fullWidth placeholder="https://…" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label={t("projectForm.linkLabel")} value={form.link_label} onChange={set("link_label")} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={t("projectForm.sortOrder")}
                type="number"
                value={form.sort_order}
                onChange={set("sort_order")}
                fullWidth
                helperText={t("projectForm.sortHelp")}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                select
                label={t("projectForm.cover")}
                value={form.cover_image_id}
                onChange={set("cover_image_id")}
                fullWidth
              >
                <MenuItem value="">{t("common.none")}</MenuItem>
                {images.map((img) => (
                  <MenuItem key={img.id} value={img.id}>
                    {img.filename}
                  </MenuItem>
                ))}
              </TextField>
              <Button size="small" sx={{ mt: 1 }} onClick={() => setPickerOpen(true)}>
                {t("postForm.browse")} →
              </Button>
            </Grid>
          </Grid>

          {form.cover_image_id && (
            <Box
              component="img"
              src={`/images/${form.cover_image_id}`}
              alt=""
              sx={{ width: "100%", maxWidth: 320, borderRadius: 1, border: 1, borderColor: "divider" }}
            />
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
              />
            }
            label={t("projectForm.featured")}
          />

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? t("common.saving") : t("projectForm.save")}
            </Button>
            <Button component={RouterLink} to="/admin/projects" variant="outlined">
              {t("common.cancel")}
            </Button>
            {isEdit && (
              <Button color="error" onClick={() => setConfirmOpen(true)}>
                {t("common.delete")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <ImagePicker
        open={pickerOpen}
        images={images}
        onSelect={(imageId) => {
          setForm((prev) => ({ ...prev, cover_image_id: imageId }));
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
        onUploaded={loadImages}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t("projectsAdmin.deleteTitle")}
        message={t("projectForm.deleteBody")}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </Box>
  );
}
