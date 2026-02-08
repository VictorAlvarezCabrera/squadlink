const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

const router = express.Router();

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son obligatorios" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Ese email ya existe" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, password_hash]
    );

    return res.status(201).json({ id: result.insertId, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son obligatorios" });
    }

    const [rows] = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;