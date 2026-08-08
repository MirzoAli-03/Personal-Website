import { Box, CircularProgress, Alert, Typography } from "@mui/material";

export function Loading({ minHeight = 200 }) {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight }}>
      <CircularProgress />
    </Box>
  );
}

export function ErrorState({ error }) {
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      {error?.message || "Something went wrong."}
    </Alert>
  );
}

export function Empty({ children }) {
  return (
    <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
      {children}
    </Typography>
  );
}
