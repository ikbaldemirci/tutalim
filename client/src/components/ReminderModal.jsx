import { useState, useEffect, use } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import trLocale from "date-fns/locale/tr";

export default function ReminderModal({
  open,
  onClose,
  onSubmit,
  propertyId = null,
  isGeneral = false,
  existingReminders = [],
}) {
  const [form, setForm] = useState({
    message: "",
    remindAt: null,
    type: "",
    dayOfMonth: "",
    monthsBefore: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newValue) => {
    if (newValue) {
      const iso = newValue.toISOString();
      setForm((prev) => ({ ...prev, remindAt: iso }));
    }
  };

  const handleSave = () => {
    if (!isGeneral && !form.type) {
      alert("Lütfen hatırlatıcı türünü seçin!");
      return;
    }

    if (isGeneral && !form.remindAt) {
      alert("Tarih seçmek zorunludur!");
      return;
    }

    const data = {
      message: form.message || "",
      remindAt: form.remindAt,
      propertyId,
      type: form.type || null,
      dayOfMonth: form.dayOfMonth ? Number(form.dayOfMonth) : null,
      monthsBefore: form.monthsBefore ? Number(form.monthsBefore) : null,
    };

    onSubmit(data);
    setForm({
      message: "",
      remindAt: null,
      type: "",
      dayOfMonth: "",
      monthsBefore: "",
    });
  };

  useEffect(() => {
    if (open) {
      setForm({
        message: "",
        remindAt: null,
        type: "",
        dayOfMonth: "",
        monthsBefore: "",
      });
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          maxWidth: 420,
          mx: "auto",
          mt: "20vh",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2} color="primary" fontWeight={600}>
          {isGeneral ? "Yeni Hatırlatıcı Ekle" : "Mülke Özel Hatırlatıcı"}
        </Typography>

        {!isGeneral && existingReminders.length > 0 && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: "#E8F6F3",
              borderLeft: "4px solid #28B463",
              maxHeight: "200px",
              overflowY: "auto",
              pr: "10px",
            }}
          >
            <Typography fontWeight={600} mb={1}>
              Bu mülke ait mevcut hatırlatıcılar:
            </Typography>

            {existingReminders.map((r, i) => (
              <Typography key={i} sx={{ mb: 0.5 }}>
                •{" "}
                <b>
                  {r.type === "monthlyPayment"
                    ? "Her ay belirli bir günde hatırlatma"
                    : "Sözleşme bitmeden X ay önce hatırlatma"}
                </b>
                — {new Date(r.remindAt).toLocaleString("tr-TR")}
              </Typography>
            ))}

            <Typography mt={1} fontSize="0.85rem" color="text.secondary">
              Tüm hatırlatıcılarınızı Profil → Hatırlatıcılarım sekmesinden
              görüntüleyebilirsiniz.
            </Typography>
          </Box>
        )}

        {!isGeneral && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="type-label">Hatırlatıcı Türü</InputLabel>
            <Select
              labelId="type-label"
              name="type"
              value={form.type}
              label="Hatırlatıcı Türü"
              onChange={handleChange}
            >
              <MenuItem value="monthlyPayment">
                Her ay belirli bir günde hatırlat
              </MenuItem>
              <MenuItem value="contractEnd">
                Sözleşme bitmeden X ay önce hatırlat
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {form.type === "monthlyPayment" && (
          <TextField
            label="Ayın Kaçıncı Günü"
            name="dayOfMonth"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ min: 1, max: 31 }}
            value={form.dayOfMonth}
            onChange={handleChange}
          />
        )}

        {form.type === "contractEnd" && (
          <TextField
            label="Kaç Ay Öncesinden Hatırlatılsın?"
            name="monthsBefore"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ min: 1, max: 12 }}
            value={form.monthsBefore}
            onChange={handleChange}
          />
        )}

        {isGeneral && (
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={trLocale}
          >
            <DateTimePicker
              label="Tarih ve Saat (5 dakikalık aralıklarla)"
              value={form.remindAt ? new Date(form.remindAt) : null}
              onChange={handleDateChange}
              ampm={false}
              minutesStep={5}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { mb: 2 },
                },
              }}
            />
          </LocalizationProvider>
        )}

        <TextField
          label="Mesaj (isteğe bağlı)"
          name="message"
          fullWidth
          sx={{ mb: 2 }}
          value={form.message}
          onChange={handleChange}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSave}
        >
          Kaydet
        </Button>
      </Box>
    </Modal>
  );
}
