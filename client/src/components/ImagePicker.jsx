import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { uploadImageFile } from "../api";

export default function ImagePicker({ open, images, onSelect, onClose, onUploaded }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setStatus("Uploading…");
    try {
      const result = await uploadImageFile(file);
      await onUploaded?.();
      setStatus("");
      onSelect(result.id);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Choose an image
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" component="label" size="small" disabled={busy}>
            Upload new
            <input type="file" accept="image/*" hidden onChange={handleUpload} />
          </Button>
          <Typography variant="caption" color="text.secondary">
            {status || "Images are resized in your browser before upload."}
          </Typography>
        </Stack>

        {images.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No images yet — upload one above.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {images.map((img) => (
              <Grid item xs={6} sm={4} md={3} key={img.id}>
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(img.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect(img.id);
                  }}
                  sx={{
                    cursor: "pointer",
                    border: 2,
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    "&:hover, &:focus-visible": { borderColor: "primary.main" },
                  }}
                >
                  <Box
                    component="img"
                    src={`/images/${img.id}`}
                    alt={img.alt_text}
                    loading="lazy"
                    sx={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ p: 1, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {img.filename}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
}
