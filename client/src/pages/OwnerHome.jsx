import jwtDecode from "jwt-decode";
import Navbar from "../components/Navbar";

function OwnerHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  return (
    <div>
      <Navbar />
      <h1>Hoşgeldiniz Sayın Ev Sahibi {decoded?.name}!</h1>
      <p>Ev sahibi panelindesiniz.</p>
    </div>
  );
}
export default OwnerHome;
