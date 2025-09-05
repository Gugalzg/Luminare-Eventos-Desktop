import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { expenseService } from '../services/expenseService'
import type { Expense, Category } from '../types'
import { Edit2, Trash2, Calendar, DollarSign } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ExpenseListProps {
  onEditExpense: (expense: Expense) => void
  refreshTrigger: number
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ onEditExpense, refreshTrigger }) => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    category: '',
    month: format(new Date(), 'yyyy-MM')
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, refreshTrigger, filter])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getExpenses(user.id),
        expenseService.getCategories(user.id)
      ])
      setExpenses(expensesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Tem certeza que deseja excluir este gasto?')) return

    try {
      await expenseService.deleteExpense(id, user.id)
      setExpenses(expenses.filter(expense => expense.id !== id))
    } catch (error) {
      console.error('Erro ao excluir gasto:', error)
    }
  }

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  const filteredExpenses = expenses.filter(expense => {
    const expenseMonth = format(parseISO(expense.date), 'yyyy-MM')
    const matchesMonth = expenseMonth === filter.month
    const matchesCategory = !filter.category || expense.category === filter.category
    return matchesMonth && matchesCategory
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">Carregando gastos...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Seus Gastos</h2>
          <div className="text-lg font-bold text-red-600">
            Total: R$ {totalAmount.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mês
            </label>
            <input
              type="month"
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredExpenses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhum gasto encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y">
            {filteredExpenses.map((expense) => {
              const categoryData = getCategoryData(expense.category)
              return (
                <div key={expense.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {categoryData && (
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: categoryData.color }}
                          >
                            {categoryData.icon}
                          </span>
                        )}
                        <h3 className="font-medium">{expense.title}</h3>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 mb-2">{expense.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(parseISO(expense.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          R$ {expense.amount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-4">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
