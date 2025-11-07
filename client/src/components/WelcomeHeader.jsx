import { Paper, Typography, Box, Fade } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";

function WelcomeHeader({ name, totalCount = 0, show = true }) {
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
          position: "relative",
          overflow: "hidden",
          maxWidth: 1100,
          mx: "auto",
          mt: 3,
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          background: "linear-gradient(90deg, #D6EBFA 0%, #F2FAFF 100%)",
          boxShadow: "0 2px 12px rgba(46,134,193,0.08)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: { xs: 1.5, sm: 2 },
          flexWrap: "wrap",

          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "3px",
            background:
              "linear-gradient(90deg, #2E86C1 0%, #4DA8E8 50%, #A9D4F9 100%)",
          },
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary"
          sx={{
            fontSize: { xs: "1.4rem", sm: "1.7rem" },
            letterSpacing: 0.3,
            textAlign: { xs: "left", sm: "left" },
          }}
        >
          Hoş geldin, {name || "Kullanıcı"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2.5 },
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#2E86C1",
            }}
          >
            <CalendarMonthOutlinedIcon
              sx={{ fontSize: { xs: 20, sm: 24 }, color: "#2E86C1" }}
            />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                textTransform: "capitalize",
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              {today.charAt(0).toUpperCase() + today.slice(1)}
            </Typography>
          </Box>

          {show && (
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
                transition: "filter 0.2s ease",
                "&:hover": { filter: "brightness(1.1)" },
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
          )}
        </Box>
      </Paper>
    </Fade>
  );
}

export default WelcomeHeader;
