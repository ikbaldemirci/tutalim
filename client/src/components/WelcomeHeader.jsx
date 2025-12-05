import { Paper, Typography, Box, Fade, Badge, IconButton, Chip } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";

function getPlanBadge(plan) {
  if (!plan) return null;
  let label = "Standart Üye";
  let color = "#757575";
  let iconColor = "#fff";

  switch (plan) {
    case "1_MONTH":
      label = "Bronz Üye";
      color = "#CD7F32"; // Bronze
      break;
    case "2_MONTHS":
      label = "Gümüş Üye";
      color = "#607D8B"; // Silver/Blue Grey
      break;
    case "6_MONTHS":
      label = "Altın Üye";
      color = "#FFC107"; // Gold (Amber)
      break;
    case "12_MONTHS":
      label = "Platin Üye";
      color = "#9C27B0"; // Purple
      break;
    default:
      return null;
  }

  return (
    <Chip
      icon={<StarIcon style={{ color: iconColor }} />}
      label={label}
      size="small"
      sx={{
        bgcolor: color,
        color: '#fff',
        fontWeight: 700,
        ml: { xs: 0, sm: 2 },
        mt: { xs: 1, sm: 0 },
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        '& .MuiChip-icon': {
          color: '#fff'
        }
      }}
    />
  );
}

function WelcomeHeader({
  name,
  totalCount = 0,
  show = true,
  inviteCount = 0,
  onOpenInvites = () => { },
  subscriptionPlan = null
}) {
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
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
          {getPlanBadge(subscriptionPlan)}
        </Box>

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
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0.5
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: subscriptionPlan ? "#E8F5E9" : "#E3F2FD",
                  color: subscriptionPlan ? "#2E7D32" : "#1565C0",
                  px: 2,
                  py: 0.7,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  border: `1px solid ${subscriptionPlan ? "#C8E6C9" : "#BBDEFB"}`
                }}
              >
                <HomeWorkOutlinedIcon sx={{ fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {subscriptionPlan ? (
                    "Sınırsız İlan Hakkı"
                  ) : (
                    `${totalCount} / 10 İlan Hakkı`
                  )}
                </Typography>
              </Box>

              {!subscriptionPlan && (
                <Box sx={{ width: '100%', maxWidth: 140, mt: 0.5 }}>
                  <Box sx={{
                    width: '100%',
                    height: 4,
                    bgcolor: '#E0E0E0',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{
                      width: `${Math.min((totalCount / 10) * 100, 100)}%`,
                      height: '100%',
                      bgcolor: totalCount >= 10 ? '#EF5350' : '#2E86C1',
                      transition: 'width 0.5s ease'
                    }} />
                  </Box>
                  {totalCount >= 10 && (
                    <Typography variant="caption" color="error" sx={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', textAlign: 'right' }}>
                      Kota Doldu
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {inviteCount > 0 && (
            <IconButton onClick={onOpenInvites} sx={{ p: 0 }}>
              <Badge
                badgeContent={inviteCount}
                color="error"
                overlap="circular"
              >
                <NotificationsIcon
                  sx={{
                    fontSize: 28,
                    color: "#2E86C1",
                    cursor: "pointer",
                  }}
                />
              </Badge>
            </IconButton>
          )}
        </Box>
      </Paper>
    </Fade>
  );
}

export default WelcomeHeader;
