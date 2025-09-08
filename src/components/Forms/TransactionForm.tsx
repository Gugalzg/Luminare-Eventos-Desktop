import React from 'react';
import { useForm } from 'react-hook-form';
import { MdSave, MdCancel, MdAdd, MdEdit } from 'react-icons/md';
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
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormData>({
    defaultValues: {
      title: transaction?.title || '',
      description: transaction?.description || '',
      amount: transaction?.amount || 0,
      category: transaction?.category || '',
      type: transaction?.type || initialType || 'entrada', // Usar initialType se fornecido
      date: transaction?.date || new Date().toISOString().split('T')[0]
    }
  });

  const selectedType = watch('type');
  const filteredCategories = categories.filter((cat: any) => cat.type === selectedType);

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
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-xl shadow-blue-900/10 p-8 border border-blue-100/50">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-blue-100">
        {isEditing ? (
          <>
            <div className="p-2 bg-blue-100 rounded-xl">
              <MdEdit className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Editar Transação
              </h2>
              <p className="text-sm text-blue-600/70 mt-1">Modifique os dados da transação</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-2 bg-green-100 rounded-xl">
              <MdAdd className="text-green-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Nova Transação
              </h2>
              <p className="text-sm text-green-600/70 mt-1">Registre uma nova movimentação financeira</p>
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Seção 1: Informações Básicas */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/60">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-blue-100">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="text-lg">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-gray-800">Informações Básicas</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tipo de Transação */}
            <div className="lg:col-span-2">
              {initialType ? (
                // Se initialType foi fornecido, mostrar apenas como informação
                <div>
                  <label className="block text-sm font-semibold text-blue-gray-700 mb-4">
                    Tipo de Transação *
                  </label>
                  <div className="flex justify-center">
                    <div className={`relative flex items-center px-8 py-6 rounded-2xl border-2 shadow-lg ${
                      initialType === 'entrada' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 text-green-800' 
                        : 'bg-gradient-to-r from-red-100 to-rose-100 border-red-300 text-red-800'
                    }`}>
                      <span className="font-bold text-xl flex items-center gap-3">
                        {initialType === 'entrada' ? '💰 Entrada' : '💸 Saída'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="hidden"
                    value={initialType}
                    {...register('type', { required: 'Selecione o tipo' })}
                  />
                </div>
              ) : (
                // Se não há initialType, mostrar radio buttons normais
                <div>
                  <label className="block text-sm font-semibold text-blue-gray-700 mb-4">
                    Tipo de Transação *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer group bg-green-50 hover:bg-green-100 transition-colors px-4 py-3 rounded-xl border border-green-200">
                      <input
                        type="radio"
                        value="entrada"
                        {...register('type', { required: 'Selecione o tipo' })}
                        className="mr-3 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 focus:ring-2"
                      />
                      <span className="text-green-700 font-semibold group-hover:text-green-800 transition-colors flex items-center gap-2">
                        💰 Entrada
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer group bg-red-50 hover:bg-red-100 transition-colors px-4 py-3 rounded-xl border border-red-200">
                      <input
                        type="radio"
                        value="saida"
                        {...register('type', { required: 'Selecione o tipo' })}
                        className="mr-3 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-red-700 font-semibold group-hover:text-red-800 transition-colors flex items-center gap-2">
                        💸 Saída
                      </span>
                    </label>
                  </div>
                </div>
              )}
              {errors.type && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                  <span className="text-base">⚠️</span> {errors.type.message}
                </p>
              )}
            </div>

            {/* Título */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-blue-gray-700 mb-3 flex items-center gap-2">
                <span className="text-base">📝</span>
                Título *
              </label>
              <input
                type="text"
                {...register('title', { 
                  required: 'Título é obrigatório',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                className="w-full px-4 py-4 bg-transparent placeholder:text-blue-gray-400 placeholder:opacity-100 text-blue-gray-700 text-base border-2 border-blue-gray-200 rounded-xl transition duration-300 ease focus:outline-none focus:border-blue-500 hover:border-blue-300 shadow-sm focus:shadow-lg focus:ring-4 focus:ring-blue-500/20"
                placeholder="Ex: Venda Mini-Festa"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                  <span className="text-base">⚠️</span> {errors.title.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção 2: Detalhes */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100/60">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800">Detalhes da Transação</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-semibold text-blue-gray-700 mb-3 flex items-center gap-2">
                <span className="text-base">🏷️</span>
                Categoria *
              </label>
              <select
                {...register('category', { required: 'Selecione uma categoria' })}
                className="w-full px-4 py-4 bg-transparent text-blue-gray-700 text-base border-2 border-blue-gray-200 rounded-xl transition duration-300 ease focus:outline-none focus:border-purple-500 hover:border-purple-300 shadow-sm focus:shadow-lg focus:ring-4 focus:ring-purple-500/20"
              >
                <option value="">Selecione uma categoria</option>
                {filteredCategories.map((category: any) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                  <span className="text-base">⚠️</span> {errors.category.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-semibold text-blue-gray-700 mb-3 flex items-center gap-2">
                <span className="text-base">📄</span>
                Descrição
              </label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-4 bg-transparent placeholder:text-blue-gray-400 placeholder:opacity-100 text-blue-gray-700 text-base border-2 border-blue-gray-200 rounded-xl transition duration-300 ease focus:outline-none focus:border-purple-500 hover:border-purple-300 shadow-sm focus:shadow-lg focus:ring-4 focus:ring-purple-500/20 resize-none"
                placeholder="Detalhes adicionais (opcional)"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Informações Financeiras */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100/60">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-emerald-100">

            <h3 className="text-lg font-semibold text-emerald-800">Informações Financeiras</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valor */}
            <div>
              <label className="block text-sm font-semibold text-blue-gray-700 mb-3 flex items-center gap-2">
                <span className="text-base">💰</span>
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 font-semibold text-lg">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('amount', { 
                    required: 'Valor é obrigatório',
                    min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                  })}
                  className="w-full pl-14 pr-4 py-4 bg-transparent placeholder:text-blue-gray-400 placeholder:opacity-100 text-blue-gray-700 text-base border-2 border-blue-gray-200 rounded-xl transition duration-300 ease focus:outline-none focus:border-emerald-500 hover:border-emerald-300 shadow-sm focus:shadow-lg focus:ring-4 focus:ring-emerald-500/20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0,00"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                  <span className="text-base">⚠️</span> {errors.amount.message}
                </p>
              )}
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-semibold text-blue-gray-700 mb-3 flex items-center gap-2">
                <span className="text-base">📅</span>
                Data *
              </label>
              <input
                type="date"
                {...register('date', { required: 'Data é obrigatória' })}
                className="w-full px-4 py-4 bg-transparent text-blue-gray-700 text-base border-2 border-blue-gray-200 rounded-xl transition duration-300 ease focus:outline-none focus:border-emerald-500 hover:border-emerald-300 shadow-sm focus:shadow-lg focus:ring-4 focus:ring-emerald-500/20"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                  <span className="text-base">⚠️</span> {errors.date.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção 4: Ações */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 active:translate-y-0"
            >
              <MdSave className="text-2xl" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Transação'}</span>
              {isSubmitting && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-all duration-300 shadow-lg shadow-gray-500/20 hover:shadow-xl hover:shadow-gray-500/30 hover:-translate-y-1 active:translate-y-0"
            >
              <MdCancel className="text-2xl" />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
