import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    mail: "",
    password: "",
    role: "emlakçı",
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
        navigate("/login");
      } else {
        alert(res.data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu hatası");
    }
  };

  return (
    <div>
      <form onSubmit={handleSignup}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="surname">Surname:</label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="mail">Mail:</label>
          <input
            type="email"
            id="mail"
            name="mail"
            value={formData.mail}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="emlakçı">Emlakçı</option>
            <option value="ev sahibi">Ev Sahibi</option>
            <option value="kullanıcı">Kullanıcı</option>
          </select>
        </div>
        <button type="submit">SignUp</button>
      </form>
      <p>Already Have an Account</p>
      <Link to="/login">Login</Link>
    </div>
  );
}

export default Signup;
