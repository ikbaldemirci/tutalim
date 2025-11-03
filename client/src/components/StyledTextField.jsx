import { TextField } from "@mui/material";

export default function StyledTextField(props) {
  return (
    <TextField
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "#fff",
          borderRadius: "8px",
          "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
          "&:hover fieldset": { borderColor: "#5DADE2" },
          "&.Mui-focused fieldset": {
            borderColor: "#5DADE2",
            boxShadow: "0 0 8px rgba(93,173,226,0.4)",
          },
        },
        "& .MuiInputLabel-root": { color: "#E0E0E0" },
        "& .MuiInputLabel-root.Mui-focused": { color: "#5DADE2" },
      }}
    />
  );
}
