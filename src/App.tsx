import { useState } from 'react'
import './App.css'
import { ExpenseProvider, useExpenses, useCategories } from './context/ExpenseContext'
import { SAMPLE_EXPENSES } from './utils/sampleData'
import { SidebarNavigation } from './components/Sidebar/SidebarNavigation'
import { 
  MdDashboard, 
  MdReceipt,
  MdCategory,
  MdBarChart,
  MdSettings,
  MdAttachMoney,
  MdDescription,
  MdTrendingUp,
  MdPlaylistAdd
} from 'react-icons/md'// Componente principal da aplicação
function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard')
  const { expenses, getTotalAmount, addExpense } = useExpenses()
  const { categories } = useCategories()

  // Função para carregar dados de exemplo
  const loadSampleData = () => {
    SAMPLE_EXPENSES.forEach(expense => {
      addExpense(expense)
    })
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '24px', 
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <h2 style={{ color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdDashboard size={24} />
              Dashboard
            </h2>
            
            {/* Cards de resumo */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', color: '#ef4444', marginBottom: '8px' }}>
                  <MdAttachMoney size={32} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                  R$ {getTotalAmount().toFixed(2)}
                </div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Total Gastos</div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '8px' }}>
                  <MdDescription size={32} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                  {expenses.length}
                </div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Total Registros</div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px' }}>
                  <MdCategory size={32} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                  {categories.length}
                </div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Categorias</div>
              </div>
            </div>

            {/* Lista de gastos recentes */}
            {expenses.length > 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc' 
                }}>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>Gastos Recentes</h3>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {expenses.slice(-5).reverse().map((expense) => (
                    <div key={expense.id} style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>
                          {expense.title}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          {new Date(expense.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: '#ef4444',
                        fontSize: '16px'
                      }}>
                        R$ {expense.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  <MdBarChart size={48} color="#64748b" />
                </div>
                <h3 style={{ color: '#94a3b8', marginBottom: '8px' }}>Nenhum gasto registrado</h3>
                <p style={{ marginBottom: '20px' }}>Comece adicionando seus primeiros gastos para ver estatísticas aqui.</p>
                <button
                  onClick={loadSampleData}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  <MdPlaylistAdd size={16} style={{ marginRight: '8px' }} />
                  Carregar Dados de Exemplo
                </button>
              </div>
            )}
          </div>
        )
      
      case 'expenses':
        return (
          <div style={{ 
            backgroundColor: '#fef3c7', 
            padding: '20px', 
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdReceipt size={24} />
              Gerenciar Gastos
            </h2>
            <p>Em breve: Formulário para adicionar, editar e deletar gastos.</p>
          </div>
        )
      
      case 'categories':
        return (
          <div style={{ 
            backgroundColor: '#f0f4ff', 
            padding: '20px', 
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdCategory size={24} />
              Gerenciar Categorias
            </h2>
            <p>Em breve: Gerenciamento de categorias com cores personalizadas.</p>
            <div style={{ marginTop: '20px' }}>
              <strong>Categorias disponíveis:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {categories.map(category => (
                  <div key={category.id} style={{
                    backgroundColor: category.color + '20',
                    color: category.color,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    border: `1px solid ${category.color}40`
                  }}>
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 'reports':
        return (
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            padding: '20px', 
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdBarChart size={24} />
              Relatórios
            </h2>
            <p>Em breve: Relatórios detalhados com gráficos e análises.</p>
          </div>
        )

      case 'settings':
        return (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '20px', 
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdSettings size={24} />
              Configurações
            </h2>
            <p>Em breve: Configurações do sistema e preferências do usuário.</p>
          </div>
        )
        
      default:
        return (
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '20px', 
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdTrendingUp size={24} />
              Sistema Funcionando!
            </h2>
            <p>Context API configurado e funcionando!</p>
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <SidebarNavigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                color: '#1e293b', 
                fontSize: '24px', 
                fontWeight: '600' 
              }}>
                {currentView === 'dashboard' && (
                  <>
                    <MdDashboard size={20} style={{ marginRight: '8px' }} />
                    Dashboard
                  </>
                )}
                {currentView === 'expenses' && (
                  <>
                    <MdReceipt size={20} style={{ marginRight: '8px' }} />
                    Gerenciar Gastos
                  </>
                )}
                {currentView === 'categories' && (
                  <>
                    <MdCategory size={20} style={{ marginRight: '8px' }} />
                    Gerenciar Categorias
                  </>
                )}
                {currentView === 'reports' && (
                  <>
                    <MdBarChart size={20} style={{ marginRight: '8px' }} />
                    Relatórios
                  </>
                )}
                {currentView === 'settings' && (
                  <>
                    <MdSettings size={20} style={{ marginRight: '8px' }} />
                    Configurações
                  </>
                )}
              </h1>
              <p style={{ 
                margin: '4px 0 0 0', 
                color: '#64748b', 
                fontSize: '14px' 
              }}>
                {currentView === 'dashboard' && 'Visão geral dos seus gastos e estatísticas'}
                {currentView === 'expenses' && 'Adicione, edite e gerencie seus gastos'}
                {currentView === 'categories' && 'Organize suas categorias de gastos'}
                {currentView === 'reports' && 'Análises detalhadas e relatórios'}
                {currentView === 'settings' && 'Configurações do sistema'}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: '#f1f5f9',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                color: '#475569',
                fontWeight: '500'
              }}>
                {categories.length} categorias
              </div>
              <div style={{
                backgroundColor: expenses.length > 0 ? '#dcfce7' : '#fef3c7',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                color: expenses.length > 0 ? '#166534' : '#92400e',
                fontWeight: '500'
              }}>
                {expenses.length} gastos
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '24px', minHeight: 'calc(100vh - 88px)' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// Componente App com Provider
function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  )
}

export default App
