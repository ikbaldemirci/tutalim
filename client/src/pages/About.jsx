import { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import CountUp from "react-countup";
import axios from "axios";
import {
  Box,
  Typography,
  Container,
  Paper,
  useMediaQuery,
  Divider,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TextType from "../components/TextType";

const steps = [
  {
    icon: <HomeWorkIcon fontSize="large" color="primary" />,
    title: "Emlakçı İlan Oluşturur",
    desc: "Emlakçılar, portföylerine yeni gayrimenkuller ekleyerek ilan oluşturur. Tüm bilgiler güvenli bir şekilde sisteme kaydedilir.",
  },
  {
    icon: <PersonSearchIcon fontSize="large" color="primary" />,
    title: "Kayıt Ev Sahibine Atanır",
    desc: "Oluşturulan ilan, ilgili ev sahibine atanır ve her iki taraf da süreci kendi panelinden görüntüleyebilir.",
  },
  {
    icon: <VisibilityIcon fontSize="large" color="primary" />,
    title: "Taraflar Süreci Takip Eder",
    desc: "Emlakçı ve ev sahibi, ilan detaylarını görüntüleyip kendilerine uygun aksiyonlar alabilir; düzenleme, onay veya geri bildirim sağlayabilir.",
  },
  {
    icon: <ChatBubbleOutlineIcon fontSize="large" color="primary" />,
    title: "İletişim & Görüşme",
    desc: "Taraflar sistem üzerinden iletişime geçerek detayları netleştirir ve süreci dijital ortamda yürütür.",
  },
  {
    icon: <DoneAllIcon fontSize="large" color="primary" />,
    title: "Süreç Tamamlanır",
    desc: "Anlaşma sağlandığında süreç tamamlanır. Kullanıcılar, kendileri için hatırlatıcılar oluşturarak ve yeni aksiyonlar alarak işlemlerini sürdürebilir.",
  },
];

function About() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [stats, setStats] = useState({
    propertyCount: 0,
    userCount: 0,
    matchCount: 0,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ignore = false;
    let idleId = null;
    let timeoutId = null;

    const run = () => {
      axios
        .get("https://tutalim.com/api/stats")
        .then((res) => {
          if (!ignore && res.data.status === "success") {
            setStats(res.data.stats);
          }
        })
        .catch((err) => console.error("Stats fetch error:", err));
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(run, 0);
    }

    return () => {
      ignore = true;
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

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
                  text={["Tutalım'a hoş geldin!", "Tutalım Nasıl çalışır?"]}
                  typingSpeed={70}
                  deletingSpeed={40}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                  textColors={["#2E86C1"]}
                  loop={true}
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
                <strong>"Dizginleri elinde tutmak"</strong> <br />
                Tutalım.com, ev sahipleri ile profesyonel emlakçıları modern,
                güvenli ve şeffaf bir platformda buluşturan dijital bir
                sistemdir. Aşağıda, bu sürecin adımlarını adım adım
                görebilirsiniz.
              </Typography>
            </m.div>
          </Container>

          <Container sx={{ pb: 4 }}>
            <Box
              sx={{
                position: "relative",
                py: 4,
                px: 1,
              }}
            >
              {!isMobile && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px",
                    background: "linear-gradient(to bottom, #AED6F1, #2E86C1)",
                    borderRadius: 2,
                    zIndex: 0,
                  }}
                />
              )}

              {steps.map((step, index) => (
                <m.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true, amount: 0.3 }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile
                        ? "column"
                        : index % 2 === 0
                        ? "row"
                        : "row-reverse",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 5,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {!isMobile && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 22,
                          height: 22,
                          backgroundColor: "#2E86C1",
                          borderRadius: "50%",
                          zIndex: 2,
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        flex: "1 1 45%",
                        display: "flex",
                        justifyContent: "center",
                        mb: isMobile ? 2 : 0,
                      }}
                    >
                      <m.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        viewport={{ once: true, amount: 0.3 }}
                        style={{ willChange: "transform, opacity" }}
                      >
                        {step.icon}
                      </m.div>
                    </Box>

                    <Paper
                      elevation={4}
                      sx={{
                        flex: "1 1 45%",
                        p: 3,
                        mx: 2,
                        borderRadius: 3,
                        backgroundColor: "#fff",
                        boxShadow: "0 4px 14px rgba(46,134,193,0.15)",
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h2"
                        fontWeight={600}
                        sx={{ color: "primary.dark" }}
                        gutterBottom
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "#333", lineHeight: 1.6 }}
                      >
                        {step.desc}
                      </Typography>
                    </Paper>
                  </Box>
                </m.div>
              ))}
            </Box>

            <Divider sx={{ my: 6, opacity: 0.5 }} />

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
                mb={4}
              >
                Tutalım'da Gerçek Zamanlı Büyüme
              </Typography>

              <Grid container columns={12} spacing={4} justifyContent="center">
                {[
                  {
                    icon: (
                      <ApartmentIcon sx={{ fontSize: 40 }} color="primary" />
                    ),
                    label: "Aktif İlan",
                    value: stats.propertyCount,
                  },
                  {
                    icon: (
                      <PeopleAltIcon sx={{ fontSize: 40 }} color="primary" />
                    ),
                    label: "Kayıtlı Kullanıcı",
                    value: stats.userCount,
                  },
                  {
                    icon: (
                      <VerifiedUserIcon sx={{ fontSize: 40 }} color="primary" />
                    ),
                    label: "Başarılı Eşleşme",
                    value: stats.matchCount,
                  },
                ].map((stat, i) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={i} textAlign="center">
                    <m.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 250 }}
                      viewport={{ once: true, amount: 0.3 }}
                      style={{ willChange: "transform, opacity" }}
                      onViewportEnter={() => setVisible(true)}
                    >
                      {stat.icon}
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color="primary"
                        sx={{ my: 1 }}
                      >
                        <CountUp end={stat.value} duration={2.5} />+
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#555" }}>
                        {stat.label}
                      </Typography>
                    </m.div>
                  </Grid>
                ))}
              </Grid>
            </m.div>

            <Divider sx={{ my: 6, opacity: 0.5 }} />

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
                Dijital gayrimenkul dünyasına adım atın
              </Typography>
              <Typography
                variant="body1"
                textAlign="center"
                sx={{ maxWidth: 700, mx: "auto", color: "#555" }}
              >
                Tutalım ile süreçleriniz artık çok daha kolay, hızlı ve şeffaf.
                Ev sahipleri ve emlakçılar, modern bir arayüzde güvenle
                buluşuyor.
              </Typography>
            </m.div>
          </Container>
        </LazyMotion>

        <Footer />
      </Box>
    </>
  );
}

export default About;
