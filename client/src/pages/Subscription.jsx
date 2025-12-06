import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Container,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Navbar from "../components/Navbar";
import api from "../api";

const ActiveSubscriptionCard = ({ subscription, plans }) => {
  if (!subscription) return null;

  const plan = plans.find((p) => p.id === subscription.planType);
  const endDate = new Date(subscription.endDate);
  const today = new Date();
  const diffTime = Math.abs(endDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, md: 5 },
        mb: 6,
        borderRadius: 4,
        background: "linear-gradient(135deg, #2E86C1 0%, #3498DB 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Background Icon */}
      <CheckCircleIcon
        sx={{
          position: "absolute",
          right: -20,
          bottom: -20,
          fontSize: 200,
          opacity: 0.1,
          transform: "rotate(-15deg)",
        }}
      />

      <Grid container alignItems="center" spacing={3}>
        <Grid
          item
          xs={12}
          md={8}
          sx={{ textAlign: { xs: "center", md: "left" }, zIndex: 1 }}
        >
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              mb: 1,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontSize: "0.85rem",
            }}
          >
            Mevcut Aboneliğiniz
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            gutterBottom
            sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
          >
            {plan ? plan.name : subscription.planType}
          </Typography>

          <Box
            display="flex"
            gap={{ xs: 2, md: 4 }}
            mt={3}
            justifyContent={{ xs: "center", md: "flex-start" }}
            flexWrap="wrap"
          >
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 1.5,
                borderRadius: 2,
                minWidth: 100,
              }}
            >
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, display: "block", mb: 0.5 }}
              >
                DURUM
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {subscription.status}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 1.5,
                borderRadius: 2,
                minWidth: 100,
              }}
            >
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, display: "block", mb: 0.5 }}
              >
                BİTİŞ TARİHİ
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {endDate.toLocaleDateString("tr-TR")}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 1.5,
                borderRadius: 2,
                minWidth: 100,
              }}
            >
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, display: "block", mb: 0.5 }}
              >
                KALAN SÜRE
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {diffDays} Gün
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "flex-end",
          }}
        >
          {/* Desktop Icon Placeholder if needed, currently decorative BG handles it */}
        </Grid>
      </Grid>
    </Paper>
  );
};

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    // 1. Abonelik durmunu çek
    api
      .get("/payment/status")
      .then((res) => {
        if (res.data.status === "success" && res.data.isSubscribed) {
          setSubscription(res.data.subscription);
        }
      })
      .catch((err) => console.error("Abonelik kontrol hatası:", err));

    // 2. Planları çek
    api
      .get("/payment/plans")
      .then((res) => {
        if (res.data.status === "success") {
          setPlans(res.data.plans);
        }
      })
      .catch((err) => console.error("Planlar yüklenemedi:", err));
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
        <Box
          textAlign="center"
          mb={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {subscription && (
            <Box sx={{ width: "100%", maxWidth: 800, mb: 4 }}>
              <ActiveSubscriptionCard
                subscription={subscription}
                plans={plans}
              />
            </Box>
          )}

          <Typography
            variant="h3"
            fontWeight={700}
            color="primary"
            gutterBottom
          >
            Abonelik Paketleri
          </Typography>
          <Typography variant="h6" color="text.secondary">
            İşinizi büyütmek için size en uygun paketi seçin.
          </Typography>
        </Box>

        <Grid
          container
          spacing={4}
          alignItems="flex-start"
          justifyContent="center"
        >
          {plans.map((plan, index) => {
            const colors = ["#4caf50", "#2196f3", "#9c27b0", "#ff9800"];
            const color = colors[index % colors.length];

            return (
              <Grid item key={plan.id} xs={12} sm={6} md={3}>
                <Paper
                  elevation={plan.recommended ? 8 : 2}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    position: "relative",
                    border: plan.recommended ? `2px solid ${color}` : "none",
                    transform: plan.recommended ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  {plan.recommended && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        bgcolor: color,
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
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    textAlign="center"
                    mb={2}
                  >
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    textAlign="center"
                    color={color}
                    mb={3}
                  >
                    {plan.price} TL
                  </Typography>

                  <Box mb={4}>
                    {plan.features.map((feature, idx) => (
                      <Box
                        key={idx}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={1.5}
                      >
                        <CheckCircleIcon sx={{ color: color, fontSize: 20 }} />
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
                      bgcolor: color,
                      "&:hover": {
                        bgcolor: color,
                        filter: "brightness(0.9)",
                      },
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Abone Ol"
                    )}
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default Subscription;
