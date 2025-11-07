import { Paper, Typography, Box, Fade } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";

function WelcomeHeader({ name, totalCount = 0 }) {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Fade in timeout={700}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 1100,
          mx: "auto",
          mt: 3,
          mb: 3,
          p: { xs: 2.5, sm: 3.2 },
          borderRadius: 3,
          background: "linear-gradient(90deg, #eaf4fb 0%, #f8fcff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 12px rgba(46,134,193,0.08)",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary"
            sx={{
              mb: 0.3,
              fontSize: { xs: "1.4rem", sm: "1.7rem" },
              letterSpacing: 0.3,
            }}
          >
            Hoş geldin, {name || "Kullanıcı"} 👋
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#555",
              fontStyle: "italic",
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
            }}
          >
            Tutalım ile portföyünü kolayca yönetebilirsin.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthOutlinedIcon
              sx={{ color: "#2E86C1", fontSize: { xs: 20, sm: 24 } }}
            />
            <Typography
              variant="body1"
              sx={{
                color: "#2E86C1",
                fontWeight: 500,
                textTransform: "capitalize",
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              {today.charAt(0).toUpperCase() + today.slice(1)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "#2E86C1",
              color: "#fff",
              px: 2,
              py: 0.7,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(46,134,193,0.3)",
            }}
          >
            <HomeWorkOutlinedIcon sx={{ fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              {totalCount} İlan
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
}

export default WelcomeHeader;
