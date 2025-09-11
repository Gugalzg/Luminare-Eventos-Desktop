import { useState } from 'react'
import { MdWifi, MdRefresh, MdCheckCircle, MdError, MdWarning } from 'react-icons/md'
import { testConnection, testTableStructure, isSupabaseConfigured } from '../lib/supabase'

export const SupabaseConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [structureResult, setStructureResult] = useState<any>(null)

  const handleTestConnection = async () => {
    setIsLoading(true)
    setConnectionResult(null)
    setStructureResult(null)

    try {
      // Testa a conexão básica
      const connectionTest = await testConnection()
      setConnectionResult(connectionTest)

      // Se a conexão básica funcionou, testa a estrutura das tabelas
      if (connectionTest.success) {
        const structureTest = await testTableStructure()
        setStructureResult(structureTest)
      }
    } catch (error) {
      setConnectionResult({
        success: false,
        error: 'Erro inesperado durante o teste'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isConfigured = isSupabaseConfigured()

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      padding: '24px',
      marginTop: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#1e293b'
        }}>
          <MdWifi size={24} />
          Teste de Conexão Supabase
        </h3>
        
        <button
          onClick={handleTestConnection}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <MdRefresh size={16} style={{ 
            animation: isLoading ? 'spin 1s linear infinite' : 'none' 
          }} />
          {isLoading ? 'Testando...' : 'Testar Conexão'}
        </button>
      </div>

      {/* Status da Configuração */}
      <div style={{
        padding: '12px',
        borderRadius: '6px',
        backgroundColor: isConfigured ? '#dcfce7' : '#fef3c7',
        border: `1px solid ${isConfigured ? '#bbf7d0' : '#fed7aa'}`,
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: isConfigured ? '#166534' : '#92400e'
        }}>
          {isConfigured ? <MdCheckCircle size={16} /> : <MdWarning size={16} />}
          {isConfigured 
            ? 'Configuração encontrada' 
            : 'Configure suas credenciais do Supabase em src/lib/supabase.ts'
          }
        </div>
      </div>

      {/* Resultado da Conexão */}
      {connectionResult && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: connectionResult.success ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${connectionResult.success ? '#bbf7d0' : '#fecaca'}`,
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: connectionResult.success ? '#166534' : '#dc2626',
            marginBottom: '8px'
          }}>
            {connectionResult.success ? <MdCheckCircle size={16} /> : <MdError size={16} />}
            {connectionResult.success ? 'Conexão Estabelecida' : 'Falha na Conexão'}
          </div>
          
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            {connectionResult.success 
              ? connectionResult.message 
              : connectionResult.error
            }
          </div>
        </div>
      )}

      {/* Resultado da Estrutura das Tabelas */}
      {structureResult && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#374151' 
          }}>
            Estrutura das Tabelas:
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '4px' }}>
                Tabela 'transactions':
              </div>
              <div style={{ fontSize: '12px', color: structureResult.transactions.error ? '#dc2626' : '#10b981' }}>
                {structureResult.transactions.error 
                  ? `❌ ${structureResult.transactions.error.message}`
                  : `✅ Acessível (${structureResult.transactions.data?.length || 0} registros)`
                }
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '4px' }}>
                Tabela 'categories':
              </div>
              <div style={{ fontSize: '12px', color: structureResult.categories.error ? '#dc2626' : '#10b981' }}>
                {structureResult.categories.error 
                  ? `❌ ${structureResult.categories.error.message}`
                  : `✅ Acessível (${structureResult.categories.data?.length || 0} registros)`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f1f5f9',
        borderRadius: '6px',
        border: '1px solid #cbd5e1'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>
          Como configurar:
        </h4>
        <ol style={{ fontSize: '13px', color: '#64748b', paddingLeft: '16px', margin: '0 0 12px 0' }}>
          <li>Acesse seu projeto no Supabase Dashboard</li>
          <li>Vá em Settings → API</li>
          <li>Copie a URL do projeto e a chave anon/public</li>
          <li>Crie um arquivo <code>.env</code> na raiz do projeto com:</li>
          <div style={{ 
            backgroundColor: '#e2e8f0', 
            padding: '8px', 
            borderRadius: '4px', 
            fontFamily: 'monospace',
            fontSize: '12px',
            margin: '4px 0'
          }}>
            VITE_SUPABASE_URL=sua_url_aqui<br/>
            VITE_SUPABASE_ANON_KEY=sua_chave_aqui
          </div>
          <li>Execute o script SQL do arquivo <code>database/setup.sql</code> no SQL Editor do Supabase</li>
          <li>Reinicie o servidor de desenvolvimento</li>
        </ol>
        
        <h5 style={{ margin: '8px 0 4px 0', fontSize: '13px', color: '#374151' }}>
          Erros Comuns:
        </h5>
        <ul style={{ fontSize: '12px', color: '#64748b', paddingLeft: '16px', margin: 0 }}>
          <li><strong>information_schema.tables:</strong> Tabelas do sistema não criadas - execute o script SQL</li>
          <li><strong>relation does not exist:</strong> Tabelas não encontradas - verifique o script SQL</li>
          <li><strong>Invalid API key:</strong> Chave incorreta - verifique as variáveis de ambiente</li>
          <li><strong>Network error:</strong> URL incorreta ou problemas de conexão</li>
        </ul>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
