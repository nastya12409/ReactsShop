import { z } from 'zod';



export const loginSchema = z.object({
  username: z.string().min(3, 'Логін — щонайменше 3 символи'),
  password: z.string().min(6, 'Пароль — щонайменше 6 символів'),
});

export const registerSchema = z
  .object({
    username: z.string().min(3, 'Логін — щонайменше 3 символи'),
    firstName: z.string().min(2, 'Вкажіть ім’я'),
    lastName: z.string().min(2, 'Вкажіть прізвище'),
    email: z.string().email('Некоректний email'),
    password: z.string().min(6, 'Пароль — щонайменше 6 символів'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Паролі не збігаються',
    path: ['confirm'],
  });


export const recipientSchema = z.object({
  firstName: z.string().min(2, 'Вкажіть ім’я'),
  lastName: z.string().min(2, 'Вкажіть прізвище'),
  email: z.string().email('Некоректний email'),
  phone: z.string().regex(/^\+?[0-9][0-9\s-]{8,14}$/, 'Телефон у форматі +380XXXXXXXXX'),
});


export const deliverySchema = z.object({
  city: z.string().min(2, 'Вкажіть місто'),
  address: z.string().min(5, 'Вкажіть відділення або адресу'),
  delivery: z.enum(['nova', 'courier', 'pickup'], { message: 'Оберіть спосіб доставки' }),
});


export const paymentSchema = z.object({
  payment: z.enum(['card', 'cash'], { message: 'Оберіть спосіб оплати' }),
});


export const productSchema = z.object({
  title: z.string().min(3, 'Назва — щонайменше 3 символи'),
  category: z.string().min(2, 'Вкажіть категорію'),
  price: z.coerce.number().positive('Ціна має бути більшою за 0'),
  stock: z.coerce.number().int('Кількість — ціле число').min(0, 'Не може бути від’ємною'),
  description: z.string().min(10, 'Опис — щонайменше 10 символів'),
});
