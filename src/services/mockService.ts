// Mock service for development - remove when Supabase is configured
export const mockExpenseService = {
  // Mock data
  mockCategories: [
    { id: '1', name: 'Alimentação', color: '#ef4444', icon: '🍽️', created_at: new Date().toISOString(), user_id: 'mock-user' },
    { id: '2', name: 'Transporte', color: '#3b82f6', icon: '🚗', created_at: new Date().toISOString(), user_id: 'mock-user' },
    { id: '3', name: 'Moradia', color: '#10b981', icon: '🏠', created_at: new Date().toISOString(), user_id: 'mock-user' },
    { id: '4', name: 'Lazer', color: '#ec4899', icon: '🎮', created_at: new Date().toISOString(), user_id: 'mock-user' },
  ],

  mockExpenses: [
    {
      id: '1',
      title: 'Almoço no restaurante',
      description: 'Almoço de negócios',
      amount: 45.50,
      category: '1',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    },
    {
      id: '2',
      title: 'Combustível',
      description: 'Abastecimento do carro',
      amount: 120.00,
      category: '2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    },
    {
      id: '3',
      title: 'Cinema',
      description: 'Ingresso do filme',
      amount: 28.00,
      category: '4',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    }
  ],

  // Mock methods
  async getExpenses() {
    return Promise.resolve(this.mockExpenses)
  },

  async getCategories() {
    return Promise.resolve(this.mockCategories)
  },

  async createExpense(expense: any) {
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    }
    this.mockExpenses.unshift(newExpense)
    return Promise.resolve(newExpense)
  },

  async updateExpense(id: string, expense: any) {
    const index = this.mockExpenses.findIndex(e => e.id === id)
    if (index !== -1) {
      this.mockExpenses[index] = { ...this.mockExpenses[index], ...expense }
      return Promise.resolve(this.mockExpenses[index])
    }
    throw new Error('Expense not found')
  },

  async deleteExpense(id: string) {
    const index = this.mockExpenses.findIndex(e => e.id === id)
    if (index !== -1) {
      this.mockExpenses.splice(index, 1)
    }
    return Promise.resolve()
  },

  async createCategory(category: any) {
    const newCategory = {
      id: Date.now().toString(),
      ...category,
      created_at: new Date().toISOString(),
      user_id: 'mock-user'
    }
    this.mockCategories.push(newCategory)
    return Promise.resolve(newCategory)
  },

  async updateCategory(id: string, category: any) {
    const index = this.mockCategories.findIndex(c => c.id === id)
    if (index !== -1) {
      this.mockCategories[index] = { ...this.mockCategories[index], ...category }
      return Promise.resolve(this.mockCategories[index])
    }
    throw new Error('Category not found')
  },

  async deleteCategory(id: string) {
    const index = this.mockCategories.findIndex(c => c.id === id)
    if (index !== -1) {
      this.mockCategories.splice(index, 1)
    }
    return Promise.resolve()
  },

  async getExpensesByDateRange() {
    return Promise.resolve(this.mockExpenses)
  },

  async getTotalByCategory() {
    const totals: { [key: string]: number } = {}
    this.mockExpenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount
    })
    return Promise.resolve(Object.entries(totals).map(([category, total]) => ({ category, total })))
  }
}
