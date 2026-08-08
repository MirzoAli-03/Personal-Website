import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { api } from "../../api";
import { useAsync } from "../../hooks/useAsync";
import { Loading, ErrorState, Empty } from "../../components/PageState";
import { formatDate } from "../../components/Cards";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function AdminPosts() {
  useDocumentTitle("Posts — Admin");

  const { data: posts, loading, error, reload, setData } = useAsync(() => api.listAllPosts(), []);
  const [pending, setPending] = useState(null);

  async function confirmDelete() {
    const target = pending;
    setPending(null);
    // Optimistic removal; a failed delete triggers a reload to resync.
    setData((current) => current.filter((p) => p.id !== target.id));
    try {
      await api.deletePost(target.id);
    } catch {
      reload();
    }
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Typography variant="h4">Posts</Typography>
        <Button component={RouterLink} to="/admin/posts/new" variant="contained">
          Write a post
        </Button>
      </Stack>

      {loading && <Loading />}
      {error && <ErrorState error={error} />}

      {posts && (
        <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          {posts.length === 0 ? (
            <Empty>No posts yet.</Empty>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Tag</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} hover>
                    <TableCell>
                      <RouterLink
                        to={`/admin/posts/${post.id}/edit`}
                        style={{ color: "inherit", fontWeight: 600 }}
                      >
                        {post.title}
                      </RouterLink>
                      <Typography variant="caption" color="text.secondary" display="block">
                        /blog/{post.slug}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{post.tag}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={post.published ? "Published" : "Draft"}
                        color={post.published ? "success" : "warning"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                      {formatDate(post.published_at || post.updated_at)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {post.published && (
                        <Tooltip title="View live">
                          <IconButton
                            size="small"
                            component="a"
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit">
                        <IconButton size="small" component={RouterLink} to={`/admin/posts/${post.id}/edit`}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setPending(post)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title="Delete post?"
        message={`"${pending?.title}" will be permanently deleted. This cannot be undone.`}
        onConfirm={confirmDelete}
        onClose={() => setPending(null)}
      />
    </>
  );
}
