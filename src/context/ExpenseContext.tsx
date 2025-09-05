import { createContext, useContext, type ReactNode } from 'react';
import type { Expense, Category } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Tipos para o contexto
interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getExpensesByCategory: (categoryId: string) => Expense[];
  getTotalAmount: () => number;
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];
}

// Contexto
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Categorias padrão
const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'Alimentação', 
    color: '#ef4444', 
    icon: 'utensils',
    created_at: new Date().toISOString(),
    user_id: 'local'
  },
  { 
    id: '2', 
    name: 'Transporte', 
    color: '#3b82f6', 
    icon: 'car',
    created_at: new Date().toISOString(),
    user_id: 'local'
  },
  { 
    id: '3', 
    name: 'Saúde', 
    color: '#10b981', 
    icon: 'heart',
    created_at: new Date().toISOString(),
    user_id: 'local'
  },
  { 
    id: '4', 
    name: 'Educação', 
    color: '#8b5cf6', 
    icon: 'book',
    created_at: new Date().toISOString(),
    user_id: 'local'
  },
  { 
    id: '5', 
    name: 'Lazer', 
    color: '#f59e0b', 
    icon: 'gamepad-2',
    created_at: new Date().toISOString(),
    user_id: 'local'
  },
  { 
    id: '6', 
    name: 'Casa', 
    color: '#06b6d4', 
    icon: 'home',
    created_at: new Date().toISOString(),
    user_id: 'local'
  },
  { 
    id: '7', 
    name: 'Roupas', 
    color: '#ec4899', 
    icon: 'shirt',
    created_at: new Date().toISOString(),
    user_id: 'local'
  },
  { 
    id: '8', 
    name: 'Outros', 
    color: '#6b7280', 
    icon: 'more-horizontal',
    created_at: new Date().toISOString(),
    user_id: 'local'
  }
];

// Provider Component
export function ExpenseProvider({ children }: { children: ReactNode }) {
  // Estado persistente
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES);

  // Funções para gastos
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, ...updatedExpense } : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Funções para categorias
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updatedCategory: Partial<Category>) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === id ? { ...category, ...updatedCategory } : category
      )
    );
  };

  const deleteCategory = (id: string) => {
    // Não permite deletar categoria se houver gastos associados
    const hasExpenses = expenses.some(expense => expense.category === id);
    if (hasExpenses) {
      throw new Error('Não é possível deletar uma categoria que possui gastos associados.');
    }
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  // Funções utilitárias
  const getExpensesByCategory = (categoryId: string) => {
    return expenses.filter(expense => expense.category === categoryId);
  };

  const getTotalAmount = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByDateRange = (startDate: Date, endDate: Date) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const contextValue: ExpenseContextType = {
    expenses,
    categories,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    getExpensesByCategory,
    getTotalAmount,
    getExpensesByDateRange,
  };

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenseContext deve ser usado dentro de um ExpenseProvider');
  }
  return context;
}

// Hooks específicos para diferentes funcionalidades
export function useExpenses() {
  const { 
    expenses, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    getExpensesByCategory,
    getTotalAmount,
    getExpensesByDateRange 
  } = useExpenseContext();

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByCategory,
    getTotalAmount,
    getExpensesByDateRange,
  };
}

export function useCategories() {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useExpenseContext();

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
