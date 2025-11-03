import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Fade,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "../api";

export default function VerifyResult() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, ok: false, msg: "" });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/verify/${token}`);
        if (res.data.status === "success") {
          setState({ loading: false, ok: true, msg: "Hesabın doğrulandı!" });
          setTimeout(() => navigate("/"), 2500);
        } else {
          setState({
            loading: false,
            ok: false,
            msg: res.data.message || "Doğrulama başarısız.",
          });
        }
      } catch (e) {
        setState({
          loading: false,
          ok: false,
          msg: "Geçersiz veya süresi dolmuş bağlantı.",
        });
      }
    })();
  }, [token, navigate]);

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          textAlign: "center",
        }}
      >
        {state.loading ? (
          <>
            <CircularProgress />
            <Typography>Doğrulama yapılıyor…</Typography>
          </>
        ) : state.ok ? (
          <>
            <Alert severity="success">{state.msg}</Alert>
            <Button variant="contained" onClick={() => navigate("/")}>
              Girişe Dön
            </Button>
          </>
        ) : (
          <>
            <Alert severity="error">{state.msg}</Alert>
            <Button
              variant="outlined"
              onClick={() => navigate("/resend-verify")}
            >
              Doğrulama Maili Yeniden Gönder
            </Button>
          </>
        )}
      </Box>
    </Fade>
  );
}
