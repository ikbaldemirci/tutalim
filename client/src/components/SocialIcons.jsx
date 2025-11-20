import { Box, IconButton, Tooltip } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

export default function SocialIcons({ direction = "row" }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Tooltip title="WhatsApp ile İletişime Geç">
        <IconButton
          component="a"
          href="https://wa.me/905322409792"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "#ffffff",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.12)",
              color: "#25D366",
              filter: "drop-shadow(0 0 4px rgba(37,211,102,0.6))",
            },
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 23 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Instagram">
        <IconButton
          component="a"
          href="https://instagram.com/tutalimcom"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "#ffffff",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.12)",
              color: "#E1306C",
              filter: "drop-shadow(0 0 4px rgba(225,48,108,0.55))",
            },
          }}
        >
          <InstagramIcon sx={{ fontSize: 23 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Facebook">
        <IconButton
          component="a"
          href="https://www.facebook.com/people/tutalimcom/61583786978752/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "#ffffff",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.12)",
              color: "#1877F2",
              filter: "drop-shadow(0 0 4px rgba(24,119,242,0.55))",
            },
          }}
        >
          <FacebookIcon sx={{ fontSize: 23 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
