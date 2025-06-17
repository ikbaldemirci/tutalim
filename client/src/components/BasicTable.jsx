import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

// Mock veri
const mockData = [
  {
    id: 1,
    rentPrice: 12000,
    rentDate: "2024-06-01",
    endDate: "2025-06-01",
    location: "Kadıköy, İstanbul",
    owner: "Henüz atanmadı",
  },
  {
    id: 2,
    rentPrice: 9500,
    rentDate: "2024-05-10",
    endDate: "2025-05-10",
    location: "Çankaya, Ankara",
    owner: "ahmet@test.com",
  },
];

export default function BasicTable() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const id = decoded.id;
        const role = decoded.role;

        const queryParam =
          role === "realtor"
            ? `realtorId=${id}`
            : role === "owner"
            ? `ownerId=${id}`
            : "";

        const res = await axios.get(
          `http://localhost:5000/api/properties?${queryParam}`
        );
        if (res.data.status === "success") {
          setProperties(res.data.properties);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: 900, margin: "2rem auto" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {/* <TableCell>ID</TableCell> */}
            <TableCell>Fiyat (₺)</TableCell>
            <TableCell>Başlangıç</TableCell>
            <TableCell>Bitiş</TableCell>
            <TableCell>Konum</TableCell>
            <TableCell>Ev Sahibi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {properties.map((row) => (
            <TableRow key={row._id}>
              <TableCell>{row.rentPrice}</TableCell>
              <TableCell>
                {new Date(row.rentDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(row.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{row.location}</TableCell>
              <TableCell>
                {row.owner ? row.owner.name || row.owner : "Henüz atanmadı"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
