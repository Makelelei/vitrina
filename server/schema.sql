-- Tabla de solicitudes de Vitrina (MySQL / MariaDB en Hostinger).
-- Importala desde hPanel → Bases de datos → phpMyAdmin → Importar.

CREATE TABLE IF NOT EXISTS leads (
  id           VARCHAR(24)  NOT NULL PRIMARY KEY,
  created_at   DATETIME     NOT NULL,
  status       VARCHAR(16)  NOT NULL DEFAULT 'nuevo',
  plan         VARCHAR(16)  NOT NULL,
  name         VARCHAR(80)  NOT NULL,
  email        VARCHAR(120) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  business     VARCHAR(80)  NOT NULL,
  category     VARCHAR(40)  NOT NULL,
  config_json  MEDIUMTEXT   NOT NULL,
  ip_hash      CHAR(64)     NOT NULL,
  email_sent   TINYINT(1)   NOT NULL DEFAULT 0,
  notes        TEXT         NULL,
  INDEX idx_created (created_at),
  INDEX idx_rate (ip_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
