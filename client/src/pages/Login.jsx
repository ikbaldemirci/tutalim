// import React from "react";
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../api";
// import "../styles/Login.css";

// function Login() {
//   const [mail, setMail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/login", { mail, password });
//       if (res.data.status === "success") {
//         localStorage.setItem("token", res.data.token);
//         console.log("kaydedilen token:", res.data.token);
//         const decoded = JSON.parse(atob(res.data.token.split(".")[1]));

//         if (decoded.role === "realtor") navigate("/realtor");
//         else if (decoded.role === "owner") navigate("/owner");
//         // else if (decoded.role === "user") navigate("/");
//         // else if(decoded.role === "kullanıcı") navigate("/home");
//       } else {
//         78;
//         alert(res.data.message || "Login failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Sunucu hatası");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h2>Giriş Yap</h2>
//         <form onSubmit={handleLogin}>
//           <label htmlFor="mail">E-posta</label>
//           <input
//             type="email"
//             id="mail"
//             name="mail"
//             value={mail}
//             onChange={(e) => setMail(e.target.value)}
//             required
//           />

//           <label htmlFor="password">Parola</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <button type="submit">Giriş Yap</button>
//         </form>
//         <p className="signup-link">
//           Hesabın yok mu? <Link to="/signup">Kayıt Ol</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css";
import {
  Snackbar,
  Alert,
  Portal,
  Dialog,
  Typography,
  TextField,
  Button,
} from "@mui/material";

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
        setSnackbar({
          open: true,
          message: res.data.message || "Login failed",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu hatası");
    }
  };

  return (
    <div>
      <div className="login-box">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="mail">E-posta</label>
          <input
            type="email"
            id="mail"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />

          <label htmlFor="password">Parola</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Giriş Yap</button>
        </form>
        <p className="signup-link">
          Hesabın yok mu?{" "}
          <button
            type="button"
            onClick={onSwitch}
            style={{
              background: "none",
              border: "none",
              color: "#2E86C1",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Kayıt Ol
          </button>
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#2E86C1",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Şifremi Unuttum
          </button>
        </p>
      </div>
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 2 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: 600,
            color: "#2E86C1",
            mb: 2,
          }}
        >
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
          disabled={loading}
          onClick={async () => {
            try {
              setLoading(true);
              const res = await api.post("/forgot-password", {
                mail: forgotMail,
              });
              setSnackbar({
                open: true,
                message: res.data.message,
                severity: "success",
              });
              setForgotOpen(false);
            } catch (err) {
              console.error("Şifre sıfırlama hatası:", err);
              setSnackbar({
                open: true,
                message: "E-posta gönderilemedi. Lütfen tekrar deneyin.",
                severity: "error",
              });
            } finally {
              setLoading(false);
            }
          }}
        >
          Gönder
        </Button>
      </Dialog>
    </div>
  );
}

export default Login;
