<?php
declare(strict_types=1);

/**
 * Recibe las solicitudes del estudio Vitrina (POST JSON), las guarda en la base
 * de datos y avisa por email. La configuración vive FUERA de public_html
 * (ver vitrina-config.example.php).
 */

const MAX_BODY_BYTES = 3_000_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MINUTES = 10;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Crea la tabla la primera vez (MySQL/MariaDB de Hostinger): no hace falta importar schema.sql a mano. */
function ensureSchema(PDO $pdo): void
{
    if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'mysql') {
        return;
    }
    $pdo->exec('CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(24) NOT NULL PRIMARY KEY,
        created_at DATETIME NOT NULL,
        status VARCHAR(16) NOT NULL DEFAULT \'nuevo\',
        plan VARCHAR(16) NOT NULL,
        name VARCHAR(80) NOT NULL,
        email VARCHAR(120) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        business VARCHAR(80) NOT NULL,
        category VARCHAR(40) NOT NULL,
        config_json MEDIUMTEXT NOT NULL,
        ip_hash CHAR(64) NOT NULL,
        email_sent TINYINT(1) NOT NULL DEFAULT 0,
        notes TEXT NULL,
        INDEX idx_created (created_at),
        INDEX idx_rate (ip_hash, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
}

function fail(int $status, string $message): never
{
    respond($status, ['ok' => false, 'error' => $message]);
}

// Preferido: un nivel arriba de public_html. Alternativa: public_html/_private (bloqueada por .htaccess).
$configFile = is_file(dirname(__DIR__, 2) . '/vitrina-config.php')
    ? dirname(__DIR__, 2) . '/vitrina-config.php'
    : dirname(__DIR__) . '/_private/vitrina-config.php';
if (!is_file($configFile)) {
    error_log('[vitrina] Falta vitrina-config.php fuera de public_html');
    fail(500, 'El servicio no está configurado todavía.');
}
/** @var array<string, mixed> $config */
$config = require $configFile;

/* ---------- CORS: solo los dominios del estudio ---------- */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = in_array($origin, $config['allowed_origins'] ?? [], true);
if ($allowed) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
}
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code($allowed ? 204 : 403);
    exit;
}
if ($method !== 'POST') {
    fail(405, 'Método no permitido.');
}
if ($origin !== '' && !$allowed) {
    fail(403, 'Origen no permitido.');
}

/* ---------- Cuerpo ---------- */
$raw = file_get_contents('php://input');
if ($raw === false || $raw === '') {
    fail(400, 'Solicitud vacía.');
}
if (strlen($raw) > MAX_BODY_BYTES) {
    fail(413, 'La configuración es demasiado grande. Probá con imágenes más livianas.');
}
try {
    $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    fail(400, 'Formato de solicitud inválido.');
}
if (!is_array($data)) {
    fail(400, 'Formato de solicitud inválido.');
}

$newId = static fn (): string => 'VT-' . strtoupper(base_convert((string) (int) (microtime(true) * 1000), 10, 36)) . strtoupper(bin2hex(random_bytes(1)));

// Campo trampa: los bots lo completan. Se responde "ok" sin guardar nada.
if (!empty($data['website'])) {
    respond(201, ['ok' => true, 'id' => $newId(), 'createdAt' => gmdate('c')]);
}

/* ---------- Validación ---------- */
$plan = $data['plan'] ?? null;
$contact = is_array($data['contact'] ?? null) ? $data['contact'] : [];
$site = is_array($data['config'] ?? null) ? $data['config'] : null;

$name = trim((string) ($contact['name'] ?? ''));
$email = trim((string) ($contact['email'] ?? ''));
$phone = preg_replace('/\D/', '', (string) ($contact['phone'] ?? '')) ?? '';
$business = trim((string) ($site['brandDetails']['name'] ?? ''));
$category = (string) ($site['businessCategory'] ?? '');

