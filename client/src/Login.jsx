import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

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
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="mail">Mail:</label>
          <input
            type="email"
            id="mail"
            name="mail"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Hesabım yok <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}

export default Login;
