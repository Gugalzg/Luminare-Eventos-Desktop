import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { transactionService, categoryService } from '../services/transactionService'

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
  loading: boolean
  error: string | null
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getTotalEntradas: () => number
  getTotalSaidas: () => number
  getLucro: () => number
  getEntradasByCategory: () => Record<string, number>
  getSaidasByCategory: () => Record<string, number>
  refreshData: () => Promise<void>
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do Supabase na inicialização
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Carrega categorias e cria as padrão se necessário
      await categoryService.ensureDefaultCategories()
      const categoriesFromDB = await categoryService.getCategories()
      
      // Carrega transações
      const transactionsFromDB = await transactionService.getTransactions()
      
      // Atualiza o estado local e localStorage
      setCategories(categoriesFromDB)
      setTransactions(transactionsFromDB)
      
      console.log('Dados carregados do Supabase:', {
        transactions: transactionsFromDB.length,
        categories: categoriesFromDB.length
      })
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do servidor')
      
      // Em caso de erro, usa dados do localStorage como fallback
      console.log('Usando dados do localStorage como fallback')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    await loadInitialData()
  }

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    setLoading(true)
    setError(null)
    
    try {
      // Salva no Supabase primeiro
      const newTransaction = await transactionService.createTransaction(transactionData)
      
      if (newTransaction) {
        // Atualiza o estado local
        setTransactions(prev => [newTransaction, ...prev])
        console.log('Transação criada com sucesso:', newTransaction)
      }
    } catch (err) {
      console.error('Erro ao criar transação:', err)
      setError('Erro ao salvar transação')
      
      // Fallback: salva apenas localmente
      const localTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      setTransactions(prev => [localTransaction, ...prev])
      
      throw err // Re-throw para que o componente possa tratar
    } finally {
      setLoading(false)
    }
  }

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    setLoading(true)
    setError(null)
    
    try {
      // Atualiza no Supabase primeiro
      const updatedTransaction = await transactionService.updateTransaction(id, transactionData)
      
      if (updatedTransaction) {
        // Atualiza o estado local
        setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t))
        console.log('Transação atualizada com sucesso:', updatedTransaction)
      }
    } catch (err) {
      console.error('Erro ao atualizar transação:', err)
      setError('Erro ao atualizar transação')
      
      // Fallback: atualiza apenas localmente
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...transactionData } : t))
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Remove do Supabase primeiro
      await transactionService.deleteTransaction(id)
      
      // Remove do estado local
      setTransactions(prev => prev.filter(t => t.id !== id))
      console.log('Transação removida com sucesso:', id)
    } catch (err) {
      console.error('Erro ao remover transação:', err)
      setError('Erro ao remover transação')
      
      // Fallback: remove apenas localmente
      setTransactions(prev => prev.filter(t => t.id !== id))
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    setLoading(true)
    setError(null)
    
    try {
      // Salva no Supabase primeiro
      const newCategory = await categoryService.createCategory(categoryData)
      
      if (newCategory) {
        // Atualiza o estado local
        setCategories(prev => [...prev, newCategory])
        console.log('Categoria criada com sucesso:', newCategory)
      }
    } catch (err) {
      console.error('Erro ao criar categoria:', err)
      setError('Erro ao salvar categoria')
      
      // Fallback: salva apenas localmente
      const localCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      setCategories(prev => [...prev, localCategory])
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    // Implementação similar para categorias (não implementada no serviço ainda)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...categoryData } : c))
  }

  const deleteCategory = async (id: string) => {
    // Implementação similar para categorias (não implementada no serviço ainda)
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
    loading,
    error,
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
    getSaidasByCategory,
    refreshData
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
