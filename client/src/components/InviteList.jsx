import { Box, Typography } from "@mui/material";

export default function InviteList({
  invites,
  loadingInvites,
  acceptInvite,
  rejectInvite,
}) {
  if (loadingInvites || invites.length === 0) return null;

  return (
    <Box
      sx={{
        maxWidth: 1000,
        margin: "0 auto",
        mt: 2,
        background: "linear-gradient(90deg, #D6EBFA 0%, #F2FAFF 100%)",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(46,134,193,0.15)",
        p: 2,
        border: "1px solid #cce4f6",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 1, color: "#2E86C1" }}
      >
        Bekleyen Davetler ({invites.length})
      </Typography>

      <Box
        sx={{
          maxHeight: 240,
          overflowY: "auto",
          pr: 1,
        }}
      >
        {invites.map((inv) => (
          <Box
            key={inv._id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.2,
              borderBottom: "1px solid #e6f3fb",
            }}
          >
            <Typography sx={{ fontSize: 14 }}>
              {inv.fromUser?.name || inv.fromUser?.mail} sizi bu mülke{" "}
              {inv.role === "realtor" ? "emlakçı" : "ev sahibi"} olarak atamak
              istiyor: <strong>{inv.property?.location}</strong>
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <button
                onClick={() => acceptInvite(inv._id)}
                style={{
                  padding: "6px 10px",
                  background: "#2E86C1",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Kabul Et
              </button>
              <button
                onClick={() => rejectInvite(inv._id)}
                style={{
                  padding: "6px 10px",
                  background: "#eee",
                  color: "#333",
                  border: 0,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Reddet
              </button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
