const { execSync } = require('child_process');

console.log('🚀 Setup completo de SquadLink\n');

console.log('1️⃣ Esperando MySQL...');
execSync('node scripts/wait-for-db.js', { stdio: 'inherit' });

console.log('\n2️⃣ Creando tablas...');
execSync('node scripts/create-tables.js', { stdio: 'inherit' });

console.log('\n3️⃣ Poblando datos de prueba...');
execSync('node scripts/seed-data.js', { stdio: 'inherit' });

console.log('\n✅ Setup completado!\n');
console.log('📌 Puedes probar:');
console.log('   - http://localhost:3000/health');
console.log('   - http://localhost:3000/api/games');
console.log('   - http://localhost:3000/api/users/random');
console.log('\n🔐 Login de prueba:');
console.log('   Email: player1@squadlink.com');
console.log('   Password: 123456\n');
