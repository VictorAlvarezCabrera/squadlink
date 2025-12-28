require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message 
    });
  }
});

// Rutas
app.get('/api/games', async (req, res) => {
  try {
    const [games] = await db.query('SELECT * FROM games');
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de usuario
app.use('/api/users', userRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en http://localhost:3000`);
});
