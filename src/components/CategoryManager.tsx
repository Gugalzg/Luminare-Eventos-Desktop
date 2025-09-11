import React, { useState, useEffect } from 'react'
import { expenseService } from '../services/expenseService'
import type { Category } from '../types'
import { X, Plus, Edit2, Trash2 } from 'lucide-react'

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated?: () => void
}

const defaultCategories = [
  { name: 'Alimentação', color: '#ef4444', icon: '🍽️' },
  { name: 'Transporte', color: '#3b82f6', icon: '🚗' },
  { name: 'Moradia', color: '#10b981', icon: '🏠' },
  { name: 'Saúde', color: '#f59e0b', icon: '⚕️' },
  { name: 'Educação', color: '#8b5cf6', icon: '📚' },
  { name: 'Lazer', color: '#ec4899', icon: '🎮' },
  { name: 'Outros', color: '#6b7280', icon: '📦' },
]

export const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, onCategoryCreated }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6', icon: '📦' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const loadCategories = async () => {
    try {
      const data = await expenseService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleCreateDefaultCategories = async () => {
    setLoading(true)
    try {
      for (const category of defaultCategories) {
        await expenseService.createCategory(category)
      }
      await loadCategories()
      onCategoryCreated?.()
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      if (editingCategory) {
        await expenseService.updateCategory(editingCategory.id, formData)
      } else {
        await expenseService.createCategory(formData)
      }
      await loadCategories()
      onCategoryCreated?.()
      setIsCreating(false)
      setEditingCategory(null)
      setFormData({ name: '', color: '#3b82f6', icon: '📦' })
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    })
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      await expenseService.deleteCategory(id)
      await loadCategories()
      onCategoryCreated?.()
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
    }
  }

  const cancelEditing = () => {
    setIsCreating(false)
    setEditingCategory(null)
    setFormData({ name: '', color: '#3b82f6', icon: '📦' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gerenciar Categorias</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {categories.length === 0 && !isCreating && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhuma categoria encontrada</p>
            <button
              onClick={handleCreateDefaultCategories}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Categorias Padrão'}
            </button>
          </div>
        )}

        {!isCreating && categories.length > 0 && (
          <div className="space-y-2 mb-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </span>
                  <span>{category.name}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Categoria</span>
          </button>
        )}

        {isCreating && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da categoria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ícone (emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="📦"
                maxLength={2}
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (editingCategory ? 'Atualizar' : 'Criar')}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
