// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../api";
// import "../styles/Signup.css";

// function Signup() {
//   const [formData, setFormData] = useState({
//     name: "",
//     surname: "",
//     mail: "",
//     password: "",
//     role: "realtor",
//   });

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/signup", formData);
//       if (res.data.status === "success") {
//         navigate("/login");
//       } else {
//         alert(res.data.message || "Signup failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Sunucu hatası");
//     }
//   };

//   return (
//     <div className="signup-container">
//       {/* 2) Beyaz kart stili */}
//       <div className="signup-box">
//         <h2>Kayıt Ol</h2>

//         <form onSubmit={handleSignup}>
//           <div className="form-group">
//             <label htmlFor="name">İsim</label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="surname">Soyisim</label>
//             <input
//               type="text"
//               id="surname"
//               name="surname"
//               value={formData.surname}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="mail">E-posta</label>
//             <input
//               type="email"
//               id="mail"
//               name="mail"
//               value={formData.mail}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="password">Parola</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="role">Rol</label>
//             <select
//               id="role"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               required
//             >
//               <option value="realtor">Emlakçı</option>
//               <option value="owner">Ev Sahibi</option>
//               <option value="user">Kullanıcı</option>
//             </select>
//           </div>

//           <button type="submit">Kayıt Ol</button>
//         </form>

//         <p className="login-link">
//           Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Signup;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Signup.css";
import { Snackbar, Alert, Portal } from "@mui/material";

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
          message: "Kaydınız başarıyla oluşturuldu 🎉 Giriş yapabilirsiniz.",
          severity: "success",
        });

        // ✅ 2 saniye sonra login formuna dön
        setTimeout(() => {
          onSwitch();
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message:
            res.data.message || "Kayıt başarısız. Lütfen tekrar deneyin.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Sunucu hatası. Lütfen tekrar deneyin.",
        severity: "error",
      });
    }
  };

  return (
    <div>
      <div className="signup-box">
        <h2>Kayıt Ol</h2>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="name">İsim</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="surname">Soyisim</label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mail">E-posta</label>
            <input
              type="email"
              id="mail"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parola</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="realtor">Emlakçı</option>
              <option value="owner">Ev Sahibi</option>
              <option value="user">Kullanıcı</option>
            </select>
          </div>

          <button type="submit">Kayıt Ol</button>
        </form>
        <p className="login-link">
          Zaten hesabınız var mı?{" "}
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
            Giriş Yap
          </button>
        </p>
      </div>
      {/* Snackbar (portaled to body so it's not clipped by parents) */}
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
    </div>
  );
}

export default Signup;
