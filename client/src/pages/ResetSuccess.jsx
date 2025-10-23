import { useEffect } from "react";
import { Box, Typography, Button, Fade } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

export default function ResetSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 3000);
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
        <CheckCircleIcon sx={{ fontSize: 80, color: "#27ae60" }} />
        <Typography variant="h5" fontWeight={600}>
          Şifren başarıyla yenilendi 🔒
        </Typography>
        <Typography sx={{ maxWidth: 400, opacity: 0.8 }}>
          Artık yeni şifrenle giriş yapabilirsin. Yönlendiriliyorsun...
        </Typography>
        <Button
          onClick={() => navigate("/")}
          sx={{ mt: 3 }}
          variant="contained"
        >
          Girişe Git
        </Button>
      </Box>
    </Fade>
  );
}
