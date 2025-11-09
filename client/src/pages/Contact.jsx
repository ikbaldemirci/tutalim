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
          <Container sx={{ textAlign: "center", py: { xs: 4, sm: 6, md: 8 } }}>
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
                  text={[
                    "Bizimle İletişimi Sıkı Tutun",
                    "Tutalım Ekibi Her Zaman Ulaşılabilir!",
                  ]}
                  typingSpeed={70}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
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
                  gap: 1,
                  alignItems: "center",
                  color: "#2E86C1",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                <DecryptedText
                  text="+90 555 444 33 22"
                  speed={45}
                  maxIterations={15}
                  animateOn="both"
                  revealDirection="center"
                  className="revealed"
                  encryptedClassName="encrypted"
                />
                <DecryptedText
                  text="info@tutalim.com"
                  speed={50}
                  maxIterations={18}
                  animateOn="both"
                  revealDirection="center"
                  className="revealed"
                  encryptedClassName="encrypted"
                />
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
