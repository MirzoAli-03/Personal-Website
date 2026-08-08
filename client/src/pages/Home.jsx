import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useApp } from "../context/AppContext";
import { useAsync } from "../hooks/useAsync";
import { api } from "../api";
import { PostCard, ProjectCard } from "../components/Cards";
import { Loading } from "../components/PageState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Home() {
  const { settings, t } = useApp();
  useDocumentTitle(settings?.full_name);

  const { data, loading } = useAsync(
    async () => {
      const [projects, posts] = await Promise.all([
        api.getProjects({ featured: true, limit: 3 }),
        api.getPosts(2),
      ]);
      return { projects, posts };
    },
    []
  );

  return (
    <>
      <Container maxWidth="lg" sx={{ pt: { xs: 7, md: 11 }, pb: 6 }}>
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          spacing={{ xs: 4, md: 7 }}
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {(settings?.role || settings?.location) && (
              <Typography variant="overline" color="primary" fontWeight={700} letterSpacing=".12em">
                {[settings.role, settings.location].filter(Boolean).join(" · ")}
              </Typography>
            )}
            {/* Deliberate scale jump: the headline is the only large thing on
                the page, so the eye has somewhere to land. */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.4rem", sm: "3rem", md: "3.9rem" },
                lineHeight: 1.04,
                letterSpacing: "-.035em",
                maxWidth: "16ch",
                mt: 1,
                mb: 2.5,
                textWrap: "balance",
              }}
            >
              {settings?.hero_heading || settings?.full_name}
            </Typography>
            {settings?.tagline && (
              <Typography
                color="text.secondary"
                sx={{ maxWidth: "50ch", fontSize: "1.08rem", mb: 4 }}
              >
                {settings.tagline}
              </Typography>
            )}
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Button component={RouterLink} to="/projects" variant="contained" size="large">
                {t("home.viewWork")}
              </Button>
              <Button component={RouterLink} to="/contact" variant="outlined" size="large">
                {t("home.getInTouch")}
              </Button>
            </Stack>
          </Box>

          {settings?.avatar_image_id && (
            <Box
              component="img"
              src={`/images/${settings.avatar_image_id}`}
              alt={settings.full_name}
              sx={{
                flex: "none",
                width: { xs: 128, md: 260 },
                height: { xs: 128, md: 260 },
                objectFit: "cover",
                borderRadius: "50%",
                border: 1,
                borderColor: "divider",
              }}
            />
          )}
        </Stack>
      </Container>

      {(settings?.bio || settings?.skills?.length > 0) && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h2" sx={{ fontSize: "1.7rem", mb: 3 }}>
            {t("home.about")}
          </Typography>
          {settings.bio && (
            <Typography color="text.secondary" sx={{ maxWidth: "60ch", mb: 3 }}>
              {settings.bio}
            </Typography>
          )}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {settings.skills?.map((skill) => (
              <Chip key={skill} label={skill} variant="outlined" />
            ))}
          </Stack>
        </Container>
      )}

      {loading && <Loading />}

      {data?.projects?.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 3 }}>
            <Typography variant="h2" sx={{ fontSize: "1.7rem" }}>
              {t("home.featured")}
            </Typography>
            <Button component={RouterLink} to="/projects" size="small">
              {t("common.seeAll")} →
            </Button>
          </Stack>
          <Grid container spacing={3}>
            {data.projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {data?.posts?.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 3 }}>
            <Typography variant="h2" sx={{ fontSize: "1.7rem" }}>
              {t("home.latest")}
            </Typography>
            <Button component={RouterLink} to="/blog" size="small">
              {t("common.seeAll")} →
            </Button>
          </Stack>
          <Grid container spacing={3}>
            {data.posts.map((post) => (
              <Grid item xs={12} sm={6} key={post.id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper
          variant="outlined"
          sx={{ p: { xs: 4, md: 6 }, textAlign: "center", bgcolor: "action.hover" }}
        >
          <Typography variant="h2" sx={{ fontSize: "1.6rem", mb: 1 }}>
            {t("home.ctaTitle")}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t("home.ctaBody")}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Button component={RouterLink} to="/contact" variant="contained">
              {t("home.contactMe")}
            </Button>
            {settings?.email && (
              <Button variant="outlined" href={`mailto:${settings.email}`}>
                {settings.email}
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
