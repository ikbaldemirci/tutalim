import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Box,
  Typography,
} from "@mui/material";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const maxChars = 500;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "message" && value.length > maxChars) return;
    setForm({ ...form, [name]: value });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.name.trim().length < 3) {
      setSnackbar({
        open: true,
        message: "Lütfen en az 3 karakterlik bir ad-soyad girin",
        severity: "warning",
      });
      return;
    }

    if (!validateEmail(form.email)) {
      setSnackbar({
        open: true,
        message: "Geçerli bir e-posta adresi girin",
        severity: "warning",
      });
      return;
    }

    if (!form.message.trim()) {
      setSnackbar({
        open: true,
        message: "Mesaj alanı boş bırakılamaz",
        severity: "warning",
      });
      return;
    }

    try {
      const res = await axios.post("https://tutalim.com/api/contact", form);

      if (res.data?.status === "success") {
        setSnackbar({
          open: true,
          message: "Mesajınız başarıyla gönderildi",
          severity: "success",
        });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error();
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Bir hata oluştu. Lütfen tekrar deneyin",
        severity: "error",
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Ad Soyad"
        name="name"
        value={form.name}
        onChange={handleChange}
        sx={{ mb: 2 }}
        required
        inputProps={{ minLength: 3 }}
      />

      <TextField
        fullWidth
        label="E-posta"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        sx={{ mb: 2 }}
        required
      />

      <TextField
        fullWidth
        select
        label="Konu"
        name="subject"
        value={form.subject}
        onChange={handleChange}
        sx={{ mb: 2 }}
      >
        <MenuItem value="Destek">Destek</MenuItem>
        <MenuItem value="Ortaklık">Ortaklık</MenuItem>
        <MenuItem value="Teknik Problem">Teknik Problem</MenuItem>
        <MenuItem value="Genel Bilgi">Genel Bilgi</MenuItem>
      </TextField>

      <Box sx={{ position: "relative", mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Mesajınız"
          name="message"
          value={form.message}
          onChange={handleChange}
          inputProps={{ maxLength: maxChars }}
          required
        />
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 4,
            right: 12,
            color:
              form.message.length >= maxChars * 0.9
                ? "error.main"
                : "text.secondary",
          }}
        >
          {form.message.length}/{maxChars}
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        type="submit"
        sx={{
          background: "linear-gradient(90deg, #2E86C1, #5DADE2)",
          color: "#fff",
          fontWeight: 600,
          borderRadius: 2,
          py: 1.2,
          "&:hover": {
            background: "linear-gradient(90deg, #1f618d, #3498db)",
          },
        }}
      >
        Mesajı Gönder
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
