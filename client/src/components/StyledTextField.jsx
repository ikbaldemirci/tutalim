import { useEffect, useState } from "react";
import { TextField } from "@mui/material";

export default function StyledTextField(props) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateMode = (e) => setIsDarkMode(e.matches);
    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateMode);

    return () => mediaQuery.removeEventListener("change", updateMode);
  }, []);

  const background = isDarkMode
    ? "rgba(0, 0, 0, 0.35)"
    : "rgba(255, 255, 255, 0.3)";
  const textColor = isDarkMode ? "#f5f5f5" : "#111";
  const labelColor = isDarkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)";
  const focusBorder = "#5DADE2";

  return (
    <TextField
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: background,
          color: textColor,
          borderRadius: "8px",
          transition: "all 0.3s ease",
          "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
          "&:hover fieldset": { borderColor: focusBorder },
          "&.Mui-focused fieldset": {
            borderColor: focusBorder,
            boxShadow: "0 0 8px rgba(93,173,226,0.4)",
          },
        },

        "& .MuiInputLabel-root": {
          color: labelColor,
          transition: "color 0.3s ease",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: focusBorder,
        },

        "& input:-webkit-autofill": {
          WebkitBoxShadow: `0 0 0 100px ${background} inset !important`,
          WebkitTextFillColor: `${textColor} !important`,
          caretColor: textColor,
          transition: "background-color 9999s ease-in-out 0s !important",
        },
        "& input:-webkit-autofill:focus": {
          WebkitBoxShadow: `0 0 0 100px ${background} inset !important`,
          WebkitTextFillColor: `${textColor} !important`,
        },
      }}
    />
  );
}
