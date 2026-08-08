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
import { useApp } from "../../context/AppContext";
import { Loading, ErrorState, Empty } from "../../components/PageState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function AdminPosts() {
  const { t, formatDate } = useApp();
  useDocumentTitle(`${t("posts.title")} — Admin`);

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
        <Typography variant="h4">{t("posts.title")}</Typography>
        <Button component={RouterLink} to="/admin/posts/new" variant="contained">
          {t("posts.write")}
        </Button>
      </Stack>

      {loading && <Loading />}
      {error && <ErrorState error={error} />}

      {posts && (
        <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          {posts.length === 0 ? (
            <Empty>{t("posts.empty")}</Empty>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("posts.colTitle")}</TableCell>
                  <TableCell>{t("posts.colTag")}</TableCell>
                  <TableCell>{t("posts.colStatus")}</TableCell>
                  <TableCell>{t("posts.colDate")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
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
                        label={post.published ? t("posts.published") : t("posts.draft")}
                        color={post.published ? "success" : "warning"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                      {formatDate(post.published_at || post.updated_at)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {post.published && (
                        <Tooltip title={t("posts.viewLive")}>
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
                      <Tooltip title={t("common.edit")}>
                        <IconButton size="small" component={RouterLink} to={`/admin/posts/${post.id}/edit`}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.delete")}>
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
        title={t("posts.deleteTitle")}
        message={t("posts.deleteBody", { title: pending?.title })}
        onConfirm={confirmDelete}
        onClose={() => setPending(null)}
      />
    </>
  );
}
