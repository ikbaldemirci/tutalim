import { Box } from "@mui/material";

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #eaf2f8, #f4f9ff)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 260,
          height: 100,
        }}
      >
        <img
          src="/images/tutalim.webp"
          alt="Tutalım Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "brightness(0.8)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "-150%",
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(120deg, transparent, rgba(255,255,255,0.7), transparent)",
            animation: "shine 2.5s infinite ease-in-out",
          }}
        />
      </Box>

      <style>{`
        @keyframes shine {
          0% { left: -150%; opacity: 0.3; }
          50% { left: 150%; opacity: 1; }
          100% { left: 150%; opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
}
