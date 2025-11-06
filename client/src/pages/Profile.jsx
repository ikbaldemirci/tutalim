import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Snackbar,
  Alert,
  Divider,
  Modal,
} from "@mui/material";
import Navbar from "../components/Navbar";
import WelcomeHeader from "../components/WelcomeHeader";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshRes = await axios.post(
          "https://tutalim.com/api/refresh",
          {},
          { withCredentials: true }
        );
        if (refreshRes.data.status === "success" && refreshRes.data.token) {
          localStorage.setItem("token", refreshRes.data.token);
          error.config.headers[
            "Authorization"
          ] = `Bearer ${refreshRes.data.token}`;
          return axios(error.config);
        }
      } catch (err) {
        console.error("Token yenileme hatası:", err);
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

function Profile() {
  const token = localStorage.getItem("token");
  const [decoded, setDecoded] = useState(token ? jwtDecode(token) : null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: decoded?.name || "",
    surname: decoded?.surname || "",
    mail: decoded?.mail || "",
    currentPassword: "",
    newPassword: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isEditing, setIsEditing] = useState({ name: false, surname: false });
  const [mailHistory, setMailHistory] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ message: "", remindAt: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfileUpdate = async () => {
    try {
      const res = await axios.put(
        `https://tutalim.com/api/users/${decoded.id}`,
        { name: form.name.trim(), surname: form.surname.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.status === "success") {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          setDecoded(jwtDecode(res.data.token));
        }
        setIsEditing({ name: false, surname: false });
        setSnackbar({
          open: true,
          message: "Profil güncellendi 🎉",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      setSnackbar({
        open: true,
        message: "Profil güncellenemedi.",
        severity: "error",
      });
    }
  };

  const handleCancel = (field) => {
    setForm((prev) => ({ ...prev, [field]: decoded?.[field] || "" }));
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  const handlePasswordChange = async () => {
    if (!form.currentPassword || !form.newPassword)
      return setSnackbar({
        open: true,
        message: "Lütfen tüm alanları doldurun.",
        severity: "warning",
      });

    try {
      const res = await axios.put(
        `https://tutalim.com/api/users/${decoded.id}/password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        setSnackbar({
          open: true,
          message: "Şifre değiştirildi. Yeniden giriş yapın.",
          severity: "success",
        });
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/");
        }, 2500);
      }
    } catch (err) {
      console.error("Şifre değişim hatası:", err);
      setSnackbar({
        open: true,
        message: "Şifre değiştirilemedi.",
        severity: "error",
      });
    }
  };

  const handleFetchNotifications = async () => {
    try {
      const res = await axios.get(
        `https://tutalim.com/api/notifications/${decoded.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.status === "success") {
        setMailHistory(res.data.notifications || []);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Mail geçmişi alınamadı.",
        severity: "error",
      });
    }
  };

  const handleFetchReminders = async () => {
    try {
      const res = await axios.get(
        `https://tutalim.com/api/reminders/${decoded.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.status === "success") setReminders(res.data.reminders);
    } catch (err) {
      console.error("Hatırlatıcılar alınamadı:", err);
    }
  };

  useEffect(() => {
    if (decoded) {
      handleFetchReminders();
      handleFetchNotifications();
    }
  }, [decoded]);

  const handleAddReminder = async () => {
    if (!newReminder.message || !newReminder.remindAt)
      return setSnackbar({
        open: true,
        message: "Mesaj ve tarih zorunludur.",
        severity: "warning",
      });

    const selectedTime = newReminder.remindAt;
    const fixedDate = `${selectedTime}:00+03:00`;

    try {
      const res = await axios.post(
        `https://tutalim.com/api/reminders`,
        {
          propertyId: "67365dbcf0b06e42eb6ff123",
          message: newReminder.message,
          remindAt: fixedDate,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.status === "success") {
        setReminders((prev) => [res.data.reminder, ...prev]);
        setOpenModal(false);
        setNewReminder({ message: "", remindAt: "" });
        setSnackbar({
          open: true,
          message: "Hatırlatıcı eklendi ✅",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Hatırlatıcı ekleme hatası:", err);
      setSnackbar({
        open: true,
        message: "Hatırlatıcı eklenemedi.",
        severity: "error",
      });
    }
  };

  const handleDeleteReminder = async (id) => {
    const ok = window.confirm("Bu hatırlatıcıyı silmek istiyor musun?");
    if (!ok) return;

    try {
      await axios.delete(`https://tutalim.com/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReminders((prev) => prev.filter((r) => r._id !== id));
      setSnackbar({
        open: true,
        message: "Hatırlatıcı silindi",
        severity: "success",
      });
    } catch (err) {
      console.error("Hatırlatıcı silme hatası:", err);
      setSnackbar({
        open: true,
        message: "Hatırlatıcı silinemedi.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ pb: 4 }}>
        <WelcomeHeader
          name={`${decoded?.name || ""} ${decoded?.surname || ""}`}
        />

        <Paper
          sx={{
            maxWidth: 850,
            mx: "auto",
            p: 4,
            borderRadius: 3,
            mt: 4,
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          }}
        >
          {/* 🔹 Bildirim Geçmişi */}
          <Typography variant="h6" fontWeight={600} color="primary" mb={1}>
            Bildirim Geçmişim
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              maxHeight: 220,
              overflowY: "auto",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              p: 1,
              mb: 4,
              bgcolor: "#fafafa",
            }}
          >
            {mailHistory.length > 0 ? (
              mailHistory.slice(0, 5).map((mail, i) => (
                <Paper
                  key={i}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    background: "#fff",
                    borderLeft: "4px solid #2E86C1",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {mail.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(mail.createdAt).toLocaleString("tr-TR")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mail.to}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ p: 1 }}>
                Henüz mail geçmişi bulunmuyor.
              </Typography>
            )}
          </Box>

          {/* 🔹 Hatırlatıcılarım */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="h6" fontWeight={600} color="primary">
              Hatırlatıcılarım
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => setOpenModal(true)}
            >
              + Yeni
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              maxHeight: 220,
              overflowY: "auto",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              p: 1,
              mb: 4,
              bgcolor: "#fafafa",
            }}
          >
            {reminders.length > 0 ? (
              reminders.slice(0, 5).map((r) => (
                <Paper
                  key={r._id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: r.isDone ? "#e8f5e9" : "#fff",
                    borderLeft: r.isDone
                      ? "4px solid #28B463"
                      : "4px solid #2E86C1",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {r.message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(r.remindAt).toLocaleString("tr-TR")}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label="hatırlatıcıyı sil"
                    onClick={() => handleDeleteReminder(r._id)}
                    sx={{ color: "#dc3545" }}
                  >
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ p: 1 }}>
                Henüz hatırlatıcı yok.
              </Typography>
            )}
          </Box>

          {/* 🔹 Profil Bilgilerim */}
          <Typography variant="h6" fontWeight={600} color="primary" mb={1}>
            Profil Bilgilerim
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {["name", "surname"].map((field) => (
              <Box
                key={field}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TextField
                  label={field === "name" ? "Ad" : "Soyad"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ readOnly: !isEditing[field] }}
                />
                {isEditing[field] ? (
                  <>
                    <IconButton color="success" onClick={handleProfileUpdate}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleCancel(field)}
                    >
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <IconButton
                    color="primary"
                    onClick={() =>
                      setIsEditing((prev) => ({ ...prev, [field]: true }))
                    }
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <TextField
              label="E-posta"
              name="mail"
              value={form.mail}
              fullWidth
              InputProps={{
                readOnly: true,
                sx: { backgroundColor: "#f5f6fa", borderRadius: 1 },
              }}
              sx={{ mt: 1 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={500}>
              Şifre Değiştir
            </Typography>
            <TextField
              label="Mevcut Şifre"
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Yeni Şifre"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 1 }}
            />
            <Button variant="contained" onClick={handlePasswordChange}>
              Şifreyi Değiştir
            </Button>
          </Box>
        </Paper>
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            p: 3,
            bgcolor: "background.paper",
            maxWidth: 400,
            mx: "auto",
            mt: "20vh",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Yeni Hatırlatıcı Ekle
          </Typography>
          <TextField
            label="Mesaj"
            fullWidth
            sx={{ mb: 2 }}
            value={newReminder.message}
            onChange={(e) =>
              setNewReminder({ ...newReminder, message: e.target.value })
            }
          />
          <TextField
            label="Tarih"
            type="datetime-local"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            value={newReminder.remindAt}
            onChange={(e) =>
              setNewReminder({ ...newReminder, remindAt: e.target.value })
            }
          />
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleAddReminder}
          >
            Ekle
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}

export default Profile;
