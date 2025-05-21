import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1>🏠 Tutalım.com'a Hoşgeldiniz!</h1>
      <p>Ev sahipleri, emlakçılar ve kullanıcılar için güvenli platform.</p>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          Giriş Yap
        </button>
        <button
          className="btn btn-outline-success"
          onClick={() => navigate("/signup")}
        >
          Kayıt Ol
        </button>
      </div>
    </div>
  );
}

export default Home;