$errors = [];
if (!in_array($plan, ['basico', 'pro'], true)) $errors[] = 'Plan inválido.';
if (mb_strlen($name) < 2 || mb_strlen($name) > 80) $errors[] = 'Revisá tu nombre.';
if (strlen($email) > 120 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) $errors[] = 'Revisá tu email.';
if (strlen($phone) < 8 || strlen($phone) > 15) $errors[] = 'Revisá tu WhatsApp.';
if ($site === null || $business === '' || mb_strlen($business) > 80 || $category === '') $errors[] = 'La configuración del sitio está incompleta.';
if ($errors) {
    fail(422, implode(' ', $errors));
}

/* ---------- Base de datos ---------- */
try {
    $pdo = new PDO($config['db']['dsn'], $config['db']['user'] ?? null, $config['db']['pass'] ?? null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    ensureSchema($pdo);
} catch (PDOException $e) {
    error_log('[vitrina] Sin conexión a la base: ' . $e->getMessage());
    fail(503, 'No pudimos registrar tu solicitud. Probá de nuevo en unos minutos.');
}

$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . ($config['ip_salt'] ?? ''));
$createdAt = gmdate('Y-m-d H:i:s');

try {
    $recent = $pdo->prepare('SELECT COUNT(*) FROM leads WHERE ip_hash = ? AND created_at >= ?');
    $recent->execute([$ipHash, gmdate('Y-m-d H:i:s', time() - RATE_WINDOW_MINUTES * 60)]);
    if ((int) $recent->fetchColumn() >= RATE_LIMIT) {
        fail(429, 'Demasiados intentos seguidos. Esperá unos minutos.');
    }

    $id = $newId();
    $insert = $pdo->prepare(
        'INSERT INTO leads (id, created_at, status, plan, name, email, phone, business, category, config_json, ip_hash, email_sent)
         VALUES (?, ?, \'nuevo\', ?, ?, ?, ?, ?, ?, ?, ?, 0)'
    );
    $insert->execute([
        $id, $createdAt, $plan, $name, $email, $phone, $business, $category,
        json_encode($site, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
        $ipHash,
    ]);
} catch (Throwable $e) {
    error_log('[vitrina] Error al guardar la solicitud: ' . $e->getMessage());
    fail(500, 'No pudimos registrar tu solicitud. Probá de nuevo en unos minutos.');
}

/* ---------- Aviso por email (si falla, la solicitud ya quedó guardada) ---------- */
$clean = static fn (string $v): string => str_replace(["\r", "\n"], ' ', $v);
$planLabel = $plan === 'pro' ? 'Pro' : 'Básico';
$subject = '=?UTF-8?B?' . base64_encode($clean("Nueva solicitud {$id}: {$business} (Plan {$planLabel})")) . '?=';
$adminUrl = (string) ($config['admin_url'] ?? '');
$body = implode("\n", [
    "Nueva solicitud de sitio en Vitrina",
    '',
    "Código:   {$id}",
    "Negocio:  {$business}",
    "Rubro:    {$category}",
    "Plan:     {$planLabel}",
    '',
    "Nombre:   {$name}",
    "Email:    {$email}",
    "WhatsApp: +{$phone}  →  https://wa.me/{$phone}",
    '',
    $adminUrl !== '' ? "Ver y descargar la configuración: {$adminUrl}" : '',
]);
$headers = implode("\r\n", [
    'From: Vitrina <' . $clean((string) ($config['from_email'] ?? '')) . '>',
    "Reply-To: {$email}",
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = false;
$notifyTo = (string) ($config['notify_email'] ?? '');
if ($notifyTo !== '' && (string) ($config['from_email'] ?? '') !== '') {
    try {
        $sent = mail($notifyTo, $subject, $body, $headers);
    } catch (Throwable $e) {
        error_log('[vitrina] Error al enviar el email: ' . $e->getMessage());
    }
}
if ($sent) {
    $pdo->prepare('UPDATE leads SET email_sent = 1 WHERE id = ?')->execute([$id]);
} else {
    error_log("[vitrina] No se pudo enviar el aviso de la solicitud {$id} (quedó guardada en la base).");
}

respond(201, ['ok' => true, 'id' => $id, 'createdAt' => gmdate('c', (int) strtotime($createdAt . ' UTC'))]);
