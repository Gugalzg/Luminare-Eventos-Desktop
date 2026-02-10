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
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react'
import { MdCalendarToday } from 'react-icons/md'
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
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  const goToPreviousMonth = () => setSelectedMonth(prev => subMonths(prev, 1))
  const goToNextMonth = () => setSelectedMonth(prev => addMonths(prev, 1))
  const goToCurrentMonth = () => setSelectedMonth(new Date())

  // Dados para gráfico de pizza (transações por categoria do mês selecionado)
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date)
      return transactionDate >= startOfMonth(selectedMonth) && transactionDate <= endOfMonth(selectedMonth)
    })
  }, [transactions, selectedMonth])

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
      const date = subMonths(selectedMonth, i)
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
  }, [transactions, selectedMonth])

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

  // Estatísticas resumidas do MÊS ATUAL
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

  // Estatísticas TOTAIS (todas as transações)
  const totalStats = useMemo(() => {
    const entradas = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const saidas = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0)

    const saldo = entradas - saidas
    const totalTransactions = transactions.length
    const entradasCount = transactions.filter(t => t.type === 'entrada').length
    const saidasCount = transactions.filter(t => t.type === 'saida').length

    return { entradas, saidas, saldo, totalTransactions, entradasCount, saidasCount }
  }, [transactions])

  // Dados de categorias separados por tipo (para o Resumo por Categoria)
  const categoryByType = useMemo(() => {
    const entradasMap = new Map<string, number>()
    const saidasMap = new Map<string, number>()

    currentMonthTransactions.forEach(t => {
      const map = t.type === 'entrada' ? entradasMap : saidasMap
      map.set(t.category, (map.get(t.category) || 0) + t.amount)
    })

    const toSorted = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)

    return {
      entradas: toSorted(entradasMap),
      saidas: toSorted(saidasMap),
      maxEntrada: Math.max(...Array.from(entradasMap.values()), 0),
      maxSaida: Math.max(...Array.from(saidasMap.values()), 0),
    }
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
      {/* ===== SEÇÃO: RESUMO GERAL (TOTAIS) ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        borderRadius: '20px',
        padding: '32px 24px',
        boxShadow: '0 10px 40px rgba(30, 27, 75, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            color: '#e0e7ff',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            📊 Resumo Geral
          </h2>
          <p style={{
            color: 'rgba(199, 210, 254, 0.6)',
            fontSize: '13px',
            marginBottom: '28px',
          }}>
            Todas as transações • {totalStats.totalTransactions} operações registradas
          </p>

          {/* Cards de Totais Gerais */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            {/* Total Entradas */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '16px',
              padding: '20px 24px',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.2)'
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#6ee7b7', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Total Entradas
                </span>
                <div style={{
                  background: 'rgba(16,185,129,0.2)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <TrendingUp style={{ width: '14px', height: '14px', color: '#34d399' }} />
                  <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 600 }}>{totalStats.entradasCount}</span>
                </div>
              </div>
              <p style={{
                color: '#6ee7b7',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: 0,
                textShadow: '0 0 30px rgba(16,185,129,0.3)',
              }}>
                <AnimatedNumber value={totalStats.entradas} formatter={formatCurrency} delay={100} />
              </p>
            </div>

            {/* Total Saídas */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '16px',
              padding: '20px 24px',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(239,68,68,0.2)'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#fca5a5', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Total Saídas
                </span>
                <div style={{
                  background: 'rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <TrendingDown style={{ width: '14px', height: '14px', color: '#f87171' }} />
                  <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 600 }}>{totalStats.saidasCount}</span>
                </div>
              </div>
              <p style={{
                color: '#fca5a5',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: 0,
                textShadow: '0 0 30px rgba(239,68,68,0.3)',
              }}>
                <AnimatedNumber value={totalStats.saidas} formatter={formatCurrency} delay={200} />
              </p>
            </div>

            {/* Saldo Total */}
            <div style={{
              background: totalStats.saldo >= 0
                ? 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(124,58,237,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.08) 100%)',
              border: `1px solid ${totalStats.saldo >= 0 ? 'rgba(139,92,246,0.25)' : 'rgba(245,158,11,0.25)'}`,
              borderRadius: '16px',
              padding: '20px 24px',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              const color = totalStats.saldo >= 0 ? '139,92,246' : '245,158,11'
              e.currentTarget.style.boxShadow = `0 8px 25px rgba(${color},0.2)`
              e.currentTarget.style.borderColor = `rgba(${color},0.5)`
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              const color = totalStats.saldo >= 0 ? '139,92,246' : '245,158,11'
              e.currentTarget.style.borderColor = `rgba(${color},0.25)`
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{
                  color: totalStats.saldo >= 0 ? '#c4b5fd' : '#fcd34d',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  Saldo Geral
                </span>
                <div style={{
                  background: totalStats.saldo >= 0 ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.2)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <DollarSign style={{ width: '14px', height: '14px', color: totalStats.saldo >= 0 ? '#a78bfa' : '#fbbf24' }} />
                  <span style={{
                    color: totalStats.saldo >= 0 ? '#a78bfa' : '#fbbf24',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>
                    {totalStats.saldo >= 0 ? 'Positivo' : 'Negativo'}
                  </span>
                </div>
              </div>
              <p style={{
                color: totalStats.saldo >= 0 ? '#c4b5fd' : '#fcd34d',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: 0,
                textShadow: `0 0 30px ${totalStats.saldo >= 0 ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}>
                {totalStats.saldo >= 0 ? '+' : '-'}
                <AnimatedNumber value={Math.abs(totalStats.saldo)} formatter={formatCurrency} delay={300} />
              </p>
            </div>
          </div>

          {/* Barra de proporção Entradas vs Saídas */}
          {totalStats.entradas + totalStats.saidas > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6ee7b7', fontSize: '12px', fontWeight: 500 }}>
                  Entradas {((totalStats.entradas / (totalStats.entradas + totalStats.saidas)) * 100).toFixed(1)}%
                </span>
                <span style={{ color: '#fca5a5', fontSize: '12px', fontWeight: 500 }}>
                  Saídas {((totalStats.saidas / (totalStats.entradas + totalStats.saidas)) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
                display: 'flex',
              }}>
                <div style={{
                  width: `${(totalStats.entradas / (totalStats.entradas + totalStats.saidas)) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  borderRadius: '4px 0 0 4px',
                  transition: 'width 1s ease',
                }} />
                <div style={{
                  width: `${(totalStats.saidas / (totalStats.entradas + totalStats.saidas)) * 100}%`,
                  background: 'linear-gradient(90deg, #ef4444, #f87171)',
                  borderRadius: '0 4px 4px 0',
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== SEÇÃO: RESUMO MENSAL (Cards existentes) ===== */}
      <div>
        {/* Seletor de Mês */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '0 10px',
        }}>
          <h2 style={{
            color: '#374151',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            📅 {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isCurrentMonth && (
              <button
                onClick={goToCurrentMonth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#6366f1' }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
              >
                <MdCalendarToday size={14} />
                Mês Atual
              </button>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
            }}>
              <button
                onClick={goToPreviousMonth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: 1,
                  borderRadius: '12px 0 0 12px',
                  padding: 0,
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
                title="Mês anterior"
              >
                ‹
              </button>

              <span style={{
                padding: '0 12px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1e293b',
                minWidth: '120px',
                textAlign: 'center',
                textTransform: 'capitalize',
                borderLeft: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0',
                lineHeight: '36px',
              }}>
                {format(selectedMonth, 'MMM yyyy', { locale: ptBR })}
              </span>

              <button
                onClick={goToNextMonth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: 1,
                  borderRadius: '0 12px 12px 0',
                  padding: 0,
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
                title="Próximo mês"
              >
                ›
              </button>
            </div>
          </div>
        </div>
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
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Gastos por Categoria */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">
            Gastos por Categoria - {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
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
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
              Resumo por Categoria
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })} • {currentMonthTransactions.length} transações
            </p>
          </div>
          <div style={{
            background: '#f1f5f9',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
          }}>
            <PieChartIcon style={{ width: 14, height: 14, display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            Por Tipo
          </div>
        </div>

        {categoryByType.entradas.length + categoryByType.saidas.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '200px' }}>
            {/* Coluna Entradas */}
            <div style={{ padding: '24px 28px', borderRight: '1px solid #f1f5f9' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px rgba(16,185,129,0.4)',
                }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Entradas
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>
                  {categoryByType.entradas.length} {categoryByType.entradas.length === 1 ? 'categoria' : 'categorias'}
                </span>
              </div>

              {categoryByType.entradas.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {categoryByType.entradas.map((item, i) => (
                    <div key={item.name} style={{ opacity: 0, animation: `fadeInUp 0.4s ease ${i * 0.08}s forwards` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{item.name}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>{formatCurrency(item.total)}</span>
                      </div>
                      <div style={{
                        height: '6px',
                        borderRadius: '3px',
                        background: '#f1f5f9',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          borderRadius: '3px',
                          background: 'linear-gradient(90deg, #10b981, #34d399)',
                          width: `${categoryByType.maxEntrada > 0 ? (item.total / categoryByType.maxEntrada) * 100 : 0}%`,
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: '#cbd5e1', fontSize: '13px' }}>
                  Nenhuma entrada neste mês
                </div>
              )}
            </div>

            {/* Coluna Saídas */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 8px rgba(239,68,68,0.4)',
                }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Saídas
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>
                  {categoryByType.saidas.length} {categoryByType.saidas.length === 1 ? 'categoria' : 'categorias'}
                </span>
              </div>

              {categoryByType.saidas.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {categoryByType.saidas.map((item, i) => (
                    <div key={item.name} style={{ opacity: 0, animation: `fadeInUp 0.4s ease ${i * 0.08}s forwards` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{item.name}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626' }}>{formatCurrency(item.total)}</span>
                      </div>
                      <div style={{
                        height: '6px',
                        borderRadius: '3px',
                        background: '#f1f5f9',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          borderRadius: '3px',
                          background: 'linear-gradient(90deg, #ef4444, #f87171)',
                          width: `${categoryByType.maxSaida > 0 ? (item.total / categoryByType.maxSaida) * 100 : 0}%`,
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: '#cbd5e1', fontSize: '13px' }}>
                  Nenhuma saída neste mês
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            color: '#94a3b8',
          }}>
            <PieChartIcon style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.4 }} />
            <span style={{ fontSize: '14px' }}>Nenhuma transação registrada neste mês</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinancialCharts
