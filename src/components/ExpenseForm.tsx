import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { expenseService } from '../services/expenseService'
import type { Category, ExpenseFormData, Expense } from '../types'
import { X, CalendarDays, DollarSign, FileText, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface ExpenseFormProps {
  isOpen: boolean
  onClose: () => void
  onExpenseCreated: () => void
  expense?: Expense | null
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onExpenseCreated,
  expense
}) => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    description: '',
    amount: 0,
    category: '',
    date: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    if (isOpen && user) {
      loadCategories()
      if (expense) {
        setFormData({
          title: expense.title,
          description: expense.description || '',
          amount: expense.amount,
          category: expense.category,
          date: format(new Date(expense.date), 'yyyy-MM-dd')
        })
      } else {
        setFormData({
          title: '',
          description: '',
          amount: 0,
          category: '',
          date: format(new Date(), 'yyyy-MM-dd')
        })
      }
    }
  }, [isOpen, user, expense])

  const loadCategories = async () => {
    if (!user) return
    try {
      const data = await expenseService.getCategories(user.id)
      setCategories(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      if (expense) {
        await expenseService.updateExpense(expense.id, formData, user.id)
      } else {
        await expenseService.createExpense(formData, user.id)
      }
      onExpenseCreated()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar gasto:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {expense ? 'Editar Gasto' : 'Novo Gasto'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Almoço no restaurante"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalhes adicionais..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Valor (R$)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="inline h-4 w-4 mr-1" />
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarDays className="inline h-4 w-4 mr-1" />
              Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (expense ? 'Atualizar' : 'Criar Gasto')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
