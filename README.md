# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
# Luminare Eventos - Sistema de Controle Financeiro

Sistema completo de controle financeiro desenvolvido especificamente para a empresa **Luminare Eventos**, utilizando as tecnologias mais modernas para gestão de receitas e despesas.

## 🚀 Funcionalidades Implementadas

### ✅ Dashboard Executivo
- **Cards de Resumo**: Visualização total de Entradas, Saídas e Lucro
- **Transações Recentes**: Lista das últimas 5 transações
- **Indicadores Visuais**: Cores diferenciadas para entrada (verde) e saída (vermelho)

### ✅ Sistema de Navegação
- **Sidebar Profissional**: Menu lateral com react-pro-sidebar
- **Menu Responsivo**: Adaptável para dispositivos móveis
- **Navegação por Seções**: Dashboard, Entradas, Saídas, Gerenciar, Relatórios

### ✅ Formulários CRUD Completos
- **React Hook Form**: Validação profissional com TypeScript
- **Modal de Criação/Edição**: Interface intuitiva para transações
- **Validação Robusta**: Campos obrigatórios, formatos corretos
- **Feedback Visual**: Mensagens de erro e sucesso

### ✅ Gestão de Transações
- **Lista Completa**: Tabela com todas as transações
- **Filtros Inteligentes**: Por tipo (Entrada/Saída) ou visualização completa
- **Ações CRUD**: Criar, Visualizar, Editar, Excluir
- **Modal de Detalhes**: Visualização completa da transação

### ✅ Categorias Específicas do Negócio

#### 📈 **Entradas (Receitas)**
- **Mini-Festa**: Eventos temáticos personalizados
- **Pegue e Monte**: Kit para decoração DIY  
- **Kit Mêsversário**: Decoração para aniversário mensal

#### 📉 **Saídas (Custos)**
- **Arco Redondo**: Material decorativo circular
- **Arco Romano**: Decoração em estilo clássico
- **Bandejas**: Utensílios para apresentação
- **Capa Cilindro**: Cobertura para elementos cilíndricos

### ✅ Relatórios e Gráficos
- **Recharts Integration**: Biblioteca de gráficos profissional
- **Gráfico de Barras Mensal**: Comparação Entradas vs Saídas
- **Gráfico de Pizza**: Distribuição por categoria
- **Evolução do Saldo**: Linha temporal do acumulado
- **Top Categorias**: Ranking das maiores movimentações
- **Cards de Resumo**: Métricas principais sempre visíveis

### ✅ Persistência de Dados
- **LocalStorage**: Armazenamento local dos dados
- **Context API**: Gerenciamento de estado global
- **Funções Calculadas**: Totalizações automáticas em tempo real

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 19** + **TypeScript**: Framework moderno com tipagem forte
- **Vite**: Build tool de alta performance
- **Tailwind CSS**: Framework CSS utility-first

### Formulários e Validação
- **React Hook Form**: Biblioteca de formulários performática
- **Validação TypeScript**: Tipagem completa dos dados

### UI/UX
- **react-pro-sidebar**: Sidebar profissional e responsiva
- **react-icons/md**: Ícones Material Design
- **Recharts**: Biblioteca de gráficos para React

### Desktop
- **Tauri**: Framework para aplicações desktop nativas

## 📊 Estrutura de Dados

```typescript
interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  date: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: 'entrada' | 'saida';
  color: string;
  icon: string;
  created_at: string;
}
```

## 🎯 Como Usar

### 1. Instalação
```bash
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```

### 3. Executar como Desktop (Tauri)
```bash
npm run tauri dev
```

### 4. Navegação Principal

#### **Dashboard** 
- Visão geral dos dados financeiros
- Cards de resumo com totais
- Lista das transações mais recentes

#### **Entradas/Saídas**
- Visualização filtrada por tipo
- Total específico de cada categoria
- Lista detalhada das transações

#### **Gerenciar Transações**
- CRUD completo de transações
- Filtros por tipo
- Modal de criação/edição
- Confirmação para exclusões

#### **Relatórios**
- Gráficos interativos
- Análise mensal comparativa
- Distribuição por categorias
- Evolução temporal do saldo

## 🗃 Base de Dados (Supabase - Preparado)

O sistema está preparado para integração com Supabase PostgreSQL:

```sql
-- Enum para tipo de transação
CREATE TYPE transaction_type AS ENUM ('entrada', 'saida');

-- Tabela de transações
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    type transaction_type NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type transaction_type NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📋 Arquivo COMO_EXECUTAR_SQL.md

Foi criado um guia completo passo-a-passo para execução dos scripts SQL no Supabase.

## 🎨 Cores e Identidade Visual

### Paleta Principal
- **Primário**: `#212038` (Azul escuro profissional)
- **Secundário**: `#FFFFFF` (Branco)
- **Entradas**: `#10b981` (Verde)
- **Saídas**: `#ef4444` (Vermelho)
- **Lucro**: `#3b82f6` (Azul)
- **Prejuízo**: `#f97316` (Laranja)

### Design System
- **Shadows**: Sombras sutis para profundidade
- **Rounded**: Bordas arredondadas modernas
- **Transitions**: Animações suaves
- **Responsive**: Layout adaptativo

## 🔧 Próximos Passos Sugeridos

### Integrações Futuras
1. **Supabase**: Conectar com banco de dados em nuvem
2. **Autenticação**: Sistema de login e usuários
3. **Backup**: Sincronização automática
4. **Notificações**: Alertas de vencimentos
5. **Relatórios PDF**: Exportação de documentos
6. **Multi-empresa**: Suporte para múltiplos negócios

### Melhorias de UX
1. **Dark Mode**: Tema escuro
2. **Configurações**: Personalização avançada
3. **Atalhos de Teclado**: Navegação rápida
4. **Drag & Drop**: Interface mais intuitiva

## 💡 Características Técnicas

- **TypeScript 100%**: Tipagem completa
- **Performance**: Otimizada com React 19
- **Responsive Design**: Mobile-first
- **Acessibilidade**: Padrões WCAG
- **Componentização**: Arquitetura modular
- **Estado Global**: Context API eficiente

## 📝 Licença

Sistema desenvolvido exclusivamente para **Luminare Eventos**.

---

**Desenvolvido com ❤️ para transformar a gestão financeira da Luminare Eventos**
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
