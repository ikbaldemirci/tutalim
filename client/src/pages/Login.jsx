import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css";

function Login() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { mail, password });
      if (res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        const decoded = JSON.parse(atob(res.data.token.split(".")[1]));

        if (decoded.role === "emlakçı") navigate("/realtor");
        else if (decoded.role === "ev sahibi") navigate("/owner");
        else if (decoded.role === "kullanıcı") navigate("/");
        // else if(decoded.role === "kullanıcı") navigate("/home");
      } else {
        78;
        alert(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu hatası");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="mail">E-posta</label>
          <input
            type="email"
            id="mail"
            name="mail"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />

          <label htmlFor="password">Parola</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Giriş Yap</button>
        </form>
        <p className="signup-link">
          Hesabın yok mu? <Link to="/signup">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
