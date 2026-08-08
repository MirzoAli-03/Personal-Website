import { Button, Container, Stack, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/MailOutline";

import { useApp } from "../context/AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Contact() {
  const { settings } = useApp();
  useDocumentTitle(settings ? `Contact — ${settings.full_name}` : "Contact");

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: 8 }}>
      <Typography variant="overline" color="primary" fontWeight={700}>
        Contact
      </Typography>
      <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, mb: 2 }}>
        Get in touch
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: "56ch", mb: 4 }}>
        The fastest way to reach me is email. I read everything and usually reply
        within a couple of days.
      </Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {settings?.email && (
          <Button
            variant="contained"
            size="large"
            startIcon={<EmailIcon />}
            href={`mailto:${settings.email}`}
          >
            {settings.email}
          </Button>
        )}
        {settings?.linkedin_url && (
          <Button variant="outlined" size="large" href={settings.linkedin_url} target="_blank" rel="noopener">
            LinkedIn
          </Button>
        )}
        {settings?.github_url && (
          <Button variant="outlined" size="large" href={settings.github_url} target="_blank" rel="noopener">
            GitHub
          </Button>
        )}
      </Stack>
    </Container>
  );
}
