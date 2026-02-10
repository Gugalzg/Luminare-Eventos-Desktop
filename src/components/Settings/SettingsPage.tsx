import React, { useState } from 'react'
import {
  MdPalette, MdStorage, MdNotifications, MdInfo,
  MdDelete, MdRefresh, MdSave, MdCheckCircle,
  MdCategory, MdAdd,
  MdDataset, MdCleaningServices
} from 'react-icons/md'
import { useTransactions } from '../../context/TransactionContext'
import { SupabaseConnectionTest } from '../SupabaseConnectionTest'

// ============================================================
// Hook para configurações persistentes no localStorage
// ============================================================
function useAppSettings() {
  const defaultSettings = {
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    startDayOfMonth: 1,
    showDecimals: true,
    confirmDelete: true,
    compactList: false,
  }

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('luminare-settings')
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('luminare-settings', JSON.stringify(updated))
      return updated
    })
  }

  return { settings, updateSetting }
}

// ============================================================
// Componentes auxiliares
// ============================================================
type Tab = 'general' | 'categories' | 'data' | 'about'

const SectionCard: React.FC<{ title: string; description?: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, description, icon, children }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    marginBottom: '16px',
  }}>
    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#64748b', flexShrink: 0,
        }}>{icon}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
          {description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{description}</p>}
        </div>
      </div>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </div>
)

