const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { obtenerYGuardarStats } = require('../controllers/statsController');

router.post('/fetch', verificarToken, obtenerYGuardarStats);

module.exports = router;
