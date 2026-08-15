const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Aplicar middleware a todas las rutas de admin
router.use(verificarToken, verificarAdmin);

// Obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const busqueda = req.query.buscar || '';
        const resultado = await pool.query(
            `SELECT id, nombre, apellido, email, usuario, numero_cliente, numero_cuenta, 
                    saldo_disponible, saldo_contable, rol, estado, created_at
             FROM usuarios 
             WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR usuario ILIKE $1 OR numero_cuenta ILIKE $1
             ORDER BY created_at DESC`,
            [`%${busqueda}%`]
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Obtener un usuario específico
router.get('/usuarios/:id', async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id, nombre, apellido, email, usuario, numero_cliente, numero_cuenta,
                    saldo_disponible, saldo_contable, rol, estado, created_at
             FROM usuarios WHERE id = $1`,
            [req.params.id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

// Obtener movimientos de un usuario
router.get('/usuarios/:id/movimientos', async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id, tipo, monto, descripcion, cuenta_destino, cuenta_origen, saldo_restante, fecha
             FROM movimientos WHERE usuario_id = $1 ORDER BY fecha DESC`,
            [req.params.id]
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener movimientos:', error);
        res.status(500).json({ error: 'Error al obtener movimientos' });
    }
});

// Obtener tarjetas de un usuario
router.get('/usuarios/:id/tarjetas', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id, numero_tarjeta, fecha_vencimiento, cvv, estado, created_at FROM tarjetas WHERE usuario_id = $1',
            [req.params.id]
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener tarjetas:', error);
        res.status(500).json({ error: 'Error al obtener tarjetas' });
    }
});

// Editar saldo de un usuario
router.put('/usuarios/:id/saldo', async (req, res) => {
    const { saldo } = req.body;
    
    try {
        const saldoNum = parseFloat(saldo);
        if (isNaN(saldoNum) || saldoNum < 0) {
            return res.status(400).json({ error: 'Saldo inválido' });
        }

        await pool.query(
            'UPDATE usuarios SET saldo_disponible = $1, saldo_contable = $1 WHERE id = $2',
            [saldoNum, req.params.id]
        );

        // Registrar movimiento
        await pool.query(
            `INSERT INTO movimientos (usuario_id, tipo, monto, descripcion, saldo_restante)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.params.id, 'Ajuste por administrador', saldoNum, 'Ajuste de saldo realizado por el administrador', saldoNum]
        );

        res.json({ mensaje: 'Saldo actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar saldo:', error);
        res.status(500).json({ error: 'Error al actualizar saldo' });
    }
});

// Bloquear/Activar usuario
router.put('/usuarios/:id/estado', async (req, res) => {
    const { estado } = req.body;
    
    try {
        if (!['activo', 'bloqueado'].includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        await pool.query(
            'UPDATE usuarios SET estado = $1 WHERE id = $2',
            [estado, req.params.id]
        );

        res.json({ mensaje: `Usuario ${estado === 'activo' ? 'activado' : 'bloqueado'} correctamente` });
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({ error: 'Error al cambiar estado' });
    }
});

// Eliminar usuario
router.delete('/usuarios/:id', async (req, res) => {
    try {
        // No permitir eliminar al propio administrador
        if (parseInt(req.params.id) === req.usuario.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
        }

        await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
        
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// Reiniciar contraseña
router.put('/usuarios/:id/reset-password', async (req, res) => {
    const { nuevaPassword } = req.body;
    
    try {
        if (!nuevaPassword || nuevaPassword.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        await pool.query(
            'UPDATE usuarios SET password = $1 WHERE id = $2',
            [hashedPassword, req.params.id]
        );

        res.json({ mensaje: 'Contraseña reiniciada correctamente' });
    } catch (error) {
        console.error('Error al reiniciar contraseña:', error);
        res.status(500).json({ error: 'Error al reiniciar contraseña' });
    }
});

// Crear nuevo administrador
router.post('/crear-admin', async (req, res) => {
    const { nombre, apellido, email, usuario, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const numeroCliente = 'CLI-' + Date.now() + Math.random().toString().slice(2, 6);
        const numeroCuenta = '1000' + Math.random().toString().slice(2, 14);

        await pool.query(
            `INSERT INTO usuarios (nombre, apellido, email, usuario, password, rol, numero_cliente, numero_cuenta, saldo_disponible, saldo_contable)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [nombre, apellido, email, usuario, hashedPassword, 'administrador', numeroCliente, numeroCuenta, 10000, 10000]
        );

        res.status(201).json({ mensaje: 'Administrador creado correctamente' });
    } catch (error) {
        console.error('Error al crear administrador:', error);
        res.status(500).json({ error: 'Error al crear administrador' });
    }
});

// Estadísticas generales
router.get('/estadisticas', async (req, res) => {
    try {
        const totalUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios WHERE rol = $1', ['usuario']);
        const totalAdmins = await pool.query('SELECT COUNT(*) FROM usuarios WHERE rol = $1', ['administrador']);
        const totalMovimientos = await pool.query('SELECT COUNT(*) FROM movimientos');
        const totalTarjetas = await pool.query('SELECT COUNT(*) FROM tarjetas');

        res.json({
            totalUsuarios: parseInt(totalUsuarios.rows[0].count),
            totalAdmins: parseInt(totalAdmins.rows[0].count),
            totalMovimientos: parseInt(totalMovimientos.rows[0].count),
            totalTarjetas: parseInt(totalTarjetas.rows[0].count)
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
