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
import { ProjectCard } from "../components/Cards";
import { PostList } from "../components/PostList";
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

  const heroPhoto = settings?.hero_image_id;

  return (
    <>
      {/*
        Optional full-bleed photo behind the hero. A photo's contrast varies
        across the frame, so text placed on one is only readable by accident —
        the scrim below is what makes it dependable. It runs from near-opaque
        at the bottom, where the text sits, to light at the top, so the image
        is still legible as an image. With no photo set, the hero renders on
        the plain ground exactly as before.
      */}
      <Box
        sx={{
          position: "relative",
          ...(heroPhoto && {
            minHeight: { xs: 520, md: 640 },
            display: "flex",
            alignItems: "flex-end",
            mb: { xs: 2, md: 4 },
            // Full-bleed: escape the page gutters to the viewport edges.
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
            overflow: "hidden",
          }),
        }}
      >
        {heroPhoto && (
          <>
            <Box
              component="img"
              src={`/images/${heroPhoto}`}
              alt=""
              aria-hidden="true"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                // Pulls detail down so the type has a calmer field to sit on.
                filter: "saturate(.85)",
              }}
            />
            <Box
              aria-hidden="true"
              sx={{
                position: "absolute",
                inset: 0,
                background: (th) =>
                  th.palette.mode === "dark"
                    ? "linear-gradient(to top, rgba(15,16,19,.94) 0%, rgba(15,16,19,.86) 34%, rgba(15,16,19,.52) 68%, rgba(15,16,19,.34) 100%)"
                    : "linear-gradient(to top, rgba(252,252,253,.95) 0%, rgba(252,252,253,.88) 34%, rgba(252,252,253,.56) 68%, rgba(252,252,253,.36) 100%)",
              }}
            />
          </>
        )}

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            pt: heroPhoto ? { xs: 8, md: 10 } : { xs: 6, md: 9 },
            pb: heroPhoto ? { xs: 6, md: 7 } : { xs: 6, md: 8 },
          }}
        >
          {(settings?.role || settings?.location) && (
            <Typography variant="overline" color="primary" fontWeight={700} letterSpacing=".12em">
              {[settings.role, settings.location].filter(Boolean).join(" · ")}
            </Typography>
          )}
          <Typography
            variant="h1"
            sx={{
              // Scales with the viewport so it keeps filling the width rather
              // than stopping short on wide screens.
              fontSize: "clamp(2.5rem, 7.2vw, 5.6rem)",
              lineHeight: 0.98,
              letterSpacing: "-.04em",
              maxWidth: "22ch",
              mt: 1.5,
              mb: 3,
              textWrap: "balance",
            }}
          >
            {settings?.hero_heading || settings?.full_name}
          </Typography>

          {/* Buttons sit under the tagline rather than beside it, so the hero
              reads top to bottom in one column: label, headline, sentence,
              action. */}
          <Stack spacing={{ xs: 3, md: 4 }} alignItems="flex-start">
            {settings?.tagline && (
              <Typography
                sx={{
                  maxWidth: "46ch",
                  // Scales with the viewport like the headline, so the two
                  // stay in proportion instead of the sentence shrinking away
                  // on wide screens.
                  fontSize: "clamp(1.25rem, 1.9vw, 1.7rem)",
                  lineHeight: 1.45,
                  // Medium weight: regular read thin beside a heavy display
                  // serif, which made the tagline look like a caption rather
                  // than the second thing you should read.
                  fontWeight: 500,
                  // Raspberry, tuned per theme — the light-mode tone would be
                  // too dark to read on the dark ground.
                  color: (th) => (th.palette.mode === "dark" ? "#EE85AC" : "#B0245B"),
                }}
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
          </Stack>
        </Container>
      </Box>

      {/* Section label in the margin, content in the main column — the layout
          reads as an article rather than a stack of app panels. */}
      {(settings?.bio || settings?.skills?.length > 0) && (
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
          <Box sx={{ borderTop: 1, borderColor: "divider", pt: { xs: 4, md: 5 } }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "132px 1fr" },
                gap: { xs: 2, md: 4 },
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ pt: 0.5 }}>
                {t("home.about")}
              </Typography>
              <Box>
                {settings.bio && (
                  <Typography sx={{ maxWidth: "62ch", fontSize: "1.05rem", mb: 3 }}>
                    {settings.bio}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {settings.skills?.map((skill) => (
                    <Chip key={skill} label={skill} variant="outlined" size="small" />
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      )}

      {loading && <Loading />}

      {data?.projects?.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
          <Box sx={{ borderTop: 1, borderColor: "divider", pt: { xs: 4, md: 5 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{ mb: 4 }}
            >
              <Typography variant="overline" color="text.secondary">
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
          </Box>
        </Container>
      )}

      {data?.posts?.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
          <Box sx={{ borderTop: 1, borderColor: "divider", pt: { xs: 4, md: 5 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{ mb: 2 }}
            >
              <Typography variant="overline" color="text.secondary">
                {t("home.latest")}
              </Typography>
              <Button component={RouterLink} to="/blog" size="small">
                {t("common.seeAll")} →
              </Button>
            </Stack>
            <PostList posts={data.posts} />
          </Box>
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
