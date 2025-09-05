# 💰 Sistema de Controle de Gastos

Um sistema moderno e intuitivo para controlar seus gastos pessoais, desenvolvido com **React**, **TypeScript**, **Tauri** e integrado ao **Supabase**.

## ✨ Funcionalidades

- 🔐 **Autenticação segura** com Supabase Auth
- 📊 **Dashboard interativo** com gráficos e estatísticas
- 💸 **Gerenciamento completo de gastos** (criar, editar, excluir)
- 🏷️ **Sistema de categorias personalizáveis** com cores e ícones
- 📈 **Análise de gastos** por categoria e período
- 📱 **Interface responsiva** para desktop e mobile
- 🎨 **Design moderno** com Tailwind CSS

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Desktop**: Tauri (Rust)
- **Backend**: Supabase
- **Build Tool**: Vite

## 📋 Pré-requisitos

- Node.js 18+
- Rust (para Tauri)
- Conta no Supabase

## 🛠️ Configuração

### 1. Clone o repositório

```bash
git clone [seu-repositório]
cd LuminareEventos
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Acesse o SQL Editor e execute o script abaixo para criar as tabelas:

```sql
-- Habilitar RLS (Row Level Security)
-- Tabela de categorias
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    color VARCHAR NOT NULL,
    icon VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Tabela de gastos
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    category UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Políticas para categories
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para expenses
CREATE POLICY "Users can view their own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete their own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);
```

### 4. Configure as variáveis de ambiente

1. Atualize o arquivo `src/lib/supabase.ts` com suas credenciais:
```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 5. Execute o projeto

#### Desenvolvimento Web
```bash
npm run dev
```

#### Aplicação Desktop (Tauri)
```bash
npm run tauri dev
```

## 📱 Como Usar

### 1. **Primeiro Acesso**
- Crie uma conta ou faça login
- O sistema criará categorias padrão automaticamente

### 2. **Gerenciar Categorias**
- Clique em "Categorias" no menu lateral
- Adicione categorias personalizadas com cores e ícones
- Edite ou exclua categorias existentes

### 3. **Adicionar Gastos**
- Clique em "Novo Gasto"
- Preencha título, valor, categoria e data
- Adicione descrição opcional

### 4. **Visualizar Gastos**
- Acesse "Gastos" para ver a lista completa
- Use filtros por mês e categoria
- Edite ou exclua gastos diretamente

### 5. **Dashboard**
- Visualize estatísticas do mês atual
- Analise gráficos por categoria
- Acompanhe a evolução mensal

## 🎨 Personalização

O sistema vem com cores e categorias padrão, mas você pode personalizar:

### Categorias Padrão
Edite as categorias padrão em `src/components/CategoryManager.tsx`:

```typescript
const defaultCategories = [
  { name: 'Alimentação', color: '#ef4444', icon: '🍽️' },
  { name: 'Transporte', color: '#3b82f6', icon: '🚗' },
  // Adicione suas categorias personalizadas
]
```

---

⭐ **Sistema completo de controle de gastos pronto para uso!**
