const { getPlayerStats: getPUBGStats } = require('../services/pubgAPI');
const { getCSGOStats, getValorantStats, getApexStats } = require('../services/trackerAPI');
const db = require('../config/database');

// Obtener y guardar estadísticas automáticamente
const obtenerYGuardarStats = async (req, res) => {
  const { juego, nombre_juego, platform } = req.body;
  const usuario_id = req.userId;

  try {
    let stats;

    // Según el juego, llamar a la API correspondiente
    switch (juego.toLowerCase()) {
      case 'pubg':
        stats = await getPUBGStats(nombre_juego, platform || 'steam');
        break;
      
      case 'csgo':
      case 'cs2':
        stats = await getCSGOStats(nombre_juego);
        break;
      
      case 'valorant':
        const [riotId, tag] = nombre_juego.split('#');
        stats = await getValorantStats(riotId, tag);
        break;
      
      case 'apex':
        stats = await getApexStats(platform || 'origin', nombre_juego);
        break;
      
      default:
        return res.status(400).json({ error: 'Juego no soportado' });
    }

    // Crear perfil de jugador
    const [jugadorResult] = await db.promise().query(
      `INSERT INTO jugadores (usuario_id, juego, nombre_juego, region, nivel)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, juego, stats.playerName, platform || 'Global', 1]
    );

    const jugadorId = jugadorResult.insertId;

    // Guardar estadísticas
    await db.promise().query(
      `INSERT INTO estadisticas (jugador_id, kd_ratio, winrate, partidas_jugadas)
       VALUES (?, ?, ?, ?)`,
      [jugadorId, stats.kd_ratio, stats.winrate, stats.partidas_jugadas]
    );

    res.status(201).json({
      message: 'Perfil creado con estadísticas automáticas',
      jugadorId,
      stats
    });

  } catch (error) {
    console.error('Error obteniendo stats:', error);
    res.status(500).json({ 
      error: 'Error obteniendo estadísticas del juego',
      details: error.message 
    });
  }
};

module.exports = { obtenerYGuardarStats };
