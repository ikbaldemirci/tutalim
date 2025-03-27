import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav>
      <span>Tutalim.com</span>
      <button onClick={handleLogout}>Çıkış Yap</button>
    </nav>
  );
}

export default Navbar;
