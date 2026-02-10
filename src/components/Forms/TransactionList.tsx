import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MdEdit, MdDelete, MdVisibility, MdClose, MdSearch, MdFilterList, MdArrowUpward, MdArrowDownward, MdSwapVert } from 'react-icons/md';
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
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Função para encontrar o nome da categoria
  const getCategoryName = (categoryName: string) => {
    const category = categories.find((cat: any) => cat.name === categoryName);
    return category ? category.name : categoryName;
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar transações
  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = searchTerm === '' || 
      transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Ordenar transações por data
  const sortedTransactions = [...filteredTransactions].sort((a: any, b: any) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Calcular totais filtrados  
  const filteredEntradas = filteredTransactions
    .filter((t: any) => t.type === 'entrada')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  const filteredSaidas = filteredTransactions
    .filter((t: any) => t.type === 'saida')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

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
    // Adiciona T00:00:00 para interpretar como horário local, não UTC
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Card Container Principal */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
                Transações
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                {filteredTransactions.length} de {transactions.length} transações
              </p>
            </div>
            {/* Mini resumo filtrado */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entradas</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(filteredEntradas)}</div>
              </div>
              <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saídas</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444' }}>{formatCurrency(filteredSaidas)}</div>
              </div>
            </div>
          </div>

          {/* Search + Filtros */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{
              flex: 1,
              minWidth: '200px',
              position: 'relative',
            }}>
              <MdSearch size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar por título, categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: '#334155',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.1)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            {/* Sort button */}
            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              title={sortOrder === 'newest' ? 'Mais recentes primeiro' : 'Mais antigas primeiro'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.background = '#ffffff' }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
            >
              <MdSwapVert size={16} />
              {sortOrder === 'newest' ? 'Recentes' : 'Antigas'}
            </button>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
              {[
                { key: 'all', label: 'Todas' },
                { key: 'entrada', label: 'Entradas' },
                { key: 'saida', label: 'Saídas' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFilter(opt.key as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: filter === opt.key ? '#ffffff' : 'transparent',
                    color: filter === opt.key ? '#1e293b' : '#64748b',
                    boxShadow: filter === opt.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista */}
        {filteredTransactions.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <MdFilterList size={28} color="#94a3b8" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#475569' }}>Nenhuma transação encontrada</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              {searchTerm ? 'Tente ajustar sua busca' : filter === 'all' ? 'Comece registrando sua primeira transação' : `Nenhuma ${filter === 'entrada' ? 'entrada' : 'saída'} registrada`}
            </p>
          </div>
        ) : (
          <div>
            {sortedTransactions.map((transaction: Transaction, index: number) => (
              <div
                key={transaction.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 28px',
                  borderBottom: index === sortedTransactions.length - 1 ? 'none' : '1px solid #f8fafc',
                  transition: 'background 0.15s ease',
                  cursor: 'default',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#fafbfc' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Ícone de tipo */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: transaction.type === 'entrada'
                    ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                    : 'linear-gradient(135deg, #fef2f2, #fecaca)',
                }}>
                  {transaction.type === 'entrada'
                    ? <MdArrowDownward size={20} color="#059669" />
                    : <MdArrowUpward size={20} color="#dc2626" />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {transaction.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      fontWeight: 500,
                      color: '#64748b',
                    }}>
                      {getCategoryName(transaction.category)}
                    </span>
                    <span>•</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>

                {/* Valor */}
                <div style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: transaction.type === 'entrada' ? '#059669' : '#dc2626',
                  whiteSpace: 'nowrap',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {transaction.type === 'entrada' ? '+' : '−'} {formatCurrency(transaction.amount)}
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {[
                    { icon: <MdVisibility size={16} color="#64748b" />, action: () => handleView(transaction), bg: '#f1f5f9', hoverBg: '#e2e8f0', title: 'Ver' },
                    { icon: <MdEdit size={16} color="#3b82f6" />, action: () => handleEdit(transaction), bg: '#eff6ff', hoverBg: '#dbeafe', title: 'Editar' },
                    { icon: <MdDelete size={16} color="#ef4444" />, action: () => handleDelete(transaction), bg: '#fef2f2', hoverBg: '#fee2e2', title: 'Excluir' },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.action}
                      title={btn.title}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        background: btn.bg,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        padding: 0,
                        lineHeight: 1,
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = btn.hoverBg; e.currentTarget.style.transform = 'scale(1.1)' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = btn.bg; e.currentTarget.style.transform = 'scale(1)' }}
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
     
      {/* Modal de Edição */}
      {modalMode && modalMode !== 'view' && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          }}>
            <TransactionForm
              transaction={selectedTransaction || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Visualização */}
      {modalMode === 'view' && selectedTransaction && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          }}>
            {/* Header colorido */}
            <div style={{
              padding: '28px 28px 20px',
              background: selectedTransaction.type === 'entrada'
                ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                : 'linear-gradient(135deg, #fef2f2, #fecaca)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '12px',
                    background: selectedTransaction.type === 'entrada' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: selectedTransaction.type === 'entrada' ? '#059669' : '#dc2626',
                  }}>
                    {selectedTransaction.type === 'entrada' ? <MdArrowDownward size={14} /> : <MdArrowUpward size={14} />}
                    {selectedTransaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                  <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
                    {selectedTransaction.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    {getCategoryName(selectedTransaction.category)}
                  </p>
                </div>
                <button
                  onClick={() => setModalMode(null)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '10px', border: 'none',
                    background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)' }}
                >
                  <MdClose size={18} color="#475569" />
                </button>
              </div>

              {/* Valor grande */}
              <div style={{
                marginTop: '20px',
                fontSize: '32px',
                fontWeight: 800,
                color: selectedTransaction.type === 'entrada' ? '#059669' : '#dc2626',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {selectedTransaction.type === 'entrada' ? '+' : '−'} {formatCurrency(selectedTransaction.amount)}
              </div>
            </div>

            {/* Detalhes */}
            <div style={{ padding: '24px 28px' }}>
              {selectedTransaction.description && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Descrição</div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{selectedTransaction.description}</p>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px',
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Data</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{formatDate(selectedTransaction.date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Categoria</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{getCategoryName(selectedTransaction.category)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TransactionList;
