const axios = require('axios');

const PUBG_API_KEY = process.env.PUBG_API_KEY;
const BASE_URL = 'https://api.pubg.com/shards';

// Plataformas disponibles: steam, psn, xbox, kakao, stadia
const getPlayerStats = async (playerName, platform = 'steam') => {
  try {
    // 1. Buscar jugador por nombre
    const playerResponse = await axios.get(
      `${BASE_URL}/${platform}/players?filter[playerNames]=${playerName}`,
      {
        headers: {
          'Authorization': `Bearer ${PUBG_API_KEY}`,
          'Accept': 'application/vnd.api+json'
        }
      }
    );

    if (!playerResponse.data.data || playerResponse.data.data.length === 0) {
      throw new Error('Jugador no encontrado');
    }

    const player = playerResponse.data.data[0];
    const playerId = player.id;

    // 2. Obtener estadísticas de temporada
    const currentSeason = await getCurrentSeason(platform);
    const statsResponse = await axios.get(
      `${BASE_URL}/${platform}/players/${playerId}/seasons/${currentSeason}`,
      {
        headers: {
          'Authorization': `Bearer ${PUBG_API_KEY}`,
          'Accept': 'application/vnd.api+json'
        }
      }
    );

    const stats = statsResponse.data.data.attributes.gameModeStats;
    
    // Obtener stats del modo más jugado (squad-fpp por ejemplo)
    const modeStats = stats['squad-fpp'] || stats['squad'] || stats['solo-fpp'] || stats['solo'];

    return {
      playerName: player.attributes.name,
      playerId: playerId,
      kills: modeStats.kills,
      deaths: modeStats.losses || 1, // Evitar división por 0
      kd_ratio: (modeStats.kills / (modeStats.losses || 1)).toFixed(2),
      wins: modeStats.wins,
      partidas_jugadas: modeStats.roundsPlayed,
      winrate: ((modeStats.wins / modeStats.roundsPlayed) * 100).toFixed(2),
      assists: modeStats.assists,
      damage_promedio: modeStats.damageDealt / modeStats.roundsPlayed
    };

  } catch (error) {
    console.error('Error obteniendo stats de PUBG:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener temporada actual
const getCurrentSeason = async (platform = 'steam') => {
  try {
    const response = await axios.get(`${BASE_URL}/${platform}/seasons`, {
      headers: {
        'Authorization': `Bearer ${PUBG_API_KEY}`,
        'Accept': 'application/vnd.api+json'
      }
    });

    const seasons = response.data.data;
    const currentSeason = seasons.find(s => s.attributes.isCurrentSeason);
    return currentSeason ? currentSeason.id : seasons[0].id;
  } catch (error) {
    console.error('Error obteniendo temporada:', error.message);
    throw error;
  }
};

module.exports = { getPlayerStats };
