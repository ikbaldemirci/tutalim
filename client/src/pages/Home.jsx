import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="container-fluid min-vh-100 d-flex flex-column justify-content-center  text-center"
      style={{
        background:
          "linear-gradient(to bottom, rgba(150, 216, 230, 1), rgba(255, 255, 0, 0))",
      }}
    >
      <Navbar />
      <div className="p-4">
        <h1 className="display-4 fw-bold mb-3">
          🏠 Tutalım.com'a Hoşgeldiniz!
        </h1>
        <p className="lead text-white">
          Ev sahipleri, emlakçılar ve kullanıcılar için güvenli, hızlı ve modern
          bir platform.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            className="btn btn-primary btn-lg px-4"
            onClick={() => navigate("/login")}
          >
            Giriş Yap
          </button>
          <button
            className="btn btn-outline-light btn-lg px-4"
            onClick={() => navigate("/signup")}
          >
            Kayıt Ol
          </button>
        </div>
      </div>

      <footer className="mt-auto py-3">
        <small className="text-light">
          © 2025 Tutalım.com – Tüm Hakları Saklıdır.
        </small>
      </footer>
    </div>
  );
}

export default Home;
