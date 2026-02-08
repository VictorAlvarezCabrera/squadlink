require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./src/db/pool");
const authRoutes = require("./src/routes/auth.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// Ruta de salud
app.get("/health", (req, res) => {
    res.json({ ok: true });
});

app.get("/db-test", async (req, res) => {
    const [rows] = await pool.query("SELECT 1 AS test");
    res.json(rows[0]);
});

app.use("/auth", authRoutes);
// Puerto
const PORT = process.env.PORT || 3001;

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});