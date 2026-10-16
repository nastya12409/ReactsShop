import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fillData, resetCheckout, setStep } from '../features/checkout/checkoutSlice';
import Stepper from '../features/checkout/Stepper';
import StepRecipient from '../features/checkout/steps/StepRecipient';
import StepDelivery from '../features/checkout/steps/StepDelivery';
import StepPayment from '../features/checkout/steps/StepPayment';
import {
  clearCart,
  selectCartDiscount,
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
} from '../features/cart/cartSlice';
import { placeOrder } from '../features/orders/ordersSlice';
import { money } from '../shared/utils/money';

// Багатокрокове оформлення: 3 кроки + підсумок.
// Дані кроків живуть у Redux, тому "назад" нічого не втрачає.
export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const step = useAppSelector((state) => state.checkout.step);
  const checkoutData = useAppSelector((state) => state.checkout.data);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const discount = useAppSelector(selectCartDiscount);
  const total = useAppSelector(selectCartTotal);
  const promo = useAppSelector((state) => state.cart.promo);
  const user = useAppSelector((state) => state.auth.user);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="page empty-state">
        <h1>Немає товарів для замовлення</h1>
        <Link to="/" className="btn">
          До каталогу
        </Link>
      </div>
    );
  }

  // Крок 1 → 2
  const nextFromRecipient = (values) => {
    dispatch(fillData(values));
    dispatch(setStep(1));
  };

  // Крок 2 → 3
  const nextFromDelivery = (values) => {
    dispatch(fillData(values));
    dispatch(setStep(2));
  };

  // Підтвердження: створюємо замовлення, чистимо кошик, ідемо на сторінку замовлення
  const confirmOrder = (values) => {
    setSubmitting(true);
    const data = { ...checkoutData, ...values };
    dispatch(fillData(data));
    // Звичайний (не асинхронний) екшен повертає payload з id замовлення
    const action = dispatch(
      placeOrder({
        customer: { ...data, username: user.username },
        items: items.map((i) => ({ ...i })),
        promo,
        subtotal,
        discount,
        total,
      }),
    );
    dispatch(clearCart());
    dispatch(resetCheckout());
    setSubmitting(false);
    navigate(`/order/${action.payload.id}`);
  };

  return (
    <div className="page checkout-page">
      <h1>Оформлення замовлення</h1>
      <Stepper current={step} />

      <div className="checkout-layout">
        <div className="checkout-steps">
          {step === 0 && <StepRecipient onNext={nextFromRecipient} />}
          {step === 1 && (
            <StepDelivery onNext={nextFromDelivery} onBack={() => dispatch(setStep(0))} />
          )}
          {step === 2 && (
            <StepPayment
              onBack={() => dispatch(setStep(1))}
              onConfirm={confirmOrder}
              submitting={submitting}
            />
          )}
        </div>

        <aside className="card summary" aria-label="Ваше замовлення">
          <h2>Ваше замовлення</h2>
          <ul className="summary-items">
            {items.map((i) => (
              <li key={i.id} className="summary-row">
                <span>
                  {i.title} × {i.qty}
                </span>
                <span>{money(i.price * (1 - (i.discountPercentage ?? 0) / 100) * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Підсумок</span>
            <span>{money(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row discount-row">
              <span>Знижка ({promo})</span>
              <span>−{money(discount)}</span>
            </div>
          )}
          <div className="summary-row total-row">
            <span>До сплати</span>
            <strong>{money(total)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
