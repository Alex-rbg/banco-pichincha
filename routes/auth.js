const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { readDB, writeDB, generateId } = require('../config/database');
const {
    generarNumeroCliente,
    generarCedulaFicticia,
    generarNumeroCuenta,
    generarNumeroTarjeta,
    generarFechaVencimiento,
    generarCVV
} = require('../utils/generators');

// Registro de usuario
router.post('/registro', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('discord').notEmpty().withMessage('El ID de Discord es obligatorio'),
    body('usuario').isLength({ min: 4 }).withMessage('El usuario debe tener al menos 4 caracteres'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, discord, usuario, password } = req.body;

    try {
        const db = readDB();

        // Verificar si el usuario o discord ya existe
        const existente = db.usuarios.find(u => u.usuario === usuario || u.email === discord);
        if (existente) {
            return res.status(400).json({ error: 'El usuario o ID de Discord ya está registrado' });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generar datos ficticios
        const numeroCliente = generarNumeroCliente();
        const cedulaFicticia = generarCedulaFicticia();
        const numeroCuenta = generarNumeroCuenta();
        const saldoInicial = parseFloat(process.env.SALDO_INICIAL || 500);

        // Crear usuario
        const nuevoUsuario = {
            id: generateId(db.usuarios),
            nombre,
            apellido,
            cedula: cedulaFicticia,
            email: discord,
            usuario,
            password: hashedPassword,
            rol: 'usuario',
            numero_cliente: numeroCliente,
            numero_cuenta: numeroCuenta,
            saldo_disponible: saldoInicial,
            saldo_contable: saldoInicial,
            estado: 'activo',
            created_at: new Date().toISOString()
        };

        db.usuarios.push(nuevoUsuario);

        // Generar tarjeta ficticia
        const nuevaTarjeta = {
            id: generateId(db.tarjetas),
            usuario_id: nuevoUsuario.id,
            numero_tarjeta: generarNumeroTarjeta(),
            fecha_vencimiento: generarFechaVencimiento(),
            cvv: generarCVV(),
            estado: 'activa',
            created_at: new Date().toISOString()
        };

        db.tarjetas.push(nuevaTarjeta);

        // Registrar movimiento inicial
        const movimiento = {
            id: generateId(db.movimientos),
            usuario_id: nuevoUsuario.id,
            tipo: 'Saldo inicial',
            monto: saldoInicial,
            descripcion: 'Crédito por apertura de cuenta ficticia',
            saldo_restante: saldoInicial,
            fecha: new Date().toISOString()
        };

        db.movimientos.push(movimiento);

        writeDB(db);

        res.status(201).json({
            mensaje: 'Cuenta creada exitosamente',
            cedula: cedulaFicticia,
            numeroCliente,
            numeroCuenta,
            saldoInicial
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al crear la cuenta' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const db = readDB();

        // Buscar usuario
        const user = db.usuarios.find(u => u.usuario === usuario);

        if (!user) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Verificar estado
        if (user.estado !== 'activo') {
            return res.status(403).json({ error: 'Tu cuenta ha sido bloqueada. Contacta al administrador.' });
        }

        // Verificar contraseña
        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                usuario: user.usuario, 
                rol: user.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                usuario: user.usuario,
                rol: user.rol,
                numeroCliente: user.numero_cliente,
                numeroCuenta: user.numero_cuenta
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;
