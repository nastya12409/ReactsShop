import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../shared/ui/Modal';
import { productSchema } from '../../shared/utils/validation';


export default function ProductForm({ product, onClose, onSubmit, saving, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          title: product.title,
          category: product.category,
          price: product.price,
          stock: product.stock ?? 0,
          description: product.description,
        }
      : { title: '', category: '', price: '', stock: 0, description: '' },
  });

  return (
    <Modal title={product ? `Редагувати: ${product.title}` : 'Новий товар'} onClose={onClose}>
      <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="field">
          <span>Назва *</span>
          <input {...register('title')} />
          {errors.title && <em className="field-error">{errors.title.message}</em>}
        </label>

        <div className="field-row">
          <label className="field">
            <span>Категорія *</span>
            <input {...register('category')} />
            {errors.category && <em className="field-error">{errors.category.message}</em>}
          </label>
          <label className="field">
            <span>Ціна, $ *</span>
            <input type="number" step="0.01" {...register('price')} />
            {errors.price && <em className="field-error">{errors.price.message}</em>}
          </label>
          <label className="field">
            <span>Кількість *</span>
            <input type="number" step="1" {...register('stock')} />
            {errors.stock && <em className="field-error">{errors.stock.message}</em>}
          </label>
        </div>

        <label className="field">
          <span>Опис *</span>
          <textarea rows={4} {...register('description')} />
          {errors.description && <em className="field-error">{errors.description.message}</em>}
        </label>

        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}

        <div className="step-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Скасувати
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
