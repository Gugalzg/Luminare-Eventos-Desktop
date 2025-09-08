import React, { useMemo } from 'react'
import { useTransactions } from '../../context/TransactionContext'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react'

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
]

const FinancialCharts: React.FC = () => {
  const { transactions } = useTransactions()

  // Dados para gráfico de pizza (transações por categoria no mês atual)
  const currentMonth = new Date()
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date)
      return transactionDate >= startOfMonth(currentMonth) && transactionDate <= endOfMonth(currentMonth)
    })
  }, [transactions, currentMonth])

  const pieData = useMemo(() => {
    const categoryTotals = new Map<string, { name: string; total: number; color?: string }>()
    
    currentMonthTransactions.forEach(transaction => {
      const categoryName = transaction.category || 'Outros'
      const current = categoryTotals.get(categoryName) || { name: categoryName, total: 0 }
      current.total += transaction.amount
      categoryTotals.set(categoryName, current)
    })

    return Array.from(categoryTotals.values())
      .filter(item => item.total > 0)
      .map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
      }))
  }, [currentMonthTransactions])

  // Dados para gráfico de barras (evolução mensal dos últimos 6 meses)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(currentMonth, i)
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = parseISO(transaction.date)
        return transactionDate >= monthStart && transactionDate <= monthEnd
      })

      const entradas = monthTransactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const saidas = monthTransactions
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(date, 'MMM/yyyy', { locale: ptBR }),
        entradas,
        saidas,
        saldo: entradas - saidas
      }
    }).reverse()
  }, [transactions, currentMonth])

  // Dados para gráfico de linha (evolução do saldo)
  const balanceEvolution = useMemo(() => {
    let runningBalance = 0
    return transactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(transaction => {
        runningBalance += transaction.type === 'entrada' ? transaction.amount : -transaction.amount
        return {
          date: format(parseISO(transaction.date), 'dd/MM', { locale: ptBR }),
          saldo: runningBalance,
          amount: transaction.type === 'entrada' ? transaction.amount : -transaction.amount
        }
      })
  }, [transactions])

  // Estatísticas resumidas
  const stats = useMemo(() => {
    const entradas = currentMonthTransactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const saidas = currentMonthTransactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0)

    const saldo = entradas - saidas
    const totalTransactions = currentMonthTransactions.length

    return { entradas, saidas, saldo, totalTransactions }
  }, [currentMonthTransactions])

  const formatCurrency = (value: number) => {
    return `R$ ${Math.abs(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const formatTooltip = (value: number, name: string) => {
    return [formatCurrency(value), name]
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entradas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entradas do Mês</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.entradas)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Saídas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saídas do Mês</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.saidas)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.saldo >= 0 ? '+' : '-'}{formatCurrency(stats.saldo)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stats.saldo >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Total de Transações */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transações</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <PieChartIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Gastos por Categoria */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
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
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Nenhuma transação registrada neste mês
            </div>
          )}
        </div>

        {/* Gráfico de Barras - Evolução Mensal */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Evolução Mensal (Últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar dataKey="entradas" fill="#10B981" name="Entradas" />
              <Bar dataKey="saidas" fill="#EF4444" name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos de Linha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução do Saldo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Evolução do Saldo</h3>
          {balanceEvolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={balanceEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Saldo Acumulado"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Nenhuma transação para mostrar evolução
            </div>
          )}
        </div>

        {/* Gráfico de Área - Fluxo de Caixa */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Fluxo de Caixa Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                name="Saldo Mensal"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumo por Categoria */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          Resumo por Categoria - {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        {pieData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">
                  {formatCurrency(item.total)}
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

export default FinancialCharts
