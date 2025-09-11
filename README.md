# 💰 Luminare Eventos - Sistema de Gestão Financeira

<div align="center">
  <img src="src/assets/logo.png" alt="Luminare Eventos" width="120" height="120" style="border-radius: 12px;">
  <h3>Sistema Desktop de Controle Financeiro para Empresa de Eventos</h3>
  
  ![Tauri](https://img.shields.io/badge/Tauri-2.8.5-blue)
  ![React](https://img.shields.io/badge/React-19.1.1-blue)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
  ![Supabase](https://img.shields.io/badge/Supabase-2.57.2-green)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.13-blue)
</div>

## 📖 Sobre o Projeto

O **Luminare Eventos** é um sistema desktop moderno para gestão financeira de empresas de eventos, desenvolvido com **Tauri + React + TypeScript**. O sistema oferece controle completo de entradas e saídas financeiras, com categorias específicas para o ramo de eventos e relatórios visuais detalhados.

### 🎯 Características Principais

- **💼 Gestão Financeira Completa**: Controle de entradas e saídas categorizadas
- **📊 Relatórios Visuais**: Gráficos interativos e dashboards
- **🏢 Categorias Específicas**: Adaptado para empresas de eventos
- **💾 Persistência de Dados**: Integração com Supabase e backup local
- **🖥️ Aplicativo Desktop**: Interface nativa multiplataforma
- **🎨 Interface Moderna**: Design responsivo e intuitivo

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.1.1** - Framework principal
- **TypeScript 5.8.3** - Tipagem estática
- **TailwindCSS 4.1.13** - Estilização
- **React Hook Form** - Formulários
- **React Icons** - Ícones
- **Recharts** - Gráficos e visualizações
- **React Pro Sidebar** - Navegação lateral

### Backend & Banco de Dados
- **Supabase 2.57.2** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança

### Desktop & Build
- **Tauri 2.8.5** - Framework para aplicações desktop
- **Rust** - Backend nativo
- **Vite 7.1.2** - Build tool

## 🚀 Funcionalidades

### 💰 Gestão de Transações
- ✅ **Entradas**: Mini-Festa, Pegue e Monte, Kit Mêsversário
- ✅ **Saídas**: Arco Redondo, Arco Romano, Bandejas, Capa Cilindro
- ✅ **CRUD Completo**: Criar, visualizar, editar e excluir transações
- ✅ **Categorização**: Sistema de categorias por tipo de evento
- ✅ **Filtros**: Por tipo, categoria e período

### 📊 Relatórios e Análises
- ✅ **Dashboard**: Visão geral dos dados financeiros
- ✅ **Gráficos Interativos**: Visualização de entradas vs saídas
- ✅ **Análise por Categoria**: Distribuição de gastos e receitas
- ✅ **Cálculo de Lucro**: Receitas - Despesas em tempo real

### 🔧 Configurações e Administração
- ✅ **Teste de Conexão**: Verificação do banco de dados
- ✅ **Backup Local**: localStorage como fallback
- ✅ **Sincronização**: Dados entre local e cloud
- ✅ **Temas**: Interface customizável

### 🖥️ Interface Desktop
- ✅ **Sidebar Responsiva**: Navegação intuitiva com logo
- ✅ **Formulários Modernos**: Validação em tempo real
- ✅ **Modais Interativos**: Experiência fluida
- ✅ **Design Responsivo**: Adaptável a diferentes telas

## 📁 Estrutura do Projeto

```
Luminare-Eventos/
├── 📂 src/
│   ├── 📂 components/           # Componentes React
│   │   ├── 📂 Charts/          # Gráficos e visualizações
│   │   ├── 📂 Forms/           # Formulários de transação
│   │   ├── 📂 Sidebar/         # Navegação lateral
│   │   └── 📂 UI/              # Componentes de interface
│   ├── 📂 context/             # Contextos React
│   ├── 📂 services/            # Serviços de API
│   ├── 📂 types/               # Definições TypeScript
│   ├── 📂 utils/               # Utilitários
│   └── 📂 assets/              # Assets estáticos
├── 📂 src-tauri/               # Código Rust/Tauri
│   ├── 📂 src/                 # Código fonte Rust
│   ├── 📂 icons/               # Ícones da aplicação
│   └── 📂 capabilities/        # Permissões Tauri
├── 📂 database/                # Scripts SQL
└── 📄 README.md               # Este arquivo
```

## ⚙️ Instalação e Configuração

### 📋 Pré-requisitos
- **Node.js** 22.12+ 
- **Rust** 1.77.2+
- **Conta Supabase** (opcional, funciona offline)

### 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Gugalzg/Luminare-Eventos-Desktop-1.git
   cd Luminare-Eventos-Desktop-1
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente** (opcional)
   ```bash
   # Crie um arquivo .env na raiz do projeto
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Configure o banco de dados** (se usar Supabase)
   ```bash
   # Execute o script SQL no Supabase SQL Editor
   # Arquivo: database/setup.sql
   ```

### 🏃‍♂️ Executar em Desenvolvimento

```bash
# Modo desenvolvimento
npm run tauri dev
```

### 📦 Build para Produção

```bash
# Build completo
npm run tauri build

# Localização do executável
# Windows: src-tauri/target/release/Luminare Eventos.exe
# macOS: src-tauri/target/release/bundle/dmg/
# Linux: src-tauri/target/release/bundle/appimage/
```

## 💾 Banco de Dados

### 🗄️ Estrutura das Tabelas

#### **transactions**
- `id` (UUID) - Identificador único
- `title` (VARCHAR) - Título da transação
- `description` (TEXT) - Descrição opcional
- `amount` (DECIMAL) - Valor da transação
- `type` (ENUM) - 'entrada' ou 'saida'
- `category` (VARCHAR) - Categoria da transação
- `date` (DATE) - Data da transação
- `created_at` (TIMESTAMP) - Data de criação

#### **categories**
- `id` (UUID) - Identificador único
- `name` (VARCHAR) - Nome da categoria
- `type` (ENUM) - 'entrada' ou 'saida'
- `color` (VARCHAR) - Cor em hexadecimal
- `icon` (VARCHAR) - Nome do ícone
- `created_at` (TIMESTAMP) - Data de criação

### 🔐 Configuração Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script `database/setup.sql`
3. Configure as variáveis de ambiente
4. Teste a conexão em **Configurações → Testar Conexão**

## 🎨 Personalização

### 🏷️ Categorias Padrão

**Entradas (Receitas):**
- 🎉 Mini-Festa
- 🔧 Pegue e Monte  
- 🎂 Kit Mêsversário

**Saídas (Custos):**
- 🏛️ Arco Redondo
- 🏺 Arco Romano
- 🍽️ Bandejas
- 🎪 Capa Cilindro

### 🎨 Temas e Cores

```css
/* Cores principais */
--primary: #212038;     /* Azul escuro */
--secondary: #3a3a5c;   /* Azul médio */
--success: #10b981;     /* Verde entradas */
--danger: #ef4444;      /* Vermelho saídas */
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Frontend apenas
npm run tauri dev    # Aplicação completa

# Build
npm run build        # Build frontend
npm run tauri build  # Build aplicação desktop

# Qualidade de código
npm run lint         # ESLint
npm run preview      # Preview do build
```

## 📊 Funcionalidades Detalhadas

### 💰 Sistema de Transações

#### **Adicionar Transação**
1. Clique em "Nova Entrada" ou "Nova Saída"
2. Preencha o formulário:
   - **Título**: Nome da transação
   - **Categoria**: Selecione da lista
   - **Valor**: Valor em reais
   - **Data**: Data da transação
   - **Descrição**: Opcional
3. Clique em "Salvar"

#### **Gerenciar Transações**
- **Visualizar**: Clique no ícone 👁️
- **Editar**: Clique no ícone ✏️
- **Excluir**: Clique no ícone 🗑️
- **Filtrar**: Por tipo (Todas/Entradas/Saídas)

### 📈 Relatórios

#### **Dashboard Principal**
- Gráfico de entradas vs saídas
- Lucro/prejuízo do período
- Distribuição por categoria
- Tendências mensais

#### **Análises Disponíveis**
- Total de entradas por categoria
- Total de saídas por categoria
- Evolução temporal
- Comparações percentuais

## 🐛 Solução de Problemas

### ❌ Problemas Comuns

#### **Erro de Conexão com Banco**
```bash
# Verifique as variáveis de ambiente
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Teste a conexão em Configurações → Testar Conexão
```

#### **Erro de Build Tauri**
```bash
# Instale as dependências do Rust
rustup update
cargo clean

# Rebuild
npm run tauri build
```

#### **Problemas de Node.js**
```bash
# Atualize para versão compatível
node -v  # Deve ser 22.12+

# Use nvm se necessário
nvm use 22.12.0
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autor

**Gugalzg** - [GitHub](https://github.com/Gugalzg)

## 🙏 Agradecimentos

- [Tauri](https://tauri.app) - Framework desktop incrível
- [React](https://reactjs.org) - Biblioteca JavaScript
- [Supabase](https://supabase.com) - Backend as a Service
- [TailwindCSS](https://tailwindcss.com) - Framework CSS

---

<div align="center">
  <p>💡 <strong>Luminare Eventos</strong> - Transformando a gestão financeira de eventos</p>
  <p>⭐ Se este projeto foi útil, considere dar uma estrela!</p>
</div>