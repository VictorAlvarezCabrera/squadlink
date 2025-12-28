require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SquadLink API funcionando' });
});

// Ruta principal
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Bienvenido a SquadLink API',
    endpoints: ['/health', '/api']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
