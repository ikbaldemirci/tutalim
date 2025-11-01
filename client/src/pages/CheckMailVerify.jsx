import { useEffect } from "react";
import { Box, Typography, Button, Fade } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { useNavigate } from "react-router-dom";

export default function CheckMailVerify() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 6000);
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
        <MarkEmailReadIcon sx={{ fontSize: 80, color: "#28a745" }} />
        <Typography variant="h5" fontWeight={600}>
          Hesabını doğrulamak için mailini kontrol et
        </Typography>
        <Typography sx={{ maxWidth: 400, opacity: 0.8 }}>
          E-posta adresine bir doğrulama bağlantısı gönderdik. Mailine gelen
          bağlantıya tıklayarak hesabını aktif hale getirebilirsin.
        </Typography>
        <Button
          onClick={() => navigate("/")}
          sx={{ mt: 3 }}
          variant="contained"
          color="primary"
        >
          Ana Sayfaya Dön
        </Button>
      </Box>
    </Fade>
  );
}
