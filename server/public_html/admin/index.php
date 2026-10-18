<?php
declare(strict_types=1);

/**
 * Panel privado de solicitudes de Vitrina: login con contraseña, listado,
 * cambio de estado y descarga del JSON listo para `npm run client`.
 */

header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

// Preferido: un nivel arriba de public_html. Alternativa: public_html/_private (bloqueada por .htaccess).
$configFile = is_file(dirname(__DIR__, 2) . '/vitrina-config.php')
    ? dirname(__DIR__, 2) . '/vitrina-config.php'
    : dirname(__DIR__) . '/_private/vitrina-config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    exit('Falta vitrina-config.php fuera de public_html.');
}
/** @var array<string, mixed> $config */
$config = require $configFile;
date_default_timezone_set((string) ($config['timezone'] ?? 'America/Argentina/Buenos_Aires'));

const STATUSES = ['nuevo' => 'Nuevo', 'contactado' => 'Contactado', 'pagado' => 'Pagado', 'publicado' => 'Publicado', 'descartado' => 'Descartado'];

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Strict',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
]);
session_name('vitrina_admin');
session_start();

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf(): string
{
    return $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

function checkCsrf(): void
{
    if (!hash_equals(csrf(), (string) ($_POST['csrf'] ?? ''))) {
        http_response_code(400);
        exit('Sesión vencida. Volvé a cargar la página.');
    }
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

function db(array $config): PDO
{
    $pdo = new PDO($config['db']['dsn'], $config['db']['user'] ?? null, $config['db']['pass'] ?? null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    ensureSchema($pdo);
    return $pdo;
}

/* ---------- Login / logout ---------- */
$error = '';
if (($_POST['action'] ?? '') === 'login') {
    $hash = (string) ($config['admin_password_hash'] ?? '');
    if ($hash !== '' && password_verify((string) ($_POST['password'] ?? ''), $hash)) {
        session_regenerate_id(true);
        $_SESSION['auth'] = true;
        header('Location: ./');
        exit;
    }
    sleep(1); // frena intentos por fuerza bruta
    $error = 'Contraseña incorrecta.';
}
if (($_POST['action'] ?? '') === 'logout') {
    checkCsrf();
    session_destroy();
    header('Location: ./');
    exit;
}

$authed = !empty($_SESSION['auth']);

/* ---------- Acciones autenticadas ---------- */
if ($authed) {
    try {
        $pdo = db($config);
    } catch (PDOException $ex) {
        error_log('[vitrina] Panel sin base de datos: ' . $ex->getMessage());
        http_response_code(503);
        exit('No hay conexión con la base de datos. Revisá vitrina-config.php.');
    }

    if (($_POST['action'] ?? '') === 'status') {
        checkCsrf();
        $status = (string) ($_POST['status'] ?? '');
        if (array_key_exists($status, STATUSES)) {
            $pdo->prepare('UPDATE leads SET status = ?, notes = ? WHERE id = ?')
                ->execute([$status, mb_substr(trim((string) ($_POST['notes'] ?? '')), 0, 1000), (string) ($_POST['id'] ?? '')]);
        }
        header('Location: ./' . (isset($_GET['f']) ? '?f=' . urlencode((string) $_GET['f']) : ''));
        exit;
    }

    // Descarga en el mismo formato que exporta el estudio: sirve directo para `npm run client`.
    if (isset($_GET['download'])) {
        $stmt = $pdo->prepare('SELECT * FROM leads WHERE id = ?');
        $stmt->execute([(string) $_GET['download']]);
        $lead = $stmt->fetch();
        if (!$lead) {
            http_response_code(404);
            exit('Solicitud no encontrada.');
        }
        $export = [
            'schema' => 'vitrina.site-config',
            'version' => 1,
            'exportedAt' => gmdate('c'),
            'site' => json_decode($lead['config_json'], true),
            'lead' => [
                'id' => $lead['id'],
                'createdAt' => $lead['created_at'],
                'plan' => $lead['plan'],
                'contact' => ['name' => $lead['name'], 'email' => $lead['email'], 'phone' => $lead['phone']],
            ],
        ];
        $slug = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower((string) iconv('UTF-8', 'ASCII//TRANSLIT', $lead['business']))), '-') ?: 'cliente';
        header('Content-Type: application/json; charset=utf-8');
        header("Content-Disposition: attachment; filename=\"vitrina-{$slug}.json\"");
        echo json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    $filter = array_key_exists((string) ($_GET['f'] ?? ''), STATUSES) ? (string) $_GET['f'] : '';
    $sql = 'SELECT id, created_at, status, plan, name, email, phone, business, category, email_sent, notes FROM leads';
    $stmt = $filter ? $pdo->prepare("{$sql} WHERE status = ? ORDER BY created_at DESC LIMIT 300") : $pdo->prepare("{$sql} ORDER BY created_at DESC LIMIT 300");
    $stmt->execute($filter ? [$filter] : []);
    $leads = $stmt->fetchAll();
    $counts = $pdo->query('SELECT status, COUNT(*) AS n FROM leads GROUP BY status')->fetchAll(PDO::FETCH_KEY_PAIR);
}
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Solicitudes · Vitrina</title>
<style>
  :root { color-scheme: dark; --bg:#07070a; --panel:#121218; --fg:#ececf1; --muted:#9b9ba8; --border:#26262e; --accent:#22d3ee; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:14px/1.5 Inter, system-ui, sans-serif; }
  main { max-width:1200px; margin:0 auto; padding:24px 16px; }
  h1 { font-size:20px; margin:0; }
  a { color:var(--accent); }
  .top { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
  .card { background:var(--panel); border:1px solid var(--border); border-radius:12px; }
  .login { max-width:340px; margin:15vh auto; padding:24px; }
  input, select, textarea, button { font:inherit; color:inherit; background:#0d0d12; border:1px solid var(--border); border-radius:8px; padding:8px 10px; }
  button { cursor:pointer; background:var(--fg); color:var(--bg); border:0; font-weight:600; }
  button.ghost { background:transparent; color:var(--fg); border:1px solid var(--border); }
  :focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  .filters { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
  .filters a { padding:6px 10px; border:1px solid var(--border); border-radius:999px; color:var(--fg); text-decoration:none; font-size:13px; }
  .filters a[aria-current="page"] { border-color:var(--accent); color:var(--accent); }
  .lead { padding:14px; margin-bottom:10px; display:grid; gap:10px; grid-template-columns: 1fr; }
  @media (min-width: 900px) { .lead { grid-template-columns: 1.2fr 1fr 1.4fr; align-items:start; } }
  .muted { color:var(--muted); font-size:12px; }
  .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; border:1px solid var(--border); }
  .row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  textarea { width:100%; min-height:38px; resize:vertical; }
  .err { color:#fb7185; font-size:13px; }
</style>
</head>
<body>
<main>
<?php if (!$authed): ?>
  <form method="post" class="card login" autocomplete="off">
    <h1>Vitrina · Panel</h1>
    <p class="muted">Ingresá la contraseña de administración.</p>
    <input type="hidden" name="action" value="login">
    <label for="password" class="muted">Contraseña</label>
    <input id="password" name="password" type="password" required autofocus style="width:100%;margin:6px 0 12px">
    <?php if ($error): ?><p class="err" role="alert"><?= e($error) ?></p><?php endif; ?>
    <button type="submit" style="width:100%">Entrar</button>
  </form>
<?php else: ?>
  <div class="top">
    <h1>Solicitudes <span class="muted">(<?= count($leads) ?>)</span></h1>
    <form method="post"><input type="hidden" name="action" value="logout"><input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><button class="ghost" type="submit">Salir</button></form>
  </div>

  <nav class="filters" aria-label="Filtrar por estado">
    <a href="./" <?= $filter === '' ? 'aria-current="page"' : '' ?>>Todas</a>
    <?php foreach (STATUSES as $key => $label): ?>
      <a href="?f=<?= e($key) ?>" <?= $filter === $key ? 'aria-current="page"' : '' ?>><?= e($label) ?> (<?= (int) ($counts[$key] ?? 0) ?>)</a>
    <?php endforeach; ?>
  </nav>

  <?php if (!$leads): ?>
    <p class="muted">Todavía no hay solicitudes<?= $filter ? ' con este estado' : '' ?>.</p>
  <?php endif; ?>

  <?php foreach ($leads as $l):
      $when = date('d/m/Y H:i', (int) strtotime($l['created_at'] . ' UTC'));
      $wa = 'https://wa.me/' . rawurlencode($l['phone']) . '?text=' . rawurlencode("¡Hola {$l['name']}! Te escribo de Vitrina por tu solicitud {$l['id']} para {$l['business']}.");
  ?>
    <article class="card lead">
      <div>
        <strong><?= e($l['business']) ?></strong>
        <div class="muted"><?= e($l['id']) ?> · <?= e($when) ?> · <?= e($l['category']) ?></div>
        <div class="row" style="margin-top:6px">
          <span class="badge">Plan <?= $l['plan'] === 'pro' ? 'Pro' : 'Básico' ?></span>
          <span class="badge"><?= e(STATUSES[$l['status']] ?? $l['status']) ?></span>
          <?php if (!(int) $l['email_sent']): ?><span class="badge" title="El aviso por email falló; la solicitud está guardada">sin email</span><?php endif; ?>
        </div>
      </div>
      <div>
        <div><?= e($l['name']) ?></div>
        <div class="muted"><a href="mailto:<?= e($l['email']) ?>"><?= e($l['email']) ?></a></div>
        <div class="row" style="margin-top:6px">
          <a href="<?= e($wa) ?>" target="_blank" rel="noopener noreferrer">WhatsApp +<?= e($l['phone']) ?></a>
          <a href="?download=<?= e(rawurlencode($l['id'])) ?>">Descargar JSON</a>
        </div>
      </div>
      <form method="post" class="row" style="align-items:flex-start">
        <input type="hidden" name="action" value="status">
        <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
        <input type="hidden" name="id" value="<?= e($l['id']) ?>">
        <label class="muted" for="s-<?= e($l['id']) ?>">Estado</label>
        <select id="s-<?= e($l['id']) ?>" name="status">
          <?php foreach (STATUSES as $key => $label): ?>
            <option value="<?= e($key) ?>" <?= $l['status'] === $key ? 'selected' : '' ?>><?= e($label) ?></option>
          <?php endforeach; ?>
        </select>
        <textarea name="notes" aria-label="Notas" placeholder="Notas internas (pago, dominio, pendientes…)"><?= e((string) $l['notes']) ?></textarea>
        <button type="submit">Guardar</button>
      </form>
    </article>
  <?php endforeach; ?>
<?php endif; ?>
</main>
</body>
</html>
