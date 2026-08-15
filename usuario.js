const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener perfil del usuario
router.get('/perfil', verificarToken, async (req, res) => {
    try {
        const db = readDB();
        const usuario = db.usuarios.find(u => u.id === req.usuario.id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // No enviar la contraseña
        const { password, ...usuarioSinPassword } = usuario;
        res.json(usuarioSinPassword);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

// Obtener saldo
router.get('/saldo', verificarToken, async (req, res) => {
    try {
        const db = readDB();
        const usuario = db.usuarios.find(u => u.id === req.usuario.id);

        res.json({
            saldo_disponible: usuario.saldo_disponible,
            saldo_contable: usuario.saldo_contable
        });
    } catch (error) {
        console.error('Error al obtener saldo:', error);
        res.status(500).json({ error: 'Error al obtener saldo' });
    }
});

// Obtener tarjetas
router.get('/tarjetas', verificarToken, async (req, res) => {
    try {
        const db = readDB();
        const tarjetas = db.tarjetas.filter(t => t.usuario_id === req.usuario.id);

        res.json(tarjetas);
    } catch (error) {
        console.error('Error al obtener tarjetas:', error);
        res.status(500).json({ error: 'Error al obtener tarjetas' });
    }
});

// Obtener movimientos
router.get('/movimientos', verificarToken, async (req, res) => {
    try {
        const db = readDB();
        const limite = parseInt(req.query.limite) || 10;
        const movimientos = db.movimientos
            .filter(m => m.usuario_id === req.usuario.id)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, limite);

        res.json(movimientos);
    } catch (error) {
        console.error('Error al obtener movimientos:', error);
        res.status(500).json({ error: 'Error al obtener movimientos' });
    }
});

// Realizar transferencia
router.post('/transferir', verificarToken, async (req, res) => {
    const { cuentaDestino, monto, descripcion } = req.body;

    try {
        const db = readDB();

        // Validar monto
        const montoNum = parseFloat(monto);
        if (isNaN(montoNum) || montoNum <= 0) {
            return res.status(400).json({ error: 'Monto inválido' });
        }

        // Obtener remitente
        const remitente = db.usuarios.find(u => u.id === req.usuario.id);
        if (!remitente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar saldo
        if (remitente.saldo_disponible < montoNum) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Buscar cuenta destino
        const destinatario = db.usuarios.find(u => u.numero_cuenta === cuentaDestino);
        if (!destinatario) {
            return res.status(400).json({ error: 'La cuenta destino no existe dentro del simulador.' });
        }

        if (destinatario.id === req.usuario.id) {
            return res.status(400).json({ error: 'No puedes transferir a tu propia cuenta' });
        }

        // Actualizar saldos
        remitente.saldo_disponible -= montoNum;
        remitente.saldo_contable -= montoNum;

        destinatario.saldo_disponible += montoNum;
        destinatario.saldo_contable += montoNum;

        // Registrar movimientos
        const movimientoRemitente = {
            id: Math.max(0, ...db.movimientos.map(m => m.id)) + 1,
            usuario_id: remitente.id,
            tipo: 'Transferencia enviada',
            monto: montoNum,
            descripcion: descripcion || 'Transferencia',
            cuenta_destino: cuentaDestino,
            saldo_restante: remitente.saldo_disponible,
            fecha: new Date().toISOString()
        };

        const movimientoDestinatario = {
            id: movimientoRemitente.id + 1,
            usuario_id: destinatario.id,
            tipo: 'Transferencia recibida',
            monto: montoNum,
            descripcion: descripcion || 'Transferencia',
            cuenta_origen: remitente.numero_cuenta,
            saldo_restante: destinatario.saldo_disponible,
            fecha: new Date().toISOString()
        };

        db.movimientos.push(movimientoRemitente);
        db.movimientos.push(movimientoDestinatario);

        writeDB(db);

        res.json({
            mensaje: 'Transferencia realizada exitosamente',
            nuevoSaldo: remitente.saldo_disponible
        });

    } catch (error) {
        console.error('Error en transferencia:', error);
        res.status(500).json({ error: 'Error al realizar transferencia' });
    }
});

module.exports = router;
