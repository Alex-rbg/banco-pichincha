# 🏦 Banco Pichincha - Simulador Web

⚠️ **AVISO IMPORTANTE**: Este es un simulador educativo. NO es un banco real. NO ingrese datos personales o financieros reales.

## 🚀 Características

- ✅ Sistema de registro y login
- ✅ Transferencias entre cuentas
- ✅ Historial de movimientos
- ✅ Tarjetas de crédito virtuales
- ✅ Panel de administración
- ✅ Cédulas ficticias ecuatorianas (10 dígitos)
- ✅ Formato de moneda ecuatoriano ($1.000)

## 🔐 Usuarios por Defecto

### Administrador
- **Usuario**: admin
- **Contraseña**: admin123
- **Rol**: Administrador del sistema

## 💻 Instalación Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 🌐 Despliegue en Render

Este proyecto está configurado para desplegarse automáticamente en Render.

Variables de entorno necesarias:
- `PORT`: 3001
- `NODE_ENV`: production
- `JWT_SECRET`: (generado automáticamente)

## 📂 Estructura del Proyecto

```
banco-web/
├── config/          # Configuración de la base de datos
├── middleware/      # Middleware de autenticación
├── public/          # Archivos HTML estáticos
├── routes/          # Rutas de la API
├── scripts/         # Scripts de inicialización
├── utils/           # Utilidades (generadores)
├── data.json        # Base de datos JSON
├── server.js        # Servidor principal
└── package.json     # Dependencias
```

## 🎨 Branding

- **Colores**: Amarillo (#FFD500) y Azul Marino (#002855)
- **Logo**: Banco Pichincha
- **Formato de moneda**: ES-EC (Ecuador)

## 📝 Licencia

MIT - Solo para fines educativos
