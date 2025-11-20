import { Modal, Box } from "@mui/material";
import InviteList from "./InviteList";

export default function InviteModal({
  open,
  onClose,
  invites,
  loadingInvites,
  acceptInvite,
  rejectInvite,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 480,
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 24,
          p: 2,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <InviteList
          invites={invites}
          loadingInvites={loadingInvites}
          acceptInvite={acceptInvite}
          rejectInvite={rejectInvite}
          mode="modal"
        />
      </Box>
    </Modal>
  );
}
