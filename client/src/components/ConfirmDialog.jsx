import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { motion } from "framer-motion";

const iconMap = {
  info: <InfoOutlinedIcon sx={{ fontSize: 38, color: "#96D8E6" }} />,
  warning: <WarningAmberIcon sx={{ fontSize: 38, color: "#F1C40F" }} />,
  danger: <ErrorOutlineIcon sx={{ fontSize: 38, color: "#E74C3C" }} />,
  success: <CheckCircleOutlineIcon sx={{ fontSize: 38, color: "#2ECC71" }} />,
};

export default function ConfirmDialog({
  open,
  title,
  message,
  severity = "info",
  confirmText = "Onay",
  cancelText = "Vazgeç",
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.18 },
        sx: { borderRadius: 3, p: 1.5 },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        {iconMap[severity]}
        {title}
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} color="inherit" sx={{ fontWeight: 600 }}>
          {cancelText}
        </Button>

        <Button
          autoFocus
          onClick={onConfirm}
          variant="contained"
          color={severity === "danger" ? "error" : "primary"}
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
