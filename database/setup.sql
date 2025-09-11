-- Script SQL para criar as tabelas do sistema de controle financeiro Luminare Eventos
-- Execute este script no SQL Editor do seu projeto Supabase

-- Criar tipo ENUM para transações
CREATE TYPE transaction_type AS ENUM ('entrada', 'saida');

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type transaction_type NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6b7280',
  icon VARCHAR(50) NOT NULL DEFAULT 'MdCategory',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de transações financeiras (entradas e saídas)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  type transaction_type NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Desabilitar RLS para acesso público
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Inserir categorias padrão do Luminare Eventos
INSERT INTO categories (name, type, color, icon) VALUES
  ('Mini-Festa', 'entrada', '#10b981', 'MdCelebration'),
  ('Pegue e Monte', 'entrada', '#06d6a0', 'MdBuildCircle'),
  ('Kit Mêsversário', 'entrada', '#14b8a6', 'MdCake'),
  ('Arco Redondo', 'saida', '#ef4444', 'MdArchitecture'),
  ('Arco Romano', 'saida', '#dc2626', 'MdAccountBalance'),
  ('Bandejas', 'saida', '#f97316', 'MdDining'),
  ('Capa Cilindro', 'saida', '#ea580c', 'MdExtension')
ON CONFLICT DO NOTHING;