import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MdSave, MdCancel, MdEdit } from 'react-icons/md';
import { useTransactions } from '../../context/TransactionContext';

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

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  initialType?: 'entrada' | 'saida'; // Nova prop para tipo pré-definido
}

export interface TransactionFormData {
  title: string;
  description?: string;
  amount: number;
  category: string;
  type: 'entrada' | 'saida';
  date: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
  initialType
}) => {
  const { categories } = useTransactions();
  const isEditing = !!transaction;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormData>({
    defaultValues: {
      title: transaction?.title || '',
      description: transaction?.description || '',
      amount: transaction?.amount || undefined,
      category: transaction?.category || '',
      type: transaction?.type || initialType, // Não usar 'entrada' como padrão
      date: transaction?.date || new Date().toISOString().split('T')[0]
    }
  });

  const watchedType = watch('type') || initialType;
  const filteredCategories = watchedType ? categories.filter((cat: any) => cat.type === watchedType) : [];

  // Definir o tipo quando initialType está presente
  useEffect(() => {
    if (initialType && !isEditing) {
      setValue('type', initialType);
    }
  }, [initialType, isEditing, setValue]);

  // Limpar categoria quando o tipo de transação mudar
  useEffect(() => {
    if (watchedType && !isEditing) {
      // Só limpa a categoria se não estamos editando uma transação existente
      const currentCategory = watch('category');
      const isCategoryValid = filteredCategories.some(cat => cat.name === currentCategory);
      
      if (!isCategoryValid) {
        setValue('category', '');
      }
    }
  }, [watchedType, filteredCategories, setValue, watch, isEditing]);

  const onFormSubmit = (data: TransactionFormData) => {
    // Garantir que o tipo correto seja usado quando initialType é fornecido
    const finalData = {
      ...data,
      amount: Number(data.amount),
      type: initialType || data.type // Usar initialType se fornecido
    };
    
    onSubmit(finalData);
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      {isEditing && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <MdEdit className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Editar Transação
              </h2>
              <p className="text-slate-600 mt-1">Modifique os dados da sua transação</p>
            </div>
          </div>
        </div>
      )}
      {/* Form Section - para aumentar o espaçamento entre seções, coloque gap: 15px */}
        <form onSubmit={handleSubmit(onFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Seção 1: Informações Básicas */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden" style={{ marginBottom: '5px' }}>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                </div>
                <h3 className="text-lg font-bold text-white">Informações Básicas</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Tipo de Transação - Exibição informativa */}
              {initialType && (
                <div>
                  <div className="flex justify-center mb-6">
                    <div className={`relative flex items-center px-8 py-4 rounded-2xl border-2 shadow-lg ${
                      initialType === 'entrada' 
                        ? 'bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 border-emerald-300 text-emerald-800' 
                        : 'bg-gradient-to-r from-rose-100 via-red-100 to-pink-100 border-rose-300 text-rose-800'
                    }`}>

                    </div>
                  </div>
                  <input
                    type="hidden"
                    value={initialType}
                    {...register('type', { required: 'Tipo é obrigatório' })}
                  />
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="text-xl">📝 </span>
                  Título da Transação
                </label>
                <input
                  type="text"
                  {...register('title', { 
                    required: 'Título é obrigatório',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                  })}
                  className="w-full px-6 py-5 bg-white/90 backdrop-blur-sm placeholder:text-slate-500 text-slate-800 text-lg font-medium border-2 border-slate-200 rounded-2xl transition-all duration-300 ease focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-slate-300 hover:bg-white shadow-lg hover:shadow-xl focus:shadow-2xl"
                  placeholder="Ex: Aniversário Pedro"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                    marginLeft: '10px'
                  }}
                />
                {errors.title && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 shadow-lg backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(254,242,242,0.9) 0%, rgba(254,226,226,0.9) 100%)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 25px rgba(239,68,68,0.15)'
                    }}
                  >
                    <span className="text-2xl animate-bounce">⚠️</span>
                    <p className="text-red-700 text-sm font-bold">{errors.title.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Detalhes da Transação */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                </div>
                <h3 className="text-lg font-bold text-white">Detalhes da Transação</h3>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="text-xl">🏷️ </span>
                  Categoria
                </label>
                <select
                  {...register('category', { required: 'Selecione uma categoria' })}
                  className="w-full px-6 py-5 bg-white/90 backdrop-blur-sm text-slate-800 text-lg font-medium border-2 border-slate-200 rounded-2xl transition-all duration-300 ease focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-slate-300 hover:bg-white shadow-lg hover:shadow-xl focus:shadow-2xl appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '3.5rem',
                    marginLeft: '10px'
                  }}
                >
                  <option value="">
                    {watchedType 
                      ? "Selecione uma categoria" 
                      : "Selecione primeiro um tipo de transação"
                    }
                  </option>
                  {filteredCategories.map((category: any) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 shadow-lg backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(254,242,242,0.9) 0%, rgba(254,226,226,0.9) 100%)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 25px rgba(239,68,68,0.15)'
                    }}
                  >
                    <span className="text-2xl animate-bounce">⚠️</span>
                    <p className="text-red-700 text-sm font-bold">{errors.category.message}</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Seção 3: Informações Financeiras */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                </div>
                <h3 className="text-xl font-bold text-white">Informações Financeiras</h3>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Valor */}
              <div>
                <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap" style={{ flexShrink: 0 }}>
                    <span className="text-xl">💰 </span>
                    Valor (R$) 
                  </label>
                  <div className="relative flex-1" style={{ flex: 1 }}>
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('amount', { 
                        required: 'Valor é obrigatório',
                        min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                      })}
                      className="w-full pl-20 pr-6 py-5 bg-white/90 backdrop-blur-sm placeholder:text-slate-500 text-slate-800 text-xl font-semibold border-2 border-slate-200 rounded-2xl transition-all duration-300 ease focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-slate-300 hover:bg-white shadow-lg hover:shadow-xl focus:shadow-2xl [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0,00"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.9) 100%)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                        textAlign: 'left' as const,
                        width: '10%'
                      }}
                    />
                  </div>
                </div>
                {errors.amount && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 shadow-lg backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(254,242,242,0.9) 0%, rgba(254,226,226,0.9) 100%)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 25px rgba(239,68,68,0.15)'
                    }}
                  >
                    <span className="text-2xl animate-bounce">⚠️</span>
                    <p className="text-red-700 text-sm font-bold">{errors.amount.message}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
          {/* Seção 3: Data da Transação */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                </div>
                <h3 className="text-xl font-bold text-white">Data da Transação</h3>
              </div>
            </div>
            
            <div className="p-8">
              {/* Data */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  Data da Transação
                </label>
                <input
                  type="date"
                  {...register('date', { required: 'Data é obrigatória' })}
                  className="w-full px-6 py-5 bg-white/90 backdrop-blur-sm text-slate-800 text-lg font-medium border-2 border-slate-200 rounded-2xl transition-all duration-300 ease focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-slate-300 hover:bg-white shadow-lg hover:shadow-xl focus:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                    colorScheme: 'light',
                    marginLeft: '10px'
                  }}
                />
                {errors.date && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 shadow-lg backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(254,242,242,0.9) 0%, rgba(254,226,226,0.9) 100%)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 25px rgba(239,68,68,0.15)'
                    }}
                  >
                    <span className="text-2xl animate-bounce">⚠️</span>
                    <p className="text-red-700 text-sm font-bold">{errors.date.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção 4: Ações */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                </div>
                <h3 className="text-xl font-bold text-white">Finalizar Transação</h3>
              </div>
            </div>
            
            <div className="p-12">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex items-center justify-center gap-4 px-10 py-5 font-bold text-lg rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
                    minWidth: '200px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    marginRight: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(16, 185, 129, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.04)'
                  }}
                >
                  <MdSave className="text-2xl" />
                  <span>{isSubmitting ? 'Salvando...' : 'Salvar Transação'}</span>
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-2"></div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="group relative flex items-center justify-center gap-4 px-10 py-5 font-bold text-lg rounded-2xl transition-all duration-300 overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #963c3cff 0%, #bd0c0cff 100%)',
                    color: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(107, 114, 128, 0.4), 0 10px 10px -5px rgba(107, 114, 128, 0.04)',
                    minWidth: '200px',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(107, 114, 128, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(107, 114, 128, 0.4), 0 10px 10px -5px rgba(107, 114, 128, 0.04)'
                  }}
                >
                  <MdCancel className="text-2xl" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>
        </form>
    </div>
  );
};

export default TransactionForm;
