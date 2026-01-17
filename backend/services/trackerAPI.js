const axios = require('axios');

const TRACKER_API_KEY = process.env.TRACKER_GG_API_KEY;
const BASE_URL = 'https://public-api.tracker.gg/v2';

// Obtener stats de CS:GO
const getCSGOStats = async (steamId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/csgo/standard/profile/steam/${steamId}`,
      {
        headers: {
          'TRN-Api-Key': TRACKER_API_KEY
        }
      }
    );

    const stats = response.data.data.segments[0].stats;

    return {
      playerName: response.data.data.platformInfo.platformUserHandle,
      kd_ratio: stats.kd?.value || 0,
      winrate: stats.wlPercentage?.value || 0,
      partidas_jugadas: stats.matchesPlayed?.value || 0,
      kills: stats.kills?.value || 0,
      deaths: stats.deaths?.value || 0,
      headshot_percentage: stats.headshotPct?.value || 0
    };
  } catch (error) {
    console.error('Error obteniendo stats de CS:GO:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener stats de Valorant
const getValorantStats = async (riotId, tag) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/valorant/standard/profile/riot/${riotId}%23${tag}`,
      {
        headers: {
          'TRN-Api-Key': TRACKER_API_KEY
        }
      }
    );

    const stats = response.data.data.segments[0].stats;

    return {
      playerName: `${riotId}#${tag}`,
      kd_ratio: stats.kDRatio?.value || 0,
      winrate: stats.matchesWinPct?.value || 0,
      partidas_jugadas: stats.matchesPlayed?.value || 0,
      kills: stats.kills?.value || 0,
      deaths: stats.deaths?.value || 0,
      headshot_percentage: stats.headshotsPercentage?.value || 0
    };
  } catch (error) {
    console.error('Error obteniendo stats de Valorant:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener stats de Apex Legends
const getApexStats = async (platform, playerName) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/apex/standard/profile/${platform}/${playerName}`,
      {
        headers: {
          'TRN-Api-Key': TRACKER_API_KEY
        }
      }
    );

    const stats = response.data.data.segments[0].stats;

    return {
      playerName: response.data.data.platformInfo.platformUserHandle,
      kd_ratio: stats.kd?.value || 0,
      winrate: stats.wlPercentage?.value || 0,
      partidas_jugadas: stats.matchesPlayed?.value || 0,
      kills: stats.kills?.value || 0,
      deaths: stats.deaths?.value || 0,
      damage_total: stats.damage?.value || 0
    };
  } catch (error) {
    console.error('Error obteniendo stats de Apex:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getCSGOStats,
  getValorantStats,
  getApexStats
};
