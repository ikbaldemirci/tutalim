import { Fab, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function FloatingInvites({ count, onClick }) {
  if (!count || count === 0) return null;

  return (
    <Fab
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        bgcolor: "#2E86C1",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(46,134,193,0.3)",
        "&:hover": { bgcolor: "#1f5fa3" },
        zIndex: 9999,
      }}
    >
      <Badge badgeContent={count} color="error">
        <NotificationsIcon sx={{ fontSize: 28 }} />
      </Badge>
    </Fab>
  );
}
