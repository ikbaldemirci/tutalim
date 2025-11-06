import { useState } from "react";
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
  Stack,
} from "@mui/material";
import Navbar from "../components/Navbar";
import WelcomeHeader from "../components/WelcomeHeader";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import IconButton from "@mui/material/IconButton";

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

  const [isEditing, setIsEditing] = useState({
    name: false,
    surname: false,
  });

  const [reminders, setReminders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ message: "", remindAt: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await axios.put(
        `https://tutalim.com/api/users/${decoded.id}`,
        { name: form.name.trim(), surname: form.surname.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
          message: "Profil bilgileriniz başarıyla güncellendi 🎉",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Profil güncellenemedi.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      setSnackbar({
        open: true,
        message: "Profil güncellenemedi. Lütfen tekrar deneyin.",
        severity: "error",
      });
    }
  };

  const handleCancel = (field) => {
    setForm((prev) => ({ ...prev, [field]: decoded?.[field] || "" }));
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  const handlePasswordChange = async () => {
    if (!form.currentPassword || !form.newPassword) {
      setSnackbar({
        open: true,
        message: "Lütfen mevcut ve yeni şifreyi girin.",
        severity: "warning",
      });
      return;
    }

    try {
      const res = await axios.put(
        `https://tutalim.com/api/users/${decoded.id}/password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.status === "success") {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        setSnackbar({
          open: true,
          message:
            "Şifreniz başarıyla değiştirildi. Lütfen tekrar giriş yapın.",
          severity: "success",
        });

        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/");
        }, 2500);
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Şifre değiştirilemedi.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Şifre değişim hatası:", err);
      setSnackbar({
        open: true,
        message: "Şifre değiştirilemedi. Lütfen tekrar deneyin.",
        severity: "error",
      });
    }
  };

  const handleFetchReminders = async () => {
    try {
      const res = await axios.get(
        `https://tutalim.com/api/reminders/${decoded.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.status === "success") {
        setReminders(res.data.reminders);
        setSnackbar({
          open: true,
          message: `Toplam ${res.data.reminders.length} hatırlatıcı bulundu`,
          severity: "info",
        });
      }
    } catch (err) {
      console.error("Hatırlatıcılar alınamadı:", err);
      setSnackbar({
        open: true,
        message: "Hatırlatıcılar alınamadı.",
        severity: "error",
      });
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.message || !newReminder.remindAt) {
      setSnackbar({
        open: true,
        message: "Mesaj ve tarih alanı zorunludur.",
        severity: "warning",
      });
      return;
    }
    try {
      const res = await axios.post(
        `https://tutalim.com/api/reminders`,
        {
          propertyId: "67365dbcf0b06e42eb6ff123",
          message: newReminder.message,
          remindAt: newReminder.remindAt,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.status === "success") {
        setReminders((prev) => [res.data.reminder, ...prev]);
        setOpenModal(false);
        setNewReminder({ message: "", remindAt: "" });
        setSnackbar({
          open: true,
          message: "Hatırlatıcı eklendi",
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

  return (
    <>
      <Navbar />
      <Box sx={{ pb: 1 }}>
        <WelcomeHeader
          name={`${decoded?.name || ""} ${decoded?.surname || ""}`}
        />

        <Paper
          elevation={3}
          sx={{
            maxWidth: 600,
            mx: "auto",
            my: 4,
            p: 4,
            borderRadius: 3,
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          }}
        >
          <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
            Profil Bilgilerim
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                label="Ad"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                InputProps={{ readOnly: !isEditing.name }}
                sx={{ flex: 1 }}
              />
              {isEditing.name ? (
                <>
                  <IconButton color="success" onClick={handleProfileUpdate}>
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleCancel("name")}
                  >
                    <CancelIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton
                  color="primary"
                  onClick={() =>
                    setIsEditing((prev) => ({ ...prev, name: true }))
                  }
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                label="Soyad"
                name="surname"
                value={form.surname}
                onChange={handleChange}
                fullWidth
                InputProps={{ readOnly: !isEditing.surname }}
              />
              {isEditing.surname ? (
                <>
                  <IconButton color="success" onClick={handleProfileUpdate}>
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleCancel("surname")}
                  >
                    <CancelIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton
                  color="primary"
                  onClick={() =>
                    setIsEditing((prev) => ({ ...prev, surname: true }))
                  }
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                label="E-posta"
                name="mail"
                value={form.mail}
                fullWidth
                InputProps={{
                  readOnly: true,
                  sx: { backgroundColor: "#f5f6fa", borderRadius: 1 },
                }}
              />
              <IconButton color="primary" disabled>
                <EditIcon />
              </IconButton>
            </Box>

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
            />

            <Button
              variant="contained"
              onClick={handlePasswordChange}
              sx={{
                alignSelf: "flex-start",
                mt: 1,
                mb: 3,
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(46, 134, 193, 0.3)",
              }}
            >
              Şifreyi Değiştir
            </Button>
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
        Bildirim Geçmişim
      </Typography>

      <Button
        variant="outlined"
        onClick={async () => {
          try {
            const res = await axios.get(
              `https://tutalim.com/api/notifications/${decoded.id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (res.data.status === "success") {
              console.log("Mail geçmişi:", res.data.notifications);
              setSnackbar({
                open: true,
                message: `Toplam ${res.data.notifications.length} mail geçmişi bulundu 📬`,
                severity: "info",
              });
            }
          } catch (err) {
            console.error("Mail geçmişi hatası:", err);
            setSnackbar({
              open: true,
              message: "Mail geçmişi alınamadı.",
              severity: "error",
            });
          }
        }}
      >
        Mail Geçmişini Görüntüle
      </Button>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
        Hatırlatıcılarım
      </Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="outlined" onClick={handleFetchReminders}>
          Hatırlatıcıları Getir
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => setOpenModal(true)}
        >
          + Yeni Hatırlatıcı
        </Button>
      </Stack>

      {reminders.length > 0 ? (
        reminders.map((r) => (
          <Paper
            key={r._id}
            sx={{
              mb: 1,
              p: 1.5,
              maxWidth: 600,
              mx: "auto",
              background: r.isDone ? "#e8f5e9" : "#fafafa",
              borderLeft: r.isDone ? "4px solid #28B463" : "4px solid #2E86C1",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {r.message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(r.remindAt).toLocaleString("tr-TR")}
            </Typography>
            {r.isDone && (
              <Typography variant="caption" color="green">
                Tamamlandı
              </Typography>
            )}
          </Paper>
        ))
      ) : (
        <Typography color="text.secondary" sx={{ ml: 1 }}>
          Henüz hatırlatıcı oluşturmadınız.
        </Typography>
      )}

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
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Profile;
