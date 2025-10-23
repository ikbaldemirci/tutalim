import { useEffect, useState } from "react";
import axios from "axios";
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

  useEffect(() => {
    if (token) {
      const ownerId = decoded?.id;
      axios
        .get("http://localhost:5000/api/properties", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.status === "success") {
            setProperties(res.data.properties);
          }
        })
        .catch((err) => console.error("Veri çekme hatası:", err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  return (
    <>
      <Navbar />

      <WelcomeHeader name={decoded?.name || "Kullanıcı"} />

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
