import {
  Container,
  Box,
  Typography,
  Button,
  LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const searchParams = new URLSearchParams(window.location.search);
  const nextUrl = searchParams.get("next");
  const targetUrl = nextUrl ? decodeURIComponent(nextUrl) : "/subscription";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(targetUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, targetUrl]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography component="h1" variant="h4" gutterBottom>
          Ödeme Başarılı!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Aboneliğiniz başarıyla başlatıldı.
        </Typography>

        <Box sx={{ width: "100%", mt: 2, mb: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {countdown} saniye içinde{" "}
            {nextUrl ? "kaldığınız yere" : "abonelik sayfasına"}{" "}
            yönlendiriliyorsunuz...
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(5 - countdown) * 20}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(targetUrl)}
          sx={{ mt: 3 }}
        >
          {nextUrl ? "Devam Et" : "Abonelik Sayfasına Git"}
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentSuccess;
