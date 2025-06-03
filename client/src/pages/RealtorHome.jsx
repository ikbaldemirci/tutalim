import jwtDecode from "jwt-decode";
import Navbar from "../components/Navbar";

function RealtorHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  return (
    <div>
      <Navbar />
      <h1>Hoşgeldiniz {decoded?.name} - Emlakçı Paneli</h1>
      <p>Burada ilanlarınızı yönetebilirsiniz.</p>
    </div>
  );
}
export default RealtorHome;
