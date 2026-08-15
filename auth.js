const jwt = require('jsonwebtoken');

// Verificar token JWT
function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

// Verificar rol de administrador
function verificarAdmin(req, res, next) {
    if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({ 
            error: 'Acceso denegado. No tienes permisos para ingresar a esta sección.' 
        });
    }
    next();
}

module.exports = { verificarToken, verificarAdmin };
