import { Container, Typography } from "@mui/material";

import { api } from "../api";
import { useAsync } from "../hooks/useAsync";
import { useApp } from "../context/AppContext";
import { PostList } from "../components/PostList";
import { Loading, ErrorState, Empty } from "../components/PageState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Blog() {
  const { settings, t } = useApp();
  useDocumentTitle(
    settings ? `${t("blog.title")} — ${settings.full_name}` : t("blog.title")
  );

  const { data: posts, loading, error } = useAsync(() => api.getPosts(), []);

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 6, md: 10 }, pb: 8 }}>
      <Typography variant="overline" color="primary">
        {t("blog.eyebrow")}
      </Typography>
      <Typography
        variant="h1"
        sx={{ fontSize: { xs: "2.4rem", md: "3.4rem" }, mt: 0.5, mb: 1.5 }}
      >
        {t("blog.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: { xs: 5, md: 7 }, maxWidth: "52ch" }}>
        {t("blog.subtitle")}
      </Typography>

      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {posts?.length === 0 && <Empty>{t("blog.empty")}</Empty>}

      {posts?.length > 0 && <PostList posts={posts} />}
    </Container>
  );
}
