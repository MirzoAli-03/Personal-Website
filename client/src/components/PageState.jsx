import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useApp } from "../context/AppContext";

export function Loading({ minHeight = 200 }) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight }}>
      <CircularProgress />
    </Box>
  );
}

export function ErrorState({ error }) {
  const { t } = useApp();
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      {error?.message || t("common.error")}
    </Alert>
  );
}

export function Empty({ children }) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: "center",
        border: 1,
        borderStyle: "dashed",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Typography color="text.secondary">{children}</Typography>
    </Box>
  );
}
