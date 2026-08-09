import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/MailOutline";

import { useApp } from "../context/AppContext";

// Profile card shown when the avatar in the header is clicked. Everything in
// here comes from site settings, so it stays in step with the home page
// without duplicating content.
export default function ProfileModal({ open, onClose }) {
  const { settings, t } = useApp();
  if (!settings) return null;

  const socials = [
    ["GitHub", settings.github_url],
    ["LinkedIn", settings.linkedin_url],
    ["Twitter", settings.twitter_url],
  ].filter(([, url]) => Boolean(url));

  const subtitle = [settings.role, settings.location].filter(Boolean).join(" · ");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <IconButton
        onClick={onClose}
        aria-label={t("common.close")}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 5, pb: 4, textAlign: "center" }}>
        <Avatar
          src={settings.avatar_image_id ? `/images/${settings.avatar_image_id}` : undefined}
          alt={settings.full_name}
          sx={{ width: 104, height: 104, mx: "auto", mb: 2, fontSize: "2.4rem" }}
        >
          {settings.full_name?.[0]?.toUpperCase()}
        </Avatar>

        <Typography variant="h5" gutterBottom>
          {settings.full_name}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="primary" fontWeight={700} sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}

        {settings.bio && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {settings.bio}
          </Typography>
        )}

        {settings.skills?.length > 0 && (
          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            useFlexGap
            justifyContent="center"
            sx={{ mb: 3 }}
          >
            {settings.skills.map((skill) => (
              <Chip key={skill} label={skill} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        <Stack spacing={1.5} alignItems="center">
          {settings.email && (
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              href={`mailto:${settings.email}`}
              fullWidth
            >
              {t("home.contactMe")}
            </Button>
          )}

          {socials.length > 0 && (
            <Box>
              <Stack direction="row" spacing={2} justifyContent="center">
                {socials.map(([label, url]) => (
                  <Link
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener"
                    variant="body2"
                    underline="hover"
                    color="text.secondary"
                  >
                    {label}
                  </Link>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
