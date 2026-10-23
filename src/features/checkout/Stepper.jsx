import { CHECKOUT_STEPS } from './checkoutSlice';


export default function Stepper({ current }) {
  return (
    <ol className="stepper" aria-label="Кроки оформлення замовлення">
      {CHECKOUT_STEPS.map((label, i) => (
        <li
          key={label}
          className={`step ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className="step-num">{i < current ? '✔' : i + 1}</span>
          <span className="step-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}
