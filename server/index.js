const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const collection = require("./config");
const app = express();

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

  // res.json({ status: "success", message: "Login successful" });
  res.json({ status: "success", token });
});

app.listen(5000, () => console.log("Server running on port 5000"));
