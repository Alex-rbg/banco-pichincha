const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Iniciando base de datos...');

        // Crear tabla de usuarios
        await client.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                usuario VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                rol VARCHAR(20) DEFAULT 'usuario',
                numero_cliente VARCHAR(20) UNIQUE NOT NULL,
                numero_cuenta VARCHAR(20) UNIQUE NOT NULL,
                saldo_disponible DECIMAL(15, 2) DEFAULT 500.00,
                saldo_contable DECIMAL(15, 2) DEFAULT 500.00,
                estado VARCHAR(20) DEFAULT 'activo',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla usuarios creada');

        // Crear tabla de tarjetas
        await client.query(`
            CREATE TABLE IF NOT EXISTS tarjetas (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                numero_tarjeta VARCHAR(19) UNIQUE NOT NULL,
                fecha_vencimiento VARCHAR(7) NOT NULL,
                cvv VARCHAR(3) NOT NULL,
                estado VARCHAR(20) DEFAULT 'activa',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla tarjetas creada');

        // Crear tabla de movimientos
        await client.query(`
            CREATE TABLE IF NOT EXISTS movimientos (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                tipo VARCHAR(50) NOT NULL,
                monto DECIMAL(15, 2) NOT NULL,
                descripcion TEXT,
                cuenta_destino VARCHAR(20),
                cuenta_origen VARCHAR(20),
                saldo_restante DECIMAL(15, 2) NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla movimientos creada');

        // Crear usuario administrador por defecto
        const adminPassword = await bcrypt.hash('admin123', 10);
        const numeroCliente = 'CLI-' + Date.now();
        const numeroCuenta = '1000' + Math.random().toString().slice(2, 14);

        await client.query(`
            INSERT INTO usuarios (nombre, apellido, email, usuario, password, rol, numero_cliente, numero_cuenta, saldo_disponible, saldo_contable)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (usuario) DO NOTHING;
        `, ['Admin', 'Sistema', 'admin@simulador.com', 'admin', adminPassword, 'administrador', numeroCliente, numeroCuenta, 10000.00, 10000.00]);
        
        console.log('✅ Usuario administrador creado');
        console.log('   Usuario: admin');
        console.log('   Contraseña: admin123');

        console.log('\n✅ Base de datos inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
    } finally {
        client.release();
        pool.end();
    }
}

initDatabase();
