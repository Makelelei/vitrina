# Backend de Vitrina (PHP + MySQL, Hostinger)

| Archivo | Para qué |
|---|---|
| `public_html/api/lead.php` | Recibe las solicitudes del estudio, las valida y guarda; avisa por email si hay casilla configurada |
| `public_html/admin/index.php` | Panel privado: login, listado, estados, notas y descarga del JSON |
| `public_html/_private/.htaccess` | Bloquea la carpeta privada desde la web |
| `vitrina-config.example.php` | Plantilla de configuración (base de datos, emails, orígenes, hash de la contraseña) |
| `schema.sql` | Tabla `leads` (también se crea sola en el primer uso) |

## Instalación

1. Crear la base de datos MySQL en hPanel (o vía API) y anotar nombre, usuario y contraseña.
2. Copiar `vitrina-config.example.php` como `vitrina-config.php` y completarlo:
   - Preferido: un nivel arriba de `public_html`.
   - Alternativa: `public_html/_private/vitrina-config.php` (bloqueada por `.htaccess`).
3. Generar el hash de la contraseña del panel: `php -r "echo password_hash('clave', PASSWORD_DEFAULT);"`.
4. Subir `public_html/` junto con el build del estudio (`dist/`, sin `site.html`).
5. En el estudio, `VITE_LEAD_ENDPOINT=https://<dominio>/api/lead.php` antes de compilar.

## Seguridad

- CORS restringido a `allowed_origins`.
- Límite de 5 solicitudes cada 10 minutos por IP (IP guardada como hash con salt).
- Campo trampa contra bots, cuerpo máximo 3 MB, consultas preparadas (PDO).
- Panel con `password_verify`, sesión `HttpOnly`/`SameSite=Strict`, CSRF y `noindex`.
- La configuración (clave de la base) nunca se versiona: `vitrina-config.php` está en `.gitignore`.
