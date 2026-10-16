import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '../../../app/hooks';
import { deliverySchema } from '../../../shared/utils/validation';

const METHODS = [
  { value: 'nova', label: 'Нова Пошта (1–2 дні, ₴45)', hint: 'до відділення або поштомата' },
  { value: 'courier', label: 'Кур’єр (наступного дня, ₴90)', hint: 'по місту до дверей' },
  { value: 'pickup', label: 'Самовивіз (безкоштовно)', hint: 'з магазину, Київ' },
];

// Крок 2: спосіб доставки та адреса
export default function StepDelivery({ onNext, onBack }) {
  const data = useAppSelector((state) => state.checkout.data);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: { city: data.city, address: data.address, delivery: data.delivery },
  });

  return (
    <form className="card checkout-step" onSubmit={handleSubmit(onNext)} noValidate>
      <h2>Крок 2: доставка</h2>

      <fieldset className="radio-cards">
        <legend>Спосіб доставки</legend>
        {METHODS.map((m) => (
          <label key={m.value} className="radio-card">
            <input type="radio" value={m.value} {...register('delivery')} />
            <span>
              <strong>{m.label}</strong>
              <em className="muted small-text">{m.hint}</em>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="field-row">
        <label className="field">
          <span>Місто *</span>
          <input {...register('city')} />
          {errors.city && <em className="field-error">{errors.city.message}</em>}
        </label>
        <label className="field">
          <span>Відділення / адреса *</span>
          <input {...register('address')} placeholder="№ відділення або вулиця, будинок" />
          {errors.address && <em className="field-error">{errors.address.message}</em>}
        </label>
      </div>

      <div className="step-actions">
        <button type="button" className="btn ghost" onClick={onBack}>
          ← Назад
        </button>
        <button type="submit" className="btn big">
          Далі: оплата →
        </button>
      </div>
    </form>
  );
}
