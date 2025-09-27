const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const collection = require("./config");
const app = express();
const Property = require("./propertyModel");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
    // cb(
    //   null,
    //   file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    // );
  },
});

const upload = multer({ storage: storage });

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.options("*", cors());
app.use("/uploads", express.static("uploads"));

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  try {
    const { name, surname, mail, password, role } = req.body;
    const existingUser = await collection.findOne({ mail });
    if (existingUser)
      return res.json({ status: "error", message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.create({
      name,
      surname,
      mail,
      password: hashedPassword,
      role,
    });

    res.json({ status: "success", message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

const jwt = require("jsonwebtoken");
const SECRET_KEY = "tutalim-secret";

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { mail, password } = req.body;
  const user = await collection.findOne({ mail });

  if (!user) return res.json({ status: "fail", message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ status: "fail", message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  res.json({ status: "success", token });
});

// Create a new property
app.post("/api/properties", async (req, res) => {
  try {
    const {
      rentPrice,
      rentDate,
      endDate,
      location,
      realtorId,
      ownerId,
      tenantName,
    } = req.body;

    if (!rentPrice || !rentDate || !endDate || !location || !realtorId) {
      return res
        .status(400)
        .json({ status: "fail", message: "Eksik alanlar var" });
    }

    const property = await Property.create({
      rentPrice,
      rentDate: new Date(rentDate),
      endDate: new Date(endDate),
      location,
      realtor: realtorId,
      owner: ownerId || null,
      tenantName: tenantName || "",
    });

    const populatedProperty = await Property.findById(property._id)
      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    res.json({ status: "success", property: populatedProperty });
  } catch (err) {
    console.error("Property ekleme hatası:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Get properties filtered by realtor and owner
app.get("/api/properties", async (req, res) => {
  try {
    const { realtorId, ownerId } = req.query;
    const filter = {};
    if (realtorId) filter.realtor = realtorId;
    if (ownerId) filter.owner = ownerId;

    const properties = await Property.find(filter)

      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    res.json({ status: "success", properties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Update a property
app.put("/api/properties/:id", async (req, res) => {
  try {
    const {
      rentPrice,
      rentDate,
      endDate,
      location,
      tenantName,
      ownerId,
      ownerMail,
    } = req.body;

    let updateData = {
      rentPrice,
      rentDate: new Date(rentDate),
      endDate: new Date(endDate),
      location,
      tenantName,
    };

    // Eğer ownerMail gönderildiyse ev sahibini mail üzerinden bul ve ata
    if (ownerMail) {
      const owner = await collection.findOne({ mail: ownerMail });
      if (!owner) {
        return res
          .status(404)
          .json({ status: "fail", message: "Owner not found" });
      }
      updateData.owner = owner._id;
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    res.json({ status: "success", property });
  } catch (err) {
    console.error("Property update error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Assign a property to an owner
app.put("/api/properties/:id/assign", async (req, res) => {
  try {
    const { ownerMail, realtorMail } = req.body;
    let updateData = {};

    // if (ownerMail === null) {
    //   updateData.owner = null;
    // } else
    if (ownerMail) {
      const owner = await collection.findOne({ mail: ownerMail });
      if (!owner) {
        return res
          .status(404)
          .json({ status: "fail", message: "Owner not found" });
      }
      updateData.owner = owner._id;
    }

    if (realtorMail === null) {
      updateData.realtor = null;
    } else if (realtorMail) {
      const realtor = await collection.findOne({ mail: realtorMail });
      if (!realtor) {
        return res
          .status(404)
          .json({ status: "fail", message: "Realtor not found" });
      }
      updateData.realtor = realtor._id;
    }

    // Eğer hiç mail gelmediyse
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "No mail provided" });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    res.json({ status: "success", property });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Delete a property
app.delete("/api/properties/:id", async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "Property deleted" });
  } catch (err) {
    console.error("Property delete error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Sözleşme yükleme endpointi
app.post(
  "/api/properties/:id/contract",
  upload.single("contract"),
  async (req, res) => {
    try {
      const property = await Property.findByIdAndUpdate(
        req.params.id,
        { contractFile: req.file.path }, // dosya yolu kaydedilecek
        { new: true }
      )
        .populate("realtor", "name mail")
        .populate("owner", "name mail");

      if (!property) {
        return res
          .status(404)
          .json({ status: "fail", message: "Property not found" });
      }

      res.json({
        status: "success",
        message: "Sözleşme başarıyla yüklendi",
        property,
      });
    } catch (err) {
      console.error("Contract upload error:", err);
      res
        .status(500)
        .json({ status: "error", message: "Server error while uploading" });
    }
  }
);

app.listen(5000, () => console.log("Server running on port 5000"));
