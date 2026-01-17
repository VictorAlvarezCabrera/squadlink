const db = require('../config/database');

// Obtener todos los jugadores (con filtros opcionales)
const obtenerJugadores = async (req, res) => {
  const { juego, region, rol } = req.query;

  try {
    let query = `
      SELECT j.*, u.username, u.email, 
             e.kd_ratio, e.winrate, e.partidas_jugadas
      FROM jugadores j
      LEFT JOIN usuarios u ON j.usuario_id = u.id
      LEFT JOIN estadisticas e ON j.id = e.jugador_id
      WHERE 1=1
    `;
    const params = [];

    if (juego) {
      query += ' AND j.juego = ?';
      params.push(juego);
    }
    if (region) {
      query += ' AND j.region = ?';
      params.push(region);
    }
    if (rol) {
      query += ' AND j.rol = ?';
      params.push(rol);
    }

    query += ' ORDER BY j.id DESC';

    const [jugadores] = await db.promise().query(query, params);
    res.json(jugadores);
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener un jugador específico
const obtenerJugador = async (req, res) => {
  const { id } = req.params;

  try {
    const [jugadores] = await db.promise().query(
      `SELECT j.*, u.username, u.email,
              e.kd_ratio, e.winrate, e.partidas_jugadas
       FROM jugadores j
       LEFT JOIN usuarios u ON j.usuario_id = u.id
       LEFT JOIN estadisticas e ON j.id = e.jugador_id
       WHERE j.id = ?`,
      [id]
    );

    if (jugadores.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    res.json(jugadores[0]);
  } catch (error) {
    console.error('Error obteniendo jugador:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Crear perfil de jugador (requiere autenticación)
const crearJugador = async (req, res) => {
  const { juego, nombre_juego, region, rol, nivel } = req.body;
  const usuario_id = req.userId; // Del middleware de autenticación

  if (!juego || !nombre_juego) {
    return res.status(400).json({ error: 'Juego y nombre de juego son obligatorios' });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO jugadores (usuario_id, juego, nombre_juego, region, rol, nivel)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, juego, nombre_juego, region, rol, nivel || 1]
    );

    res.status(201).json({
      message: 'Perfil de jugador creado',
      jugadorId: result.insertId
    });
  } catch (error) {
    console.error('Error creando jugador:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Actualizar perfil de jugador
const actualizarJugador = async (req, res) => {
  const { id } = req.params;
  const { nombre_juego, region, rol, nivel } = req.body;
  const usuario_id = req.userId;

  try {
    // Verificar que el jugador pertenece al usuario
    const [jugadores] = await db.promise().query(
      'SELECT * FROM jugadores WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (jugadores.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para editar este perfil' });
    }

    await db.promise().query(
      `UPDATE jugadores 
       SET nombre_juego = ?, region = ?, rol = ?, nivel = ?
       WHERE id = ?`,
      [nombre_juego, region, rol, nivel, id]
    );

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando jugador:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Eliminar perfil de jugador
const eliminarJugador = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.userId;

  try {
    const [jugadores] = await db.promise().query(
      'SELECT * FROM jugadores WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (jugadores.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este perfil' });
    }

    await db.promise().query('DELETE FROM jugadores WHERE id = ?', [id]);

    res.json({ message: 'Perfil eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando jugador:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = {
  obtenerJugadores,
  obtenerJugador,
  crearJugador,
  actualizarJugador,
  eliminarJugador
};
