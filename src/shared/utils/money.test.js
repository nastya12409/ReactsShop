import { describe, expect, it } from 'vitest';
import { PROMOS, money, unitPrice } from './money';

describe('money.js', () => {
  it('money форматує число як валюту', () => {
    expect(money(1234.5)).toContain('1');
    expect(money(undefined)).toContain('0');
  });

  it('unitPrice враховує знижку товару', () => {
    expect(unitPrice({ price: 1000, discountPercentage: 10 })).toBe(900);
    expect(unitPrice({ price: 50 })).toBe(50); // без знижки
  });

  it('промокоди містять очікувані відсотки', () => {
    expect(PROMOS.SALE10).toBe(10);
    expect(PROMOS.SALE20).toBe(20);
  });
});
