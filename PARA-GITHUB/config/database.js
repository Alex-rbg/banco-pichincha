const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data.json');

// Inicializar base de datos
function initDB() {
    if (!fs.existsSync(dbPath)) {
        const initialData = {
            usuarios: [],
            tarjetas: [],
            movimientos: []
        };
        fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
        console.log('✅ Base de datos JSON creada');
        
        // Crear admin por defecto
        createAdmin();
    } else {
        console.log('✅ Conectado a la base de datos JSON');
    }
}

// Crear administrador
async function createAdmin() {
    const db = readDB();
    const adminExists = db.usuarios.find(u => u.usuario === 'admin');
    
    if (!adminExists) {
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = {
            id: 1,
            nombre: 'Admin',
            apellido: 'Sistema',
            cedula: '9999999999',
            email: 'admin@discord',
            usuario: 'admin',
            password: adminPassword,
            rol: 'administrador',
            numero_cliente: 'CLI-ADMIN001',
            numero_cuenta: '1000000000001',
            saldo_disponible: 10000.00,
            saldo_contable: 10000.00,
            estado: 'activo',
            created_at: new Date().toISOString()
        };
        
        db.usuarios.push(admin);
        writeDB(db);
        console.log('✅ Usuario administrador creado (usuario: admin, contraseña: admin123)');
    }
}

// Leer base de datos
function readDB() {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

// Escribir base de datos
function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Generar ID único
function generateId(array) {
    if (array.length === 0) return 1;
    return Math.max(...array.map(item => item.id)) + 1;
}

// Inicializar
initDB();

module.exports = {
    readDB,
    writeDB,
    generateId
};
