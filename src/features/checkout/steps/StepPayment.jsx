import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '../../../app/hooks';
import { paymentSchema } from '../../../shared/utils/validation';

const METHODS = [
  { value: 'card', label: '💳 Карта онлайн', hint: 'Visa / Mastercard' },
  { value: 'cash', label: '💵 Готівкою при отриманні', hint: 'оплата кур’єру або у відділенні' },
];


export default function StepPayment({ onBack, onConfirm, submitting }) {
  const data = useAppSelector((state) => state.checkout.data);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { payment: data.payment },
  });

  return (
    <form className="card checkout-step" onSubmit={handleSubmit(onConfirm)} noValidate>
      <h2>Крок 3: оплата</h2>

      <fieldset className="radio-cards">
        <legend>Спосіб оплати</legend>
        {METHODS.map((m) => (
          <label key={m.value} className="radio-card">
            <input type="radio" value={m.value} {...register('payment')} />
            <span>
              <strong>{m.label}</strong>
              <em className="muted small-text">{m.hint}</em>
            </span>
          </label>
        ))}
      </fieldset>
      {errors.payment && <em className="field-error">{errors.payment.message}</em>}

      <div className="step-actions">
        <button type="button" className="btn ghost" onClick={onBack}>
          ← Назад
        </button>
        <button type="submit" className="btn big" disabled={submitting}>
          {submitting ? 'Оформлення…' : '✔ Підтвердити замовлення'}
        </button>
      </div>
    </form>
  );
}
