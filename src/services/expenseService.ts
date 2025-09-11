import { supabase } from '../lib/supabase'
import { mockExpenseService } from './mockService'
import type { Expense, Category, ExpenseFormData, CategoryFormData } from '../types'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const supabaseUrl = 'YOUR_SUPABASE_URL'
  const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
  return supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY'
}

// Main expense service that switches between real and mock data
export const expenseService = {
  // Expenses CRUD
  async getExpenses(): Promise<Expense[]> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.getExpenses()
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createExpense(expense: ExpenseFormData): Promise<Expense> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.createExpense(expense)
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateExpense(id: string, expense: Partial<ExpenseFormData>): Promise<Expense> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.updateExpense(id, expense)
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteExpense(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.deleteExpense(id)
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Categories CRUD
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.getCategories()
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async createCategory(category: CategoryFormData): Promise<Category> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.createCategory(category)
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCategory(id: string, category: Partial<CategoryFormData>): Promise<Category> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.updateCategory(id, category)
    }

    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCategory(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.deleteCategory(id)
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Analytics
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.getExpensesByDateRange()
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getTotalByCategory(startDate?: string, endDate?: string): Promise<{ category: string; total: number }[]> {
    if (!isSupabaseConfigured()) {
      return mockExpenseService.getTotalByCategory()
    }

    let query = supabase
      .from('expenses')
      .select('category, amount')

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query

    if (error) throw error

    // Group by category
    const categoryTotals: { [key: string]: number } = {}
    data?.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })

    return Object.entries(categoryTotals).map(([category, total]) => ({ category, total }))
  }
}
