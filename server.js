require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuario');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        mensaje: '⚠️ Simulador de Banca Web - Solo para pruebas educativas',
        aviso: 'Este sistema es un simulador para fines educativos. No pertenece a ninguna entidad financiera.'
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log('⚠️  AVISO IMPORTANTE');
    console.log(`${'='.repeat(60)}`);
    console.log('Este es un SIMULADOR DE BANCA para pruebas y capacitación.');
    console.log('NO pertenece a ningún banco real.');
    console.log('NO ingrese datos personales, bancarios ni financieros reales.');
    console.log('Toda la información es FICTICIA.');
    console.log(`${'='.repeat(60)}\n`);
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
});
