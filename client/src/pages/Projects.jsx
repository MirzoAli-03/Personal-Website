import { Container, Grid, Typography } from "@mui/material";

import { api } from "../api";
import { useAsync } from "../hooks/useAsync";
import { useApp } from "../context/AppContext";
import { ProjectCard } from "../components/Cards";
import { Loading, ErrorState, Empty } from "../components/PageState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Projects() {
  const { settings } = useApp();
  useDocumentTitle(settings ? `Projects — ${settings.full_name}` : "Projects");

  const { data: projects, loading, error } = useAsync(() => api.getProjects(), []);

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: 6 }}>
      <Typography variant="overline" color="primary" fontWeight={700}>
        Portfolio
      </Typography>
      <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, mb: 1 }}>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 5 }}>
        A selection of things I've built.
      </Typography>

      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {projects?.length === 0 && <Empty>No projects yet.</Empty>}

      <Grid container spacing={3}>
        {projects?.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
