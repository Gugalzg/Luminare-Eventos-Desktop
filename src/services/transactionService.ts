import { supabase } from '../lib/supabase'
import type { Transaction, Category } from '../context/TransactionContext'

// Serviço para gerenciar transações no Supabase
export const transactionService = {
  // Buscar todas as transações
  async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar transações:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro inesperado ao buscar transações:', error)
      return []
    }
  },

  // Criar nova transação
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          title: transaction.title,
          description: transaction.description || null,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar transação:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Erro inesperado ao criar transação:', error)
      throw error
    }
  },

  // Atualizar transação
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          title: updates.title,
          description: updates.description,
          amount: updates.amount,
          type: updates.type,
          category: updates.category,
          date: updates.date
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar transação:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Erro inesperado ao atualizar transação:', error)
      throw error
    }
  },

  // Deletar transação
  async deleteTransaction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar transação:', error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Erro inesperado ao deletar transação:', error)
      throw error
    }
  }
}

// Serviço para gerenciar categorias no Supabase
export const categoryService = {
  // Buscar todas as categorias
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Erro ao buscar categorias:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro inesperado ao buscar categorias:', error)
      return []
    }
  },

  // Criar nova categoria
  async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar categoria:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Erro inesperado ao criar categoria:', error)
      throw error
    }
  },

  // Criar categorias padrão se não existirem
  async ensureDefaultCategories(): Promise<void> {
    try {
      const existingCategories = await this.getCategories()
      
      // Se já existem categorias, não faz nada
      if (existingCategories.length > 0) {
        return
      }

      const defaultCategories = [
        // Entradas (Receitas)
        { name: 'Mini-Festa', type: 'entrada' as const, color: '#10b981', icon: 'MdCelebration' },
        { name: 'Pegue e Monte', type: 'entrada' as const, color: '#06d6a0', icon: 'MdBuildCircle' },
        { name: 'Kit Mêsversário', type: 'entrada' as const, color: '#14b8a6', icon: 'MdCake' },
        
        // Saídas (Custos)
        { name: 'Arco Redondo', type: 'saida' as const, color: '#ef4444', icon: 'MdArchitecture' },
        { name: 'Arco Romano', type: 'saida' as const, color: '#dc2626', icon: 'MdAccountBalance' },
        { name: 'Bandejas', type: 'saida' as const, color: '#f97316', icon: 'MdDining' },
        { name: 'Capa Cilindro', type: 'saida' as const, color: '#ea580c', icon: 'MdExtension' },
      ]

      // Cria todas as categorias padrão
      for (const category of defaultCategories) {
        await this.createCategory(category)
      }

      console.log('Categorias padrão criadas com sucesso!')
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error)
    }
  }
}
