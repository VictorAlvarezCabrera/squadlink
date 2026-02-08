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

module.exports = router;