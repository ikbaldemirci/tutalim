import { Paper, Typography } from "@mui/material";

function WelcomeHeader({ name }) {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: 1000,
        mx: "auto",
        mt: 3,
        mb: 2,
        p: 2.5,
        borderRadius: 3,
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="h6" fontWeight={700} color="primary">
        Hoş geldin, {name}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {today.charAt(0).toUpperCase() + today.slice(1)}
      </Typography>
    </Paper>
  );
}

export default WelcomeHeader;