const SettingRow: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({ label, description, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid #f8fafc',
  }}>
    <div style={{ flex: 1, marginRight: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{label}</div>
      {description && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{description}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
)

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none',
      background: checked ? '#10b981' : '#cbd5e1', cursor: 'pointer',
      position: 'relative', transition: 'background 0.2s ease', padding: 0,
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
      position: 'absolute', top: '3px',
      left: checked ? '23px' : '3px',
      transition: 'left 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    }} />
  </button>
)

const Select: React.FC<{ value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }> = ({ value, options, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: '7px 32px 7px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
      background: '#f8fafc', fontSize: '13px', fontWeight: 500, color: '#334155',
      cursor: 'pointer', appearance: 'none', outline: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px',
    }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)

// ============================================================
// Componente principal
// ============================================================
const SettingsPage: React.FC = () => {
  const { categories, transactions, addCategory, deleteCategory, refreshData } = useTransactions()
  const { settings, updateSetting } = useAppSettings()
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [toast, setToast] = useState<string | null>(null)

  // Category form
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')
  const [catType, setCatType] = useState<'entrada' | 'saida'>('entrada')
  const [catColor, setCatColor] = useState('#10b981')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleAddCategory = async () => {
    if (!catName.trim()) return
    try {
      await addCategory({ name: catName.trim(), type: catType, color: catColor, icon: 'MdLabel' })
      setCatName('')
      setShowCatForm(false)
      showToast('Categoria criada com sucesso!')
    } catch { showToast('Erro ao criar categoria') }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    const used = transactions.some(t => t.category === name)
    if (used) {
      showToast('Categoria em uso! Remova as transações primeiro.')
      return
    }
    if (settings.confirmDelete && !window.confirm(`Excluir a categoria "${name}"?`)) return
    try {
      await deleteCategory(id)
      showToast('Categoria removida!')
    } catch { showToast('Erro ao remover categoria') }
  }

  const handleClearAllData = () => {
    if (!window.confirm('Tem certeza que deseja limpar TODOS os dados locais? Esta ação não pode ser desfeita.')) return
    if (!window.confirm('ÚLTIMA CONFIRMAÇÃO: Todos os dados serão perdidos permanentemente.')) return
    localStorage.removeItem('luminare-transactions')
    localStorage.removeItem('luminare-categories')
    localStorage.removeItem('luminare-settings')
    showToast('Dados locais limpos! Recarregando...')
    setTimeout(() => window.location.reload(), 1500)
  }

  const handleExportData = () => {
    const data = {
      transactions,
      categories,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `luminare-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup exportado com sucesso!')
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.transactions) localStorage.setItem('luminare-transactions', JSON.stringify(data.transactions))
        if (data.categories) localStorage.setItem('luminare-categories', JSON.stringify(data.categories))
        if (data.settings) localStorage.setItem('luminare-settings', JSON.stringify(data.settings))
        showToast('Dados importados! Recarregando...')
        setTimeout(() => window.location.reload(), 1500)
      } catch {
        showToast('Arquivo inválido!')
      }
    }
    input.click()
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'general', label: 'Geral', icon: <MdPalette size={18} /> },
    { key: 'categories', label: 'Categorias', icon: <MdCategory size={18} /> },
    { key: 'data', label: 'Dados', icon: <MdStorage size={18} /> },
    { key: 'about', label: 'Sobre', icon: <MdInfo size={18} /> },
  ]

  const colorOptions = ['#10b981', '#059669', '#06d6a0', '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#ef4444', '#dc2626', '#f97316', '#ea580c', '#f59e0b']

  const entradasCats = categories.filter((c: any) => c.type === 'entrada')
  const saidasCats = categories.filter((c: any) => c.type === 'saida')

  const localDataSize = (() => {
    let total = 0
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('luminare')) total += (localStorage.getItem(key) || '').length
    }
    return (total / 1024).toFixed(1)
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#1e293b', color: '#fff', padding: '12px 20px',
          borderRadius: '12px', fontSize: '13px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          animation: 'slideInRight 0.3s ease',
        }}>
          <MdCheckCircle size={16} color="#10b981" />
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        background: '#ffffff', borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
        padding: '6px', display: 'flex', gap: '4px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '12px', borderRadius: '12px', border: 'none',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === tab.key ? '#1e293b' : 'transparent',
              color: activeTab === tab.key ? '#ffffff' : '#64748b',
            }}
            onMouseOver={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = '#f1f5f9' }}
            onMouseOut={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = 'transparent' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: GERAL ===== */}
      {activeTab === 'general' && (
        <>
          <SectionCard title="Preferências de Exibição" description="Personalize como os dados aparecem" icon={<MdPalette size={18} />}>
            <SettingRow label="Moeda" description="Moeda utilizada para valores">
              <Select value={settings.currency} onChange={v => updateSetting('currency', v)} options={[
                { value: 'BRL', label: 'R$ (Real)' },
                { value: 'USD', label: '$ (Dólar)' },
                { value: 'EUR', label: '€ (Euro)' },
              ]} />
            </SettingRow>
            <SettingRow label="Formato de data" description="Como as datas são apresentadas">
              <Select value={settings.dateFormat} onChange={v => updateSetting('dateFormat', v)} options={[
                { value: 'dd/MM/yyyy', label: 'DD/MM/AAAA' },
                { value: 'MM/dd/yyyy', label: 'MM/DD/AAAA' },
                { value: 'yyyy-MM-dd', label: 'AAAA-MM-DD' },
              ]} />
            </SettingRow>
            <SettingRow label="Exibir centavos" description="Mostrar casas decimais nos valores">
              <Toggle checked={settings.showDecimals} onChange={v => updateSetting('showDecimals', v)} />
            </SettingRow>
            <SettingRow label="Lista compacta" description="Reduzir espaçamento na lista de transações">
              <Toggle checked={settings.compactList} onChange={v => updateSetting('compactList', v)} />
            </SettingRow>
          </SectionCard>

          <SectionCard title="Comportamento" description="Ajuste como o aplicativo se comporta" icon={<MdNotifications size={18} />}>
            <SettingRow label="Confirmar exclusão" description="Pedir confirmação antes de excluir itens">
              <Toggle checked={settings.confirmDelete} onChange={v => updateSetting('confirmDelete', v)} />
            </SettingRow>
            <SettingRow label="Início do mês financeiro" description="Dia em que o mês financeiro começa">
              <Select value={String(settings.startDayOfMonth)} onChange={v => updateSetting('startDayOfMonth', Number(v))} options={
                Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: `Dia ${i + 1}` }))
              } />
            </SettingRow>
          </SectionCard>
        </>
      )}

      {/* ===== TAB: CATEGORIAS ===== */}
      {activeTab === 'categories' && (
        <>
          <SectionCard title="Gestão de Categorias" description="Organize suas transações por categorias" icon={<MdCategory size={18} />}>
            {/* Botão adicionar */}
            <button
              onClick={() => setShowCatForm(!showCatForm)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', borderRadius: '10px', border: '1.5px dashed #cbd5e1',
                background: '#f8fafc', cursor: 'pointer', width: '100%',
                fontSize: '13px', fontWeight: 600, color: '#64748b',
                transition: 'all 0.2s ease', marginBottom: '20px',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#eef2ff' }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f8fafc' }}
            >
              <MdAdd size={18} /> Nova Categoria
            </button>

            {/* Form adicionar */}
            {showCatForm && (
              <div style={{
                background: '#f8fafc', borderRadius: '12px', padding: '16px',
                border: '1px solid #e2e8f0', marginBottom: '20px',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nome da categoria"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    style={{
                      flex: 1, padding: '9px 14px', borderRadius: '8px',
                      border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none',
                      fontWeight: 500, color: '#1e293b',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as any)}
                    style={{
                      padding: '9px 12px', borderRadius: '8px',
                      border: '1.5px solid #e2e8f0', fontSize: '13px',
                      fontWeight: 600, color: catType === 'entrada' ? '#059669' : '#dc2626',
                      background: catType === 'entrada' ? '#ecfdf5' : '#fef2f2',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>

                {/* Cores */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Cor:</span>
                  {colorOptions.map(c => (
                    <button
                      key={c}
                      onClick={() => setCatColor(c)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: c, border: catColor === c ? '2px solid #1e293b' : '2px solid transparent',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        transform: catColor === c ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setShowCatForm(false); setCatName('') }}
                    style={{
                      padding: '8px 16px', borderRadius: '8px',
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={!catName.trim()}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: 'none',
                      background: catName.trim() ? '#1e293b' : '#cbd5e1',
                      fontSize: '13px', fontWeight: 600, color: '#fff', cursor: catName.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Criar
                  </button>
                </div>
              </div>
            )}

            {/* Lista - Entradas */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Entradas ({entradasCats.length})
                </span>
              </div>
              {entradasCats.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1', fontSize: '13px' }}>Nenhuma categoria de entrada</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {entradasCats.map((cat: any) => (
                    <div key={cat.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '10px',
                      transition: 'background 0.15s ease',
                    }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: cat.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#334155' }}>{cat.name}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {transactions.filter((t: any) => t.category === cat.name).length} transações
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '6px',
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#cbd5e1', transition: 'all 0.15s ease',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1' }}
                        title="Excluir"
                      >
                        <MdDelete size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lista - Saídas */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Saídas ({saidasCats.length})
                </span>
              </div>
              {saidasCats.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1', fontSize: '13px' }}>Nenhuma categoria de saída</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {saidasCats.map((cat: any) => (
                    <div key={cat.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '10px',
                      transition: 'background 0.15s ease',
                    }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: cat.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#334155' }}>{cat.name}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {transactions.filter((t: any) => t.category === cat.name).length} transações
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '6px',
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#cbd5e1', transition: 'all 0.15s ease',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1' }}
                        title="Excluir"
                      >
                        <MdDelete size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </>
      )}

      {/* ===== TAB: DADOS ===== */}
      {activeTab === 'data' && (
        <>
          <SectionCard title="Backup e Restauração" description="Exporte ou importe seus dados" icon={<MdStorage size={18} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex', gap: '10px', padding: '16px',
                background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0',
                alignItems: 'center',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Exportar Backup</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Salve todas as transações, categorias e configurações em um arquivo JSON
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  style={{
                    padding: '9px 18px', borderRadius: '10px', border: 'none',
                    background: '#1e293b', color: '#fff', fontSize: '13px',
                    fontWeight: 600, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '6px', transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
                >
                  <MdSave size={16} /> Exportar
                </button>
              </div>

              <div style={{
                display: 'flex', gap: '10px', padding: '16px',
                background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0',
                alignItems: 'center',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Importar Backup</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Restaure dados a partir de um arquivo de backup JSON exportado anteriormente
                  </div>
                </div>
                <button
                  onClick={handleImportData}
                  style={{
                    padding: '9px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                    background: '#fff', color: '#334155', fontSize: '13px',
                    fontWeight: 600, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '6px', transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#6366f1' }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
                >
                  <MdRefresh size={16} /> Importar
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Sincronização" description="Status da conexão com o banco de dados" icon={<MdDataset size={18} />}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <button
                onClick={async () => {
                  try { await refreshData(); showToast('Dados sincronizados!') }
                  catch { showToast('Erro ao sincronizar') }
                }}
                style={{
                  padding: '9px 18px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <MdRefresh size={16} /> Sincronizar Agora
              </button>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {transactions.length} transações • {categories.length} categorias
              </span>
            </div>
            <SupabaseConnectionTest />
          </SectionCard>

          <SectionCard title="Armazenamento Local" description="Dados salvos no seu dispositivo" icon={<MdCleaningServices size={18} />}>
            <SettingRow label="Espaço utilizado" description="Tamanho dos dados salvos localmente">
              <span style={{
                padding: '5px 12px', borderRadius: '8px', background: '#f1f5f9',
                fontSize: '13px', fontWeight: 700, color: '#475569',
              }}>
                {localDataSize} KB
              </span>
            </SettingRow>
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={handleClearAllData}
                style={{
                  padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #fecaca',
                  background: '#fef2f2', color: '#dc2626', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '6px', transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5' }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca' }}
              >
                <MdDelete size={16} /> Limpar Todos os Dados Locais
              </button>
              <p style={{ fontSize: '11px', color: '#f87171', marginTop: '8px', fontWeight: 500 }}>
                ⚠️ Esta ação remove todas as transações, categorias e configurações salvas localmente.
              </p>
            </div>
          </SectionCard>
        </>
      )}

      {/* ===== TAB: SOBRE ===== */}
      {activeTab === 'about' && (
        <>
          <SectionCard title="Luminare Eventos" description="Gestão financeira para eventos" icon={<MdInfo size={18} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                textAlign: 'center', padding: '24px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                borderRadius: '14px', color: '#fff',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
                <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800 }}>Luminare Eventos</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(199,210,254,0.7)' }}>Sistema de Gestão Financeira</p>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'rgba(199,210,254,0.5)' }}>Versão 1.0.0</p>
              </div>

              <SettingRow label="Transações registradas">
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{transactions.length}</span>
              </SettingRow>
              <SettingRow label="Categorias cadastradas">
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{categories.length}</span>
              </SettingRow>
              <SettingRow label="Plataforma">
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Tauri + React</span>
              </SettingRow>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}

export default SettingsPage
