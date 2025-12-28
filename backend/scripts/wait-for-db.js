const mysql = require('mysql2/promise');

async function waitForDatabase() {
  const maxRetries = 30;
  let retries = 0;

  console.log('⏳ Esperando a que MySQL esté listo...');

  while (retries < maxRetries) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'SquadLink'
      });
      
      console.log('✅ MySQL está listo y conectado!');
      await connection.end();
      return;
      
    } catch (error) {
      retries++;
      console.log(`⏳ Esperando MySQL... Intento ${retries}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos
    }
  }
  
  console.error('❌ No se pudo conectar a MySQL después de 30 intentos');
  process.exit(1);
}

waitForDatabase();
