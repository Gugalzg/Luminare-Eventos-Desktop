import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

// Tipos para o sistema financeiro
export interface Transaction {
  id: string
  title: string
  description?: string
  amount: number
  type: 'entrada' | 'saida'
  category: string
  date: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: 'entrada' | 'saida'
  color: string
  icon: string
  created_at: string
}

interface TransactionContextType {
  transactions: Transaction[]
  categories: Category[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  getTotalEntradas: () => number
  getTotalSaidas: () => number
  getLucro: () => number
  getEntradasByCategory: () => Record<string, number>
  getSaidasByCategory: () => Record<string, number>
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

// Hook personalizado para localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}

// Categorias padrão do Luminare Eventos
const DEFAULT_CATEGORIES: Category[] = [
  // Entradas (Receitas)
  { id: '1', name: 'Mini-Festa', type: 'entrada', color: '#10b981', icon: 'MdCelebration', created_at: new Date().toISOString() },
  { id: '2', name: 'Pegue e Monte', type: 'entrada', color: '#06d6a0', icon: 'MdBuildCircle', created_at: new Date().toISOString() },
  { id: '3', name: 'Kit Mêsversário', type: 'entrada', color: '#14b8a6', icon: 'MdCake', created_at: new Date().toISOString() },
  
  // Saídas (Custos)
  { id: '4', name: 'Arco Redondo', type: 'saida', color: '#ef4444', icon: 'MdArchitecture', created_at: new Date().toISOString() },
  { id: '5', name: 'Arco Romano', type: 'saida', color: '#dc2626', icon: 'MdAccountBalance', created_at: new Date().toISOString() },
  { id: '6', name: 'Bandejas', type: 'saida', color: '#f97316', icon: 'MdDining', created_at: new Date().toISOString() },
  { id: '7', name: 'Capa Cilindro', type: 'saida', color: '#ea580c', icon: 'MdExtension', created_at: new Date().toISOString() },
]

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('luminare-transactions', [])
  const [categories, setCategories] = useLocalStorage<Category[]>('luminare-categories', DEFAULT_CATEGORIES)

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    }
    setTransactions(prev => [...prev, newTransaction])
  }

  const updateTransaction = (id: string, transactionData: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...transactionData } : t))
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const addCategory = (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    }
    setCategories(prev => [...prev, newCategory])
  }

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...categoryData } : c))
  }

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const getTotalEntradas = () => {
    return transactions
      .filter(t => t.type === 'entrada')
      .reduce((total, t) => total + t.amount, 0)
  }

  const getTotalSaidas = () => {
    return transactions
      .filter(t => t.type === 'saida')
      .reduce((total, t) => total + t.amount, 0)
  }

  const getLucro = () => {
    return getTotalEntradas() - getTotalSaidas()
  }

  const getEntradasByCategory = () => {
    const entradas = transactions.filter(t => t.type === 'entrada')
    return entradas.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
  }

  const getSaidasByCategory = () => {
    const saidas = transactions.filter(t => t.type === 'saida')
    return saidas.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
  }

  const value: TransactionContextType = {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    getTotalEntradas,
    getTotalSaidas,
    getLucro,
    getEntradasByCategory,
    getSaidasByCategory
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionProvider')
  }
  return context
}

export function useCategories() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useCategories deve ser usado dentro de um TransactionProvider')
  }
  return context
}
