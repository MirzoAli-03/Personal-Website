import { Link as RouterLink } from "react-router-dom";
import { Button, Container, Typography } from "@mui/material";

import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useApp } from "../context/AppContext";

export default function NotFound() {
  const { t } = useApp();
  useDocumentTitle(t("notFound.title"));

  return (
    <Container maxWidth="lg" sx={{ py: 12 }}>
      <Typography variant="overline" color="primary" fontWeight={700}>
        404
      </Typography>
      <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, mb: 2 }}>
        {t("notFound.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {t("notFound.body")}
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        {t("common.goHome")}
      </Button>
    </Container>
  );
}
