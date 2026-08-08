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
import { formatDate } from "../../components/Cards";
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
  useDocumentTitle("Dashboard — Admin");
  const { user, settings } = useApp();

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
        Welcome back, {user?.username}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={6} md={3}>
          <Stat
            value={posts.filter((p) => p.published).length}
            label="Published posts"
            sub={`${posts.filter((p) => !p.published).length} draft(s)`}
            to="/admin/posts"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Stat
            value={projects.length}
            label="Projects"
            sub={`${projects.filter((p) => p.featured).length} featured`}
            to="/admin/projects"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Stat value={images.length} label="Images" sub={`${storedMb} MB stored`} to="/admin/images" />
        </Grid>
        <Grid item xs={6} md={3}>
          <Stat value="⚙" label="Site settings" sub={settings?.full_name} to="/admin/settings" />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
        <Button component={RouterLink} to="/admin/posts/new" variant="contained">
          Write a post
        </Button>
        <Button component={RouterLink} to="/admin/projects/new" variant="outlined">
          Add a project
        </Button>
        <Button component={RouterLink} to="/admin/images" variant="outlined">
          Upload images
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
          <Typography variant="h6">Recent posts</Typography>
          <Button component={RouterLink} to="/admin/posts" size="small">
            All posts →
          </Button>
        </Stack>

        {posts.length === 0 ? (
          <Empty>No posts yet.</Empty>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
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
                      label={post.published ? "Published" : "Draft"}
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
