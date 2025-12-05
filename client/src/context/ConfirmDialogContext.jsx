import { createContext, useContext, useState, useCallback } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

const ConfirmDialogContext = createContext();
export const useConfirm = () => useContext(ConfirmDialogContext);

export const ConfirmDialogProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  const processNext = () => {
    setCurrent((prev) => {
      const next = queue[0] || null;
      if (next) {
        setQueue((q) => q.slice(1));
      }
      return next;
    });
  };

  const confirm = useCallback(
    (options) => {
      return new Promise((resolve) => {
        const entry = { ...options, resolve };
        setQueue((q) => [...q, entry]);

        if (!current) {
          setCurrent(entry);
          setQueue((q) => q.slice(1));
        }
      });
    },
    [current]
  );

  const handleConfirm = () => {
    current?.resolve(true);
    setCurrent(null);
    processNext();
  };

  const handleCancel = () => {
    current?.resolve(false);
    setCurrent(null);
    processNext();
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {current && (
        <ConfirmDialog
          open={true}
          title={current.title}
          message={current.message}
          severity={current.severity || "info"}
          confirmText={current.confirmText}
          cancelText={current.cancelText}
          disableEscape={current.disableEscape || false}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
};
