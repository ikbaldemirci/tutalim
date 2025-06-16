import * as React from "react";
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
  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: 900, margin: "2rem auto" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Fiyat (₺)</TableCell>
            <TableCell>Başlangıç</TableCell>
            <TableCell>Bitiş</TableCell>
            <TableCell>Konum</TableCell>
            <TableCell>Ev Sahibi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.rentPrice}</TableCell>
              <TableCell>{row.rentDate}</TableCell>
              <TableCell>{row.endDate}</TableCell>
              <TableCell>{row.location}</TableCell>
              <TableCell>{row.owner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
