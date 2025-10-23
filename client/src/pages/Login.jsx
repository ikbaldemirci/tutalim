import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css";
import {
  Snackbar,
  Alert,
  Portal,
  Dialog,
  Typography,
  TextField,
  Button,
} from "@mui/material";

function Login({ onSwitch }) {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotMail, setForgotMail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { mail, password });
      if (res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
        if (decoded.role === "realtor") navigate("/realtor");
        else if (decoded.role === "owner") navigate("/owner");
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Giriş başarısız",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Sunucu hatası",
        severity: "error",
      });
    }
  };

  // 📨 Şifremi Unuttum
  const handleForgotPassword = async () => {
    if (!forgotMail) return;
    try {
      setLoading(true);
      const res = await api.post("/forgot-password", { mail: forgotMail });

      if (res.data.status === "success") {
        setForgotOpen(false);
        navigate("/check-mail");
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "E-posta bulunamadı.",
          severity: "warning",
        });
      }
    } catch (err) {
      console.error("Şifre sıfırlama hatası:", err);
      setSnackbar({
        open: true,
        message: "E-posta gönderilemedi. Lütfen tekrar deneyin.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="login-box">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="mail">E-posta</label>
          <input
            type="email"
            id="mail"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />

          <label htmlFor="password">Parola</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Giriş Yap</button>
        </form>

        <p className="signup-link">
          Hesabın yok mu?{" "}
          <button
            type="button"
            onClick={onSwitch}
            style={{
              background: "none",
              border: "none",
              color: "#2E86C1",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Kayıt Ol
          </button>
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#2E86C1",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Şifremi Unuttum
          </button>
        </p>
      </div>

      {/* 🔹 Şifremi Unuttum Dialog */}
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 2 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: 600,
            color: "#2E86C1",
            mb: 2,
          }}
        >
          🔒 Şifremi Unuttum
        </Typography>

        <TextField
          fullWidth
          label="Kayıtlı E-posta Adresiniz"
          type="email"
          value={forgotMail}
          onChange={(e) => setForgotMail(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          disabled={loading}
          onClick={handleForgotPassword}
        >
          Gönder
        </Button>
      </Dialog>

      {/* 🔔 Snackbar */}
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </div>
  );
}

export default Login;
