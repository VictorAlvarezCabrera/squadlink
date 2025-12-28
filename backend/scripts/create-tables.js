const db = require('../src/config/database');

async function createTables() {
  console.log('🚀 Creando tablas...\n');
  
  try {
    // 1. USERS (primero, porque otras dependen de ella)
    console.log('📝 Creando tabla users...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_picture VARCHAR(500),
        bio TEXT,
        region VARCHAR(50),
        is_pro BOOLEAN DEFAULT false,
        pro_until DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_is_pro (is_pro)
      )
    `);
    console.log('✅ Users creada\n');
    
    // 2. GAMES (segundo, roles depende de ella)
    console.log('📝 Creando tabla games...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS games (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        icon_url VARCHAR(500),
        api_provider ENUM('pubg', 'tracker', 'riot', 'custom') DEFAULT 'custom',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_is_active (is_active)
      )
    `);
    console.log('✅ Games creada\n');
    
    // Insertar juegos básicos
    console.log('📝 Insertando juegos iniciales...');
    await db.query(`
      INSERT INTO games (name, slug, api_provider) VALUES
      ('PUBG', 'pubg', 'pubg'),
      ('Valorant', 'valorant', 'tracker'),
      ('Counter-Strike 2', 'cs2', 'tracker')
      ON DUPLICATE KEY UPDATE name=name
    `);
    console.log('✅ Juegos insertados\n');
    
    // 3. ROLES (depende de games)
    console.log('📝 Creando tabla roles...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        game_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        INDEX idx_game_id (game_id)
      )
    `);
    console.log('✅ Roles creada\n');
    
    // 4. USER_GAMES (depende de users, games, roles)
    console.log('📝 Creando tabla user_games...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_games (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        game_id INT NOT NULL,
        in_game_username VARCHAR(100),
        preferred_role_id INT,
        availability JSON,
        is_visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (preferred_role_id) REFERENCES roles(id) ON DELETE SET NULL,
        UNIQUE KEY unique_user_game (user_id, game_id),
        INDEX idx_user_id (user_id),
        INDEX idx_game_id (game_id)
      )
    `);
    console.log('✅ User_games creada\n');
    
    // 5. PLAYER_STATS (depende de user_games)
    console.log('📝 Creando tabla player_stats...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS player_stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_game_id INT NOT NULL,
        kd_ratio DECIMAL(5,2) DEFAULT 0.00,
        win_rate DECIMAL(5,2) DEFAULT 0.00,
        total_games INT DEFAULT 0,
        player_rank VARCHAR(50),
        level INT DEFAULT 1,
        last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_game_id) REFERENCES user_games(id) ON DELETE CASCADE,
        INDEX idx_user_game_id (user_game_id)
      )
    `);
    console.log('✅ Player_stats creada\n');
    
    // 6. TEAMS (depende de users, games)
    console.log('📝 Creando tabla teams...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        game_id INT NOT NULL,
        creator_id INT NOT NULL,
        description TEXT,
        max_members INT DEFAULT 5,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_game_id (game_id),
        INDEX idx_creator_id (creator_id)
      )
    `);
    console.log('✅ Teams creada\n');
    
    // 7. TEAM_MEMBERS (depende de teams, users, roles)
    console.log('📝 Creando tabla team_members...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        team_id INT NOT NULL,
        user_id INT NOT NULL,
        role_id INT,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'active', 'left') DEFAULT 'active',
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
        UNIQUE KEY unique_team_user (team_id, user_id),
        INDEX idx_team_id (team_id),
        INDEX idx_user_id (user_id)
      )
    `);
    console.log('✅ Team_members creada\n');
    
    // 8. MATCH_REQUESTS (depende de users, games)
    console.log('📝 Creando tabla match_requests...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS match_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        game_id INT NOT NULL,
        message TEXT,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP NULL,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        INDEX idx_sender_id (sender_id),
        INDEX idx_receiver_id (receiver_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Match_requests creada\n');
    
    // Insertar roles iniciales
    console.log('📝 Insertando roles iniciales...');
    await db.query(`
      INSERT INTO roles (game_id, name, description) VALUES
      (2, 'Duelist', 'Agente de combate agresivo'),
      (2, 'Controller', 'Control de área'),
      (2, 'Sentinel', 'Defensa'),
      (2, 'Initiator', 'Información'),
      (3, 'Entry Fragger', 'Primer contacto'),
      (3, 'AWPer', 'Francotirador'),
      (3, 'Support', 'Soporte'),
      (3, 'IGL', 'Líder')
      ON DUPLICATE KEY UPDATE name=name
    `);
    console.log('✅ Roles insertados\n');
    
    console.log('🎉 ¡Todas las tablas creadas correctamente!');
    console.log('\n📊 Tablas creadas:');
    console.log('   1. users');
    console.log('   2. games (con 3 juegos)');
    console.log('   3. roles (con 8 roles)');
    console.log('   4. user_games');
    console.log('   5. player_stats');
    console.log('   6. teams');
    console.log('   7. team_members');
    console.log('   8. match_requests\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createTables();
