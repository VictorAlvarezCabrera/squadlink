const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Función para conectar con reintentos
let db;
const connectWithRetry = () => {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  db = mysql.createConnection(config);

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

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
