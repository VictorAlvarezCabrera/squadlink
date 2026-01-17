const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const {
  obtenerJugadores,
  obtenerJugador,
  crearJugador,
  actualizarJugador,
  eliminarJugador
} = require('../controllers/jugadoresController');

// Rutas públicas (no requieren autenticación)
router.get('/', obtenerJugadores);
router.get('/:id', obtenerJugador);

// Rutas protegidas (requieren JWT)
router.post('/', verificarToken, crearJugador);
router.put('/:id', verificarToken, actualizarJugador);
router.delete('/:id', verificarToken, eliminarJugador);

module.exports = router;
