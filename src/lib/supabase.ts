import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Configurações do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Cria o cliente Supabase apenas se as variáveis estiverem configuradas
let supabase: SupabaseClient

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase conectado:', supabaseUrl)
  } else {
    console.warn('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env')
    // Cria um client dummy com URL placeholder válida para evitar crash
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
} catch (error) {
  console.warn('Erro ao inicializar Supabase:', error)
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export { supabase }

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
  return supabaseUrl !== '' && 
         supabaseAnonKey !== '' &&
         !supabaseUrl.includes('placeholder')
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
