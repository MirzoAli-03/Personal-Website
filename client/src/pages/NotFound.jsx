import { Link as RouterLink } from "react-router-dom";
import { Button, Container, Typography } from "@mui/material";

import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <Container maxWidth="lg" sx={{ py: 12 }}>
      <Typography variant="overline" color="primary" fontWeight={700}>
        404
      </Typography>
      <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, mb: 2 }}>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        That page doesn't exist, or it may have moved.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Go home
      </Button>
    </Container>
  );
}
