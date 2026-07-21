-- =========================================
-- RESET DATABASE (DEV / STAGING ONLY)
-- =========================================

-- Drop tables in dependency order (REMOVE THIS IN PRODUCTION)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS invoice_status_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_monthly_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enums
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- =========================================
-- EXTENSIONS
-- =========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

-- =========================================
-- ENUM TYPES
-- =========================================

CREATE TYPE invoice_status AS ENUM (
  'UNPAID',
  'PAID',
  'OVERDUE',
  'CANCELLED'
);

CREATE TYPE subscription_plan AS ENUM (
  'FREE',
  'PRO',
  'PREMIUM'
);

CREATE TYPE subscription_status AS ENUM (
  'ACTIVE',
  'CANCELLED',
  'EXPIRED'
);

-- =========================================
-- USERS
-- =========================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  full_name VARCHAR(150) NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  avatar_url TEXT,
  public_id TEXT,
  timezone VARCHAR(100) DEFAULT 'UTC',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  refresh_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (char_length(full_name) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =========================================
-- CLIENTS
-- =========================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name VARCHAR(150) NOT NULL,
  email CITEXT,
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (char_length(name) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON clients USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_user_created_id ON clients (user_id, created_at DESC, id DESC);

-- =========================================
-- INVOICES
-- =========================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  invoice_number VARCHAR(50) NOT NULL UNIQUE,

  status invoice_status NOT NULL DEFAULT 'UNPAID',

  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,

  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, invoice_number),

  CHECK (due_date >= issue_date)
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- =========================================
-- INVOICE ITEMS
-- =========================================

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  description TEXT NOT NULL,

  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),

  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- =========================================
-- PAYMENTS
-- =========================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

  payment_method VARCHAR(50) NOT NULL,

  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  reference_number VARCHAR(100) UNIQUE,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_number_trgm ON invoices USING gin (invoice_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_payment_reference_trgm ON payments USING gin(reference_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_payments_user_date ON payments (user_id, payment_date);

-- =========================================
-- BUSINESS 
-- =========================================

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  brand_url TEXT,
  public_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_user_id ON businesses(user_id);

-- =========================================
-- INVOICE STATUS HISTORY
-- =========================================

CREATE TABLE IF NOT EXISTS invoice_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  status invoice_status NOT NULL,

  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_status_history_invoice_id ON invoice_status_history(invoice_id);

-- =========================================
-- USER MONTHLY STATS
-- =========================================

CREATE TABLE IF NOT EXISTS user_monthly_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),

  total_income NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_invoices INT NOT NULL DEFAULT 0,
  paid_invoices INT NOT NULL DEFAULT 0,
  unpaid_invoices INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_user_monthly_stats_user_id ON user_monthly_stats(user_id);

-- =========================================
-- SUBSCRIPTIONS
-- =========================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  plan subscription_plan NOT NULL DEFAULT 'FREE',

  status subscription_status NOT NULL DEFAULT 'ACTIVE',

  start_date DATE NOT NULL,
  end_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (
    end_date IS NULL
    OR end_date >= start_date
  )
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- =========================================
-- AUDIT LOGS
-- =========================================
-- Extremely useful in real SaaS apps
-- Tracks important user actions

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  action VARCHAR(100) NOT NULL,

  entity_type VARCHAR(100),
  entity_id UUID,

  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =========================================
-- UPDATED_AT AUTO-UPDATE TRIGGER
-- =========================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- USERS
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- CLIENTS
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- INVOICES
CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- SUBSCRIPTIONS
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();