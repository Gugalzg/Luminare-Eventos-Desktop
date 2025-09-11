import React, { useMemo, useState, useEffect, useRef } from 'react'
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
import './FinancialCharts.css'

// Custom hooks for advanced animations
const useTilt = () => {
  const [tiltStyle, setTiltStyle] = useState({})
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const rotateX = (e.clientY - centerY) / 10
    const rotateY = (centerX - e.clientX) / 10
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`,
      transition: 'none'
    })
  }

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'all 0.5s ease-out'
    })
  }

  return { tiltStyle, handleMouseMove, handleMouseLeave, cardRef }
}

const useCountAnimation = (targetValue: number, duration: number = 1000) => {
  const [currentValue, setCurrentValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const startValue = 0
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      setCurrentValue(Math.floor(startValue + (targetValue - startValue) * easeOut))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [targetValue, duration, isVisible])

  return { currentValue, setIsVisible }
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
]

// Enhanced Card Component with advanced animations
interface EnhancedCardProps {
  children: React.ReactNode
  gradient: string
  className?: string
  delay?: number
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({ children, gradient, className = '', delay = 0 }) => {
  const { tiltStyle, handleMouseMove, handleMouseLeave, cardRef } = useTilt()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      ref={cardRef}
      className={`enhanced-card rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 ${isVisible ? 'fade-in-up' : ''} ${className}`}
      style={{
        background: gradient,
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        ...tiltStyle
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      <div className="card-content relative p-6 text-white">
        {children}
      </div>
    </div>
  )
}

// Animated Number Component
interface AnimatedNumberProps {
  value: number
  formatter?: (value: number) => string
  delay?: number
  className?: string
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  formatter = (v) => v.toString(), 
  delay = 0,
  className = '' 
}) => {
  const { currentValue, setIsVisible } = useCountAnimation(value, 1500)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay, setIsVisible])

  return (
    <span className={`number-display ${className}`}>
      {formatter(currentValue)}
    </span>
  )
}

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
    <div className="space-y-8">
      {/* Cards de Resumo - Layout Horizontal */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        margin: '0 auto',
        padding: '10px',
        maxWidth: '1200px'
      }}>
        {/* Entradas */}
        <div className="card-wrapper">
          <EnhancedCard
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            delay={100}
            className=""
          >
            <div className="card-content-wrapper">
              <div className="card-header">
                <div className="icon-container">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="period-label">
                    Este Mês
                  </div>
                </div>
              </div>
              <div className="card-main-content">
                <h3 className="card-title">
                  <span className="text-lg">💰</span> ENTRADAS
                </h3>
                <div className="card-value-container">
                  <p className="number-display">
                    <AnimatedNumber 
                      value={stats.entradas} 
                      formatter={formatCurrency}
                      delay={200}
                    />
                  </p>
                </div>
                <p className="card-subtitle">
                  Receitas do período
                </p>
              </div>
            </div>
          </EnhancedCard>
        </div>

        {/* Saídas */}
        <div className="card-wrapper">
          <EnhancedCard
            gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            delay={200}
            className=""
          >
            <div className="card-content-wrapper">
              <div className="card-header">
                <div className="icon-container">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="period-label">
                    Este Mês
                  </div>
                </div>
              </div>
              <div className="card-main-content">
                <h3 className="card-title">
                  <span className="text-lg">💸</span> SAÍDAS
                </h3>
                <div className="card-value-container">
                  <p className="number-display">
                    <AnimatedNumber 
                      value={stats.saidas} 
                      formatter={formatCurrency}
                      delay={300}
                    />
                  </p>
                </div>
                <p className="card-subtitle">
                  Despesas do período
                </p>
              </div>
            </div>
          </EnhancedCard>
        </div>

        {/* Saldo */}
        <div className="card-wrapper">
          <EnhancedCard
            gradient={
              stats.saldo >= 0 
                ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            }
            delay={300}
            className=""
          >
            <div className="card-content-wrapper">
              <div className="card-header">
                <div className="icon-container">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="period-label">
                    Este Mês
                  </div>
                </div>
              </div>
              <div className="card-main-content">
                <h3 className="card-title">
                  <span className="text-lg">{stats.saldo >= 0 ? '📈' : '📉'}</span> SALDO
                </h3>
                <div className="card-value-container">
                  <p className="number-display">
                    {stats.saldo >= 0 ? '+' : '-'}
                    <AnimatedNumber 
                      value={Math.abs(stats.saldo)} 
                      formatter={formatCurrency}
                      delay={400}
                    />
                  </p>
                </div>
                <p className="card-subtitle">
                  {stats.saldo >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
                </p>
              </div>
            </div>
          </EnhancedCard>
        </div>

        {/* Total de Transações */}
        <div className="card-wrapper">
          <EnhancedCard
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            delay={400}
            className=""
          >
            <div className="card-content-wrapper">
              <div className="card-header">
                <div className="icon-container">
                  <PieChartIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="period-label">
                    Este Mês
                  </div>
                </div>
              </div>
              <div className="card-main-content">
                <h3 className="card-title">
                  <span className="text-lg">📊</span> TRANSAÇÕES
                </h3>
                <div className="card-value-container">
                  <p className="number-display">
                    <AnimatedNumber 
                      value={stats.totalTransactions} 
                      formatter={(v) => v.toString()}
                      delay={500}
                    />
                  </p>
                </div>
                <p className="card-subtitle">
                  Operações realizadas
                </p>
              </div>
            </div>
          </EnhancedCard>
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
