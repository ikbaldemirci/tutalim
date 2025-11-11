import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Snackbar,
  Alert,
  Portal,
  Typography,
  Button,
  Box,
  MenuItem,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StyledTextField from "../components/StyledTextField";

function Signup({ onSwitch }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/signup", formData);

      if (res.data.status === "success") {
        setSnackbar({
          open: true,
          message: "Kayıt başarılı! Mailini kontrol et.",
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
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      let displayMessage = "Sunucu hatası. Lütfen tekrar deneyin.";

      if (
        serverMessage?.includes("8 karakter") ||
        serverMessage?.includes("özel karakter") ||
        serverMessage?.includes("büyük harf") ||
        serverMessage?.includes("küçük harf") ||
        serverMessage?.includes("sayı")
      ) {
        displayMessage = "Şifreniz yeterince güçlü değil ❌";
      } else if (serverMessage?.includes("zaten kayıtlı")) {
        displayMessage = "Bu e-posta adresiyle zaten kayıtlı bir hesap var ⚠️";
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

      <StyledTextField
        label="İsim"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        fullWidth
      />
      <StyledTextField
        label="Soyisim"
        name="surname"
        value={formData.surname}
        onChange={handleChange}
        required
        fullWidth
      />
      <StyledTextField
        label="E-posta"
        name="mail"
        type="email"
        value={formData.mail}
        onChange={handleChange}
        required
        fullWidth
      />

      {/* <Tooltip
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
        <StyledTextField
          label="Parola"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          fullWidth
        />
      </Tooltip> */}

      {isMobile ? (
        <Box sx={{ width: "100%" }}>
          <StyledTextField
            label="Parola"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            helperText={
              <Typography sx={{ fontSize: "0.8rem", color: "#bbb" }}>
                En az <strong>8 karakter</strong>, bir <strong>büyük</strong>,
                bir <strong>küçük</strong> harf, bir <strong>sayı</strong> ve
                bir <strong>özel karakter</strong> içermelidir.
              </Typography>
            }
          />
        </Box>
      ) : (
        <Tooltip
          title={
            <Typography sx={{ fontSize: "0.85rem", p: 0.5 }}>
              En az <strong>8 karakter</strong>, bir <strong>büyük harf</strong>
              , bir <strong>küçük harf</strong>, bir <strong>sayı</strong> ve
              bir <strong>özel karakter</strong> içermelidir.
            </Typography>
          }
          placement="top-start"
          arrow
        >
          <StyledTextField
            label="Parola"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
          />
        </Tooltip>
      )}

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

      <StyledTextField
        select
        label="Rol"
        name="role"
        value={formData.role}
        onChange={handleChange}
        fullWidth
      >
        <MenuItem value="realtor">Emlakçı</MenuItem>
        <MenuItem value="owner">Ev Sahibi</MenuItem>
      </StyledTextField>

      <Button
        variant="contained"
        color="success"
        type="submit"
        fullWidth
        disabled={loading}
      >
        {loading ? "Kaydediliyor..." : "Kayıt Ol"}
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
