import { describe, expect, it } from 'vitest';
import {
  deliverySchema,
  loginSchema,
  paymentSchema,
  productSchema,
  recipientSchema,
  registerSchema,
} from './validation';

describe('схеми валідації (Zod)', () => {
  it('loginSchema: приймає коректні дані і відхиляє короткі', () => {
    expect(loginSchema.safeParse({ username: 'admin', password: 'admin123' }).success).toBe(true);
    expect(loginSchema.safeParse({ username: 'ab', password: '123456' }).success).toBe(false);
  });

  it('registerSchema: вимагає збігу паролів та коректний email', () => {
    const ok = registerSchema.safeParse({
      username: 'ivan',
      firstName: 'Іван',
      lastName: 'Петренко',
      email: 'ivan@example.com',
      password: 'secret1',
      confirm: 'secret1',
    });
    expect(ok.success).toBe(true);

    const mismatch = registerSchema.safeParse({
      username: 'ivan',
      firstName: 'Іван',
      lastName: 'Петренко',
      email: 'ivan@example.com',
      password: 'secret1',
      confirm: 'secret2',
    });
    expect(mismatch.success).toBe(false);

    const badEmail = registerSchema.safeParse({
      username: 'ivan',
      firstName: 'Іван',
      lastName: 'Петренко',
      email: 'not-an-email',
      password: 'secret1',
      confirm: 'secret1',
    });
    expect(badEmail.success).toBe(false);
  });

  it('checkoutSchema: перевіряє телефон і обов’язкові поля', () => {
    expect(
      recipientSchema.safeParse({
        firstName: 'Анна',
        lastName: 'Коваль',
        email: 'a@b.ua',
        phone: '+380671234567',
      }).success,
    ).toBe(true);
    expect(
      recipientSchema.safeParse({
        firstName: 'Анна',
        lastName: 'Коваль',
        email: 'a@b.ua',
        phone: 'abc',
      }).success,
    ).toBe(false);

    expect(
      deliverySchema.safeParse({ city: 'Київ', address: 'відділення 5', delivery: 'nova' }).success,
    ).toBe(true);
    expect(deliverySchema.safeParse({ city: 'Київ', address: '1', delivery: 'nova' }).success).toBe(
      false,
    );

    expect(paymentSchema.safeParse({ payment: 'card' }).success).toBe(true);
    expect(paymentSchema.safeParse({ payment: 'bitcoin' }).success).toBe(false);
  });

  it('productSchema: ціна має бути додатною, кількість — цілою', () => {
    expect(
      productSchema.safeParse({
        title: 'Ноутбук',
        category: 'laptops',
        price: 999.99,
        stock: 5,
        description: 'Потужний ноутбук для навчання',
      }).success,
    ).toBe(true);
    expect(
      productSchema.safeParse({
        title: 'Ноутбук',
        category: 'laptops',
        price: -5,
        stock: 5.5,
        description: 'Коротко',
      }).success,
    ).toBe(false);
  });
});
