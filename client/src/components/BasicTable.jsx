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

export default function BasicTable({ data = [], onUpdate }) {
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [ownerInput, setOwnerInput] = useState({}); // propertyId -> ownerId

  // search
  const [search, setSearch] = useState("");

  //  filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Düzenle moduna geç
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
          rentDate: new Date(editForm.rentDate),
          endDate: new Date(editForm.endDate),
        }
      );

      if (res.data.status === "success") {
        onUpdate(res.data.property); // parent state güncelle
        setEditingRow(null);
      }
    } catch (err) {
      console.error("Update error:", err);
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
      console.error("Delete error:", err);
    }
  };

  const handleAssignOwner = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/properties/${id}/assign`,
        { ownerId: ownerInput[id] }
      );
      if (res.data.status === "success") {
        onUpdate(res.data.property);
        setOwnerInput({ ...ownerInput, [id]: "" });
      }
    } catch (err) {
      console.error("Assign error:", err);
    }
  };

  // search + filter uygulanmış data
  const filteredData = data.filter((row) => {
    const matchSearch =
      row.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
      row.location?.toLowerCase().includes(search.toLowerCase()) ||
      row.rentPrice?.toString().includes(search) ||
      (row.owner?.name &&
        row.owner.name.toLowerCase().includes(search.toLowerCase()));

    const matchDate =
      // (!startDate ||
      //   (row.rentDate && new Date(row.rentDate) >= new Date(startDate))) &&
      // (!endDate || (row.endDate && new Date(row.endDate) <= new Date(endDate)));

      (!startDate || new Date(row.rentDate) >= new Date(startDate)) &&
      (!endDate || new Date(row.endDate) <= new Date(endDate));

    return matchSearch && matchDate;
  });

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
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
      </Toolbar>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Kıracı</TableCell>
            <TableCell>Fiyat (₺)</TableCell>
            <TableCell>Başlangıç</TableCell>
            <TableCell>Bitiş</TableCell>
            <TableCell>Konum</TableCell>
            <TableCell>
              {(() => {
                const token = localStorage.getItem("token");
                if (token) {
                  const decoded = JSON.parse(atob(token.split(".")[1]));
                  return decoded.role === "realtor"
                    ? "Ev Sahibi Adı"
                    : "Emlakçı Adı";
                }
                return "";
              })()}
            </TableCell>
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
                    value={editForm.rentPrice}
                    onChange={handleEditChange}
                    size="small"
                  />
                ) : (
                  row.rentPrice
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

              {/* Owner */}
              <TableCell>
                {row.owner ? row.owner.name || row.owner : "Henüz atanmadı"}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: 4 }}>
                  <TextField
                    size="small"
                    placeholder="Owner ID"
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
                    onClick={() => handleAssignOwner(row._id)}
                  >
                    Ata
                  </Button>
                </div>
              </TableCell>

              {/* İşlemler */}
              <TableCell>
                {editingRow === row._id ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSave(row._id)}
                  >
                    Kaydet
                  </Button>
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
