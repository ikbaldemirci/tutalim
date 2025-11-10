import { useEffect, useState } from "react";
import api from "../api";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { CircularProgress, Box, Typography } from "@mui/material";
import BasicTable from "../components/BasicTable";
import WelcomeHeader from "../components/WelcomeHeader";

function OwnerHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [properties, setProperties] = useState([]);
  const [loadingState, setLoadingState] = useState({});
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .get("/properties")
      .then((res) => {
        if (res.data.status === "success") {
          setProperties(res.data.properties);
        }
      })
      .catch((err) => console.error("Veri çekme hatası:", err))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    api
      .get("/assignments/pending")
      .then((res) => {
        if (res.data.status === "success")
          setInvites(res.data.assignments || []);
      })
      .finally(() => setLoadingInvites(false));
  }, [token]);

  const acceptInvite = async (id) => {
    try {
      const res = await api.post(`/assignments/${id}/accept`);
      if (res.data.status === "success") {
        setInvites((prev) => prev.filter((i) => i._id !== id));
        if (res.data.property) {
          setProperties((prev) => [...prev, res.data.property]);
        }
      }
    } catch (err) {
      console.error("Davet kabul hatası:", err);
    }
  };

  const rejectInvite = async (id) => {
    try {
      const res = await api.post(`/assignments/${id}/reject`);
      if (res.data.status === "success") {
        setInvites((prev) => prev.filter((i) => i._id !== id));
      }
    } catch (err) {
      console.error("Davet reddetme hatası:", err);
    }
  };

  return (
    <>
      <Navbar />
      <WelcomeHeader name={decoded?.name} totalCount={properties.length} />

      {!loadingInvites && invites.length > 0 && (
        <Box sx={{ maxWidth: 1000, margin: "0 auto", mt: 2 }}>
          <Box
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              background: "#fff9f1",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Bekleyen Davetler ({invites.length})
            </Typography>
            {invites.map((inv) => (
              <Box
                key={inv._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                }}
              >
                <Typography sx={{ fontSize: 14 }}>
                  {inv.fromUser?.name || inv.fromUser?.mail} sizi bu mülke{" "}
                  {inv.role === "realtor" ? "emlakçı" : "ev sahibi"} olarak
                  atamak istiyor: <strong>{inv.property?.location}</strong>
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <button
                    onClick={() => acceptInvite(inv._id)}
                    style={{
                      padding: "6px 10px",
                      background: "#2E86C1",
                      color: "#fff",
                      border: 0,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Kabul Et
                  </button>
                  <button
                    onClick={() => rejectInvite(inv._id)}
                    style={{
                      padding: "6px 10px",
                      background: "#eee",
                      color: "#333",
                      border: 0,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Reddet
                  </button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 5,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      ) : properties.length > 0 ? (
        <BasicTable
          data={properties}
          onUpdate={(updated) =>
            setProperties((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p))
            )
          }
          loadingState={loadingState}
          setLoadingState={setLoadingState}
        />
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            color: "#777",
            fontStyle: "italic",
          }}
        >
          Henüz ilan bulunmuyor.
        </Box>
      )}
    </>
  );
}

export default OwnerHome;
