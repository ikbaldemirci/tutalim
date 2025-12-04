import { useState, useEffect, useRef } from "react";
import api from "../api";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Toolbar,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Box,
  Slide,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  GlobalStyles,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PersonAddDisabledIcon from "@mui/icons-material/PersonAddDisabled";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import AlarmAddIcon from "@mui/icons-material/AlarmAdd";
import AlarmOnIcon from "@mui/icons-material/AlarmOn";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ReminderModal from "./ReminderModal";
import { useConfirm } from "../context/ConfirmDialogContext";

export default function BasicTable({
  data = [],
  onUpdate,
  loadingState,
  setLoadingState,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [ownerInput, setOwnerInput] = useState({});
  const [realtorInput, setRealtorInput] = useState({});
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [snackbar, setSnackbar] = useState({
    key: 0,
    open: false,
    message: "",
    severity: "success",
  });
  const [sentInvitesMap, setSentInvitesMap] = useState({});
  const [notesSaved, setNotesSaved] = useState({});
  const [notesDraft, setNotesDraft] = useState({});
  const [openRowId, setOpenRowId] = useState(null);
  const autoSaveTimers = useRef({});

  const tableRef = useRef(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);
  const [uploadingIds, setUploadingIds] = useState(new Set());
  const [activeNotes, setActiveNotes] = useState(new Set());

  const token = localStorage.getItem("token");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const userRole = decoded?.role;

  const { confirm } = useConfirm();

  const [openReminderModal, setOpenReminderModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const [propertyReminders, setPropertyReminders] = useState({});

  const [expandedLocationRow, setExpandedLocationRow] = useState(null);

  useEffect(() => {
    const updateWidth = () => {
      const el = tableRef.current;
      if (el) setTableScrollWidth(el.scrollWidth || 0);
    };
    updateWidth();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateWidth)
        : null;
    if (ro && tableRef.current) ro.observe(tableRef.current);

    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      if (ro) ro.disconnect();
    };
  }, [data]);

  useEffect(() => {
    if (data?.length > 0) {
      const synced = {};
      data.forEach((p) => {
        if (p.notes) synced[p._id] = p.notes;
      });
      setNotesSaved(synced);
    }
  }, [data]);

  useEffect(() => {
    const loadSent = async () => {
      try {
        const res = await api.get("/assignments/sent");
        if (res.data?.status === "success") {
          const map = {};
          (res.data.assignments || []).forEach((a) => {
            const pid = a.property?._id || a.property;
            if (!pid) return;
            if (!map[pid]) map[pid] = {};
            map[pid][a.role] = true;
          });
          setSentInvitesMap(map);
        }
      } catch (e) {}
    };
    loadSent();
  }, [data?.length]);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const userId = decoded?.id;
        if (!userId) return;

        const res = await api.get(`/reminders/${userId}`);

        if (res.data.status === "success") {
          const map = {};
          res.data.reminders.forEach((r) => {
            if (r.propertyId) {
              const pid = r.propertyId._id || r.propertyId;
              if (!map[pid]) map[pid] = [];
              map[pid].push(r);
            }
          });
          setPropertyReminders(map);
        }
      } catch (err) {
        console.error("Reminder map load error:", err);
      }
    };

    loadReminders();
  }, []);

  const handleReminderUpdate = (payload) => {
    if (payload.updateOnly && payload.deletedReminderId) {
      setPropertyReminders((prev) => {
        const pid = selectedPropertyId;
        return {
          ...prev,
          [pid]: (prev[pid] || []).filter(
            (r) => r._id !== payload.deletedReminderId
          ),
        };
      });
      setSnackbar({
        key: Date.now(),
        open: true,
        message: "Hatırlatıcı silindi",
        severity: "success",
      });
      return;
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row._id);
    setEditForm({
      rentPrice: row.rentPrice,
      rentDate: row.rentDate?.split("T")[0] || "",
      endDate: row.endDate?.split("T")[0] || "",
      location: row.location,
      tenantName: row.tenantName || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      const res = await api.put(`/properties/${id}`, {
        ...editForm,
        rentDate: editForm.rentDate ? new Date(editForm.rentDate) : undefined,
        endDate: editForm.endDate ? new Date(editForm.endDate) : undefined,
      });

      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setEditingRow(null);
        setSnackbar({
          key: Date.now(),
          open: true,
          message: "Güncelleme başarılı",
          severity: "success",
        });
      }
    } catch (err) {
      let msg = "Güncelleme sırasında hata oluştu";
      if (
        err.response?.data?.message?.includes(
          '"endDate" must be greater than "ref:rentDate"'
        )
      ) {
        msg = "Bitiş tarihi başlangıç tarihinden önce olamaz!";
      }

      setSnackbar({
        key: Date.now(),
        open: true,
        message: msg,
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Mülkü Sil",
      message:
        "Bu mülkü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      severity: "danger",
    });
    if (!ok) return;

    try {
      const res = await api.delete(`/properties/${id}`);
      if (res.data.status === "success") {
        onUpdate({ _id: id, deleted: true });
        setSnackbar({
          key: Date.now(),
          open: true,
          message: "Mülk başarıyla silindi",
          severity: "info",
        });
      }
    } catch {
      setSnackbar({
        key: Date.now(),
        open: true,
        message: "Silme sırasında hata oluştu",
        severity: "error",
      });
    }
  };

  const handleInvite = async (id, targetMail, role) => {
    try {
      if (!targetMail) {
        setSnackbar({
          key: Date.now(),
          open: true,
          message: "Mail gerekli",
          severity: "warning",
        });
        return;
      }

      const res = await api.post("/assignments", {
        propertyId: id,
        targetMail,
        role,
      });

      if (res.data.status === "success") {
        if (role === "owner") setOwnerInput({ ...ownerInput, [id]: "" });
        if (role === "realtor") setRealtorInput({ ...realtorInput, [id]: "" });
        setSentInvitesMap((prev) => ({
          ...prev,
          [id]: { ...(prev[id] || {}), [role]: true },
        }));
        setSnackbar({
          key: Date.now(),
          open: true,
          message: res.data.message || "Davet gönderildi. Onay bekleniyor.",
          severity: "success",
        });
      } else {
        setSnackbar({
          key: Date.now(),
          open: true,
          message: res.data.message || "Davet oluşturulamadı",
          severity: "warning",
        });
      }
    } catch (err) {
      setSnackbar({
        key: Date.now(),
        open: true,
        message:
          err.response?.data?.message || "İşlem sırasında bir hata oluştu",
        severity: "error",
      });
    }
  };

  const handleAssign = async (id, payload) => {
    try {
      const res = await api.put(`/properties/${id}/assign`, payload);

      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setOwnerInput({ ...ownerInput, [id]: "" });
        setRealtorInput({ ...realtorInput, [id]: "" });
        setSnackbar({
          key: Date.now(),
          open: true,
          message: res.data.message || "Atama başarılı",
          severity: "success",
        });
      } else {
        setSnackbar({
          key: Date.now(),
          open: true,
          message: res.data.message || "Atama başarısız",
          severity: "warning",
        });
      }
    } catch (err) {
      setSnackbar({
        key: Date.now(),
        open: true,
        message:
          err.response?.data?.message || "Atama sırasında bir hata oluştu",
        severity: "error",
      });
    }
  };

  const handleUploadContract = async (id, file) => {
    if (!file) return;

    if (uploadingIds.has(id)) {
      console.log("Zaten yükleme devam ediyor, bekleniyor...");
      return;
    }

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setSnackbar({
        key: Date.now(),
        open: true,
        message: "Dosya boyutu 25 MB’den fazla olamaz",
        severity: "error",
      });
      return;
    }

    setUploadingIds((prev) => new Set(prev).add(id));
    setLoadingState((prev) => ({ ...prev, [id]: "upload" }));

    const formData = new FormData();
    formData.append("contract", file);

    try {
      const res = await api.post(`/properties/${id}/contract`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success") {
        onUpdate(res.data.property);
        setSnackbar({
          key: Date.now(),
          open: true,
          message: res.data.message || "Sözleşme başarıyla yüklendi",
          severity: "success",
        });
      } else {
        setSnackbar({
          key: Date.now(),
          open: true,
          message: res.data?.message || "Sözleşme yüklenemedi",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      const status = error.response?.status;
      let msg = "Sözleşme yüklenemedi";
      if (status === 413) msg = "Dosya boyutu 25 MB’den fazla olamaz";
      else if (status === 403) msg = "Bu mülke dosya yükleme yetkiniz yok";
      else if (status === 404) msg = "Mülk bulunamadı";
      else if (status === 500) msg = "Sunucu hatası (sözleşme yükleme)";
      else if (error.response?.data?.message) msg = error.response.data.message;
      setSnackbar({
        key: Date.now(),
        open: true,
        message: msg,
        severity: "error",
      });
    } finally {
      setUploadingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
      setLoadingState((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleDeleteContract = async (id) => {
    const ok = await confirm({
      title: "Sözleşme Sil",
      message:
        "Bu sözleşmeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      severity: "danger",
    });
    if (!ok) return;

    setLoadingState((prev) => ({ ...prev, [id]: "delete" }));

    try {
      const res = await api.delete(`/properties/${id}/contract`);
      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setSnackbar({
          key: Date.now(),
          open: true,
          message: res.data.message || "Sözleşme silindi",
          severity: "info",
        });
      } else {
        setSnackbar({
          key: Date.now(),
          open: true,
          message: res.data?.message || "Sözleşme silinemedi",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Delete contract error:", error);
      const status = error.response?.status;
      let msg = "Sözleşme silinemedi";
      if (status === 403) msg = "Bu mülkteki sözleşmeyi silme yetkiniz yok";
      else if (status === 404) msg = "Mülk bulunamadı";
      else if (status === 500) msg = "Sunucu hatası (sözleşme silme)";
      else if (error.response?.data?.message) msg = error.response.data.message;
      setSnackbar({
        key: Date.now(),
        open: true,
        message: msg,
        severity: "error",
      });
    } finally {
      setLoadingState((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleNotes = async (id, isAutoSave = false) => {
    if (activeNotes.has(id)) return;
    setActiveNotes((prev) => new Set(prev).add(id));

    try {
      const payload = { notes: notesDraft[id] ?? "" };
      const noteSize = new Blob([JSON.stringify(payload)]).size;
      if (noteSize > 25 * 1024 * 1024) {
        if (!isAutoSave)
          setSnackbar({
            key: Date.now(),
            open: true,
            message: "Dosya boyutu 25 MB’den fazla olamaz",
            severity: "error",
          });
        return;
      }

      const res = await api.put(`/properties/${id}/notes`, payload);

      if (res.data.status === "success") {
        if (res.data.property && onUpdate) onUpdate(res.data.property);
        else setNotesSaved((p) => ({ ...p, [id]: payload.notes }));

        if (!isAutoSave) {
          setSnackbar({
            key: Date.now(),
            open: true,
            message: res.data.message || "Not başarıyla kaydedildi",
            severity: "success",
          });
          closeNotes();
        }
      }
    } catch (err) {
      console.error("Not kaydetme hatası:", err);
      let msg = "Not kaydedilemedi. Lütfen tekrar deneyin";
      const status = err.response?.status;
      if (status === 413) msg = "Dosya boyutu 25 MB’den fazla olamaz";
      else if (status === 403) msg = "Bu mülke not ekleme yetkiniz yok";
      else if (status === 404) msg = "Mülk bulunamadı";
      else if (status === 500) msg = "Sunucu hatası (not yükleme)";
      else if (err.response?.data?.message) msg = err.response.data.message;
      if (!isAutoSave)
        setSnackbar({
          key: Date.now(),
          open: true,
          message: msg,
          severity: "error",
        });
    } finally {
      setActiveNotes((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    }
  };

  const handleNoteChange = (id, value) => {
    setNotesDraft((prev) => ({ ...prev, [id]: value }));
    if (autoSaveTimers.current[id]) clearTimeout(autoSaveTimers.current[id]);
    autoSaveTimers.current[id] = setTimeout(() => {
      if (openRowId === id) handleNotes(id, true);
    }, 1200);
  };

  const openNotes = (rowId) => {
    setOpenRowId(rowId);
    setNotesDraft((prev) => ({ ...prev, [rowId]: notesSaved[rowId] || "" }));
  };

  const closeNotes = () => {
    if (autoSaveTimers.current[openRowId]) {
      clearTimeout(autoSaveTimers.current[openRowId]);
      delete autoSaveTimers.current[openRowId];
    }
    setOpenRowId(null);
  };

  useEffect(() => {
    return () => {
      Object.values(autoSaveTimers.current).forEach(clearTimeout);
    };
  }, []);

  function normalize(dateStr) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const filteredData = data.filter((row) => {
    const s = search.toLowerCase();

    const matchSearch =
      row.tenantName?.toLowerCase().includes(s) ||
      row.location?.toLowerCase().includes(s) ||
      row.rentPrice?.toString().includes(search);

    const start = startDate ? normalize(startDate) : null;
    const end = endDate ? normalize(endDate) : null;

    const rentStart = normalize(row.rentDate);
    const rentEnd = normalize(row.endDate);

    const matchDate =
      (!start || rentStart >= start) && (!end || rentEnd <= end);

    return matchSearch && matchDate;
  });

  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  function toISODate(d) {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const toggleLocation = (rowId) => {
    setExpandedLocationRow((prev) => (prev === rowId ? null : rowId));
  };

  return (
    <>
      <Box sx={{ mb: 6, display: "flow-root" }}>
        <TableContainer
          component={Paper}
          sx={{
            maxWidth: "95%",
            margin: "2rem auto",
            borderRadius: 3,
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            overflowX: "auto",
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              backgroundColor: "#f8f9fa",
              borderBottom: "1px solid #e0e0e0",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              gap: 2,
              py: 2,
              minWidth: tableScrollWidth || undefined,
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <TextField
                size="small"
                placeholder="Kiracı, konum veya fiyat ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "#999" }} />,
                }}
                sx={{ width: 250 }}
              />
              <DatePicker
                label="Başlangıç"
                format="dd/MM/yyyy"
                value={startDate ? new Date(startDate) : null}
                onChange={(date) => {
                  setStartDate(toISODate(date));
                }}
                slotProps={{ textField: { size: "small" } }}
              />

              <DatePicker
                label="Bitiş"
                format="dd/MM/yyyy"
                value={endDate ? new Date(endDate) : null}
                onChange={(date) => {
                  setEndDate(toISODate(date));
                }}
                slotProps={{ textField: { size: "small" } }}
              />

              <Button variant="outlined" onClick={handleClearFilters}>
                Filtreleri Temizle
              </Button>
            </Box>
          </Toolbar>

          {/* 📋 Tablo */}
          <Table ref={tableRef}>
            <TableHead sx={{ backgroundColor: "#2E86C1" }}>
              <TableRow>
                {[
                  "Hatırlatıcı",
                  "Kiracı",
                  "Fiyat",
                  "Başlangıç",
                  "Bitiş",
                  "Konum",
                  userRole === "realtor" ? "Ev Sahibi" : "Emlakçı",
                  "Sözleşme",
                  "Notlar",
                  "İşlemler",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.map((row) => (
                <TableRow
                  key={row._id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f9fcff",
                      transition: "0.3s",
                    },
                  }}
                >
                  <TableCell align="center">
                    <IconButton
                      onClick={() => {
                        setSelectedPropertyId(row._id);
                        setOpenReminderModal(true);
                      }}
                      sx={{
                        backgroundColor:
                          propertyReminders[row._id]?.length > 0
                            ? "rgba(40,180,99,0.1)"
                            : "rgba(46,134,193,0.1)",
                        "&:hover": {
                          backgroundColor:
                            propertyReminders[row._id]?.length > 0
                              ? "rgba(40,180,99,0.2)"
                              : "rgba(46,134,193,0.2)",
                        },
                      }}
                    >
                      {propertyReminders[row._id]?.length > 0 ? (
                        <AlarmOnIcon color="success" />
                      ) : (
                        <AlarmAddIcon color="primary" />
                      )}
                    </IconButton>
                  </TableCell>

                  {/* Kiracı */}
                  <TableCell>
                    {editingRow === row._id ? (
                      <TextField
                        name="tenantName"
                        value={editForm.tenantName}
                        onChange={handleEditChange}
                        size="small"
                      />
                    ) : (
                      row.tenantName || (
                        <em style={{ color: "#888" }}>Henüz atanmadı</em>
                      )
                    )}
                  </TableCell>

                  {/* Fiyat */}
                  <TableCell>
                    {editingRow === row._id ? (
                      <TextField
                        name="rentPrice"
                        type="number"
                        value={editForm.rentPrice}
                        onChange={handleEditChange}
                        size="small"
                      />
                    ) : (
                      (row.rentPrice?.toLocaleString("tr-TR") || "-") + " ₺"
                    )}
                  </TableCell>

                  {/* Başlangıç */}
                  <TableCell>
                    {editingRow === row._id ? (
                      <TextField
                        name="rentDate"
                        type="date"
                        value={editForm.rentDate}
                        onChange={handleEditChange}
                        size="small"
                      />
                    ) : row.rentDate ? (
                      new Date(row.rentDate).toLocaleDateString("tr-TR")
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  {/* Bitiş */}
                  <TableCell>
                    {editingRow === row._id ? (
                      <TextField
                        name="endDate"
                        type="date"
                        value={editForm.endDate}
                        onChange={handleEditChange}
                        size="small"
                      />
                    ) : row.endDate ? (
                      new Date(row.endDate).toLocaleDateString("tr-TR")
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  {/* Konum */}
                  <TableCell
                    onClick={() => isMobile && toggleLocation(row._id)}
                  >
                    {editingRow === row._id ? (
                      <TextField
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <Typography
                        sx={{
                          cursor: isMobile ? "pointer" : "default",
                          whiteSpace:
                            isMobile && expandedLocationRow !== row._id
                              ? "nowrap"
                              : "normal",
                          overflow:
                            isMobile && expandedLocationRow !== row._id
                              ? "hidden"
                              : "visible",
                          textOverflow:
                            isMobile && expandedLocationRow !== row._id
                              ? "ellipsis"
                              : "unset",
                          maxWidth: isMobile ? 150 : "none",
                          transition: "0.2s ease",
                        }}
                      >
                        {row.location}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {userRole === "realtor" ? (
                      <>
                        {row.owner ? (
                          <span style={{ fontWeight: 500 }}>
                            {row.owner.name || row.owner.mail}
                          </span>
                        ) : sentInvitesMap[row._id]?.owner ? (
                          <Chip
                            label="Yanıt bekleniyor"
                            color="warning"
                            variant="outlined"
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              flexWrap: "wrap",
                              width: "100%",
                            }}
                          >
                            <TextField
                              size="small"
                              placeholder="Mail"
                              value={ownerInput[row._id] || ""}
                              onChange={(e) =>
                                setOwnerInput({
                                  ...ownerInput,
                                  [row._id]: e.target.value,
                                })
                              }
                              sx={{ flexGrow: 1 }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<PersonAddAltIcon fontSize="small" />}
                              sx={{
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "8px",
                                boxShadow: "0 2px 6px rgba(46, 134, 193, 0.3)",
                                "&:hover": {
                                  backgroundColor: "#1f5fa3",
                                  boxShadow:
                                    "0 3px 8px rgba(46, 134, 193, 0.5)",
                                },
                              }}
                              onClick={() =>
                                handleInvite(
                                  row._id,
                                  ownerInput[row._id],
                                  "owner"
                                )
                              }
                            >
                              Ata
                            </Button>
                          </Box>
                        )}
                      </>
                    ) : (
                      <>
                        {row.realtor ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "0.4rem",
                              minWidth: "150px",
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>
                              {row.realtor.name || row.realtor.mail}
                            </span>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={
                                <PersonAddDisabledIcon fontSize="small" />
                              }
                              sx={{
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "8px",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 0, 0, 0.05)",
                                  borderColor: "#d32f2f",
                                },
                              }}
                              onClick={async () => {
                                const ok = await confirm({
                                  title: "Yetki Kaldır",
                                  message: "Yetki kaldırılacak. Emin misin?",
                                  severity: "danger",
                                });
                                if (!ok) return;

                                handleAssign(row._id, { realtorMail: null });
                              }}
                            >
                              Kaldır
                            </Button>
                          </Box>
                        ) : sentInvitesMap[row._id]?.realtor ? (
                          <Chip
                            label="Yanıt bekleniyor"
                            color="warning"
                            variant="outlined"
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              flexWrap: "wrap",
                              width: "100%",
                            }}
                          >
                            <TextField
                              size="small"
                              placeholder="Mail"
                              value={realtorInput[row._id] || ""}
                              onChange={(e) =>
                                setRealtorInput({
                                  ...realtorInput,
                                  [row._id]: e.target.value,
                                })
                              }
                              sx={{ flexGrow: 1 }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<PersonAddAltIcon fontSize="small" />}
                              sx={{
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "8px",
                                boxShadow: "0 2px 6px rgba(46, 134, 193, 0.3)",
                                "&:hover": {
                                  backgroundColor: "#1f5fa3",
                                  boxShadow:
                                    "0 3px 8px rgba(46, 134, 193, 0.5)",
                                },
                              }}
                              onClick={() =>
                                handleInvite(
                                  row._id,
                                  realtorInput[row._id],
                                  "realtor"
                                )
                              }
                            >
                              Ata
                            </Button>
                          </Box>
                        )}
                      </>
                    )}
                  </TableCell>

                  {/* Sözleşme */}
                  <TableCell>
                    {loadingState[row._id] === "upload" ? (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        startIcon={<CircularProgress size={16} />}
                      >
                        Yükleniyor...
                      </Button>
                    ) : loadingState[row._id] === "delete" ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled
                        startIcon={<CircularProgress size={16} />}
                      >
                        Siliniyor...
                      </Button>
                    ) : !row.contractFile ? (
                      <Button
                        variant="outlined"
                        size="small"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                      >
                        Yükle
                        <input
                          type="file"
                          hidden
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const maxSize = 25 * 1024 * 1024;
                            if (file.size > maxSize) {
                              setSnackbar({
                                key: Date.now(),
                                open: true,
                                message: "Dosya boyutu 25 MB’den fazla olamaz",
                                severity: "error",
                              });
                              e.target.value = null;
                              return;
                            }

                            handleUploadContract(row._id, file);
                            e.target.value = null;
                          }}
                        />
                      </Button>
                    ) : editingRow === row._id ? (
                      <Chip
                        label="Sözleşmeyi Sil"
                        color="error"
                        onClick={() => handleDeleteContract(row._id)}
                        startIcon={<DeleteIcon />}
                      />
                    ) : (
                      <Chip
                        label="Sözleşme"
                        color="success"
                        onClick={() =>
                          window.open(
                            `https://tutalim.com/${row.contractFile}`,
                            "_blank"
                          )
                        }
                        sx={{ cursor: "pointer" }}
                      />
                    )}
                  </TableCell>

                  {/* Notlar (popover from button) */}
                  <TableCell>
                    <Chip
                      label={
                        notesSaved[row._id]?.trim() ? "Notu Gör" : "Not Ekle"
                      }
                      color="primary"
                      variant={
                        notesSaved[row._id]?.trim() ? "filled" : "outlined"
                      }
                      onClick={() => openNotes(row._id)}
                      sx={{ cursor: "pointer" }}
                    />
                    <GlobalStyles
                      styles={{
                        ".ql-toolbar.ql-snow": {
                          border: "0 !important",
                          borderBottom: "1px solid rgba(0,0,0,0.08) !important",
                          background: "#fff",
                          borderTopLeftRadius: 10,
                          borderTopRightRadius: 10,
                        },
                        ".ql-container.ql-snow": {
                          border: "0 !important",
                          background: "#fff",
                          borderBottomLeftRadius: 10,
                          borderBottomRightRadius: 10,
                          overflow: "hidden",
                        },
                        ".ql-editor": {
                          minHeight: "55vh",
                          padding: "16px !important",
                          lineHeight: "1.6",
                          overflowWrap: "break-word",
                        },
                        ".ql-editor strong": { color: "#000" },
                      }}
                    />
                    <Dialog
                      open={openRowId === row._id}
                      onClose={closeNotes}
                      fullWidth
                      maxWidth="md"
                      keepMounted
                      disableEnforceFocus
                      disableRestoreFocus
                      disableScrollLock
                      slotProps={{
                        paper: {
                          sx: {
                            borderRadius: 3,
                            width: "80vw",
                            height: "80vh",
                            backgroundColor: "#fff",
                            display: "flex",
                          },
                        },
                      }}
                    >
                      <Box sx={{ px: 3, pt: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "#2E86C1",
                            textAlign: "center",
                          }}
                        >
                          📝 Notlar
                        </Typography>
                      </Box>

                      <DialogContent
                        dividers={false}
                        sx={{
                          pt: 2,
                          px: 3,
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          overflow: "hidden",
                        }}
                      >
                        <ReactQuill
                          theme="snow"
                          value={notesDraft[row._id] || ""}
                          onChange={(value) =>
                            setNotesDraft((prev) => ({
                              ...prev,
                              [row._id]: value,
                            }))
                          }
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, 3, false] }],
                              ["bold", "italic", "underline", "strike"],
                              [{ color: [] }, { background: [] }],
                              [{ align: [] }],
                              [{ list: "ordered" }, { list: "bullet" }],
                              ["blockquote", "code-block"],
                              ["link", "image"],
                              ["clean"],
                            ],
                          }}
                          formats={[
                            "header",
                            "bold",
                            "italic",
                            "underline",
                            "strike",
                            "color",
                            "background",
                            "align",
                            "list",
                            "blockquote",
                            "code-block",
                            "link",
                            "image",
                          ]}
                          style={{
                            flex: 1,
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            minHeight: "60vh",
                          }}
                        />
                      </DialogContent>

                      <DialogActions
                        sx={{
                          px: 3,
                          py: 2,
                          borderTop: "none",
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1.5,
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={closeNotes}
                          sx={{ px: 3, fontWeight: 600 }}
                        >
                          Kapat
                        </Button>

                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleNotes(row._id)}
                          sx={{
                            px: 4,
                            fontWeight: 700,
                            background:
                              "linear-gradient(135deg, #27ae60, #2ecc71)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #1e8449, #27ae60)",
                            },
                          }}
                        >
                          Kaydet
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </TableCell>

                  {/* İşlemler */}
                  <TableCell>
                    {editingRow === row._id ? (
                      <Box sx={{ display: "flex", gap: "0.5rem" }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSave(row._id)}
                          startIcon={<SaveIcon />}
                        >
                          Kaydet
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setEditingRow(null)}
                        >
                          Vazgeç
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <IconButton
                          aria-label="işlemler"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setMenuRowId(row._id);
                          }}
                          size="small"
                          sx={{
                            border: "1px solid rgba(0,0,0,0.1)",
                            borderRadius: 2,
                            "&:hover": {
                              backgroundColor: "rgba(46,134,193,0.08)",
                            },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>

                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={() => setAnchorEl(null)}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              handleEditClick(
                                data.find((r) => r._id === menuRowId)
                              );
                              setAnchorEl(null);
                            }}
                          >
                            <EditIcon sx={{ fontSize: 18, mr: 1 }} /> Düzenle
                          </MenuItem>

                          <MenuItem
                            onClick={() => {
                              handleDelete(menuRowId);
                              setAnchorEl(null);
                            }}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteIcon sx={{ fontSize: 18, mr: 1 }} /> Sil
                          </MenuItem>
                        </Menu>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <ReminderModal
        open={openReminderModal}
        onClose={() => setOpenReminderModal(false)}
        onSubmit={async (formData) => {
          try {
            if (formData.updateOnly) {
              handleReminderUpdate(formData);
              return;
            }
            let remindAt = null;
            if (formData.type === "monthlyPayment" && formData.dayOfMonth) {
              const today = new Date();
              const currentMonth = today.getMonth();
              const year = today.getFullYear();

              const nextDate = new Date(
                year,
                currentMonth,
                formData.dayOfMonth,
                9,
                0,
                0
              );
              if (nextDate < today) nextDate.setMonth(nextDate.getMonth() + 1);

              remindAt = nextDate.toISOString();
            }

            if (formData.type === "contractEnd" && formData.monthsBeforeEnd) {
              const property = data.find((p) => p._id === selectedPropertyId);

              if (property?.endDate) {
                const end = new Date(property.endDate);
                const target = new Date(end);
                target.setMonth(target.getMonth() - formData.monthsBeforeEnd);
                target.setHours(9, 0, 0, 0);
                remindAt = target.toISOString();
              } else {
                console.warn("Property endDate bulunamadı");
              }
            }

            if (!remindAt) {
              setSnackbar({
                key: Date.now(),
                open: true,
                message: "Tarih hesaplanamadı, girişleri kontrol et.",
                severity: "warning",
              });
              return;
            }

            if (new Date(remindAt) <= new Date()) {
              setSnackbar({
                key: Date.now(),
                open: true,
                message: "Geçmiş bir zamana hatırlatıcı oluşturulamaz.",
                severity: "warning",
              });
              return;
            }

            const property = data.find((p) => p._id === selectedPropertyId);

            if (property?.endDate) {
              const endDate = new Date(property.endDate);
              const reminderDate = new Date(remindAt);

              if (reminderDate > endDate) {
                setSnackbar({
                  open: true,
                  key: Date.now(),
                  message:
                    "Bu sözleşme için artık hatırlatıcı oluşturamazsınız.",
                  severity: "warning",
                });
                return;
              }
            }
            const res = await api.post("/reminders", {
              ...formData,
              propertyId: selectedPropertyId,
              remindAt,
            });

            if (res.data.status !== "success") {
              setSnackbar({
                key: Date.now(),
                open: true,
                message: res.data.message || "Hatırlatıcı eklenemedi.",
                severity: "error",
              });
              return;
            }

            setPropertyReminders((prev) => ({
              ...prev,
              [selectedPropertyId]: [
                ...(prev[selectedPropertyId] || []),
                res.data.reminder,
              ],
            }));

            setSnackbar({
              key: Date.now(),
              open: true,
              message: "Hatırlatıcı başarıyla oluşturuldu",
              severity: "success",
            });

            setOpenReminderModal(false);
          } catch (err) {
            setSnackbar({
              key: Date.now(),
              open: true,
              message: "Hatırlatıcı eklenemedi.",
              severity: "error",
            });
          }
        }}
        propertyId={selectedPropertyId}
        isGeneral={false}
        existingReminders={propertyReminders[selectedPropertyId] || []}
      />

      {/* 🎬 Snackbar */}
      <Snackbar
        key={snackbar.key}
        open={snackbar.open}
        autoHideDuration={3000}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
