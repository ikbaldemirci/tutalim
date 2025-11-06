<Paper
  sx={{
    maxWidth: 850,
    mx: "auto",
    p: 4,
    borderRadius: 3,
    mt: 4,
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  }}
>
  {/* 🔹 Bildirim Geçmişi */}
  <Typography variant="h6" fontWeight={600} color="primary" mb={1}>
    Bildirim Geçmişim
  </Typography>
  <Divider sx={{ mb: 2 }} />
  <Box
    sx={{
      maxHeight: 220,
      overflowY: "auto",
      borderRadius: 2,
      border: "1px solid #e0e0e0",
      p: 1,
      mb: 4,
      bgcolor: "#fafafa",
    }}
  >
    {mailHistory.length > 0 ? (
      mailHistory.slice(0, 5).map((mail, i) => (
        <Paper
          key={i}
          sx={{
            p: 1.5,
            mb: 1,
            background: "#fff",
            borderLeft: "4px solid #2E86C1",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {mail.subject}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(mail.createdAt).toLocaleString("tr-TR")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mail.to}
          </Typography>
        </Paper>
      ))
    ) : (
      <Typography color="text.secondary" sx={{ p: 1 }}>
        Henüz mail geçmişi bulunmuyor.
      </Typography>
    )}
  </Box>

  {/* 🔹 Hatırlatıcılarım */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      mb: 1,
    }}
  >
    <Typography variant="h6" fontWeight={600} color="primary">
      Hatırlatıcılarım
    </Typography>
    <Button
      variant="contained"
      color="success"
      onClick={() => setOpenModal(true)}
    >
      + Yeni
    </Button>
  </Box>
  <Divider sx={{ mb: 2 }} />

  <Box
    sx={{
      maxHeight: 220,
      overflowY: "auto",
      borderRadius: 2,
      border: "1px solid #e0e0e0",
      p: 1,
      mb: 4,
      bgcolor: "#fafafa",
    }}
  >
    {reminders.length > 0 ? (
      reminders.slice(0, 5).map((r) => (
        <Paper
          key={r._id}
          sx={{
            p: 1.5,
            mb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: r.isDone ? "#e8f5e9" : "#fff",
            borderLeft: r.isDone ? "4px solid #28B463" : "4px solid #2E86C1",
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {r.message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(r.remindAt).toLocaleString("tr-TR")}
            </Typography>
          </Box>
          <IconButton
            aria-label="hatırlatıcıyı sil"
            onClick={() => handleDeleteReminder(r._id)}
            sx={{ color: "#dc3545" }}
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Paper>
      ))
    ) : (
      <Typography color="text.secondary" sx={{ p: 1 }}>
        Henüz hatırlatıcı yok.
      </Typography>
    )}
  </Box>

  {/* 🔹 Profil Bilgilerim */}
  <Typography variant="h6" fontWeight={600} color="primary" mb={1}>
    Profil Bilgilerim
  </Typography>
  <Divider sx={{ mb: 2 }} />

  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {["name", "surname"].map((field) => (
      <Box key={field} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          label={field === "name" ? "Ad" : "Soyad"}
          name={field}
          value={form[field]}
          onChange={handleChange}
          fullWidth
          InputProps={{ readOnly: !isEditing[field] }}
        />
        {isEditing[field] ? (
          <>
            <IconButton color="success" onClick={handleProfileUpdate}>
              <CheckIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleCancel(field)}>
              <CancelIcon />
            </IconButton>
          </>
        ) : (
          <IconButton
            color="primary"
            onClick={() => setIsEditing((prev) => ({ ...prev, [field]: true }))}
          >
            <EditIcon />
          </IconButton>
        )}
      </Box>
    ))}

    <TextField
      label="E-posta"
      name="mail"
      value={form.mail}
      fullWidth
      InputProps={{
        readOnly: true,
        sx: { backgroundColor: "#f5f6fa", borderRadius: 1 },
      }}
      sx={{ mt: 1 }}
    />

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight={500}>
      Şifre Değiştir
    </Typography>
    <TextField
      label="Mevcut Şifre"
      type="password"
      name="currentPassword"
      value={form.currentPassword}
      onChange={handleChange}
      fullWidth
    />
    <TextField
      label="Yeni Şifre"
      type="password"
      name="newPassword"
      value={form.newPassword}
      onChange={handleChange}
      fullWidth
      sx={{ mb: 1 }}
    />
    <Button variant="contained" onClick={handlePasswordChange}>
      Şifreyi Değiştir
    </Button>
  </Box>
</Paper>;
