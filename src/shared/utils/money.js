
export const PROMOS = { SALE10: 10, SALE20: 20, WELCOME5: 5 };


export const money = (value) =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD' }).format(value ?? 0);


export const unitPrice = (item) => item.price * (1 - (item.discountPercentage ?? 0) / 100);
