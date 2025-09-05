import { useState } from 'react'
import './App.css'
import { ExpenseProvider, useExpenses, useCategories } from './context/ExpenseContext'

// Componente principal da aplicação
function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard')
  const { expenses, getTotalAmount } = useExpenses()
  const { categories } = useCategories()

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
            <h2 style={{ color: '#1e293b', marginBottom: '24px' }}>📊 Dashboard</h2>
            
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
                <div style={{ fontSize: '32px', color: '#ef4444', marginBottom: '8px' }}>💰</div>
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
                <div style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '8px' }}>📝</div>
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
                <div style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px' }}>🏷️</div>
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
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ color: '#94a3b8', marginBottom: '8px' }}>Nenhum gasto registrado</h3>
                <p>Comece adicionando seus primeiros gastos para ver estatísticas aqui.</p>
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
            <h2>💸 Gerenciar Gastos</h2>
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
            <h2>🏷️ Gerenciar Categorias</h2>
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
        
      default:
        return (
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '20px', 
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h2>🎯 Sistema Funcionando!</h2>
            <p>Context API configurado e funcionando!</p>
          </div>
        )
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '2px solid #e5e7eb', 
        paddingBottom: '20px', 
        marginBottom: '20px' 
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
          💰 Sistema de Controle de Gastos - LuminareEventos
        </h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'dashboard' ? '#3b82f6' : '#f3f4f6',
              color: currentView === 'dashboard' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setCurrentView('expenses')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'expenses' ? '#3b82f6' : '#f3f4f6',
              color: currentView === 'expenses' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            💸 Gastos
          </button>
          <button
            onClick={() => setCurrentView('categories')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'categories' ? '#3b82f6' : '#f3f4f6',
              color: currentView === 'categories' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🏷️ Categorias
          </button>
        </div>
      </header>

      {/* Content */}
      <main>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <p>✅ Context API configurado - {categories.length} categorias carregadas</p>
        <p style={{ fontSize: '14px', marginTop: '5px' }}>
          Sistema de controle de gastos usando dados locais
        </p>
      </footer>
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
