export interface Expense {
  id: string
  title: string
  description?: string
  amount: number
  category: string
  date: string
  created_at: string
  user_id: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  created_at: string
  user_id: string
}

export interface ExpenseWithCategory extends Expense {
  category_data?: Category
}

export interface ExpenseFormData {
  title: string
  description?: string
  amount: number
  category: string
  date: string
}

export interface CategoryFormData {
  name: string
  color: string
  icon: string
}

export interface MonthlyExpense {
  month: string
  total: number
  expenses: Expense[]
}

export interface CategoryExpense {
  category: string
  total: number
  color: string
  expenses: Expense[]
}
