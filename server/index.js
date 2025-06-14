const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const collection = require("./config");
const app = express();
const Property = require("./propertyModel");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

app.options("*", cors());

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
    const { rentPrice, rentDate, endDate, location, realtorId, ownerId } =
      req.body;
    const property = await Property.create({
      rentPrice,
      rentDate,
      endDate,
      location,
      realtor: realtorId,
      owner: ownerId || null,
      details,
    });
    res.json({ status: "success", property });
  } catch (err) {
    console.error(err);
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

    const properties = await Property.find(filter);
    res.json({ status: "success", properties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Assign a property to an owner
app.put("/api/properties/:id/assign", async (req, res) => {
  try {
    const { ownerId } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { owner: ownerId },
      { new: true }
    );
    res.json({ status: "success", property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
