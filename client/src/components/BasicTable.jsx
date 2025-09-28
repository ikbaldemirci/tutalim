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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";

export default function BasicTable({ data = [], onUpdate }) {
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [ownerInput, setOwnerInput] = useState({}); // propertyId -> ownerId
  const [realtorInput, setRealtorInput] = useState({}); // propertyId -> realtorId

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const userRole = decoded?.role;

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
          // rentDate: new Date(editForm.rentDate),
          // endDate: new Date(editForm.endDate),
          rentDate: editForm.rentDate ? new Date(editForm.rentDate) : undefined,
          endDate: editForm.endDate ? new Date(editForm.endDate) : undefined,
        }
      );

      if (res.data.status === "success") {
        onUpdate(res.data.property); // parent state güncelle
        setEditingRow(null);
      }
    } catch (err) {
      alert("Güncelleme sırasında hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bu mülkü silmek istediğinize emin misiniz?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/properties/${id}`
      );
      if (res.data.status === "success") {
        onUpdate({ _id: id, deleted: true }); // parent state güncelle
      }
    } catch (err) {
      alert("Silme sırasında hata oluştu.");
    }
  };

  const handleAssign = async (id, payload) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/properties/${id}/assign`,
        payload // { ownerMail: "..."} veya { realtorMail: "..." }
      );

      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setOwnerInput({ ...ownerInput, [id]: "" });
        setRealtorInput({ ...realtorInput, [id]: "" });
      }
    } catch (err) {
      console.error("Assign error:", err);
    }
  };

  const getUserDisplay = (user) => {
    if (!user) return null;
    // Eğer populate edilmiş obje ise object, değilse string id olabilir
    if (typeof user === "object") {
      // name varsa name + (opsiyonel) surname yoksa mail göster
      return (
        user.name || user.mail || (user._id && user._id.toString()) || null
      );
    }
    // user string ise (objectId string) => gösterilecek okunabilir bilgi yok, döndür id
    return String(user);
  };

  // hangi sütunda ne gösterilecek: eğer kullanıcının rolü realtor ise Owner gösterilsin,
  // eğer owner ise Realtor gösterilsin
  const renderOwnerOrRealtorCell = (row) => {
    const token = localStorage.getItem("token");
    const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
    if (!decoded) return "Henüz atanmadı";

    if (decoded.role === "realtor") {
      // Emlakçı görüyorsa -> ev sahibinin bilgisini göster (owner)
      const ownerName = getUserDisplay(row.owner);
      return ownerName || "Henüz atanmadı";
    } else {
      // Ev sahibi görüyorsa -> emlakçının bilgisini göster (realtor)
      const realtorName = getUserDisplay(row.realtor);
      return realtorName || "Henüz atanmadı";
    }
  };

  const filteredData = data.filter((row) => {
    const searchLower = search?.toString().toLowerCase() || "";

    const matchSearch =
      (row.tenantName && row.tenantName.toLowerCase().includes(searchLower)) ||
      (row.location && row.location.toLowerCase().includes(searchLower)) ||
      (row.rentPrice && row.rentPrice.toString().includes(search)) ||
      (row.owner &&
        typeof row.owner === "object" &&
        row.owner.name &&
        row.owner.name.toLowerCase().includes(searchLower)) ||
      (row.realtor &&
        typeof row.realtor === "object" &&
        row.realtor.name &&
        row.realtor.name.toLowerCase().includes(searchLower));

    const matchDate =
      (!startDate ||
        (row.rentDate && new Date(row.rentDate) >= new Date(startDate))) &&
      (!endDate || (row.endDate && new Date(row.endDate) <= new Date(endDate)));

    return matchSearch && matchDate;
  });

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
  };

  // upload
  const handleUploadContract = async (id, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("contract", file);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/properties/${id}/contract`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.status === "success") {
        onUpdate(res.data.property);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // delete
  const handleDeleteContract = async (id) => {
    const confirmDelete = window.confirm(
      "Bu sözleşmeyi silmek istediğinize emin misiniz?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/properties/${id}/contract`
      );
      if (res.data.status === "success") {
        onUpdate(res.data.property);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: 1000, margin: "2rem auto" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* <Toolbar sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}></Toolbar> */}
        <TextField
          size="small"
          placeholder="Ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 220 }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
          <Button onClick={handleClearFilters}>Filtreleri Temizle</Button>
        </div>
      </Toolbar>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Kiracı</TableCell>
            <TableCell>Fiyat (₺)</TableCell>
            <TableCell>Başlangıç</TableCell>
            <TableCell>Bitiş</TableCell>
            <TableCell>Konum</TableCell>
            <TableCell>
              {(() => {
                const token = localStorage.getItem("token");
                if (token) {
                  const decoded = JSON.parse(atob(token.split(".")[1]));
                  return decoded.role === "realtor" ? "Ev Sahibi" : "Emlakçı";
                }
                return "";
              })()}
            </TableCell>
            <TableCell>Sözleşme</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredData.map((row) => (
            <TableRow key={row._id}>
              <TableCell>
                {editingRow === row._id ? (
                  <TextField
                    name="tenantName"
                    value={editForm.tenantName}
                    onChange={handleEditChange}
                    size="small"
                  />
                ) : (
                  row.tenantName || "Henüz atanmadı"
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
                  row.rentPrice?.toLocaleString("tr-TR") + " ₺"
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
                  new Date(row.rentDate).toLocaleDateString()
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
                  new Date(row.endDate).toLocaleDateString()
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

              {/* Owner/Realtor bilgisi */}
              <TableCell>
                {userRole === "realtor" ? (
                  <>
                    {row.owner ? (
                      editingRow === row._id ? (
                        // Düzenle modunda: yeni owner maili girilebilir
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <TextField
                            size="small"
                            placeholder="Yeni Ev Sahibi Mail"
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
                        </div>
                      ) : (
                        <span>{row.owner.name || row.owner.mail}</span>
                      )
                    ) : (
                      // Hiç atama yapılmamışsa her zaman input gelsin
                      <div style={{ display: "flex", gap: "0.5rem" }}>
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
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {row.realtor ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        <span>{row.realtor.name || row.realtor.mail}</span>
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() =>
                            handleAssign(row._id, { realtorMail: null })
                          }
                        >
                          Yetkiyi Kaldır
                        </Button>
                      </div>
                    ) : editingRow === row._id ? (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <TextField
                          size="small"
                          placeholder="Realtor Mail"
                          value={realtorInput[row._id] || ""}
                          onChange={(e) =>
                            setRealtorInput({
                              ...realtorInput,
                              [row._id]: e.target.value,
                            })
                          }
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleAssign(row._id, {
                              realtorMail: realtorInput[row._id],
                            })
                          }
                        >
                          Ata
                        </Button>
                      </div>
                    ) : (
                      "Henüz atanmadı"
                    )}
                  </>
                )}
              </TableCell>

              {/* Sözleşme */}
              <TableCell>
                {!row.contractFile ? (
                  // Eğer sözleşme yoksa yükleme butonu
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                  >
                    Sözleşme Yükle
                    <input
                      type="file"
                      hidden
                      accept="application/pdf"
                      onChange={(e) =>
                        handleUploadContract(row._id, e.target.files[0])
                      }
                    />
                  </Button>
                ) : editingRow === row._id ? (
                  // Düzenleme modundaysa sil
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteContract(row._id)}
                    startIcon={<DeleteIcon />}
                  >
                    Sözleşmeyi Sil
                  </Button>
                ) : (
                  // Normal modda görüntüle
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      window.open(
                        `http://localhost:5000/${row.contractFile}`,
                        "_blank"
                      )
                    }
                    startIcon={<SaveIcon />}
                  >
                    Sözleşmeyi Görüntüle
                  </Button>
                )}
              </TableCell>

              {/* İşlemler */}
              <TableCell>
                {editingRow === row._id ? (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSave(row._id)}
                    >
                      Kaydet
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setEditingRow(null)}
                    >
                      Vazgeç
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditClick(row)}
                    >
                      <EditIcon />
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(row._id)}
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
