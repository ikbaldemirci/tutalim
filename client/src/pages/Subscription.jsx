import { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid, Container, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Navbar from "../components/Navbar";
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

const ActiveSubscriptionCard = ({ subscription }) => {
    if (!subscription) return null;

    const plan = PLANS.find((p) => p.id === subscription.planType);
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = Math.abs(endDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                mb: 6,
                borderRadius: 4,
                background: "linear-gradient(135deg, #2E86C1 0%, #3498DB 100%)",
                color: "white",
            }}
        >
            <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                        Mevcut Aboneliğiniz
                    </Typography>
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                        {plan ? plan.title : subscription.planType}
                    </Typography>
                    <Box display="flex" gap={3} mt={2}>
                        <Box>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>DURUM</Typography>
                            <Typography variant="h6" fontWeight={600}>{subscription.status}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>BİTİŞ TARİHİ</Typography>
                            <Typography variant="h6" fontWeight={600}>{endDate.toLocaleDateString("tr-TR")}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>KALAN SÜRE</Typography>
                            <Typography variant="h6" fontWeight={600}>{diffDays} Gün</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4} textAlign="right">
                    <CheckCircleIcon sx={{ fontSize: 100, opacity: 0.2 }} />
                </Grid>
            </Grid>
        </Paper>
    );
};

const Subscription = () => {
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        api.get("/payment/status")
            .then(res => {
                if (res.data.status === "success" && res.data.isSubscribed) {
                    setSubscription(res.data.subscription);
                }
            })
            .catch(err => console.error("Abonelik kontrol hatası:", err));
    }, []);

    const handleSubscribe = async (planId) => {
        setLoading(true);
        try {
            const res = await api.post("/payment/subscribe", { planType: planId });
            if (res.data.status === "success") {
                if (res.data.paymentPageUrl) {
                    window.location.href = res.data.paymentPageUrl;
                } else if (res.data.checkoutFormContent) {
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
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
            <Navbar />

            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box textAlign="center" mb={6} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {subscription && (
                        <Box sx={{ width: "100%", maxWidth: 800, mb: 4 }}>
                            <ActiveSubscriptionCard subscription={subscription} />
                        </Box>
                    )}

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
