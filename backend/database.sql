-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS squadlink;

-- Usar la base de datos
USE squadlink;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    riot_id VARCHAR(100) NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para búsquedas por nombre de usuario
CREATE INDEX idx_nombre_usuario ON usuarios(nombre_usuario);

-- Índice para búsquedas por riot_id
CREATE INDEX idx_riot_id ON usuarios(riot_id);
