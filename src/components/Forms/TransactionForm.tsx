import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MdSave, MdCancel, MdEdit } from 'react-icons/md';
import { useTransactions } from '../../context/TransactionContext';
import './TransactionForm.css';

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
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  initialType?: 'entrada' | 'saida';
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
      type: transaction?.type || initialType,
      date: transaction?.date || new Date().toISOString().split('T')[0]
    }
  });

  const watchedType = watch('type') || initialType;
  const filteredCategories = watchedType ? categories.filter((cat: any) => cat.type === watchedType) : [];

  useEffect(() => {
    if (initialType && !isEditing) {
      setValue('type', initialType);
    }
  }, [initialType, isEditing, setValue]);

  useEffect(() => {
    if (watchedType && !isEditing) {
      const currentCategory = watch('category');
      const isCategoryValid = filteredCategories.some(cat => cat.name === currentCategory);
      
      if (!isCategoryValid) {
        setValue('category', '');
      }
    }
  }, [watchedType, filteredCategories, setValue, watch, isEditing]);

  const onFormSubmit = async (data: TransactionFormData) => {
    try {
      const finalData = {
        ...data,
        amount: Number(data.amount),
        type: initialType || data.type
      };
      
      await onSubmit(finalData);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      // Aqui você pode adicionar um toast ou notificação de erro
      alert('Erro ao salvar transação. Tente novamente.');
    }
  };

  return (
    <div className="transaction-form-compact">
      {/* Header compacto apenas para edição */}
      {isEditing && (
        <div className="form-header-compact">
          <MdEdit className="header-icon" />
          <span className="header-text">Editando Transação</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-unified">
        {/* Grid compacto com todos os campos */}
        <div className="form-grid">
          {/* Título */}
          <div className="field-compact">
            <label className="label-compact">
              📝 Título
            </label>
            <input
              type="text"
              {...register('title', { 
                required: 'Título é obrigatório',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              className={`input-compact ${errors.title ? 'error' : ''}`}
              placeholder="Ex: Aniversário Pedro"
            />
            {errors.title && (
              <div className="error-compact">
                ⚠️ {errors.title.message}
              </div>
            )}
          </div>

          {/* Categoria */}
          <div className="field-compact">
            <label className="label-compact">
              🏷️ Categoria
            </label>
            <select
              {...register('category', { required: 'Selecione uma categoria' })}
              className={`input-compact select-compact ${errors.category ? 'error' : ''}`}
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
              <div className="error-compact">
                ⚠️ {errors.category.message}
              </div>
            )}
          </div>

          {/* Valor */}
          <div className="field-compact">
            <label className="label-compact">
              💰 Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Valor é obrigatório',
                min: { value: 0.01, message: 'Valor deve ser maior que zero' }
              })}
              className={`input-compact input-value-compact ${errors.amount ? 'error' : ''}`}
              placeholder="0,00"
            />
            {errors.amount && (
              <div className="error-compact">
                ⚠️ {errors.amount.message}
              </div>
            )}
          </div>

          {/* Data */}
          <div className="field-compact">
            <label className="label-compact">
              📅 Data
            </label>
            <input
              type="date"
              {...register('date', { required: 'Data é obrigatória' })}
              className={`input-compact ${errors.date ? 'error' : ''}`}
            />
            {errors.date && (
              <div className="error-compact">
                ⚠️ {errors.date.message}
              </div>
            )}
          </div>

          {/* Descrição - linha completa */}
          <div className="field-compact field-full">
            <label className="label-compact">
              📄 Descrição (Opcional)
            </label>
            <textarea
              {...register('description')}
              className="input-compact textarea-compact"
              placeholder="Descrição adicional..."
              rows={2}
            />
          </div>
        </div>

        {/* Botões compactos */}
        <div className="buttons-compact">
          <button
            type="submit"
            disabled={isSubmitting}
            className="button-compact success"
          >
            <MdSave className="button-icon" />
            {isSubmitting ? 'Salvando...' : 'Salvar'}
            {isSubmitting && <div className="spinner-compact"></div>}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="button-compact danger"
          >
            <MdCancel className="button-icon" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
