import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function InviteList({
  invites = [],
  loadingInvites = false,
  acceptInvite,
  rejectInvite,
  mode = "inline",
}) {
  if (loadingInvites) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!invites || invites.length === 0) return null;

  const renderInvites = () => (
    <Box
      sx={{
        maxHeight: mode === "inline" ? 130 : "none",
        overflowY: mode === "inline" ? "auto" : "visible",
        pr: mode === "inline" ? 1 : 0,
      }}
    >
      {invites.map((inv) => (
        <Box
          key={inv._id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1.3,
            borderBottom: "1px solid #e3eef7",
          }}
        >
          <Typography sx={{ fontSize: 14 }}>
            {inv.fromUser?.name || inv.fromUser?.mail} sizi bu mülke{" "}
            {inv.role === "realtor" ? "emlakçı" : "ev sahibi"} olarak atamak
            istiyor: <strong>{inv.property?.location}</strong>
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              sx={{
                background: "#2E86C1",
                textTransform: "none",
                fontWeight: 600,
              }}
              onClick={() => acceptInvite(inv._id)}
            >
              Kabul Et
            </Button>

            <Button
              size="small"
              variant="outlined"
              sx={{
                borderColor: "#999",
                color: "#444",
                textTransform: "none",
                fontWeight: 600,
              }}
              onClick={() => rejectInvite(inv._id)}
            >
              Reddet
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );

  if (mode === "modal") {
    return (
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 17,
            mb: 1.5,
            color: "#2E86C1",
          }}
        >
          Bekleyen Davetler ({invites.length})
        </Typography>
        {renderInvites()}
      </Box>
    );
  }

  if (mode === "accordion") {
    return (
      <Box sx={{ maxWidth: 1000, mx: "auto", mt: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>
              Bekleyen Davetler ({invites.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>{renderInvites()}</AccordionDetails>
        </Accordion>
      </Box>
    );
  }

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
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 1, color: "#2E86C1" }}
      >
        Bekleyen Davetler ({invites.length})
      </Typography>

      {renderInvites()}
    </Box>
  );
}
