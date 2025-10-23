import { useEffect } from "react";
import { Box, Typography, Button, Fade } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { useNavigate } from "react-router-dom";

export default function CheckMail() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <MarkEmailReadIcon sx={{ fontSize: 80, color: "#2E86C1" }} />
        <Typography variant="h5" fontWeight={600}>
          Mail adresini kontrol et 📧
        </Typography>
        <Typography sx={{ maxWidth: 400, opacity: 0.8 }}>
          Şifre sıfırlama bağlantısı e-posta adresine gönderildi. 15 dakika
          içinde bağlantıya tıklayarak şifreni yenileyebilirsin.
        </Typography>
        <Button
          onClick={() => navigate("/")}
          sx={{ mt: 3 }}
          variant="contained"
        >
          Girişe Dön
        </Button>
      </Box>
    </Fade>
  );
}
