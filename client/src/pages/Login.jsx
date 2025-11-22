import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Snackbar,
  Alert,
  Portal,
  Dialog,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
} from "@mui/material";
import StyledTextField from "../components/StyledTextField";

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
        if (res.data.code === "EMAIL_NOT_VERIFIED") {
          setTimeout(() => {
            navigate("/check-mail-verify");
          }, 800);
        }
        setSnackbar({
          open: true,
          message: res.data.message || "Giriş başarısız",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Sunucu hatası",
        severity: "error",
      });
    }
  };

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
    } catch {
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
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h5" fontWeight="bold" textAlign="center">
        Giriş Yap
      </Typography>

      <StyledTextField
        label="E-posta"
        type="email"
        variant="outlined"
        fullWidth
        value={mail}
        onChange={(e) => setMail(e.target.value)}
        required
      />
      <StyledTextField
        label="Parola"
        type="password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button
        variant="contained"
        color="primary"
        type="submit"
        sx={{
          display: "block",
          maxWidth: "260px",
          width: "100%",
          mx: "auto",
          mt: 1,
        }}
      >
        Giriş Yap
      </Button>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
          gap: 1,
        }}
      >
        <Button
          onClick={onSwitch}
          sx={{
            textTransform: "none",
            color: "#fff",
            "&:hover": { color: "#5DADE2" },
          }}
        >
          Kayıt Ol
        </Button>
        <Button
          onClick={() => setForgotOpen(true)}
          sx={{
            textTransform: "none",
            color: "#fff",
            "&:hover": { color: "#5DADE2" },
          }}
        >
          Şifremi Unuttum
        </Button>
      </Box>

      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" textAlign="center" mb={2}>
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
            onClick={handleForgotPassword}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Gönder"
            )}
          </Button>
        </Box>
      </Dialog>

      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </Box>
  );
}

export default Login;
