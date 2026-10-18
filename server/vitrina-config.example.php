<?php
/**
 * Configuración del backend de Vitrina.
 *
 * Copialo como `vitrina-config.php` UN NIVEL ARRIBA de public_html
 * (ej: /home/uXXXX/domains/TU-DOMINIO/vitrina-config.php). Así no es
 * accesible desde la web y nunca se sube al repositorio.
 */
return [
    'db' => [
        // En Hostinger la base corre en el mismo servidor: host 127.0.0.1, puerto 3306.
        'dsn' => 'mysql:host=127.0.0.1;port=3306;dbname=uXXXX_vitrina;charset=utf8mb4',
        'user' => 'uXXXX_vitrina',
        'pass' => 'CAMBIAR',
    ],

    // A dónde te llegan los avisos y desde qué casilla salen (tiene que existir en Hostinger).
    'notify_email' => 'hola@TU-DOMINIO',
    'from_email' => 'hola@TU-DOMINIO',

    // Dominios desde donde el estudio puede enviar solicitudes.
    'allowed_origins' => ['https://TU-DOMINIO', 'https://www.TU-DOMINIO'],

    // Contraseña del panel /admin (guardá solo el hash, nunca la contraseña en texto plano).
    // Generalo con: php -r "echo password_hash('tu-contraseña', PASSWORD_DEFAULT);"
    'admin_password_hash' => '',

    // Texto aleatorio para anonimizar IPs en el límite de envíos.
    'ip_salt' => 'CAMBIAR-por-un-texto-largo-y-aleatorio',

    'admin_url' => 'https://TU-DOMINIO/admin/',
    'timezone' => 'America/Argentina/Buenos_Aires',
];
