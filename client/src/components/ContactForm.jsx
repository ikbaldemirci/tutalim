import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Box,
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://tutalim.com/api/contact", form);
      if (res.data?.status === "success") {
        setSnackbar({
          open: true,
          message: "Mesajınız başarıyla gönderildi 🎉",
          severity: "success",
        });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error();
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Bir hata oluştu. Lütfen tekrar deneyin ❌",
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
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Mesajınız"
        name="message"
        value={form.message}
        onChange={handleChange}
        sx={{ mb: 3 }}
        required
      />
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
        Mesajı Gönder 🚀
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
