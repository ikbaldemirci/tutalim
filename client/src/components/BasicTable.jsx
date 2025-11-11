import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { emit, NOTIFY_EVENT } from "../lib/bus";
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
  Zoom,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  GlobalStyles,
} from "@mui/material";
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
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function BasicTable({
  data = [],
  onUpdate,
  loadingState,
  setLoadingState,
}) {
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [ownerInput, setOwnerInput] = useState({});
  const [realtorInput, setRealtorInput] = useState({});
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [snackbar, setSnackbar] = useState({
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

  const Transition = React.forwardRef((props, ref) => (
    <Zoom ref={ref} {...props} timeout={400} />
  ));

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
          open: true,
          message: "GÃ¼ncelleme baÅŸarÄ±lÄ±",
          severity: "success",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "GÃ¼ncelleme sÄ±rasÄ±nda hata oluÅŸtu",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu mÃ¼lkÃ¼ silmek istediÄŸinize emin misiniz?"))
      return;
    try {
      const res = await api.delete(`/properties/${id}`);
      if (res.data.status === "success") {
        onUpdate({ _id: id, deleted: true });
        setSnackbar({
          open: true,
          message: "MÃ¼lk baÅŸarÄ±yla silindi",
          severity: "info",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Silme sÄ±rasÄ±nda hata oluÅŸtu",
        severity: "error",
      });
    }
  };

  const handleInvite = async (id, targetMail, role) => {
    try {
      if (!targetMail) {
        setSnackbar({
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
          open: true,
          message: res.data.message || "Davet gÃ¶nderildi. Onay bekleniyor.",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Davet oluÅŸturulamadÄ±",
          severity: "warning",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Ä°ÅŸlem sÄ±rasÄ±nda bir hata oluÅŸtu",
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
          open: true,
          message: res.data.message || "Atama baÅŸarÄ±lÄ±",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Atama baÅŸarÄ±sÄ±z",
          severity: "warning",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Atama sÄ±rasÄ±nda bir hata oluÅŸtu",
        severity: "error",
      });
    }
  };

  const handleUploadContract = async (id, file) => {
    if (!file) return;
    if (uploadingIds.has(id)) {
      console.log("Upload is already in progress for this item. Skipping.");
      return;
    }
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      emit(NOTIFY_EVENT, {
        severity: "error",
        message: "Dosya boyutu 25 MB'den fazla olamaz",
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
        meta: { toast: true },
      });
      if (res.data?.status === "success") {
        onUpdate(res.data.property);
        emit(NOTIFY_EVENT, {
          severity: "success",
          message: res.data.message || "Sözleşme başarıyla yüklendi",
        });
      } else {
        emit(NOTIFY_EVENT, {
          severity: "error",
          message: res.data?.message || "Sözleşme yüklenemedi",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      const status = error.response?.status;
      let msg = "Sözleşme yüklenemedi";
      if (status === 413) msg = "Dosya boyutu 25 MB'den fazla olamaz";
      else if (status === 403) msg = "Bu mülkte dosya yükleme yetkiniz yok";
      else if (status === 404) msg = "Mülk bulunamadı";
      else if (status === 500) msg = "Sunucu hatası (sözleşme yükleme)";
      else if (error.response?.data?.message) msg = error.response.data.message;
      emit(NOTIFY_EVENT, { severity: "error", message: msg });
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
    if (!window.confirm("Bu sÃ¶zleÅŸmeyi silmek istediÄŸinize emin misiniz?"))
      return;

    setLoadingState((prev) => ({ ...prev, [id]: "delete" }));

    try {
      const res = await api.delete(`/properties/${id}/contract`);
      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setSnackbar({
          open: true,
          message: res.data.message || "SÃ¶zleÅŸme silindi",
          severity: "info",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.data?.message || "SÃ¶zleÅŸme silinemedi",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Delete contract error:", error);
      const status = error.response?.status;
      let msg = "SÃ¶zleÅŸme silinemedi";
      if (status === 403) msg = "Bu mÃ¼lkteki sÃ¶zleÅŸmeyi silme yetkiniz yok";
      else if (status === 404) msg = "MÃ¼lk bulunamadÄ±";
      else if (status === 500) msg = "Sunucu hatasÄ± (sÃ¶zleÅŸme silme)";
      else if (error.response?.data?.message) msg = error.response.data.message;
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setLoadingState((prev) => ({ ...prev, [id]: null }));
    }
  };

  // const handleNotes = async (id, isAutoSave = false) => {
  //   try {
  //     const payload = { notes: notesDraft[id] ?? "" };
  //     const noteSize = new Blob([JSON.stringify(payload)]).size;
  //     if (noteSize > 25 * 1024 * 1024) {
  //       if (!isAutoSave)
  //         setSnackbar({
  //           open: true,
  //           message: "Dosya boyutu 25 MBâ€™den fazla olamaz",
  //           severity: "error",
  //         });
  //       return;
  //     }

  //     const res = await api.put(`/properties/${id}/notes`, payload);

  //     if (res.data.status === "success") {
  //       if (res.data.property && onUpdate) onUpdate(res.data.property);
  //       else setNotesSaved((p) => ({ ...p, [id]: payload.notes }));

  //       if (!isAutoSave) {
  //         setSnackbar({
  //           open: true,
  //           message: res.data.message || "Not baÅŸarÄ±yla kaydedildi",
  //           severity: "success",
  //         });
  //         closeNotes();
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Not kaydetme hatasÄ±:", err);
  //     let msg = "Not kaydedilemedi. LÃ¼tfen tekrar deneyin";
  //     const status = err.response?.status;
  //     if (status === 413) msg = "Dosya boyutu 25 MBâ€™den fazla olamaz";
  //     else if (status === 403) msg = "Bu mÃ¼lke not ekleme yetkiniz yok";
  //     else if (status === 404) msg = "MÃ¼lk bulunamadÄ±";
  //     else if (status === 500) msg = "Sunucu hatasÄ± (not yÃ¼kleme)";
  //     else if (err.response?.data?.message) msg = err.response.data.message;
  //     if (!isAutoSave)
  //       setSnackbar({ open: true, message: msg, severity: "error" });
  //   }
  // };

  const handleNotes = async (id, isAutoSave = false) => {
    if (activeNotes.has(id)) return;
    setActiveNotes((prev) => new Set(prev).add(id));

    try {
      const payload = { notes: notesDraft[id] ?? "" };
      const noteSize = new Blob([JSON.stringify(payload)]).size;
      if (noteSize > 25 * 1024 * 1024) {
        if (!isAutoSave)
          setSnackbar({
            open: true,
            message: "Dosya boyutu 25 MBâ€™den fazla olamaz",
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
            open: true,
            message: res.data.message || "Not baÅŸarÄ±yla kaydedildi",
            severity: "success",
          });
          closeNotes();
        }
      }
    } catch (err) {
      console.error("Not kaydetme hatasÄ±:", err);
      let msg = "Not kaydedilemedi. LÃ¼tfen tekrar deneyin";
      const status = err.response?.status;
      if (status === 413) msg = "Dosya boyutu 25 MBâ€™den fazla olamaz";
      else if (status === 403) msg = "Bu mÃ¼lke not ekleme yetkiniz yok";
      else if (status === 404) msg = "MÃ¼lk bulunamadÄ±";
      else if (status === 500) msg = "Sunucu hatasÄ± (not yÃ¼kleme)";
      else if (err.response?.data?.message) msg = err.response.data.message;
      if (!isAutoSave)
        setSnackbar({ open: true, message: msg, severity: "error" });
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

  const filteredData = data.filter((row) => {
    const s = search.toLowerCase();
    const matchSearch =
      row.tenantName?.toLowerCase().includes(s) ||
      row.location?.toLowerCase().includes(s) ||
      row.rentPrice?.toString().includes(search);
    const matchDate =
      (!startDate || new Date(row.rentDate) >= new Date(startDate)) &&
      (!endDate || new Date(row.endDate) <= new Date(endDate));
    return matchSearch && matchDate;
  });

  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
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
                placeholder="KiracÄ±, konum veya fiyat ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "#999" }} />,
                }}
                sx={{ width: 250 }}
              />
              <TextField
                size="small"
                type="date"
                label="BaÅŸlangÄ±Ã§"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                size="small"
                type="date"
                label="BitiÅŸ"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Button variant="outlined" onClick={handleClearFilters}>
                Filtreleri Temizle
              </Button>
            </Box>
          </Toolbar>

          {/* ðŸ“‹ Tablo */}
          <Table ref={tableRef}>
            <TableHead sx={{ backgroundColor: "#2E86C1" }}>
              <TableRow>
                {[
                  "KiracÄ±",
                  "Fiyat",
                  "BaÅŸlangÄ±Ã§",
                  "BitiÅŸ",
                  "Konum",
                  userRole === "realtor" ? "Ev Sahibi" : "EmlakÃ§Ä±",
                  "SÃ¶zleÅŸme",
                  "Notlar",
                  "Ä°ÅŸlemler",
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
                  {/* KiracÄ± */}
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
                        <em style={{ color: "#888" }}>HenÃ¼z atanmadÄ±</em>
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
                      (row.rentPrice?.toLocaleString("tr-TR") || "-") + " â‚º"
                    )}
                  </TableCell>

                  {/* BaÅŸlangÄ±Ã§ */}
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

                  {/* BitiÅŸ */}
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
                  <TableCell>
                    {editingRow === row._id ? (
                      <TextField
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        size="small"
                      />
                    ) : (
                      row.location
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
                            label="YanÄ±t bekleniyor"
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
                              onClick={() =>
                                handleAssign(row._id, { realtorMail: null })
                              }
                            >
                              KaldÄ±r
                            </Button>
                          </Box>
                        ) : sentInvitesMap[row._id]?.realtor ? (
                          <Chip
                            label="YanÄ±t bekleniyor"
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

                  {/* SÃ¶zleÅŸme */}
                  <TableCell>
                    {loadingState[row._id] === "upload" ? (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        startIcon={<CircularProgress size={16} />}
                      >
                        YÃ¼kleniyor...
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
                        YÃ¼kle
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
                                open: true,
                                message:
                                  "Dosya boyutu 25 MBâ€™den fazla olamaz",
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
                        label="SÃ¶zleÅŸmeyi Sil"
                        color="error"
                        onClick={() => handleDeleteContract(row._id)}
                        startIcon={<DeleteIcon />}
                      />
                    ) : (
                      <Chip
                        label="SÃ¶zleÅŸme"
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
                        notesSaved[row._id]?.trim() ? "Notu GÃ¶r" : "Not Ekle"
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
                          ðŸ“ Notlar
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

                  {/* Ä°ÅŸlemler */}
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
                          VazgeÃ§
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <IconButton
                          aria-label="iÅŸlemler"
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
                            <EditIcon sx={{ fontSize: 18, mr: 1 }} /> DÃ¼zenle
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

      {/* ðŸŽ¬ Snackbar */}
      <Snackbar
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
