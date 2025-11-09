import { LazyMotion, domAnimation, m } from "framer-motion";
import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TextType from "../components/TextType";
import ContactForm from "../components/ContactForm";
import DecryptedText from "../components/DecryptedText";
import "../components/style/DecryptedText.css";

export default function Contact() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <Navbar />
      <Box
        sx={{
          background: "linear-gradient(135deg, #EAF2F8, #FDFEFE)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <LazyMotion features={domAnimation}>
          <Container sx={{ textAlign: "center", py: { xs: 2, sm: 4, md: 6 } }}>
            <m.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
              style={{ willChange: "transform, opacity" }}
            >
              <Typography
                variant="h2"
                component="h1"
                fontWeight={700}
                color="primary"
                gutterBottom
              >
                <TextType
                  text={["Bizimle İletişimi Sıkı Tutun!", "Şimdi Ulaşın!"]}
                  typingSpeed={70}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                  loop={true}
                  deletingSpeed={40}
                  textColors={["#2E86C1"]}
                />
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  maxWidth: 700,
                  mx: "auto",
                  color: "#555",
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Sorularınız, iş birliği teklifleriniz veya geri bildirimleriniz
                mi var? Tutalım ekibi her mesajı özenle inceler.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.2,
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography
                  component="a"
                  href="tel:+905068337985"
                  sx={{
                    color: "#2E86C1",
                    fontWeight: 600,
                    fontSize: "1.15rem",
                    textDecoration: "none",
                    transition: "color 0.3s ease",
                    "&:hover": {
                      color: "#1F618D",
                      textDecoration: "underline",
                    },
                  }}
                >
                  +90 506 833 7985
                </Typography>

                <Typography
                  component="a"
                  href="mailto:info@tutalim.com"
                  sx={{
                    color: "#2E86C1",
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    textDecoration: "none",
                    transition: "color 0.3s ease",
                    "&:hover": {
                      color: "#1F618D",
                      textDecoration: "underline",
                    },
                  }}
                >
                  info@tutalim.com
                </Typography>
              </Box>
            </m.div>
          </Container>

          <Box
            sx={{
              py: 4,
              px: { xs: 1, sm: 3 },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Paper
              elevation={4}
              sx={{
                p: { xs: 3, sm: 5 },
                maxWidth: 600,
                mx: "auto",
                borderRadius: 3,
                backgroundColor: "#fff",
                boxShadow: "0 4px 14px rgba(46,134,193,0.15)",
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                fontWeight={600}
                sx={{ color: "primary.dark", mb: 3, textAlign: "center" }}
              >
                Mesaj Gönderin
              </Typography>
              <ContactForm />
            </Paper>
          </Box>

          <Divider sx={{ my: 6, opacity: 0.5 }} />

          <Container sx={{ pb: 4 }}>
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.3 }}
              style={{ willChange: "transform, opacity" }}
            >
              <Typography
                variant="h5"
                textAlign="center"
                color="primary"
                fontWeight={600}
                mb={1}
              >
                Tutalım ile bağlantıda kalın
              </Typography>
              <Typography
                variant="body1"
                textAlign="center"
                sx={{ maxWidth: 700, mx: "auto", color: "#555" }}
              >
                Dijitalde sınır tanımıyoruz. Sizinle iletişim kurmak için
                sabırsızlanıyoruz.
              </Typography>
            </m.div>
          </Container>
        </LazyMotion>

        <Footer />
      </Box>
    </>
  );
}
