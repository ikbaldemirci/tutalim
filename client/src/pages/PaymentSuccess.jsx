import { Container, Box, Typography, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
    const navigate = useNavigate();

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
                    Aboneliğiniz başarıyla başlatıldı. Artık sınırsız ilan yayınlayabilir ve yönetebilirsiniz.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/")}
                    sx={{ mt: 3 }}
                >
                    Ana Sayfaya Dön
                </Button>
            </Box>
        </Container>
    );
};

export default PaymentSuccess;
