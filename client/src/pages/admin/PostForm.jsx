import { useEffect, useRef, useState } from "react";
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
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { api } from "../../api";
import { useApp } from "../../context/AppContext";
import RichTextEditor from "../../components/RichTextEditor";
import ImagePicker from "../../components/ImagePicker";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Loading, ErrorState } from "../../components/PageState";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const EMPTY = {
  title: "",
  excerpt: "",
  body: "",
  tag: "Notes",
  slug: "",
  cover_image_id: "",
  published: false,
};

export default function PostForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t, formatDate } = useApp();
  useDocumentTitle(
    `${isEdit ? t("postForm.editTitle") : t("postForm.newTitle")} — Admin`
  );

  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState("cover");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null);

  const editorApi = useRef(null);

  const loadImages = () => api.listImages().then(setImages);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [post] = await Promise.all([
          isEdit ? api.getAdminPost(id) : Promise.resolve(null),
          loadImages(),
        ]);
        if (cancelled) return;
        if (post) {
          setForm({
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            tag: post.tag,
            slug: post.slug,
            cover_image_id: post.cover_image_id ?? "",
            published: post.published,
          });
          setPublishedAt(post.published_at);
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
      if (isEdit) {
        await api.updatePost(id, payload);
        setSaved(true);
      } else {
        const { id: newId } = await api.createPost(payload);
        navigate(`/admin/posts/${newId}/edit`, { replace: true });
        setSaved(true);
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setConfirmOpen(false);
    await api.deletePost(id);
    navigate("/admin/posts", { replace: true });
  }

  function handlePicked(imageId) {
    setPickerOpen(false);
    if (pickerTarget === "cover") {
      setForm((prev) => ({ ...prev, cover_image_id: imageId }));
    } else {
      editorApi.current?.insertImage(imageId);
    }
  }

  if (loading) return <Loading minHeight={300} />;
  if (loadError) return <ErrorState error={loadError} />;

  const previewSlug = form.slug.trim() ? slugify(form.slug) : slugify(form.title);

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Typography variant="h4">
          {isEdit ? t("postForm.editTitle") : t("postForm.newTitle")}
        </Typography>
        <Button component={RouterLink} to="/admin/posts" startIcon={<ArrowBackIcon />}>
          {t("postForm.allPosts")}
        </Button>
      </Stack>

      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                label={t("postForm.title")}
                value={form.title}
                onChange={set("title")}
                required
                fullWidth
                size="medium"
              />
              <TextField
                label={t("postForm.excerpt")}
                value={form.excerpt}
                onChange={set("excerpt")}
                multiline
                rows={2}
                fullWidth
                helperText={t("postForm.excerptHelp")}
              />
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  {t("postForm.body")}
                </Typography>
                <RichTextEditor
                  value={form.body}
                  onChange={(html) => setForm((prev) => ({ ...prev, body: html }))}
                  editorApiRef={editorApi}
                  onRequestImage={() => {
                    setPickerTarget("body");
                    setPickerOpen(true);
                  }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("postForm.publish")}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.published}
                    onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                  />
                }
                label={t("postForm.published")}
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                {form.published
                  ? publishedAt
                    ? t("postForm.liveSince", { date: formatDate(publishedAt) })
                    : t("postForm.willGoLive")
                  : t("postForm.draftNote")}
              </Typography>
              <Button type="submit" variant="contained" fullWidth disabled={busy}>
                {busy ? t("common.saving") : t("postForm.save")}
              </Button>
              {isEdit && form.published && (
                <Button
                  fullWidth
                  sx={{ mt: 1 }}
                  href={`/blog/${previewSlug}`}
                  target="_blank"
                  rel="noopener"
                  endIcon={<OpenInNewIcon />}
                >
                  {t("posts.viewLive")}
                </Button>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("postForm.details")}
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label={t("postForm.tag")}
                  value={form.tag}
                  onChange={set("tag")}
                  fullWidth
                />
                <TextField
                  label={t("postForm.slug")}
                  value={form.slug}
                  onChange={set("slug")}
                  fullWidth
                  placeholder={t("postForm.slugPlaceholder")}
                  helperText={`/blog/${previewSlug || "…"}`}
                />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("postForm.cover")}
              </Typography>
              <TextField
                select
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
              {form.cover_image_id && (
                <Box
                  component="img"
                  src={`/images/${form.cover_image_id}`}
                  alt=""
                  sx={{ width: "100%", mt: 2, borderRadius: 1, border: 1, borderColor: "divider" }}
                />
              )}
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => {
                  setPickerTarget("cover");
                  setPickerOpen(true);
                }}
              >
                {t("postForm.browse")} →
              </Button>
            </Paper>

            {isEdit && (
              <Button color="error" variant="outlined" onClick={() => setConfirmOpen(true)}>
                {t("postForm.deletePost")}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>

      <ImagePicker
        open={pickerOpen}
        images={images}
        onSelect={handlePicked}
        onClose={() => setPickerOpen(false)}
        onUploaded={loadImages}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t("posts.deleteTitle")}
        message={t("postForm.deleteBody")}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />

      <Snackbar
        open={saved}
        autoHideDuration={2500}
        onClose={() => setSaved(false)}
        message={t("common.saved")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </form>
  );
}
