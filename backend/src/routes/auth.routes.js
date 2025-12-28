const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, region } = req.body;
    
    // Validar datos
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Encriptar contraseña
    const password_hash = await bcrypt.hash(password, 10);
    
    // Insertar usuario
    const [result] = await db.query(
      'INSERT INTO users (email, username, password_hash, region) VALUES (?, ?, ?, ?)',
      [email, username, password_hash, region || 'EU']
    );
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      userId: result.insertId 
    });
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email o username ya existe' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos' });
    }
    
    // Buscar usuario
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    const user = users[0];
    
    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // No enviar el hash al cliente
    delete user.password_hash;
    
    res.json({ 
      message: 'Login exitoso',
      user 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
