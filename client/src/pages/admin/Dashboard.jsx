import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { api } from "../../api";
import { useAsync } from "../../hooks/useAsync";
import { useApp } from "../../context/AppContext";
import { Loading, ErrorState, Empty } from "../../components/PageState";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function Stat({ value, label, sub, to }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea component={RouterLink} to={to} sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          <Typography fontWeight={600}>{label}</Typography>
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Dashboard() {
  const { user, settings, t, formatDate } = useApp();
  useDocumentTitle(`${t("admin.dashboard")} — Admin`);

  const { data, loading, error } = useAsync(async () => {
    const [posts, projects, images] = await Promise.all([
      api.listAllPosts(),
      api.getProjects(),
      api.listImages(),
    ]);
    return { posts, projects, images };
  }, []);

  if (loading) return <Loading minHeight={300} />;
  if (error) return <ErrorState error={error} />;

  const { posts, projects, images } = data;
  const storedMb = (images.reduce((sum, i) => sum + i.byte_size, 0) / 1048576).toFixed(1);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t("dash.welcome", { name: user?.username })}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={6} md={3}>
          <Stat
            value={posts.filter((p) => p.published).length}
            label={t("dash.publishedPosts")}
            sub={t("dash.drafts", { n: posts.filter((p) => !p.published).length })}
            to="/admin/posts"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Stat
            value={projects.length}
            label={t("admin.projects")}
            sub={t("dash.featured", { n: projects.filter((p) => p.featured).length })}
            to="/admin/projects"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Stat
            value={images.length}
            label={t("admin.images")}
            sub={t("dash.stored", { n: storedMb })}
            to="/admin/images"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Stat value="⚙" label={t("dash.siteSettings")} sub={settings?.full_name} to="/admin/settings" />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
        <Button component={RouterLink} to="/admin/posts/new" variant="contained">
          {t("dash.writePost")}
        </Button>
        <Button component={RouterLink} to="/admin/projects/new" variant="outlined">
          {t("dash.addProject")}
        </Button>
        <Button component={RouterLink} to="/admin/images" variant="outlined">
          {t("dash.uploadImages")}
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
          <Typography variant="h6">{t("dash.recentPosts")}</Typography>
          <Button component={RouterLink} to="/admin/posts" size="small">
            {t("dash.allPosts")} →
          </Button>
        </Stack>

        {posts.length === 0 ? (
          <Empty>{t("dash.noPosts")}</Empty>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("posts.colTitle")}</TableCell>
                <TableCell>{t("posts.colStatus")}</TableCell>
                <TableCell>{t("posts.colDate")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.slice(0, 5).map((post) => (
                <TableRow key={post.id} hover>
                  <TableCell>
                    <RouterLink
                      to={`/admin/posts/${post.id}/edit`}
                      style={{ color: "inherit", fontWeight: 600 }}
                    >
                      {post.title}
                    </RouterLink>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={post.published ? t("posts.published") : t("posts.draft")}
                      color={post.published ? "success" : "warning"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {formatDate(post.published_at || post.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </>
  );
}
