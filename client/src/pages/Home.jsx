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
  const { settings } = useApp();
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
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: 6 }}>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Hello, I'm
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, maxWidth: "18ch", mb: 2 }}>
          {settings?.hero_heading || settings?.full_name}
        </Typography>
        {settings?.tagline && (
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: "56ch", fontWeight: 400, mb: 4 }}>
            {settings.tagline}
          </Typography>
        )}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button component={RouterLink} to="/projects" variant="contained" size="large">
            View my work
          </Button>
          <Button component={RouterLink} to="/contact" variant="outlined" size="large">
            Get in touch
          </Button>
        </Stack>
      </Container>

      {(settings?.bio || settings?.skills?.length > 0) && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h2" sx={{ fontSize: "1.7rem", mb: 3 }}>
            About me
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
              Featured projects
            </Typography>
            <Button component={RouterLink} to="/projects" size="small">
              See all →
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
              Latest posts
            </Typography>
            <Button component={RouterLink} to="/blog" size="small">
              See all →
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
            Let's work together
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Have a project in mind or just want to say hi? My inbox is always open.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Button component={RouterLink} to="/contact" variant="contained">
              Contact me
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
