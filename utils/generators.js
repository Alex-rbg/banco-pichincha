// Generar número de cliente ficticio
function generarNumeroCliente() {
    return 'CLI-' + Date.now() + Math.random().toString().slice(2, 6);
}

// Generar número de cédula ficticio (10 dígitos)
function generarCedulaFicticia() {
    let cedula = '';
    // Primer dígito entre 1-2 (provincias válidas en Ecuador)
    cedula += Math.floor(Math.random() * 2) + 1;
    // 9 dígitos aleatorios más
    for (let i = 0; i < 9; i++) {
        cedula += Math.floor(Math.random() * 10);
    }
    // Asegurar que no sea 1234567890 ni secuencias obvias
    if (cedula === '1234567890' || cedula === '0123456789') {
        return generarCedulaFicticia(); // Recursión si sale secuencia obvia
    }
    return cedula;
}

// Generar número de cuenta ficticio (10 dígitos)
function generarNumeroCuenta() {
    return '1000' + Math.random().toString().slice(2, 14).padEnd(12, '0').slice(0, 12);
}

// Generar número de tarjeta ficticio (16 dígitos)
function generarNumeroTarjeta() {
    let numero = '4111'; // Empieza con 4111 (número de prueba de Visa)
    for (let i = 0; i < 12; i++) {
        numero += Math.floor(Math.random() * 10);
    }
    // Formatear: XXXX XXXX XXXX XXXX
    return numero.match(/.{1,4}/g).join(' ');
}

// Generar fecha de vencimiento ficticia (3 años desde ahora)
function generarFechaVencimiento() {
    const fecha = new Date();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = (fecha.getFullYear() + 3).toString().slice(-2);
    return `${mes}/${año}`;
}

// Generar CVV ficticio (3 dígitos)
function generarCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
}

// Validar si parece información real (básico)
function validarDatosNoReales(texto) {
    const advertencias = [];
    
    // Si parece una cédula ecuatoriana (10 dígitos)
    if (/^\d{10}$/.test(texto)) {
        advertencias.push('No uses números de cédula reales');
    }
    
    // Si parece un número de cuenta bancaria real (más de 10 dígitos consecutivos)
    if (/\d{11,}/.test(texto.replace(/\s/g, ''))) {
        advertencias.push('No uses números de cuenta reales');
    }
    
    return advertencias;
}

module.exports = {
    generarNumeroCliente,
    generarCedulaFicticia,
    generarNumeroCuenta,
    generarNumeroTarjeta,
    generarFechaVencimiento,
    generarCVV,
    validarDatosNoReales
};
