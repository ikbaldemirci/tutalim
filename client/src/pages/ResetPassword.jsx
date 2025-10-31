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
  const { token } = useParams();
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
        message: "Şifreler eşleşmiyor",
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
        setTimeout(() => navigate("/reset-success"), 2000);
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Şifre sıfırlama başarısız",
          severity: "error",
        });
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      let displayMessage = "Sunucu hatası. Lütfen tekrar deneyin";

      if (
        serverMessage?.includes("Şifre en az 8 karakter") ||
        serverMessage?.includes("özel karakter") ||
        serverMessage?.includes("büyük harf") ||
        serverMessage?.includes("küçük harf") ||
        serverMessage?.includes("sayı")
      ) {
        displayMessage = "Şifreniz yeterince güçlü değil.";
      } else if (serverMessage?.includes("aynı olamaz")) {
        displayMessage = "Yeni şifreniz eski şifrenizle aynı olamaz ⚠️";
      } else if (serverMessage) {
        displayMessage = serverMessage;
      }

      setSnackbar({
        open: true,
        message: displayMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    const regexStrong =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/;
    if (regexStrong.test(password)) return "strong";
    if (password.length >= 6) return "medium";
    return "weak";
  };

  const strength = getPasswordStrength(form.password);

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
            Şifre Sıfırla
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
              helperText="En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir."
            />

            {form.password && (
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  mt: -1,
                  mb: 1,
                  color:
                    strength === "strong"
                      ? "green"
                      : strength === "medium"
                      ? "orange"
                      : "red",
                  fontWeight: 500,
                }}
              >
                {strength === "strong"
                  ? "Güçlü şifre 💪"
                  : strength === "medium"
                  ? "Orta seviye şifre ⚠️"
                  : "Zayıf şifre ❌"}
              </Typography>
            )}

            <TextField
              label="Yeni Şifre (Tekrar)"
              name="confirm"
              type="password"
              fullWidth
              required
              margin="normal"
              value={form.confirm}
              onChange={handleChange}
              error={form.confirm && form.password !== form.confirm}
              helperText={
                form.confirm && form.password !== form.confirm
                  ? "Şifreler Eşleşmiyor"
                  : ""
              }
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
