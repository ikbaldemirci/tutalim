import { useEffect, useRef, useState } from "react";
import api from "../api";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { Box, Snackbar, Alert, Slide, CircularProgress } from "@mui/material";
import BasicTable from "../components/BasicTable";
import WelcomeHeader from "../components/WelcomeHeader";
import InviteList from "../components/InviteList";
import InviteModal from "../components/InviteModal";
import AddPropertyCard from "../components/AddPropertyCard";
import { useConfirm } from "../context/ConfirmDialogContext";

function RealtorHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [properties, setProperties] = useState([]);
  const [loadingState, setLoadingState] = useState({});
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const { confirm } = useConfirm();

  const didFetchPropsRef = useRef(false);
  useEffect(() => {
    if (didFetchPropsRef.current) return;
    if (!token || !decoded?.id) {
      setLoading(false);
      return;
    }
    didFetchPropsRef.current = true;
    api
      .get("/properties")
      .then((res) => {
        if (res.data.status === "success") {
          setProperties(res.data.properties);
        }
      })
      .catch((err) => console.error("Veri çekme hatası:", err))
      .finally(() => setLoading(false));
  }, []);

  const didFetchInvitesRef = useRef(false);
  useEffect(() => {
    if (didFetchInvitesRef.current) return;
    if (!token) return;
    didFetchInvitesRef.current = true;
    api
      .get("/assignments/pending")
      .then((res) => {
        if (res.data.status === "success")
          setInvites(res.data.assignments || []);
      })
      .finally(() => setLoadingInvites(false));

    // Abonelik durumunu kontrol et
    api
      .get("/payment/status")
      .then((res) => {
        if (res.data.status === "success") {
          setIsSubscribed(res.data.isSubscribed);
          if (res.data.subscription) {
            setSubscriptionPlan(res.data.subscription.planType);
          }
        }
      })
      .catch((err) => console.error("Abonelik durumu alınamadı:", err));
  }, []);

  const acceptInvite = async (id) => {
    try {
      const res = await api.put(`/assignments/${id}/accept`);
      if (res.data.status === "success") {
        setInvites((prev) => prev.filter((i) => i._id !== id));
        if (res.data.property) {
          setProperties((prev) => [...prev, res.data.property]);
        }
      }
    } catch (err) {
      console.error("Davet kabul hatası:", err);
      if (err.response?.data?.message?.includes("LIMIT_REACHED")) {
        const confirmed = await confirm({
          title: "Yönetim Kotası Doldu",
          message:
            "Mevcut paketinizle en fazla 10 mülk yönetebilirsiniz. Devam etmek için aboneliğinizi yükseltin.",
          severity: "warning",
          confirmText: "Paketleri İncele",
          cancelText: "İptal",
        });

        if (confirmed) {
          window.location.href = "/subscription";
        }
      }
    }
  };

  const rejectInvite = async (id) => {
    try {
      const res = await api.put(`/assignments/${id}/reject`);
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
      <WelcomeHeader
        name={decoded?.name}
        totalCount={properties.length}
        inviteCount={invites.length}
        onOpenInvites={() => setInviteModalOpen(true)}
        subscriptionPlan={subscriptionPlan}
      />

      <InviteList
        invites={invites}
        loadingInvites={loadingInvites}
        acceptInvite={acceptInvite}
        rejectInvite={rejectInvite}
      />

      <AddPropertyCard
        onCreate={(property) => {
          setProperties((prev) => [...prev, property]);
        }}
        propertyCount={properties.length}
        isSubscribed={isSubscribed}
      />

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
          onUpdate={(updated) => {
            if (updated.deleted) {
              setProperties((prev) =>
                prev.filter((p) => p._id !== updated._id)
              );
            } else {
              setProperties((prev) =>
                prev.map((p) => (p._id === updated._id ? updated : p))
              );
            }
          }}
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

      <InviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        invites={invites}
        loadingInvites={loadingInvites}
        acceptInvite={acceptInvite}
        rejectInvite={rejectInvite}
      />
    </>
  );
}

export default RealtorHome;
