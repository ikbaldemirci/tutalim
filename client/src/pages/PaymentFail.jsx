import { Container, Box, Typography, Button } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate } from "react-router-dom";

const PaymentFail = () => {
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
                <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
                <Typography component="h1" variant="h4" gutterBottom>
                    Ödeme Başarısız
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Maalesef ödeme işleminiz tamamlanamadı. Lütfen tekrar deneyin veya bankanızla iletişime geçin.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate("/subscription")}
                    sx={{ mt: 3 }}
                >
                    Tekrar Dene
                </Button>
            </Box>
        </Container>
    );
};

export default PaymentFail;
