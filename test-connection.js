require('dotenv').config();
const pool = require('../config/database');

async function testConnection() {
    console.log('\n🔄 Probando conexión a la base de datos...\n');
    
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa a PostgreSQL');
        console.log('📅 Fecha del servidor:', result.rows[0].now);
        
        // Verificar tablas
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log('\n📋 Tablas encontradas:');
        if (tables.rows.length === 0) {
            console.log('   ⚠️  No hay tablas. Ejecuta: npm run init-db');
        } else {
            tables.rows.forEach(row => {
                console.log(`   ✓ ${row.table_name}`);
            });
        }
        
        // Contar usuarios
        const usuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
        console.log(`\n👥 Total de usuarios: ${usuarios.rows[0].count}`);
        
        console.log('\n✅ Todo está funcionando correctamente!\n');
        
    } catch (error) {
        console.error('\n❌ Error de conexión:');
        console.error(error.message);
        console.log('\n💡 Verifica:');
        console.log('   1. PostgreSQL está corriendo');
        console.log('   2. Las credenciales en .env son correctas');
        console.log('   3. La base de datos existe: CREATE DATABASE banco_simulador;\n');
    } finally {
        pool.end();
    }
}

testConnection();
