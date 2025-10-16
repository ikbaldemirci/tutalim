import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        textAlign: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
        color: "#fff",
        mt: "auto", // sayfa sonuna yapışması için
      }}
    >
      <Typography variant="body2">
        © 2025 Tutalım.com – Luxury Real Estate Platform
      </Typography>
    </Box>
  );
}
