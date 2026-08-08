import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
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
import StarIcon from "@mui/icons-material/Star";

import { api } from "../../api";
import { useAsync } from "../../hooks/useAsync";
import { useApp } from "../../context/AppContext";
import { Loading, ErrorState, Empty } from "../../components/PageState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function AdminProjects() {
  const { t } = useApp();
  useDocumentTitle(`${t("projectsAdmin.title")} — Admin`);

  const { data: projects, loading, error, reload, setData } = useAsync(() => api.getProjects(), []);
  const [pending, setPending] = useState(null);

  async function confirmDelete() {
    const target = pending;
    setPending(null);
    setData((current) => current.filter((p) => p.id !== target.id));
    try {
      await api.deleteProject(target.id);
    } catch {
      reload();
    }
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Typography variant="h4">{t("projectsAdmin.title")}</Typography>
        <Button component={RouterLink} to="/admin/projects/new" variant="contained">
          {t("projectsAdmin.add")}
        </Button>
      </Stack>

      {loading && <Loading />}
      {error && <ErrorState error={error} />}

      {projects && (
        <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          {projects.length === 0 ? (
            <Empty>{t("projectsAdmin.empty")}</Empty>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>{t("projectsAdmin.colTitle")}</TableCell>
                  <TableCell>{t("projectsAdmin.colTags")}</TableCell>
                  <TableCell align="center">{t("projectsAdmin.colFeatured")}</TableCell>
                  <TableCell align="center">{t("projectsAdmin.colOrder")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell sx={{ width: 72 }}>
                      <Box
                        component={project.cover_image_id ? "img" : "div"}
                        src={project.cover_image_id ? `/images/${project.cover_image_id}` : undefined}
                        alt=""
                        sx={{
                          width: 52,
                          height: 38,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: 1,
                          borderColor: "divider",
                          bgcolor: "action.hover",
                          display: "block",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <RouterLink
                        to={`/admin/projects/${project.id}/edit`}
                        style={{ color: "inherit", fontWeight: 600 }}
                      >
                        {project.title}
                      </RouterLink>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {project.year}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {(project.tags || []).join(", ")}
                    </TableCell>
                    <TableCell align="center">
                      {project.featured && <StarIcon fontSize="small" color="primary" />}
                    </TableCell>
                    <TableCell align="center" sx={{ color: "text.secondary" }}>
                      {project.sort_order}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title={t("common.edit")}>
                        <IconButton
                          size="small"
                          component={RouterLink}
                          to={`/admin/projects/${project.id}/edit`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.delete")}>
                        <IconButton size="small" color="error" onClick={() => setPending(project)}>
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
        title={t("projectsAdmin.deleteTitle")}
        message={t("projectsAdmin.deleteBody", { title: pending?.title })}
        onConfirm={confirmDelete}
        onClose={() => setPending(null)}
      />
    </>
  );
}
