import jwtDecode from "jwt-decode";

function UserHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  return (
    <div>
      <h1>Hoşgeldiniz {decoded?.name || "Kullanıcı"}!</h1>
      <p>Size özel kullanıcı paneline hoş geldiniz.</p>
    </div>
  );
}
export default UserHome;
