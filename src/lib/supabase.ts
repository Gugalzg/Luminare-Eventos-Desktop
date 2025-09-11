import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Debug das variáveis (remover em produção)
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para testar a conexão com o Supabase
export const testConnection = async () => {
  try {
    // Primeiro, verifica se o supabase está configurado
    if (!isSupabaseConfigured()) {
      return { 
        success: false, 
        error: 'Supabase não configurado. Configure as variáveis de ambiente primeiro.' 
      }
    }

    // Testa a conexão tentando fazer uma query simples em uma das nossas tabelas
    const { error } = await supabase
      .from('transactions')
      .select('id')
      .limit(1)
    
    if (error) {
      // Se der erro na tabela transactions, verifica se é problema de tabela não existir
      if (error.message.includes('relation "public.transactions" does not exist')) {
        return { 
          success: false, 
          error: 'Tabelas não encontradas. Execute o script SQL de configuração primeiro.' 
        }
      }
      return { success: false, error: error.message }
    }
    
    return { 
      success: true, 
      message: 'Conexão com Supabase estabelecida com sucesso!',
      info: 'Autenticação, conectividade e tabelas verificadas'
    }
  } catch (err: any) {
    console.log('Erro de conexão:', err)
    return { success: false, error: err.message || 'Erro de conexão com o banco de dados' }
  }
}

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'YOUR_SUPABASE_URL' && 
         supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
}

// Função para testar a estrutura das tabelas
export const testTableStructure = async () => {
  try {
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1)
    
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)

    return {
      success: true,
      transactions: { data: transactionsData, error: transactionsError },
      categories: { data: categoriesData, error: categoriesError }
    }
  } catch (err) {
    return { success: false, error: err }
  }
}

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          title: string
          description: string | null
          amount: number
          type: 'entrada' | 'saida'
          category: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          amount: number
          type: 'entrada' | 'saida'
          category: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          amount?: number
          type?: 'entrada' | 'saida'
          category?: string
          date?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'entrada' | 'saida'
          color: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'entrada' | 'saida'
          color: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'entrada' | 'saida'
          color?: string
          icon?: string
          created_at?: string
        }
      }
    }
  }
}
