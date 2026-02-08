const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

// GET /players/random?limit=6
router.get("/random", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "6", 10), 20);

    const [rows] = await pool.query(
      `SELECT 
        id,
        nickname,
        game,
        role,
        rango,
        matches_played,
        wins,
        kda,
        winrate
       FROM players
       ORDER BY RAND()
       LIMIT ?`,
      [limit]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo players" });
  }
});

// GET /players/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const [rows] = await pool.query(
      `SELECT
        id,
        nickname,
        game,
        role,
        rango,
        matches_played,
        wins,
        kda,
        winrate,
        created_at
      FROM players
      WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Player no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo player" });
  }
});

module.exports = router;