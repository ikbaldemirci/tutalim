import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Snackbar,
  Alert,
  Portal,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Tooltip,
} from "@mui/material";

function Signup({ onSwitch }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    mail: "",
    password: "",
    role: "realtor",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/signup", formData);
      if (res.data.status === "success") {
        setSnackbar({
          open: true,
          message: "Kayıt başarılı! Mailini kontrol et",
          severity: "success",
        });
        setTimeout(() => navigate("/check-mail-verify"), 1500);
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Kayıt başarısız.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Sunucu hatası. Lütfen tekrar deneyin.",
        severity: "error",
      });
    }
  };

  const getPasswordStrength = (password) => {
    const regexStrong =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/;
    if (regexStrong.test(password)) return "strong";
    if (password.length >= 6) return "medium";
    return "weak";
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <Box
      component="form"
      onSubmit={handleSignup}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h5" fontWeight="bold" textAlign="center">
        Kayıt Ol
      </Typography>

      <TextField
        label="İsim"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        fullWidth
      />
      <TextField
        label="Soyisim"
        name="surname"
        value={formData.surname}
        onChange={handleChange}
        required
        fullWidth
      />
      <TextField
        label="E-posta"
        name="mail"
        type="email"
        value={formData.mail}
        onChange={handleChange}
        required
        fullWidth
      />
      <Tooltip
        title={
          <Typography sx={{ fontSize: "0.85rem", p: 0.5 }}>
            En az <strong>8 karakter</strong>, bir <strong>büyük harf</strong>,
            bir <strong>küçük harf</strong>, bir <strong>sayı</strong> ve bir{" "}
            <strong>özel karakter</strong> içermelidir.
          </Typography>
        }
        placement="top-start"
        arrow
      >
        <TextField
          label="Parola"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          fullWidth
        />
      </Tooltip>

      {formData.password && (
        <Typography
          sx={{
            fontSize: "0.85rem",
            mt: -1,
            mb: 1,
            color:
              strength === "strong"
                ? "lightgreen"
                : strength === "medium"
                ? "orange"
                : "tomato",
            textAlign: "center",
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
        select
        label="Rol"
        name="role"
        value={formData.role}
        onChange={handleChange}
        fullWidth
      >
        <MenuItem value="realtor">Emlakçı</MenuItem>
        <MenuItem value="owner">Ev Sahibi</MenuItem>
        {/* <MenuItem value="user">Kullanıcı</MenuItem> */}
      </TextField>

      <Button variant="contained" color="success" type="submit" fullWidth>
        Kayıt Ol
      </Button>

      <Button
        onClick={onSwitch}
        sx={{
          textTransform: "none",
          color: "#fff",
          "&:hover": { color: "#5DADE2" },
        }}
      >
        Giriş Yap
      </Button>

      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Portal>
    </Box>
  );
}

export default Signup;
