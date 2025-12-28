CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    is_pro BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true
);

-- Datos iniciales de juegos
INSERT INTO games (name, slug) VALUES
('PUBG', 'pubg'),
('Valorant', 'valorant'),
('Counter-Strike 2', 'cs2')
ON DUPLICATE KEY UPDATE name=name;
