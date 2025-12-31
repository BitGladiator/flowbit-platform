const express = require("express");
const { login, register } = require("../services/authService");
const router = express.Router();
router.get("/validate", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ valid: false, error: "No token provided" });
    }

    const user = await validateToken(token);
    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false, error: error.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { email, password, customerId, role } = req.body;
    if (!email || !password || !customerId) {
      return res.status(400).json({
        error: "Email, password, and customerId are required",
      });
    }

    const user = await register(email, password, customerId, role);
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
