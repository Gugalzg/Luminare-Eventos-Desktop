import React, { useState } from 'react';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { useTransactions } from '../../context/TransactionContext';
import TransactionForm from './TransactionForm';
import type { TransactionFormData } from './TransactionForm';

interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  date: string;
  created_at: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;

const TransactionList: React.FC = () => {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'entrada' | 'saida'>('all');

  // Função para encontrar o nome da categoria
  const getCategoryName = (categoryName: string) => {
    const category = categories.find((cat: any) => cat.name === categoryName);
    return category ? category.name : categoryName;
  };

  // Filtrar transações
  const filteredTransactions = transactions.filter((transaction: any) => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('edit');
  };

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('view');
  };

  const handleDelete = async (transaction: Transaction) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(transaction.id);
      } catch (error) {
        alert('Erro ao excluir transação');
      }
    }
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      if (modalMode === 'create') {
        await addTransaction(data);
      } else if (modalMode === 'edit' && selectedTransaction) {
        await updateTransaction(selectedTransaction.id, data);
      }
      setModalMode(null);
      setSelectedTransaction(null);
    } catch (error) {
      alert('Erro ao salvar transação');
    }
  };

  const handleCancel = () => {
    setModalMode(null);
    setSelectedTransaction(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header com Título e Botão Criar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          margin: 0
        }}>
          Lista de Transações
        </h2>
      </div>

      {/* Filtros */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: 'Todas', color: '#6b7280' },
          { key: 'entrada', label: 'Entradas', color: '#10b981' },
          { key: 'saida', label: 'Saídas', color: '#ef4444' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            style={{
              background: filter === filterOption.key ? filterOption.color : 'transparent',
              color: filter === filterOption.key ? '#FFFFFF' : filterOption.color,
              border: `2px solid ${filterOption.color}`,
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Lista de Transações */}
      {filteredTransactions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #e5e7eb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Nenhuma transação encontrada</h3>
          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
            {filter === 'all' 
              ? 'Comece criando sua primeira transação'
              : `Nenhuma ${filter === 'entrada' ? 'entrada' : 'saída'} encontrada`
            }
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header da Tabela - Desktop */}
          <div style={{
            display: 'none',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
            gap: '16px',
            padding: '16px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }} className="hidden md:grid">
            <div>Transação</div>
            <div>Categoria</div>
            <div>Tipo</div>
            <div>Valor</div>
            <div>Data</div>
            <div>Ações</div>
          </div>

          {/* Linhas da Tabela */}
          {filteredTransactions.map((transaction: Transaction, index: number) => (
            <div key={transaction.id}>
              {/* Versão Desktop */}
              <div style={{
                display: 'none',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
                gap: '16px',
                padding: '16px 20px',
                alignItems: 'center',
                borderBottom: index === filteredTransactions.length - 1 ? 'none' : '1px solid #f3f4f6'
              }} className="hidden md:grid">
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    {transaction.title}
                  </div>
                  {transaction.description && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {transaction.description.length > 50 
                        ? `${transaction.description.substring(0, 50)}...`
                        : transaction.description
                      }
                    </div>
                  )}
                </div>
                
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {getCategoryName(transaction.category)}
                </div>
                
                <div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: transaction.type === 'entrada' ? '#ecfdf5' : '#fef2f2',
                    color: transaction.type === 'entrada' ? '#065f46' : '#991b1b'
                  }}>
                    {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </div>
                
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: transaction.type === 'entrada' ? '#10b981' : '#ef4444'
                }}>
                  {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </div>
                
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {formatDate(transaction.date)}
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleView(transaction)}
                    style={{
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Visualizar"
                  >
                    <MdVisibility size={16} color="#6b7280" />
                  </button>
                  <button
                    onClick={() => handleEdit(transaction)}
                    style={{
                      background: '#dbeafe',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Editar"
                  >
                    <MdEdit size={16} color="#3b82f6" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Excluir"
                  >
                    <MdDelete size={16} color="#ef4444" />
                  </button>
                </div>
              </div>

              {/* Versão Mobile */}
              <div style={{
                display: 'block',
                padding: '16px 20px',
                borderBottom: index === filteredTransactions.length - 1 ? 'none' : '1px solid #f3f4f6'
              }} className="md:hidden">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      {transaction.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      {getCategoryName(transaction.category)} • {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: transaction.type === 'entrada' ? '#10b981' : '#ef4444'
                  }}>
                    {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: transaction.type === 'entrada' ? '#ecfdf5' : '#fef2f2',
                    color: transaction.type === 'entrada' ? '#065f46' : '#991b1b'
                  }}>
                    {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleView(transaction)}
                      style={{
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MdVisibility size={18} color="#6b7280" />
                    </button>
                    <button
                      onClick={() => handleEdit(transaction)}
                      style={{
                        background: '#dbeafe',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MdEdit size={18} color="#3b82f6" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction)}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MdDelete size={18} color="#ef4444" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
     
      {/* Modal */}
      {modalMode && modalMode !== 'view' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <TransactionForm
              transaction={selectedTransaction || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {modalMode === 'view' && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Detalhes da Transação</h2>
              <button
                onClick={() => setModalMode(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <p className="text-gray-900">{selectedTransaction.title}</p>
              </div>
              
              {selectedTransaction.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <p className="text-gray-900">{selectedTransaction.description}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <p className="text-gray-900">{getCategoryName(selectedTransaction.category)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedTransaction.type === 'entrada' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedTransaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor</label>
                <p className={`text-lg font-medium ${
                  selectedTransaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedTransaction.type === 'entrada' ? '+' : '-'} {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <p className="text-gray-900">{formatDate(selectedTransaction.date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
