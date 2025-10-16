// import React, { useState } from "react";
// import axios from "axios";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   TextField,
//   Toolbar,
//   Snackbar,
//   Alert,
//   CircularProgress,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import SaveIcon from "@mui/icons-material/Save";

// export default function BasicTable({
//   data = [],
//   onUpdate,
//   loadingState,
//   setLoadingState,
// }) {
//   const [editingRow, setEditingRow] = useState(null);
//   const [editForm, setEditForm] = useState({});
//   const [ownerInput, setOwnerInput] = useState({}); // propertyId -> ownerId
//   const [realtorInput, setRealtorInput] = useState({}); // propertyId -> realtorId

//   const [search, setSearch] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const token = localStorage.getItem("token");
//   const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
//   const userRole = decoded?.role;

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   const handleEditClick = (row) => {
//     setEditingRow(row._id);
//     setEditForm({
//       rentPrice: row.rentPrice,
//       rentDate: row.rentDate?.split("T")[0] || "",
//       endDate: row.endDate?.split("T")[0] || "",
//       location: row.location,
//       tenantName: row.tenantName || "",
//     });
//   };

//   const handleEditChange = (e) => {
//     setEditForm({ ...editForm, [e.target.name]: e.target.value });
//   };

//   const handleSave = async (id) => {
//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/properties/${id}`,
//         {
//           ...editForm,
//           rentDate: editForm.rentDate ? new Date(editForm.rentDate) : undefined,
//           endDate: editForm.endDate ? new Date(editForm.endDate) : undefined,
//         }
//       );

//       if (res.data.status === "success") {
//         onUpdate(res.data.property); // parent state güncelle
//         setEditingRow(null);
//       }
//     } catch (err) {
//       alert("Güncelleme sırasında hata oluştu.");
//     }
//   };

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm(
//       "Bu mülkü silmek istediğinize emin misiniz?"
//     );
//     if (!confirmDelete) return;

//     try {
//       const res = await axios.delete(
//         `http://localhost:5000/api/properties/${id}`
//       );
//       if (res.data.status === "success") {
//         onUpdate({ _id: id, deleted: true }); // parent state güncelle
//       }
//     } catch (err) {
//       alert("Silme sırasında hata oluştu.");
//     }
//   };

//   const handleAssign = async (id, payload) => {
//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/properties/${id}/assign`,
//         payload // { ownerMail: "..."} veya { realtorMail: "..." }
//       );

//       if (res.data.status === "success") {
//         onUpdate(res.data.property);
//         setOwnerInput({ ...ownerInput, [id]: "" });
//         setRealtorInput({ ...realtorInput, [id]: "" });
//       }
//     } catch (err) {
//       console.error("Assign error:", err);
//     }
//   };

//   const getUserDisplay = (user) => {
//     if (!user) return null;
//     // Eğer populate edilmiş obje ise object, değilse string id olabilir
//     if (typeof user === "object") {
//       // name varsa name + (opsiyonel) surname yoksa mail göster
//       return (
//         user.name || user.mail || (user._id && user._id.toString()) || null
//       );
//     }
//     // user string ise (objectId string) => gösterilecek okunabilir bilgi yok, döndür id
//     return String(user);
//   };

//   // hangi sütunda ne gösterilecek: eğer kullanıcının rolü realtor ise Owner gösterilsin,
//   // eğer owner ise Realtor gösterilsin
//   const renderOwnerOrRealtorCell = (row) => {
//     const token = localStorage.getItem("token");
//     const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
//     if (!decoded) return "Henüz atanmadı";

//     if (decoded.role === "realtor") {
//       // Emlakçı görüyorsa -> ev sahibinin bilgisini göster (owner)
//       const ownerName = getUserDisplay(row.owner);
//       return ownerName || "Henüz atanmadı";
//     } else {
//       // Ev sahibi görüyorsa -> emlakçının bilgisini göster (realtor)
//       const realtorName = getUserDisplay(row.realtor);
//       return realtorName || "Henüz atanmadı";
//     }
//   };

//   const filteredData = data.filter((row) => {
//     const searchLower = search?.toString().toLowerCase() || "";

//     const matchSearch =
//       (row.tenantName && row.tenantName.toLowerCase().includes(searchLower)) ||
//       (row.location && row.location.toLowerCase().includes(searchLower)) ||
//       (row.rentPrice && row.rentPrice.toString().includes(search)) ||
//       (row.owner &&
//         typeof row.owner === "object" &&
//         row.owner.name &&
//         row.owner.name.toLowerCase().includes(searchLower)) ||
//       (row.realtor &&
//         typeof row.realtor === "object" &&
//         row.realtor.name &&
//         row.realtor.name.toLowerCase().includes(searchLower));

//     const matchDate =
//       (!startDate ||
//         (row.rentDate && new Date(row.rentDate) >= new Date(startDate))) &&
//       (!endDate || (row.endDate && new Date(row.endDate) <= new Date(endDate)));

//     return matchSearch && matchDate;
//   });

//   const handleClearFilters = () => {
//     setStartDate("");
//     setEndDate("");
//     setSearch("");
//   };

//   // upload
//   const handleUploadContract = async (id, file) => {
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("contract", file);

//     setLoadingState((prev) => ({ ...prev, [id]: "upload" }));
//     const startTime = Date.now();

//     try {
//       const res = await axios.post(
//         `http://localhost:5000/api/properties/${id}/contract`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       if (res.data.status === "success") {
//         onUpdate(res.data.property);

//         // snackbar'ı spinner bitiminde gösterebilmek için state'e kaydediyoruz
//         const elapsed = Date.now() - startTime;
//         const delay = Math.max(0, 2000 - elapsed);
//         setTimeout(() => {
//           setLoadingState((prev) => ({ ...prev, [id]: null }));
//           setSnackbar({
//             open: true,
//             message: "Sözleşme başarıyla yüklendi.",
//             severity: "success",
//           });
//         }, delay);
//       }
//     } catch (err) {
//       console.error("Upload error:", err);
//       setLoadingState((prev) => ({ ...prev, [id]: null }));
//       setSnackbar({
//         open: true,
//         message: "Sözleşme yüklenemedi.",
//         severity: "error",
//       });
//     }
//   };

//   // delete
//   const handleDeleteContract = async (id) => {
//     const confirmDelete = window.confirm(
//       "Bu sözleşmeyi silmek istediğinize emin misiniz?"
//     );
//     if (!confirmDelete) return;

//     setLoadingState((prev) => ({ ...prev, [id]: "delete" }));
//     const startTime = Date.now();

//     try {
//       const res = await axios.delete(
//         `http://localhost:5000/api/properties/${id}/contract`
//       );

//       if (res.data.status === "success") {
//         onUpdate(res.data.property);

//         const elapsed = Date.now() - startTime;
//         const delay = Math.max(0, 2000 - elapsed);
//         setTimeout(() => {
//           setLoadingState((prev) => ({ ...prev, [id]: null }));
//           setSnackbar({
//             open: true,
//             message: "Sözleşme silindi.",
//             severity: "info",
//           });
//         }, delay);
//       }
//     } catch (err) {
//       console.error("Delete error:", err);
//       setLoadingState((prev) => ({ ...prev, [id]: null }));
//       setSnackbar({
//         open: true,
//         message: "Sözleşme silinemedi.",
//         severity: "error",
//       });
//     }
//   };

//   return (
//     <>
//       <TableContainer
//         component={Paper}
//         sx={{ maxWidth: 1000, margin: "2rem auto" }}
//       >
//         <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <TextField
//               size="small"
//               placeholder="Ara"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               sx={{ width: 220 }}
//             />
//             <TextField
//               size="small"
//               type="date"
//               label="Başlangıç"
//               InputLabelProps={{ shrink: true }}
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//             />
//             <TextField
//               size="small"
//               type="date"
//               label="Bitiş"
//               InputLabelProps={{ shrink: true }}
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//             />
//             <Button onClick={handleClearFilters}>Filtreleri Temizle</Button>
//           </div>
//         </Toolbar>

//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Kiracı</TableCell>
//               <TableCell>Fiyat</TableCell>
//               <TableCell>Başlangıç</TableCell>
//               <TableCell>Bitiş</TableCell>
//               <TableCell>Konum</TableCell>
//               <TableCell>
//                 {(() => {
//                   const token = localStorage.getItem("token");
//                   if (token) {
//                     const decoded = JSON.parse(atob(token.split(".")[1]));
//                     return decoded.role === "realtor" ? "Ev Sahibi" : "Emlakçı";
//                   }
//                   return "";
//                 })()}
//               </TableCell>
//               <TableCell>Sözleşme</TableCell>
//               <TableCell>İşlemler</TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {filteredData.map((row) => (
//               <TableRow key={row._id}>
//                 <TableCell>
//                   {editingRow === row._id ? (
//                     <TextField
//                       name="tenantName"
//                       value={editForm.tenantName}
//                       onChange={handleEditChange}
//                       size="small"
//                     />
//                   ) : (
//                     row.tenantName || "Henüz atanmadı"
//                   )}
//                 </TableCell>
//                 {/* Fiyat */}
//                 <TableCell>
//                   {editingRow === row._id ? (
//                     <TextField
//                       name="rentPrice"
//                       type="number"
//                       value={editForm.rentPrice}
//                       onChange={handleEditChange}
//                       size="small"
//                     />
//                   ) : (
//                     row.rentPrice?.toLocaleString("tr-TR") + " ₺"
//                   )}
//                 </TableCell>

//                 {/* Başlangıç */}
//                 <TableCell>
//                   {editingRow === row._id ? (
//                     <TextField
//                       name="rentDate"
//                       type="date"
//                       value={editForm.rentDate}
//                       onChange={handleEditChange}
//                       size="small"
//                     />
//                   ) : row.rentDate ? (
//                     new Date(row.rentDate).toLocaleDateString()
//                   ) : (
//                     "-"
//                   )}
//                 </TableCell>

//                 {/* Bitiş */}
//                 <TableCell>
//                   {editingRow === row._id ? (
//                     <TextField
//                       name="endDate"
//                       type="date"
//                       value={editForm.endDate}
//                       onChange={handleEditChange}
//                       size="small"
//                     />
//                   ) : row.endDate ? (
//                     new Date(row.endDate).toLocaleDateString()
//                   ) : (
//                     "-"
//                   )}
//                 </TableCell>

//                 {/* Konum */}
//                 <TableCell>
//                   {editingRow === row._id ? (
//                     <TextField
//                       name="location"
//                       value={editForm.location}
//                       onChange={handleEditChange}
//                       size="small"
//                     />
//                   ) : (
//                     row.location
//                   )}
//                 </TableCell>

//                 {/* Owner/Realtor bilgisi */}
//                 <TableCell>
//                   {userRole === "realtor" ? (
//                     <>
//                       {row.owner ? (
//                         editingRow === row._id ? (
//                           // Düzenle modunda: yeni owner maili girilebilir
//                           <div style={{ display: "flex", gap: "0.5rem" }}>
//                             <TextField
//                               size="small"
//                               placeholder="Yeni Ev Sahibi Mail"
//                               value={ownerInput[row._id] || ""}
//                               onChange={(e) =>
//                                 setOwnerInput({
//                                   ...ownerInput,
//                                   [row._id]: e.target.value,
//                                 })
//                               }
//                             />
//                             <Button
//                               variant="outlined"
//                               size="small"
//                               onClick={() =>
//                                 handleAssign(row._id, {
//                                   ownerMail: ownerInput[row._id],
//                                 })
//                               }
//                             >
//                               Ata
//                             </Button>
//                           </div>
//                         ) : (
//                           <span>{row.owner.name || row.owner.mail}</span>
//                         )
//                       ) : (
//                         // Hiç atama yapılmamışsa her zaman input gelsin
//                         <div style={{ display: "flex", gap: "0.5rem" }}>
//                           <TextField
//                             size="small"
//                             placeholder="Ev Sahibi Mail"
//                             value={ownerInput[row._id] || ""}
//                             onChange={(e) =>
//                               setOwnerInput({
//                                 ...ownerInput,
//                                 [row._id]: e.target.value,
//                               })
//                             }
//                           />
//                           <Button
//                             variant="outlined"
//                             size="small"
//                             onClick={() =>
//                               handleAssign(row._id, {
//                                 ownerMail: ownerInput[row._id],
//                               })
//                             }
//                           >
//                             Ata
//                           </Button>
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <>
//                       {row.realtor ? (
//                         <div
//                           style={{
//                             display: "flex",
//                             gap: "0.5rem",
//                             alignItems: "center",
//                           }}
//                         >
//                           <span>{row.realtor.name || row.realtor.mail}</span>
//                           <Button
//                             variant="text"
//                             color="error"
//                             size="small"
//                             onClick={() =>
//                               handleAssign(row._id, { realtorMail: null })
//                             }
//                           >
//                             Yetkiyi Kaldır
//                           </Button>
//                         </div>
//                       ) : editingRow === row._id ? (
//                         <div style={{ display: "flex", gap: "0.5rem" }}>
//                           <TextField
//                             size="small"
//                             placeholder="Realtor Mail"
//                             value={realtorInput[row._id] || ""}
//                             onChange={(e) =>
//                               setRealtorInput({
//                                 ...realtorInput,
//                                 [row._id]: e.target.value,
//                               })
//                             }
//                           />
//                           <Button
//                             variant="outlined"
//                             size="small"
//                             onClick={() =>
//                               handleAssign(row._id, {
//                                 realtorMail: realtorInput[row._id],
//                               })
//                             }
//                           >
//                             Ata
//                           </Button>
//                         </div>
//                       ) : (
//                         "Henüz atanmadı"
//                       )}
//                     </>
//                   )}
//                 </TableCell>

//                 {/* Sözleşme */}
//                 <TableCell>
//                   {/* 1) Önce global loading durumu */}
//                   {loadingState[row._id] === "upload" ? (
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       disabled
//                       startIcon={<CircularProgress size={16} />}
//                     >
//                       Yükleniyor...
//                     </Button>
//                   ) : loadingState[row._id] === "delete" ? (
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       size="small"
//                       disabled
//                       startIcon={<CircularProgress size={16} />}
//                     >
//                       Siliniyor...
//                     </Button>
//                   ) : /* 2) Normal dallar */ !row.contractFile ? (
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       component="label"
//                       startIcon={<CloudUploadIcon />}
//                     >
//                       Sözleşme Yükle
//                       <input
//                         type="file"
//                         hidden
//                         accept="application/pdf,image/*"
//                         onChange={(e) => {
//                           const file = e.target.files?.[0];
//                           if (file) handleUploadContract(row._id, file);
//                           // Aynı dosyayı üst üste seçince change tetiklensin
//                           e.target.value = null;
//                         }}
//                       />
//                     </Button>
//                   ) : editingRow === row._id ? (
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       size="small"
//                       onClick={() => handleDeleteContract(row._id)}
//                       startIcon={<DeleteIcon />}
//                     >
//                       Sözleşmeyi Sil
//                     </Button>
//                   ) : (
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() =>
//                         window.open(
//                           `http://localhost:5000/${row.contractFile}`,
//                           "_blank"
//                         )
//                       }
//                       startIcon={<SaveIcon />}
//                     >
//                       Sözleşmeyi Görüntüle
//                     </Button>
//                   )}
//                 </TableCell>

//                 {/* İşlemler */}
//                 <TableCell>
//                   {editingRow === row._id ? (
//                     <div style={{ display: "flex", gap: "0.5rem" }}>
//                       <Button
//                         variant="contained"
//                         size="small"
//                         onClick={() => handleSave(row._id)}
//                       >
//                         Kaydet
//                       </Button>

//                       <Button
//                         variant="contained"
//                         size="small"
//                         onClick={() => setEditingRow(null)}
//                       >
//                         Vazgeç
//                       </Button>
//                     </div>
//                   ) : (
//                     <div style={{ display: "flex", gap: "0.5rem" }}>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => handleEditClick(row)}
//                       >
//                         <EditIcon />
//                       </Button>

//                       <Button
//                         variant="outlined"
//                         color="error"
//                         size="small"
//                         onClick={() => handleDelete(row._id)}
//                       >
//                         <DeleteIcon />
//                       </Button>
//                     </div>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// }

import React, { useState } from "react";
import axios from "axios";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PersonAddDisabledIcon from "@mui/icons-material/PersonAddDisabled";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

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

  const token = localStorage.getItem("token");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const userRole = decoded?.role;

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);

  // ✅ edit mode
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
      const res = await axios.put(
        `http://localhost:5000/api/properties/${id}`,
        {
          ...editForm,
          rentDate: editForm.rentDate ? new Date(editForm.rentDate) : undefined,
          endDate: editForm.endDate ? new Date(editForm.endDate) : undefined,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setEditingRow(null);
        setSnackbar({
          open: true,
          message: "Güncelleme başarılı 🎉",
          severity: "success",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Güncelleme sırasında hata oluştu",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu mülkü silmek istediğinize emin misiniz?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/properties/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.status === "success") {
        onUpdate({ _id: id, deleted: true });
        setSnackbar({
          open: true,
          message: "Mülk başarıyla silindi 🏠",
          severity: "info",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Silme sırasında hata oluştu",
        severity: "error",
      });
    }
  };

  // const handleAssign = async (id, payload) => {
  //   try {
  //     const res = await axios.put(
  //       `http://localhost:5000/api/properties/${id}/assign`,
  //       payload
  //     );

  //     if (res.data.status === "success") {
  //       onUpdate(res.data.property);
  //       setOwnerInput({ ...ownerInput, [id]: "" });
  //       setRealtorInput({ ...realtorInput, [id]: "" });
  //       setSnackbar({
  //         open: true,
  //         message: "Atama başarılı ✅",
  //         severity: "success",
  //       });
  //     }
  //   } catch {
  //     setSnackbar({
  //       open: true,
  //       message: "Atama sırasında hata oluştu",
  //       severity: "error",
  //     });
  //   }
  // };

  //   const handleAssign = async (id, payload) => {
  //   try {
  //     // 🔹 Atanacak maili bul (emlakçı mı ev sahibi mi?)
  //     const mail = payload.ownerMail || payload.realtorMail;
  //     if (!mail) {
  //       setSnackbar({
  //         open: true,
  //         message: "Lütfen bir mail adresi girin.",
  //         severity: "warning",
  //       });
  //       return;
  //     }

  //     // 🔹 Önce bu mail hangi role ait, onu kontrol et
  //     const userRes = await axios.get(
  //       `http://localhost:5000/api/users?mail=${mail}`
  //     );
  //     const user = userRes.data.user;

  //     if (!user) {
  //       setSnackbar({
  //         open: true,
  //         message: "Bu mail adresine sahip bir kullanıcı bulunamadı.",
  //         severity: "error",
  //       });
  //       return;
  //     }

  //     // 🔹 Şimdi rol kontrolü yap
  //     if (userRole === "realtor" && user.role !== "owner") {
  //       setSnackbar({
  //         open: true,
  //         message: "Lütfen bir ev sahibi maili girin.",
  //         severity: "warning",
  //       });
  //       return;
  //     }

  //     if (userRole === "owner" && user.role !== "realtor") {
  //       setSnackbar({
  //         open: true,
  //         message: "Lütfen bir emlakçı maili girin.",
  //         severity: "warning",
  //       });
  //       return;
  //     }

  //     // 🔹 Kontrol geçtiyse normal atama yap
  //     const res = await axios.put(
  //       `http://localhost:5000/api/properties/${id}/assign`,
  //       payload
  //     );

  //     if (res.data.status === "success") {
  //       onUpdate(res.data.property);
  //       setOwnerInput({ ...ownerInput, [id]: "" });
  //       setRealtorInput({ ...realtorInput, [id]: "" });
  //       setSnackbar({
  //         open: true,
  //         message: "Atama başarılı ✅",
  //         severity: "success",
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Atama hatası:", err);
  //     setSnackbar({
  //       open: true,
  //       message:
  //         err.response?.data?.message || "Atama sırasında hata oluştu ❌",
  //       severity: "error",
  //     });
  //   }
  // };

  const handleAssign = async (id, payload) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/properties/${id}/assign`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setOwnerInput({ ...ownerInput, [id]: "" });
        setRealtorInput({ ...realtorInput, [id]: "" });
        setSnackbar({
          open: true,
          message: res.data.message || "Atama başarılı ✅",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.data.message || "Atama başarısız ❌",
          severity: "warning",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Atama sırasında bir hata oluştu ❌",
        severity: "error",
      });
    }
  };

  const filteredData = data.filter((row) => {
    const searchLower = search?.toLowerCase() || "";
    const matchSearch =
      (row.tenantName && row.tenantName.toLowerCase().includes(searchLower)) ||
      (row.location && row.location.toLowerCase().includes(searchLower)) ||
      (row.rentPrice && row.rentPrice.toString().includes(search));
    const matchDate =
      (!startDate ||
        (row.rentDate && new Date(row.rentDate) >= new Date(startDate))) &&
      (!endDate || (row.endDate && new Date(row.endDate) <= new Date(endDate)));
    return matchSearch && matchDate;
  });

  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  const handleUploadContract = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("contract", file);
    setLoadingState((prev) => ({ ...prev, [id]: "upload" }));
    try {
      const res = await axios.post(
        `http://localhost:5000/api/properties/${id}/contract`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setLoadingState((prev) => ({ ...prev, [id]: null }));
        setSnackbar({
          open: true,
          message: "Sözleşme başarıyla yüklendi 📄",
          severity: "success",
        });
      }
    } catch {
      setLoadingState((prev) => ({ ...prev, [id]: null }));
      setSnackbar({
        open: true,
        message: "Sözleşme yüklenemedi ❌",
        severity: "error",
      });
    }
  };

  const handleDeleteContract = async (id) => {
    if (!window.confirm("Bu sözleşmeyi silmek istediğinize emin misiniz?"))
      return;
    setLoadingState((prev) => ({ ...prev, [id]: "delete" }));
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/properties/${id}/contract`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setLoadingState((prev) => ({ ...prev, [id]: null }));
        setSnackbar({
          open: true,
          message: "Sözleşme silindi 🗑️",
          severity: "info",
        });
      }
    } catch {
      setLoadingState((prev) => ({ ...prev, [id]: null }));
      setSnackbar({
        open: true,
        message: "Sözleşme silinemedi ❌",
        severity: "error",
      });
    }
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
          {/* 🔎 Filtre Alanı */}
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
              <TextField
                size="small"
                type="date"
                label="Başlangıç"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                size="small"
                type="date"
                label="Bitiş"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Button variant="outlined" onClick={handleClearFilters}>
                Filtreleri Temizle
              </Button>
            </Box>
          </Toolbar>

          {/* 📋 Tablo */}
          <Table>
            <TableHead sx={{ backgroundColor: "#2E86C1" }}>
              <TableRow>
                {[
                  "Kiracı",
                  "Fiyat",
                  "Başlangıç",
                  "Bitiş",
                  "Konum",
                  userRole === "realtor" ? "Ev Sahibi" : "Emlakçı",
                  "Sözleşme",
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

                  {/* Ev Sahibi / Emlakçı bilgisi */}
                  {/* <TableCell>
                  {userRole === "realtor" ? (
                    <>
                      {row.owner ? (
                        <span style={{ fontWeight: 500 }}>
                          {row.owner.name || row.owner.mail}
                        </span>
                      ) : (
                        <Box sx={{ display: "flex", gap: "0.5rem" }}>
                          <TextField
                            size="small"
                            placeholder="Ev Sahibi Mail"
                            value={ownerInput[row._id] || ""}
                            onChange={(e) =>
                              setOwnerInput({
                                ...ownerInput,
                                [row._id]: e.target.value,
                              })
                            }
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleAssign(row._id, {
                                ownerMail: ownerInput[row._id],
                              })
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
                            gap: "0.5rem",
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>
                            {row.realtor.name || row.realtor.mail}
                          </span>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            // startIcon={<HighlightOffIcon fontSize="small" />}
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
                            Kaldır
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", gap: "0.5rem" }}>
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
                                boxShadow: "0 3px 8px rgba(46, 134, 193, 0.5)",
                              },
                            }}
                            onClick={() =>
                              handleAssign(row._id, {
                                ownerMail:
                                  ownerInput[row._id] || realtorInput[row._id],
                              })
                            }
                          >
                            Ata
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </TableCell> */}

                  {/* Ev Sahibi / Emlakçı bilgisi */}
                  <TableCell>
                    {userRole === "realtor" ? (
                      // 🔹 Realtor paneli -> Ev sahibi atama
                      <>
                        {row.owner ? (
                          <span style={{ fontWeight: 500 }}>
                            {row.owner.name || row.owner.mail}
                          </span>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            <TextField
                              size="small"
                              placeholder="Ev Sahibi Mail"
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
                                handleAssign(row._id, {
                                  ownerMail: ownerInput[row._id],
                                })
                              }
                            >
                              Ata
                            </Button>
                          </Box>
                        )}
                      </>
                    ) : (
                      // 🔹 Owner paneli -> Emlakçı atama veya kaldırma
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
                              Kaldır
                            </Button>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
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
                                handleAssign(row._id, {
                                  realtorMail: realtorInput[row._id],
                                })
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
                            if (file) handleUploadContract(row._id, file);
                            e.target.value = null;
                          }}
                        />
                      </Button>
                    ) : editingRow === row._id ? (
                      // <Button
                      //   variant="outlined"
                      //   color="error"
                      //   size="small"
                      //   onClick={() => handleDeleteContract(row._id)}
                      //   startIcon={<DeleteIcon />}
                      // >
                      //   Sil
                      // </Button>
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
                            `http://localhost:5000/${row.contractFile}`,
                            "_blank"
                          )
                        }
                        sx={{ cursor: "pointer" }}
                      />
                    )}
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
                      // <Box sx={{ display: "flex", gap: "0.5rem" }}>
                      //   <Button
                      //     variant="outlined"
                      //     size="small"
                      //     onClick={() => handleEditClick(row)}
                      //     startIcon={<EditIcon />}
                      //   >
                      //     Düzenle
                      //   </Button>
                      //   <Button
                      //     variant="outlined"
                      //     color="error"
                      //     size="small"
                      //     onClick={() => handleDelete(row._id)}
                      //     startIcon={<DeleteIcon />}
                      //   >
                      //     Sil
                      //   </Button>
                      // </Box>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <IconButton
                          aria-label="işlemler"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setMenuRowId(row._id); // ✅ hangi satır olduğunu kaydet
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

      {/* 🎬 Snackbar */}
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
