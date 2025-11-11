import { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { on, NOTIFY_EVENT } from "./lib/bus";

export default function NotificationProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const off = on(NOTIFY_EVENT, (payload) => {
      const item = {
        id: Date.now() + Math.random(),
        severity: payload?.severity || "info",
        message: payload?.message || "",
        duration: payload?.duration || 3000,
      };
      setQueue((q) => [...q, item]);
    });
    return () => off();
  }, []);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  const handleClose = () => setCurrent(null);

  return (
    <>
      {children}
      <Snackbar
        open={!!current}
        autoHideDuration={current?.duration || 3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity={current?.severity || "info"} sx={{ width: "100%" }}>
          {current?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

