import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { api, uploadImageFile } from "../../api";
import { useAsync } from "../../hooks/useAsync";
import { Loading, ErrorState, Empty } from "../../components/PageState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function Images() {
  useDocumentTitle("Images — Admin");

  const { data: images, loading, error, reload, setData } = useAsync(() => api.listImages(), []);
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(null);
  const [copied, setCopied] = useState(null);

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    try {
      for (let i = 0; i < files.length; i += 1) {
        setStatus({ severity: "info", text: `Uploading ${i + 1} of ${files.length}…` });
        await uploadImageFile(files[i]);
      }
      setStatus({ severity: "success", text: `Uploaded ${files.length} image(s).` });
      await reload().then(setData);
    } catch (err) {
      setStatus({ severity: "error", text: `Upload failed: ${err.message}` });
    }
  }

  async function confirmDelete() {
    const target = pending;
    setPending(null);
    setData((current) => current.filter((i) => i.id !== target.id));
    try {
      await api.deleteImage(target.id);
    } catch {
      reload().then(setData);
    }
  }

  function copyUrl(url) {
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(url);
        setTimeout(() => setCopied(null), 1200);
      },
      () => {}
    );
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Typography variant="h4">Images</Typography>
        <Button variant="contained" component="label">
          Upload images
          <input type="file" accept="image/*" hidden multiple onChange={handleUpload} />
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Images are downscaled to 1600px and converted to WebP in your browser before
        upload, then stored in Postgres. Server limit is 4 MB per file.
      </Typography>

      {status && (
        <Alert severity={status.severity} sx={{ mb: 2 }} onClose={() => setStatus(null)}>
          {status.text}
        </Alert>
      )}

      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {images?.length === 0 && <Empty>No images yet.</Empty>}

      <Grid container spacing={2}>
        {images?.map((img) => (
          <Grid item xs={12} sm={6} md={3} key={img.id}>
            <Card variant="outlined">
              <CardMedia
                component="img"
                height="130"
                image={`/images/${img.id}`}
                alt={img.alt_text}
                loading="lazy"
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="body2" fontWeight={600} noWrap title={img.filename}>
                  {img.filename}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  {img.width && img.height ? `${img.width}×${img.height} · ` : ""}
                  {(img.byte_size / 1024).toFixed(0)} KB
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TextField
                    value={copied === `/images/${img.id}` ? "Copied!" : `/images/${img.id}`}
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true, sx: { fontSize: "0.75rem" } }}
                  />
                  <Tooltip title="Copy URL">
                    <IconButton size="small" onClick={() => copyUrl(`/images/${img.id}`)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setPending(img)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Delete image?"
        message="Posts and projects using this image will lose their cover."
        onConfirm={confirmDelete}
        onClose={() => setPending(null)}
      />
    </>
  );
}
