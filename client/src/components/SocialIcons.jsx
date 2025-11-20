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
          href="https://wa.me/905522776688"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#fff" }}
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
          sx={{ color: "#fff" }}
        >
          <InstagramIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Facebook">
        <IconButton
          component="a"
          href="https://facebook.com/tutalimcom"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#fff" }}
        >
          <FacebookIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
