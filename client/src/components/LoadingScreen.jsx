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
      {/* Logo alanı */}
      <Box
        sx={{
          position: "relative",
          width: 260, // 🔹 logo boyutu (biraz büyüttük)
          height: 100,
        }}
      >
        <img
          src="/images/tutalim.png"
          alt="Tutalım Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "brightness(0.8)",
          }}
        />

        {/* ✨ Parlaklık efekti katmanı */}
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

      {/* 🔹 Işık animasyonu */}
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

// return (
//   <Box
//     sx={{
//       height: "100vh",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       flexDirection: "column",
//       color: "#2E86C1",
//     }}
//   >
//     <CircularProgress color="primary" size={60} thickness={5} />
//     <p style={{ marginTop: "1rem", fontWeight: 600 }}>
//       Giriş doğrulanıyor...
//     </p>
//   </Box>
// );
