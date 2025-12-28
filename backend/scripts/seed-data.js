const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function seedData() {
  console.log('🌱 Poblando base de datos con datos de prueba...\n');
  
  try {
    // Verificar si ya hay usuarios
    const [existingUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('⚠️  Ya hay usuarios en la BD');
      console.log('ℹ️  Si quieres resetear, ejecuta: docker compose down -v');
      process.exit(0);
    }
    
    // Crear usuarios de prueba
    console.log('📝 Creando 5 usuarios de prueba...');
    const password = await bcrypt.hash('123456', 10);
    
    await db.query(`
      INSERT INTO users (email, username, password_hash, region, is_pro) VALUES
      ('player1@squadlink.com', 'ProGamer', ?, 'EU', false),
      ('player2@squadlink.com', 'NinjaWarrior', ?, 'NA', false),
      ('player3@squadlink.com', 'SnipeKing', ?, 'EU', true),
      ('player4@squadlink.com', 'TacticalPro', ?, 'ASIA', false),
      ('player5@squadlink.com', 'RushMaster', ?, 'EU', false)
    `, [password, password, password, password, password]);
    console.log('✅ Usuarios creados\n');
    
    // Asociar usuarios con juegos
    console.log('📝 Asociando usuarios con juegos...');
    await db.query(`
      INSERT INTO user_games (user_id, game_id, in_game_username, preferred_role_id) VALUES
      (1, 2, 'ProGamer#VAL', 1),
      (2, 3, 'NinjaCS', 5),
      (3, 2, 'SnipeKing#VAL', 1),
      (4, 3, 'TacticalCS', 7),
      (5, 2, 'RushMaster#VAL', 4)
    `);
    console.log('✅ Asociaciones creadas\n');
    
    // Crear estadísticas
    console.log('📝 Creando estadísticas de jugadores...');
    await db.query(`
      INSERT INTO player_stats (user_game_id, kd_ratio, win_rate, total_games, player_rank, level) VALUES
      (1, 1.45, 52.3, 150, 'Platinum 2', 42),
      (2, 1.20, 48.5, 200, 'Gold Nova 3', 35),
      (3, 2.10, 65.2, 300, 'Diamond 1', 58),
      (4, 0.95, 50.1, 120, 'Gold Nova 2', 28),
      (5, 1.65, 55.8, 180, 'Platinum 3', 46)
    `);
    console.log('✅ Estadísticas creadas\n');
    
    // Crear equipo de ejemplo
    console.log('📝 Creando equipo de ejemplo...');
    await db.query(`
      INSERT INTO teams (name, game_id, creator_id, description, max_members) VALUES
      ('Elite Squad', 2, 1, 'Equipo competitivo de Valorant buscando jugadores Platinum+', 5)
    `);
    
    await db.query(`
      INSERT INTO team_members (team_id, user_id, status) VALUES
      (1, 1, 'active'),
      (1, 3, 'active')
    `);
    console.log('✅ Equipo creado\n');
    
    console.log('🎉 ¡Base de datos poblada correctamente!\n');
    console.log('📊 Resumen:');
    console.log('   - 5 usuarios de prueba');
    console.log('   - 5 perfiles de jugador');
    console.log('   - 5 estadísticas');
    console.log('   - 1 equipo con 2 miembros\n');
    console.log('🔐 Credenciales de prueba:');
    console.log('   Email: player1@squadlink.com');
    console.log('   Password: 123456');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedData();
