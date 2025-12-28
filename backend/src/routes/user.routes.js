const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/users/random - Perfiles aleatorios para la home
router.get('/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const [users] = await db.query(`
      SELECT 
        u.id, 
        u.username, 
        u.region, 
        u.is_pro,
        u.created_at
      FROM users u
      ORDER BY RAND()
      LIMIT ?
    `, [limit]);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Perfil de usuario específico
router.get('/:id', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, region, is_pro, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
