import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { expenseService } from '../services/expenseService'
import type { Expense, Category } from '../types'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

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

  // Dados para gráfico de pizza (gastos por categoria no mês atual)
  const currentMonth = new Date()
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = parseISO(expense.date)
    return expenseDate >= startOfMonth(currentMonth) && expenseDate <= endOfMonth(currentMonth)
  })

  const pieData = categories.map(category => {
    const categoryExpenses = currentMonthExpenses.filter(expense => expense.category === category.id)
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    return {
      name: category.name,
      value: total,
      color: category.color,
      icon: category.icon
    }
  }).filter(item => item.value > 0)

  // Dados para gráfico de barras (gastos dos últimos 6 meses)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(currentMonth, i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = parseISO(expense.date)
      return expenseDate >= monthStart && expenseDate <= monthEnd
    })

    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    return {
      month: format(date, 'MMM/yyyy', { locale: ptBR }),
      total: total,
      count: monthExpenses.length
    }
  }).reverse()

  // Estatísticas gerais
  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const lastMonth = subMonths(currentMonth, 1)
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = parseISO(expense.date)
    return expenseDate >= startOfMonth(lastMonth) && expenseDate <= endOfMonth(lastMonth)
  })
  const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const monthlyChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0

  const totalExpenses = expenses.length
  const avgExpenseValue = expenses.length > 0 ? expenses.reduce((sum, expense) => sum + expense.amount, 0) / expenses.length : 0

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">Carregando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gasto do Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {currentMonthTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          {monthlyChange !== 0 && (
            <div className="mt-2 flex items-center">
              {monthlyChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm ${monthlyChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.abs(monthlyChange).toFixed(1)}% em relação ao mês passado
              </span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Gastos</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpenses}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {avgExpenseValue.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Gastos por categoria */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Gastos por Categoria - {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Nenhum gasto registrado neste mês
            </div>
          )}
        </div>

        {/* Gráfico de Barras - Evolução mensal */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Evolução dos Gastos (Últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de categorias com totais */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Resumo por Categoria - Mês Atual</h3>
        {pieData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">
                  R$ {item.value.toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Nenhum gasto registrado neste mês
          </div>
        )}
      </div>
    </div>
  )
}
