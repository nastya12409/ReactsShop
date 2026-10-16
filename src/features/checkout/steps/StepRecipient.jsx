import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '../../../app/hooks';
import { recipientSchema } from '../../../shared/utils/validation';

// Крок 1: дані одержувача. Попередні значення підставляються зі сховища,
// тому "назад" повертає вже заповнені поля.
export default function StepRecipient({ onNext }) {
  const data = useAppSelector((state) => state.checkout.data);
  const user = useAppSelector((state) => state.auth.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      firstName: data.firstName || user.firstName,
      lastName: data.lastName || user.lastName,
      email: data.email || user.email,
      phone: data.phone,
    },
  });

  return (
    <form className="card checkout-step" onSubmit={handleSubmit(onNext)} noValidate>
      <h2>Крок 1: дані одержувача</h2>

      <div className="field-row">
        <label className="field">
          <span>Ім’я *</span>
          <input {...register('firstName')} />
          {errors.firstName && <em className="field-error">{errors.firstName.message}</em>}
        </label>
        <label className="field">
          <span>Прізвище *</span>
          <input {...register('lastName')} />
          {errors.lastName && <em className="field-error">{errors.lastName.message}</em>}
        </label>
      </div>

      <label className="field">
        <span>Email *</span>
        <input type="email" {...register('email')} />
        {errors.email && <em className="field-error">{errors.email.message}</em>}
      </label>

      <label className="field">
        <span>Телефон *</span>
        <input type="tel" placeholder="+380XXXXXXXXX" {...register('phone')} />
        {errors.phone && <em className="field-error">{errors.phone.message}</em>}
      </label>

      <button type="submit" className="btn big">
        Далі: доставка →
      </button>
    </form>
  );
}
