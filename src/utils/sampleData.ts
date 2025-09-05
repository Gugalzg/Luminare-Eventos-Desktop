import type { Expense } from '../types';

// Dados de exemplo para demonstração
export const SAMPLE_EXPENSES: Omit<Expense, 'id'>[] = [
  {
    title: 'Supermercado Pão de Açúcar',
    description: 'Compras da semana - alimentos básicos',
    amount: 342.50,
    category: '1', // Alimentação
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    user_id: 'local'
  },
  {
    title: 'Posto Shell',
    description: 'Combustível',
    amount: 120.80,
    category: '2', // Transporte
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // ontem
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: 'local'
  },
  {
    title: 'Farmácia Droga Raia',
    description: 'Medicamentos',
    amount: 45.30,
    category: '3', // Saúde
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 dias atrás
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user_id: 'local'
  },
  {
    title: 'Cinema Cinemark',
    description: 'Ingressos + pipoca',
    amount: 78.90,
    category: '5', // Lazer
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 dias atrás
    created_at: new Date(Date.now() - 259200000).toISOString(),
    user_id: 'local'
  },
  {
    title: 'Amazon',
    description: 'Livro técnico',
    amount: 89.90,
    category: '4', // Educação
    date: new Date(Date.now() - 432000000).toISOString().split('T')[0], // 5 dias atrás
    created_at: new Date(Date.now() - 432000000).toISOString(),
    user_id: 'local'
  }
];

// Hook para adicionar dados de exemplo
export function useSampleData() {
  return {
    expenses: SAMPLE_EXPENSES
  };
}
