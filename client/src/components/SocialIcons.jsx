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
        gap: 1.2,
      }}
    >
      <Tooltip title="WhatsApp ile İletişime Geç">
        <IconButton
          component="a"
          href="https://wa.me/905322409792"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "#fff",
            opacity: 0.85,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              opacity: 1,
            },
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Instagram">
        <IconButton
          component="a"
          href="https://instagram.com/tutalimcom"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "#fff",
            opacity: 0.85,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              opacity: 1,
            },
          }}
        >
          <InstagramIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Facebook">
        <IconButton
          component="a"
          href="https://www.facebook.com/people/tutalimcom/61583786978752/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "#fff",
            opacity: 0.85,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              opacity: 1,
            },
          }}
        >
          <FacebookIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
