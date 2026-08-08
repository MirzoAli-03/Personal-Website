import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
  Box,
} from "@mui/material";

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const hoverSx = {
  height: "100%",
  border: 1,
  borderColor: "divider",
  "&:hover": { transform: "translateY(-2px)", borderColor: "primary.main" },
};

function Thumb({ imageId, alt }) {
  if (imageId) {
    return (
      <CardMedia
        component="img"
        height="150"
        image={`/images/${imageId}`}
        alt={alt}
        loading="lazy"
        sx={{ objectFit: "cover" }}
      />
    );
  }
  return (
    <Box
      sx={{
        height: 150,
        background: (t) =>
          `linear-gradient(135deg, ${t.palette.primary.main}33, ${t.palette.action.hover})`,
      }}
    />
  );
}

export function PostCard({ post }) {
  return (
    <Card variant="outlined" sx={hoverSx}>
      <CardActionArea
        component={RouterLink}
        to={`/blog/${post.slug}`}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        {post.cover_image_id && <Thumb imageId={post.cover_image_id} alt={post.title} />}
        <CardContent sx={{ flexGrow: 1 }}>
          {post.tag && <Chip label={post.tag} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />}
          <Typography variant="h6" gutterBottom>
            {post.title}
          </Typography>
          {post.excerpt && (
            <Typography variant="body2" color="text.secondary">
              {post.excerpt}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            {formatDate(post.published_at)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function ProjectCard({ project }) {
  const linkProps = project.url
    ? { component: "a", href: project.url, target: "_blank", rel: "noopener" }
    : { component: RouterLink, to: "/projects" };

  return (
    <Card variant="outlined" sx={hoverSx}>
      <CardActionArea
        {...linkProps}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Thumb imageId={project.cover_image_id} alt={project.title} />
        <CardContent sx={{ flexGrow: 1 }}>
          {project.tags?.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              {project.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
              ))}
            </Stack>
          )}
          <Typography variant="h6" gutterBottom>
            {project.title}
          </Typography>
          {project.description && (
            <Typography variant="body2" color="text.secondary">
              {project.description}
            </Typography>
          )}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {project.year}
            </Typography>
            {project.url && (
              <Typography variant="caption" color="primary" fontWeight={700}>
                {project.link_label || "View"} →
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
