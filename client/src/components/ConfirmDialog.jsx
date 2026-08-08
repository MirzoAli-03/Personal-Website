import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useApp } from "../context/AppContext";

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }) {
  const { t } = useApp();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {confirmLabel || t("common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
