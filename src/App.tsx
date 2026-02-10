import { useState } from 'react'
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar'
import { MdAttachMoney, MdBarChart, MdSettings, MdMenu, MdTrendingUp, MdTrendingDown } from 'react-icons/md'
import { TransactionProvider, useTransactions } from './context/TransactionContext'
import TransactionForm from './components/Forms/TransactionForm'
import TransactionList from './components/Forms/TransactionList'
import FinancialCharts from './components/Charts/FinancialCharts'
import Modal from './components/UI/Modal'
import SidebarLogo from './components/Sidebar/SidebarLogo'
import SettingsPage from './components/Settings/SettingsPage'
import type { TransactionFormData } from './components/Forms/TransactionForm'
import './App.css'

type Page = 'dashboard' | 'transactions' | 'charts' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('transactions')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return <FilteredTransactions />
      case 'charts':
        return <FinancialCharts />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <TransactionProvider>
      <div className="app-container" style={{ display: 'flex', height: '100vh' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          width="280px"
          collapsedWidth="80px"
          backgroundColor="#212038"
          rootStyles={{
            color: '#FFFFFF'
          }}
        >
          {/* Header do Sidebar com Logo */}
          <SidebarLogo collapsed={sidebarCollapsed} />
          
          {/* Menu Items */}
          <Menu
            menuItemStyles={{
              button: ({ active }) => ({
                backgroundColor: active ? '#3a3a5c' : 'transparent',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#3a3a5c'
                }
              })
            }}
          >
               
            <MenuItem
              icon={<MdAttachMoney />}
              onClick={() => setCurrentPage('transactions')}
              active={currentPage === 'transactions'}
            >
              Transações
            </MenuItem>
            
            <MenuItem
              icon={<MdBarChart />}
              onClick={() => setCurrentPage('charts')}
              active={currentPage === 'charts'}
            >
              Relatórios
            </MenuItem>
            
            <MenuItem
              icon={<MdSettings />}
              onClick={() => setCurrentPage('settings')}
              active={currentPage === 'settings'}
            >
              Configurações
            </MenuItem>
          </Menu>
        </Sidebar>

        <div className="main-content" style={{ 
          flex: 1,
          padding: '20px',
          backgroundColor: '#f5f5f5',
          overflow: 'auto'
        }}>
          <AppContent 
            currentPage={currentPage}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
          {renderPage()}
        </div>
      </div>
    </TransactionProvider>
  )
}

function AppContent({ 
  currentPage, 
  sidebarCollapsed, 
  setSidebarCollapsed 
}: {
  currentPage: Page
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}) {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard'
      case 'transactions': return 'Gestão de Transações'
      case 'charts': return 'Relatórios Financeiros'
      case 'settings': return 'Configurações'
      default: return 'Dashboard'
    }
  }

  return (
    <div className="page-header" style={{ marginBottom: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>{getPageTitle()}</h1>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            background: '#212038',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <MdMenu />
          {sidebarCollapsed ? 'Expandir' : 'Recolher'}
        </button>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="dashboard">
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Resumo Financeiro</h3>
          <FinancialCharts />
        </div>
      </div>
    </div>
  )
}

function FilteredTransactions() {
  const { addTransaction, updateTransaction } = useTransactions()
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [transactionType, setTransactionType] = useState<'entrada' | 'saida' | null>(null)

  const handleAddEntrada = () => {
    setEditingTransaction(null)
    setTransactionType('entrada')
    setShowForm(true)
  }

  const handleAddSaida = () => {
    setEditingTransaction(null)
    setTransactionType('saida')
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTransaction(null)
    setTransactionType(null)
  }

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      if (editingTransaction) {
        // Editando transação existente
        await updateTransaction(editingTransaction.id, data)
        console.log('Transação atualizada:', data)
      } else {
        // Criando nova transação
        await addTransaction({
          title: data.title,
          description: data.description,
          amount: data.amount,
          type: data.type,
          category: data.category,
          date: data.date
        })
        console.log('Nova transação criada:', data)
      }
      handleCloseForm()
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      // A mensagem de erro já é tratada no contexto
    }
  }

  return (
    <div className="transactions-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Seção de Ações Rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
      }}>
        {/* Botão Nova Entrada */}
        <button
          onClick={handleAddEntrada}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(16,185,129,0.2)'
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          }}>
            <MdTrendingUp size={26} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#065f46', marginBottom: '2px' }}>Nova Entrada</div>
            <div style={{ fontSize: '13px', color: '#047857', opacity: 0.7 }}>Registrar receita</div>
          </div>
        </button>

        {/* Botão Nova Saída */}
        <button
          onClick={handleAddSaida}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(239,68,68,0.2)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          }}>
            <MdTrendingDown size={26} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#991b1b', marginBottom: '2px' }}>Nova Saída</div>
            <div style={{ fontSize: '13px', color: '#b91c1c', opacity: 0.7 }}>Registrar despesa</div>
          </div>
        </button>
      </div>

      {/* Modal do Formulário */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={transactionType === 'entrada' ? 'Nova Entrada' : 'Nova Saída'}
        subtitle={transactionType === 'entrada' ? 'Registrar uma nova receita' : 'Registrar uma nova despesa'}
        variant={transactionType === 'entrada' ? 'entrada' : 'saida'}
        icon={transactionType === 'entrada' ? <MdTrendingUp size={24} color="#fff" /> : <MdTrendingDown size={24} color="#fff" />}
        size="lg"
      >
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          initialType={transactionType || undefined}
        />
      </Modal>

      {/* Lista de Transações */}
      <TransactionList />
    </div>
  )
}

function Settings() {
  return <SettingsPage />
}

export default App