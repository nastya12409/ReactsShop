// Гроші та промокоди — чисті функції без залежності від React.

// Промокоди магазину: значення — відсоток знижки
export const PROMOS = { SALE10: 10, SALE20: 20, WELCOME5: 5 };

// Форматування суми у гривні-еквіваленті долара
export const money = (value) =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD' }).format(value ?? 0);

// Ціна одиниці з урахуванням знижки товару (discountPercentage з API)
export const unitPrice = (item) => item.price * (1 - (item.discountPercentage ?? 0) / 100);
