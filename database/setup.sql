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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- RLS (Row Level Security) - Cada usuário só vê seus próprios dados
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Políticas para transações
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Inserir categorias padrão do Luminare Eventos (sem user_id para serem públicas)
INSERT INTO categories (name, type, color, icon) VALUES
  ('Mini-Festa', 'entrada', '#10b981', 'MdCelebration'),
  ('Pegue e Monte', 'entrada', '#06d6a0', 'MdBuildCircle'),
  ('Kit Mêsversário', 'entrada', '#14b8a6', 'MdCake'),
  ('Arco Redondo', 'saida', '#ef4444', 'MdArchitecture'),
  ('Arco Romano', 'saida', '#dc2626', 'MdAccountBalance'),
  ('Bandejas', 'saida', '#f97316', 'MdDining'),
  ('Capa Cilindro', 'saida', '#ea580c', 'MdExtension')
ON CONFLICT DO NOTHING;