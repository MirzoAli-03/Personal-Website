import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Divider, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { api } from "../api";
import { useAsync } from "../hooks/useAsync";
import { Loading, ErrorState } from "../components/PageState";
import { formatDate } from "../components/Cards";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function readingTime(html) {
  const words = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function Post() {
  const { slug } = useParams();
  const { data: post, loading, error } = useAsync(() => api.getPost(slug), [slug]);

  useDocumentTitle(post?.title, post?.excerpt);

  if (loading) return <Loading minHeight={400} />;
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Typography variant="h1" sx={{ fontSize: "2rem", mb: 2 }}>
          {error.status === 404 ? "Post not found" : "Something went wrong"}
        </Typography>
        <Button component={RouterLink} to="/blog" startIcon={<ArrowBackIcon />}>
          Back to blog
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 5, md: 8 }, pb: 8 }}>
      <Button component={RouterLink} to="/blog" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to blog
      </Button>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        {formatDate(post.published_at)} · {readingTime(post.body)} min read
        {post.tag ? ` · ${post.tag}` : ""}
      </Typography>

      <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, mb: 3 }}>
        {post.title}
      </Typography>

      {post.cover_image_id && (
        <Box
          component="img"
          src={`/images/${post.cover_image_id}`}
          alt={post.title}
          sx={{
            width: "100%",
            maxHeight: 420,
            objectFit: "cover",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            mb: 4,
          }}
        />
      )}

      <Divider sx={{ mb: 4 }} />

      {/*
        Post bodies are HTML written by the authenticated site owner in the
        admin editor, so they are rendered as-is to preserve formatting.
      */}
      <Box
        dangerouslySetInnerHTML={{ __html: post.body }}
        sx={{
          lineHeight: 1.75,
          "& h2": { fontSize: "1.5rem", fontWeight: 700, mt: 5, mb: 1.5 },
          "& h3": { fontSize: "1.2rem", fontWeight: 700, mt: 4, mb: 1 },
          "& p": { mb: 2 },
          "& ul, & ol": { mb: 2, pl: 3 },
          "& li": { mb: 0.5 },
          "& img": { maxWidth: "100%", borderRadius: 2, my: 3 },
          "& a": { color: "primary.main" },
          "& blockquote": {
            m: 0,
            my: 3,
            pl: 2.5,
            borderLeft: 3,
            borderColor: "primary.main",
            color: "text.secondary",
          },
          "& pre": {
            bgcolor: "action.hover",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            overflowX: "auto",
            fontSize: "0.9rem",
          },
          "& code": { fontFamily: "monospace" },
        }}
      />
    </Container>
  );
}
