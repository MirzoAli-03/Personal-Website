import { Link as RouterLink } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material";

import { useApp } from "../context/AppContext";

/*
  Posts as a ruled list rather than a grid of cards.

  Cards force every post to look equally important and leave the layout
  dependent on cover images that mostly do not exist. A list with the date in
  the margin scales from three posts to three hundred without changing shape,
  and it is how publications actually present an archive.
*/
export function PostList({ posts }) {
  const { formatDate } = useApp();

  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {posts.map((post, i) => (
        <Box
          component="li"
          key={post.id}
          sx={{ borderTop: i === 0 ? 0 : 1, borderColor: "divider" }}
        >
          <Box
            component={RouterLink}
            to={`/blog/${post.slug}`}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "132px 1fr" },
              gap: { xs: 0.5, sm: 4 },
              alignItems: "baseline",
              py: { xs: 3, sm: 3.5 },
              textDecoration: "none",
              color: "inherit",
              "&:hover .post-title": { color: "primary.main" },
            }}
          >
            <Stack
              direction={{ xs: "row", sm: "column" }}
              spacing={{ xs: 1.5, sm: 0.5 }}
              sx={{ pt: { sm: 0.75 } }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
              >
                {formatDate(post.published_at)}
              </Typography>
              {post.tag && (
                <Typography
                  variant="overline"
                  color="primary"
                  sx={{ fontSize: "0.66rem", lineHeight: 1.6 }}
                >
                  {post.tag}
                </Typography>
              )}
            </Stack>

            <Box>
              <Typography
                variant="h3"
                className="post-title"
                sx={{
                  fontSize: { xs: "1.35rem", sm: "1.6rem" },
                  mb: post.excerpt ? 1 : 0,
                  transition: "color .15s ease",
                  textWrap: "balance",
                }}
              >
                {post.title}
              </Typography>
              {post.excerpt && (
                <Typography color="text.secondary" sx={{ maxWidth: "62ch" }}>
                  {post.excerpt}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
