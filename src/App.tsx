import { useState } from 'react'
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar'
import { MdAttachMoney, MdBarChart, MdSettings, MdMenu, MdTrendingUp, MdTrendingDown } from 'react-icons/md'
import { TransactionProvider, useTransactions } from './context/TransactionContext'
import TransactionForm from './components/Forms/TransactionForm'
import TransactionList from './components/Forms/TransactionList'
import FinancialCharts from './components/Charts/FinancialCharts'
import Modal from './components/UI/Modal'
import type { TransactionFormData } from './components/Forms/TransactionForm'
import './App.css'

type Page = 'dashboard' | 'transactions' | 'charts' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
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
          {/* Header do Sidebar */}
          <div style={{ 
            padding: '20px',
            textAlign: 'center',
            borderBottom: '1px solid #3a3a5c',
            backgroundColor: '#212038'
          }}>
            <h2 style={{ 
              color: '#FFFFFF',
              margin: 0,
              fontSize: sidebarCollapsed ? '14px' : '18px',
              fontWeight: 'bold'
            }}>
              {sidebarCollapsed ? 'LE' : 'Luminare Eventos'}
            </h2>
          </div>
          
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

  const handleSubmit = (data: TransactionFormData) => {
    try {
      if (editingTransaction) {
        // Editando transação existente
        updateTransaction(editingTransaction.id, data)
        console.log('Transação atualizada:', data)
      } else {
        // Criando nova transação
        addTransaction({
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
    }
  }

  return (
    <div className="transactions-page">
      {/* Seção de Controle de Entradas e Saídas */}
      <div style={{ 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          color: '#333', 
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Controle de Entradas e Saídas
        </h3>
        
        {/* Container de Botões com Layout Responsivo */}
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          {/* Botão Adicionar Entrada */}
          <button
            onClick={handleAddEntrada}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              padding: '20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.3s ease',
              minWidth: '220px',
              flex: '1 1 300px',
              maxWidth: '400px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.35)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}
          >
            <MdTrendingUp size={28} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>Nova Entrada</div>
              <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '400' }}>Receitas e ganhos</div>
            </div>
          </button>

          {/* Botão Adicionar Saída */}
          <button
            onClick={handleAddSaida}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#FFFFFF',
              border: 'none',
              padding: '20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
              transition: 'all 0.3s ease',
              minWidth: '220px',
              flex: '1 1 300px',
              maxWidth: '400px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)'
            }}
          >
            <MdTrendingDown size={28} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>Nova Saída</div>
              <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '400' }}>Custos e despesas</div>
            </div>
          </button>
        </div>

        {/* Informações das Categorias */}
        <div style={{ 
          marginTop: '24px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          borderLeft: '4px solid #212038'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            fontSize: '14px',
            color: '#666'
          }}>
            <div>
              <h5 style={{ 
                color: '#059669', 
                margin: '0 0 12px 0', 
                fontSize: '15px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MdTrendingUp size={18} />
                Categorias de Entrada:
              </h5>
              <ul style={{ margin: 0, paddingLeft: '26px', lineHeight: '1.6' }}>
                <li>Mini-Festa</li>
                <li>Pegue e Monte</li>
                <li>Kit Mêsversário</li>
              </ul>
            </div>
            <div>
              <h5 style={{ 
                color: '#dc2626', 
                margin: '0 0 12px 0', 
                fontSize: '15px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MdTrendingDown size={18} />
                Categorias de Saída:
              </h5>
              <ul style={{ margin: 0, paddingLeft: '26px', lineHeight: '1.6' }}>
                <li>Arco Redondo</li>
                <li>Arco Romano</li>
                <li>Bandejas</li>
                <li>Capa Cilindro</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Formulário */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={transactionType === 'entrada' ? '💰 Nova Entrada' : '💸 Nova Saída'}
        size="lg"
      >
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          initialType={transactionType || undefined}
        />
      </Modal>      {/* Lista de Transações */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <TransactionList />
      </div>
    </div>
  )
}

function Settings() {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>Configurações do Sistema</h3>
      <div style={{ color: '#666' }}>
        <p>• Tema da aplicação</p>
        <p>• Configurações de backup</p>
        <p>• Preferências de relatório</p>
        <p>• Configurações de notificação</p>
      </div>
    </div>
  )
}

export default App