import { useState } from "react";
import { Box, Typography, Button, Paper, Grid, Container, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../api";

const PLANS = [
    {
        id: "1_MONTH",
        title: "1 Aylık Paket",
        price: "300 TL",
        features: ["Sınırsız İlan Ekleme", "1 Ay Boyunca Geçerli", "Öne Çıkan İlanlar"],
        color: "#4caf50",
    },
    {
        id: "2_MONTHS",
        title: "2 Aylık Paket",
        price: "500 TL",
        features: ["Sınırsız İlan Ekleme", "2 Ay Boyunca Geçerli", "Öne Çıkan İlanlar", "%15 İndirim"],
        color: "#2196f3",
        popular: true,
    },
    {
        id: "6_MONTHS",
        title: "6 Aylık Paket",
        price: "1500 TL",
        features: ["Sınırsız İlan Ekleme", "6 Ay Boyunca Geçerli", "Öne Çıkan İlanlar", "Premium Destek"],
        color: "#9c27b0",
    },
    {
        id: "12_MONTHS",
        title: "12 Aylık Paket",
        price: "3000 TL",
        features: ["Sınırsız İlan Ekleme", "1 Yıl Boyunca Geçerli", "Öne Çıkan İlanlar", "Premium Destek", "Rozet"],
        color: "#ff9800",
    },
];

const Subscription = () => {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (planId) => {
        setLoading(true);
        try {
            const res = await api.post("/payment/subscribe", { planType: planId });
            if (res.data.status === "success") {
                // Iyzico'nun verdiği HTML içeriğini bir sayfaya yazdırıp oraya yönlendirebiliriz
                // veya direkt link varsa oraya gidebiliriz.
                // Iyzico checkout form genellikle bir script veya iframe döner.
                // Ancak API yanıtında paymentPageUrl varsa direkt oraya yönlendirmek en kolayıdır.

                if (res.data.paymentPageUrl) {
                    window.location.href = res.data.paymentPageUrl;
                } else if (res.data.checkoutFormContent) {
                    // HTML içeriği geldiyse (iframe/script), geçici bir div'e basıp formu submit edebiliriz
                    // Ama genelde redirect url tercih edilir.
                    // Şimdilik HTML içeriğini yeni pencerede açalım veya mevcut sayfaya basalım.
                    const newWindow = window.open();
                    newWindow.document.write(res.data.checkoutFormContent);
                }
            }
        } catch (err) {
            console.error("Ödeme başlatılamadı", err);
            alert("Ödeme sistemi şu an kullanılamıyor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", py: 8 }}>
            <Container maxWidth="lg">
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
                        Abonelik Paketleri
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        İşinizi büyütmek için size en uygun paketi seçin.
                    </Typography>
                </Box>

                <Grid container spacing={4} alignItems="flex-start">
                    {PLANS.map((plan) => (
                        <Grid item key={plan.id} xs={12} sm={6} md={3}>
                            <Paper
                                elevation={plan.popular ? 8 : 2}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    position: "relative",
                                    border: plan.popular ? `2px solid ${plan.color}` : "none",
                                    transform: plan.popular ? "scale(1.05)" : "scale(1)",
                                    transition: "transform 0.3s",
                                    "&:hover": { transform: "scale(1.05)" },
                                }}
                            >
                                {plan.popular && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: -12,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            bgcolor: plan.color,
                                            color: "white",
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 20,
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        En Popüler
                                    </Box>
                                )}
                                <Typography variant="h5" fontWeight={700} textAlign="center" mb={2}>
                                    {plan.title}
                                </Typography>
                                <Typography
                                    variant="h4"
                                    fontWeight={800}
                                    textAlign="center"
                                    color={plan.color}
                                    mb={3}
                                >
                                    {plan.price}
                                </Typography>

                                <Box mb={4}>
                                    {plan.features.map((feature, idx) => (
                                        <Box key={idx} display="flex" alignItems="center" gap={1} mb={1.5}>
                                            <CheckCircleIcon sx={{ color: plan.color, fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {feature}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loading}
                                    sx={{
                                        bgcolor: plan.color,
                                        "&:hover": { bgcolor: plan.color, filter: "brightness(0.9)" },
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Abone Ol"}
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Subscription;
