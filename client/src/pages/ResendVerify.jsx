import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../api";

export default function ResendVerify() {
  const [mail, setMail] = useState("");
  const [sb, setSb] = useState({ open: false, msg: "", sev: "info" });

  const submit = async () => {
    try {
      const res = await api.post("/verify/resend", { mail });
      if (res.data.status === "success") {
        setSb({
          open: true,
          msg: "Doğrulama e-postası gönderildi.",
          sev: "success",
        });
      } else {
        setSb({
          open: true,
          msg: res.data.message || "İşlem başarısız.",
          sev: "warning",
        });
      }
    } catch {
      setSb({ open: true, msg: "Sunucu hatası.", sev: "error" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h5" fontWeight={600}>
        Doğrulama E-postasını Yeniden Gönder
      </Typography>
      <TextField
        label="Kayıtlı E-posta"
        value={mail}
        onChange={(e) => setMail(e.target.value)}
        sx={{ width: 360 }}
      />
      <Button variant="contained" onClick={submit}>
        Gönder
      </Button>
      <Snackbar
        open={sb.open}
        autoHideDuration={3000}
        onClose={() => setSb({ ...sb, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={sb.sev}>{sb.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
