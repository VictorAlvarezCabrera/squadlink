const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const connectWithRetry = () => {
  db.connect((err) => {
    if (err) {
      console.error('❌ Error conectando a MySQL:', err.message);
      console.log('🔄 Reintentando en 5 segundos...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('✅ Conectado a MySQL correctamente');
    }
  });
};

connectWithRetry();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando' });
});

// Rutas
const authRoutes = require('./routes/auth');
const jugadoresRoutes = require('./routes/jugadores');
const statsRoutes = require('./routes/stats');

app.use('/api/auth', authRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/stats', statsRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
