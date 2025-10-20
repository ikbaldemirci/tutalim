import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Fade,
} from "@mui/material";

function ResetPassword() {
  const { token } = useParams(); // URL'den token al
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirm: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setSnackbar({
        open: true,
        message: "Şifreler eşleşmiyor ❌",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/reset-password/${token}`, {
        password: form.password,
      });

      if (res.data.status === "success") {
        setSnackbar({
          open: true,
          message: "Şifre başarıyla değiştirildi ✅",
          severity: "success",
        });
        setTimeout(() => navigate("/"), 2000);
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Şifre sıfırlama başarısız ❌",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Şifre sıfırlama hatası:", err);
      setSnackbar({
        open: true,
        message: "Sunucu hatası. Lütfen tekrar deneyin ❌",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to right, #eaf2f8, #f4f9ff)",
        }}
      >
        <Paper
          elevation={10}
          sx={{
            width: "100%",
            maxWidth: 380,
            p: 4,
            borderRadius: 3,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255,255,255,0.8)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            sx={{ color: "#2E86C1", mb: 3 }}
          >
            🔒 Şifre Sıfırla
          </Typography>

          <form onSubmit={handleReset}>
            <TextField
              label="Yeni Şifre"
              name="password"
              type="password"
              fullWidth
              required
              margin="normal"
              value={form.password}
              onChange={handleChange}
            />
            <TextField
              label="Yeni Şifre (Tekrar)"
              name="confirm"
              type="password"
              fullWidth
              required
              margin="normal"
              value={form.confirm}
              onChange={handleChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1,
                fontWeight: 600,
                background: "linear-gradient(135deg, #2E86C1, #5DADE2)",
              }}
            >
              {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
            </Button>
          </form>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Paper>
      </Box>
    </Fade>
  );
}

export default ResetPassword;
