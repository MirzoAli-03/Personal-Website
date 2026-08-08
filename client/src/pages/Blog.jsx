import { Container, Grid, Typography } from "@mui/material";

import { api } from "../api";
import { useAsync } from "../hooks/useAsync";
import { useApp } from "../context/AppContext";
import { PostCard } from "../components/Cards";
import { Loading, ErrorState, Empty } from "../components/PageState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Blog() {
  const { settings } = useApp();
  useDocumentTitle(settings ? `Blog — ${settings.full_name}` : "Blog");

  const { data: posts, loading, error } = useAsync(() => api.getPosts(), []);

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: 6 }}>
      <Typography variant="overline" color="primary" fontWeight={700}>
        Writing
      </Typography>
      <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, mb: 1 }}>
        Blog
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 5, maxWidth: "56ch" }}>
        Notes on what I'm building, reading, and figuring out.
      </Typography>

      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {posts?.length === 0 && <Empty>No posts published yet.</Empty>}

      <Grid container spacing={3}>
        {posts?.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
