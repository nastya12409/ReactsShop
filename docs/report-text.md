# Текст для звіту: робота №2 «Інтернет-магазин ReactShop»

Нижче — текст роботи по етапах (копіюється у Word). Код наведено з реального проєкту.

## Етап 1. Створення проєкту та встановлення залежностей

Для створення проєкту використала збірник Vite та шаблон React. За умовою методички TypeScript зазначено як бажаний, але не обов'язковий, тому реалізацію виконала на JavaScript, що відповідає вимозі «React 18+» і спрощує супровід коду. У робочому каталозі виконала команди:

```
npm create vite@latest reactshop -- --template react
cd reactshop
npm install
npm install react-router-dom @reduxjs/toolkit react-redux axios
npm install react-hook-form zod @hookform/resolvers
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event prettier eslint-config-prettier
```

У `package.json` налаштувала скрипти запуску, тестів, лінтера та форматування:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "format": "prettier --write src",
  "test": "vitest run",
  "preview": "vite preview"
}
```

Адресу відкритого API DummyJSON винесла у змінну середовища. Створила файл `.env` (він у `.gitignore`, а в репозиторій покладено зразок `.env.example`):

```
VITE_API_URL=https://dummyjson.com
```

У конфігурації Vite одразу налаштувала середовище тестів (jsdom) та файл початкового налаштування:

```js
// vite.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
```

У `index.html` задала `lang="uk"`, змістовний `title` і метатег `description` (враховується при перевірці доступності та SEO). Також створила конфіги `eslint.config.js` (flat config), `.prettierrc` і `vercel.json` для SPA-деплою.

## Етап 2. Розкладання коду за каталогами

Код розклашла за функціональними областями (features): усе, що стосується кошика, лежить поруч — зріз, компоненти, тести. Спільні частини винесено в `shared/`:

```
src/
  app/        store.js, hooks.js, router.jsx, Layout.jsx
  shared/
    api/      http.js, axiosBaseQuery.js, api.js
    ui/       Skeleton, Pagination, Modal, Rating, ErrorBoundary, RouteError, Spinner
    hooks/    useDebounce.js
    utils/    storage.js, money.js, validation.js
  features/
    cart/       cartSlice.js, CartItemRow.jsx
    favorites/  favoritesSlice.js
    auth/       authSlice.js, PrivateRoute.jsx, useAutoLogout.js
    checkout/   checkoutSlice.js, Stepper.jsx, steps/
    orders/     ordersSlice.js
    products/   ProductCard.jsx, Filters.jsx
    admin/      ProductsTable.jsx, ProductForm.jsx
  pages/      ProductsPage, ProductPage, CartPage, FavoritesPage, LoginPage,
              RegisterPage, ProfilePage, CheckoutPage, OrderPage, AdminPage
  test/       setup.js
  main.jsx
```

Призначення основних блоків:

- `shared/api/` — єдине місце для запитів: екземпляр axios та RTK Query;
- `shared/utils/validation.js` — схеми валідації Zod (використовуються і в формах, і в тестах);
- `features/*` — зрізи Redux Toolkit та компоненти кожної області;
- `pages/` — сторінки за маршрутами;
- `app/` — сховище, роутер із ледачим завантаженням, каркас із шапкою.

## Етап 3. Централізований шар API

Створила екземпляр axios з інтерсепторами: запит підставляє токен, якщо користувач залогінений, а помилки приводяться до єдиного вигляду `{ status, message }`:

```js
// shared/api/http.js
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dummyjson.com',
  timeout: 15000,
});

// Запит: підставляємо токен, якщо користувач залогінений
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('reactshop:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Відповідь: приводимо помилки до єдиного вигляду { status, message }
http.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject({
      status: error.response?.status ?? 0,
      message: error.response?.data?.message ?? error.message ?? 'Помилка мережі',
    }),
);
```

Щоб поєднати кешування RTK Query з власним axios, написала міст `axiosBaseQuery` і оголосила ендпоінти:

```js
// shared/api/axiosBaseQuery.js
export const axiosBaseQuery =
  ({ instance = http } = {}) =>
  async ({ url, method = 'GET', data, params }) => {
    try {
      const result = await instance({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      return { error: { status: error.status ?? 0, data: error.data, message: error.message } };
    }
  };
```

```js
// shared/api/api.js (фрагмент)
export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ instance: http }),
  tagTypes: ['Products', 'Product'],
  endpoints: (builder) => ({
    // limit=0 — API повертає весь каталог (~190 товарів) одним запитом
    getProducts: builder.query({
      query: () => ({ url: '/products', params: { limit: 0 } }),
      providesTags: ['Products'],
    }),
    getProduct: builder.query({ query: (id) => ({ url: `/products/${id}` }) }),
    addProduct: builder.mutation({ query: (body) => ({ url: '/products/add', method: 'POST', body }) }),
    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/products/${id}`, method: 'PUT', body: patch }),
    }),
    deleteProduct: builder.mutation({ query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }) }),
  }),
});
```

DummyJSON — фейковий API: він приймає запити, але не зберігає зміни. Тому після мутацій кеш каталогу оновлюється вручну через `onQueryStarted` і `updateQueryData`, і таблиця адмін-розділу не «відкочується» після повторного завантаження:

```js
// shared/api/api.js (фрагмент updateProduct)
async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
  try {
    await queryFulfilled;
    dispatch(
      api.util.updateQueryData('getProducts', undefined, (draft) => {
        const product = draft.products.find((p) => p.id === id);
        if (product) Object.assign(product, patch);
      }),
    );
  } catch {
    /* помилку покаже isError у компонента */
  }
},
```

## Етап 4. Redux-сховище та зріз кошика

Сховище зібрана функцією `makeStore`, щоб у тестах отримувати чистий стан. Кошик, обране, авторизація та замовлення персистяться в `localStorage` підпискою на store; кеш API у сховище не пишеться:

```js
// app/store.js (фрагмент)
export const makeStore = () => {
  const store = configureStore({
    reducer: {
      cart, favorites, auth, checkout, orders,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  store.subscribe(() => {
    const state = store.getState();
    save('reactshop:cart', state.cart);
    save('reactshop:favorites', state.favorites);
    save('reactshop:orders', state.orders);
    save('reactshop:session', {
      user: state.auth.user,
      token: state.auth.token,
      exp: state.auth.exp,
    });
    if (state.auth.token) localStorage.setItem('reactshop:token', state.auth.token);
    else localStorage.removeItem('reactshop:token');
  });

  return store;
};
```

У зрізі кошика додавання того самого товару збільшує кількість, а не створює дублікат. Суми обчислюються мемоізованими селекторами `createSelector`, тому перераховуються лише при зміні `items`:

```js
// features/cart/cartSlice.js (фрагмент)
addToCart(state, action) {
  const product = action.payload;
  const item = state.items.find((i) => i.id === product.id);
  if (item) {
    item.qty += 1;
  } else {
    state.items.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      discountPercentage: product.discountPercentage,
      qty: 1,
    });
  }
},
applyPromo(state, action) {
  const code = String(action.payload ?? '').trim().toUpperCase();
  state.promo = PROMOS[code] ? code : null;
},
```

```js
// features/cart/cartSlice.js (селектори)
export const selectCartCount = createSelector([selectItems], (items) =>
  items.reduce((n, i) => n + i.qty, 0),
);

export const selectCartSubtotal = createSelector([selectItems], (items) =>
  items.reduce((sum, i) => sum + unitPrice(i) * i.qty, 0),
);

export const selectCartDiscount = createSelector(
  [selectCartSubtotal, (state) => state.cart.promo],
  (subtotal, promo) => (promo ? (subtotal * PROMOS[promo]) / 100 : 0),
);
```

`unitPrice` враховує знижку самого товару (`discountPercentage` з API), а промокод дає додаткову знижку від суми.

## Етап 5. Зріз обраного

Обране зберігає об'єктами (не ідентифікаторами), щоб сторінка `/favorites` працювала без повторного запиту до API. Додавання того самого товару — прибирає його з обраного:

```js
// features/favorites/favoritesSlice.js (фрагмент)
toggleFavorite(state, action) {
  const product = action.payload;
  const index = state.findIndex((f) => f.id === product.id);
  if (index >= 0) state.splice(index, 1);
  else
    state.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      brand: product.brand,
      category: product.category,
    });
},
```

## Етап 6. Авторизація: імітація сервісу, токен, захищені маршрути

За умовою авторизацію можна реалізувати «через API або власний сервіс-імітацію». Обрала власну імітацію: користувачі живуть у `localStorage`, токен — «підроблений JWT» із часом життя, що дозволяє реалізувати ролі (admin/user) та автоматичний вихід. Вхід — асинхронна дія (`createAsyncThunk`) з імітацією затримки мережі:

```js
// features/auth/authSlice.js (фрагмент)
const TOKEN_TTL = 60 * 60 * 1000; // 1 година

const makeToken = (username) =>
  btoa(JSON.stringify({ sub: username, exp: Date.now() + TOKEN_TTL }));

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    await delay(300); // імітація мережевого запиту
    const user = allUsers().find((u) => u.username === username.trim().toLowerCase());
    if (!user || user.password !== password) return rejectWithValue('Невірний логін або пароль');
    return { user: publicUser(user), token: makeToken(user.username), exp: Date.now() + TOKEN_TTL };
  },
);
```

Пароль у стан не потрапляє — зберігається лише публічна частина профілю. Сесія переживає перезавантаження сторінки, якщо токен ще дійсний. Демо-акаунти: `admin/admin123` (роль admin) та `user/user123` (клієнт).

Захищений маршрут — компонент-обгортка; після входу користувач повертається на сторінку, з якої прийшов:

```jsx
// features/auth/PrivateRoute.jsx
export function PrivateRoute({ role }) {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
}
```

Автоматичний вихід після завершення дії токена — хук із таймером на час, що лишився:

```jsx
// features/auth/useAutoLogout.js (фрагмент)
useEffect(() => {
  if (!user || !exp) return;

  const expire = () => {
    dispatch(logout());
    navigate('/login', { state: { expired: true } });
  };

  const ms = exp - Date.now();
  if (ms <= 0) {
    expire();
    return;
  }
  const timer = setTimeout(expire, ms);
  return () => clearTimeout(timer);
}, [user, exp, dispatch, navigate, location.pathname]);
```

Кожен маршрут вимагає сесію або роль, а `/checkout` та `/order/:id` доступні лише залогіненим — це і є захищені маршрути з методички.

## Етап 7. Маршрутизація: React.lazy і ErrorBoundary

Кожна сторінка вантажиться ліниво — окремим чанком, з індикатором завантаження через `Suspense`:

```jsx
// app/router.jsx (фрагмент)
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductPage = lazy(() => import('../pages/ProductPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
// ... решта сторінок так само

const page = (Component) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: page(ProductsPage) },
      { path: '/products/:id', element: page(ProductPage) },
      { path: '/cart', element: page(CartPage) },
      // ...
      {
        element: <PrivateRoute />,
        children: [
          { path: '/profile', element: page(ProfilePage) },
          { path: '/checkout', element: page(CheckoutPage) },
          { path: '/order/:id', element: page(OrderPage) },
        ],
      },
      {
        element: <PrivateRoute role="admin" />,
        children: [{ path: '/admin', element: page(AdminPage) }],
      },
    ],
  },
]);
```

Помилки маршрутів ловить `errorElement` (сторінка `RouteError` на основі `useRouteError`), а помилки рендеру — класний `ErrorBoundary` рівня застосунку:

```jsx
// shared/ui/ErrorBoundary.jsx (фрагмент)
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page error-page" role="alert">
          <h1>Щось пішло не так 😔</h1>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Перезавантажити сторінку
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

## Етап 8. Каталог: фільтри в URL, debounce, пагінація

Каталог завантажує весь перелік товарів з API одним запитом (DummyJSON не підтримує комбінації фільтрів «категорія + ціна + рейтинг + пошук» на боці сервера), далі фільтрування, сортування та пагінація працюють на клієнті — для ~190 товарів це миттєво, а дані кешовані RTK Query. Стан фільтрів зберігається в query-параметрах URL, тому посилання на відфільтрований каталог можна поділитися. Текст пошуку оновлюється через `useDebounce` (300 мс), щоб не «мусорити» в історії браузера:

```jsx
// pages/ProductsPage.jsx (фрагмент)
const q = params.get('q') ?? '';
const category = params.get('category') ?? '';
const price = Number(params.get('price') ?? 0);
const rating = Number(params.get('rating') ?? 0);
const sort = params.get('sort') ?? 'default';
const page = Math.max(1, Number(params.get('page') ?? 1));

const [text, setText] = useState(q);
const debounced = useDebounce(text, 300);
useEffect(() => {
  if (debounced === q) return;
  const next = new URLSearchParams(params);
  if (debounced) next.set('q', debounced);
  else next.delete('q');
  next.delete('page');
  setParams(next, { replace: true });
}, [debounced]);

const filtered = useMemo(() => {
  const list = products.filter((p) => {
    const haystack = `${p.title} ${p.description} ${p.brand ?? ''}`.toLowerCase();
    if (q && !haystack.includes(q.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    if (price && p.price > price) return false;
    if (rating && (p.rating ?? 0) < rating) return false;
    return true;
  });
  switch (sort) {
    case 'price-asc': return [...list].sort((a, b) => a.price - b.price);
    case 'rating-desc': return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    // ... решта варіантів сортування
    default: return list;
  }
}, [products, q, category, price, rating, sort]);
```

Сам хук `useDebounce` — власний, у `shared/hooks/`:

```js
// shared/hooks/useDebounce.js
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

Під час завантаження показуються скелетони карток, помилка запиту — блок із кнопкою «Повторити», а пагінація (`shared/ui/Pagination.jsx`) відображає номери сторінок із «трьома крапками» та атрибутом `aria-current="page"`.

## Етап 9. Сторінка товару

Сторінка отримує товар за id (`useGetProductQuery`), галерея зображень перемикається між мініатюрами. Стан активного зображення скидається при переході на інший товар «коригуванням стану під час рендеру» (рекомендований React-паттерн замість `useEffect`):

```jsx
// pages/ProductPage.jsx (фрагмент)
const [activeImage, setActiveImage] = useState('');
// Скидаємо галерею при зміні товару: pattern "коригування стану під час рендеру"
const [prevThumb, setPrevThumb] = useState(undefined);
if (product?.thumbnail !== prevThumb) {
  setPrevThumb(product?.thumbnail);
  setActiveImage(product?.thumbnail ?? '');
}
```

Блок «Схожі товари» формується з кешованого каталогу — товари тієї самої категорії, без повтору поточного:

```jsx
// pages/ProductPage.jsx (фрагмент)
const similar = (catalog?.products ?? [])
  .filter((p) => p.category === product?.category && p.id !== product?.id)
  .slice(0, 4);
```

Крім того, на сторінці: характеристики з API (вага, габарити, гарантія, доставка, повернення), відгуки товару, наявність, кнопки «Додати до кошика» та «В обране».

## Етап 10. Кошик і промокоди

Рядок кошика має керування кількістю (кнопки та поле введення) і підсумок з урахуванням знижки товару:

```jsx
// features/cart/CartItemRow.jsx (фрагмент)
<div className="qty">
  <button type="button" className="btn small"
          onClick={() => dispatch(decQty(item.id))}
          aria-label={`Зменшити кількість ${item.title}`}>−</button>
  <input type="number" min="1" max="99" value={item.qty}
         aria-label={`Кількість ${item.title}`}
         onChange={(e) => dispatch(setQty({ id: item.id, qty: Number(e.target.value) || 1 }))} />
  <button type="button" className="btn small"
          onClick={() => dispatch(incQty(item.id))}
          aria-label={`Збільшити кількість ${item.title}`}>+</button>
</div>
<strong className="cart-row-total">{money(unitPrice(item) * item.qty)}</strong>
```

Промокоди та гроші — чисті функції в `shared/utils/`:

```js
// shared/utils/money.js
export const PROMOS = { SALE10: 10, SALE20: 20, WELCOME5: 5 };

export const money = (value) =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD' }).format(value ?? 0);

// Ціна одиниці з урахуванням знижки товару (discountPercentage з API)
export const unitPrice = (item) => item.price * (1 - (item.discountPercentage ?? 0) / 100);
```

Підсумок кошика: «Товари (N)», знижка за промокодом із підписом та кнопкою прибирання, «До сплати». Стан кошика зберігається в `localStorage`, лічильник товарів відображається в шапці.

## Етап 11. Валідація форм: React Hook Form і Zod

Усі схеми валідації винесено в окремий файл — одне джерело правди для форм і тестів:

```js
// shared/utils/validation.js (фрагмент)
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

// Крок 1 оформлення замовлення — дані одержувача
export const recipientSchema = z.object({
  firstName: z.string().min(2, 'Вкажіть ім’я'),
  lastName: z.string().min(2, 'Вкажіть прізвище'),
  email: z.string().email('Некоректний email'),
  phone: z.string().regex(/^\+?[0-9][0-9\s-]{8,14}$/, 'Телефон у форматі +380XXXXXXXXX'),
});
```

Форма входу підключає схему через `zodResolver`, а помилки виводяться під полями:

```jsx
// pages/LoginPage.jsx (фрагмент)
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({ resolver: zodResolver(loginSchema) });

const onSubmit = (values) => {
  dispatch(login(values))
    .unwrap()
    .then(() => navigate(from, { replace: true }))
    .catch(() => {});
};

// ...
<label className="field">
  <span>Логін</span>
  <input {...register('username')} placeholder="admin" autoComplete="username" />
  {errors.username && <em className="field-error">{errors.username.message}</em>}
</label>
```

## Етап 12. Багатокрокове оформлення замовлення

Оформлення — три кроки «дані одержувача → доставка → оплата» з індикатором прогресу. Дані кроків зберігаються в Redux-зрізі, тому кнопка «назад» повертає вже заповнені поля — вимога «збереження введеного під час повернення назад» виконується:

```js
// features/checkout/checkoutSlice.js (фрагмент)
const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {
    step: 0,
    data: { firstName: '', lastName: '', email: '', phone: '',
            city: '', address: '', delivery: 'nova', payment: 'card' },
  },
  reducers: {
    setStep(state, action) { state.step = action.payload; },
    fillData(state, action) { Object.assign(state.data, action.payload); },
    resetCheckout(state) {
      state.step = 0;
      state.data = { ...checkoutSlice.getInitialState().data };
    },
  },
});
```

Після підтвердження створюється замовлення, кошик очищується, і користувач потрапляє на сторінку підтвердження з номером замовлення:

```jsx
// pages/CheckoutPage.jsx (фрагмент)
const confirmOrder = (values) => {
  const data = { ...checkoutData, ...values };
  dispatch(fillData(data));
  // Звичайний (не асинхронний) екшен повертає payload з id замовлення
  const action = dispatch(
    placeOrder({
      customer: { ...data, username: user.username },
      items: items.map((i) => ({ ...i })),
      promo, subtotal, discount, total,
    }),
  );
  dispatch(clearCart());
  dispatch(resetCheckout());
  navigate(`/order/${action.payload.id}`);
};
```

Замовлення зберігаються в зрізі `orders` (персиститься в `localStorage`) і відображаються в профілі як історія; сторінка замовлення показує склад, суму, спосіб доставки та оплати.

## Етап 13. Адмін-розділ

Адмін-розділ (маршрут із перевіркою ролі `admin`) містить таблицю всіх товарів. Сортування за стовпцями — на клієнті, з атрибутом `aria-sort` для доступності:

```jsx
// features/admin/ProductsTable.jsx (фрагмент)
{COLUMNS.map((col) => (
  <th key={col.key} scope="col" aria-sort={sort.key === col.key ? sort.dir : 'none'}>
    <button type="button" className="th-sort" onClick={() => onSort(col.key)}>
      {col.label}
      <span aria-hidden="true">
        {sort.key === col.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
      </span>
    </button>
  </th>
))}
```

```jsx
// pages/AdminPage.jsx (фрагмент)
const onSort = (key) =>
  setSort((s) =>
    s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
```

Додавання та редагування — у модальному вікні (React Portal, Esc, клік поза вікном) із формою на `react-hook-form` + Zod-схемою `productSchema`. Збереження виконує мутація RTK Query; якщо API повернув помилку, вона показується у формі. Видалення — з підтвердженням через `window.confirm`.

## Етап 14. Стилі та адаптивна верстка

Усі кольори визначені CSS-змінними в одному місці; компоненти використовують лише змінні:

```css
/* index.css */
:root {
  --bg: #f4f6f9;
  --surface: #ffffff;
  --text: #1b1f24;
  --muted: #616a75;
  --border: #dde2e8;
  --accent: #2563eb;
  --accent-soft: #eaf0fe;
  --danger: #dc2626;
  --success: #16a34a;
  --radius: 12px;
}
```

Для малих екранів сітки переходять у одну колонку, елементи керування переносяться на новий рядок; верстка коректна від 360 px:

```css
@media (max-width: 960px) {
  .catalog-page { grid-template-columns: 1fr; }
  .product-top { grid-template-columns: 1fr; }
  .cart-layout,
  .checkout-layout,
  .profile-layout { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .product-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  .field-row { grid-template-columns: 1fr; }
}
```

Доступність: семантичні теги (`header`, `nav`, `main`, `section`, `table`), `aria-label`/`aria-pressed`/`aria-current`/`aria-sort`, видимий фокус (`:focus-visible`), зображення з `alt` і `loading="lazy"`.

## Етап 15. Тести

Налаштувала Vitest із середовищем jsdom. Написала 17 тестів у чотирьох файлах: зріз кошика, схеми валідації Zod, грошові утиліти та компонент картки товару. Приклад тесту зрізу — перевіряються і граничні значення кількості, і селектори сум:

```js
// features/cart/cartSlice.test.js (фрагмент)
it('кількість не опускається нижче 1; інкремент/декремент працюють', () => {
  let state = cartReducer(initial, addToCart(product));
  state = cartReducer(state, incQty(1));
  expect(state.items[0].qty).toBe(2);
  state = cartReducer(state, decQty(1));
  expect(state.items[0].qty).toBe(1);
  state = cartReducer(state, decQty(1)); // остання одиниця — видалення
  expect(state.items).toHaveLength(0);
});

it('селектори рахують суми зі знижкою товару і промокодом', () => {
  let state = { cart: cartReducer(initial, addToCart(product)) };
  state = cartReducer(state.cart, incQty(1)); // qty = 2, ціна за шт. зі знижкою 900
  const withQty = { cart: state };

  expect(selectCartCount(withQty)).toBe(2);
  expect(selectCartSubtotal(withQty)).toBe(1800); // 900 × 2

  const promoState = { cart: cartReducer(state, applyPromo('SALE10')) };
  expect(selectCartDiscount(promoState)).toBeCloseTo(180);
  expect(selectCartTotal(promoState)).toBeCloseTo(1620);
});
```

Тест картки товару рендерить компонент у справжньому `Provider` із чистим сховищем і перевіряє реальний вплив на стан Redux:

```jsx
// features/products/ProductCard.test.jsx (фрагмент)
it('кнопка «До кошика» додає товар у стан Redux', () => {
  const store = makeStore();
  renderCard(store);

  fireEvent.click(screen.getByRole('button', { name: /до кошика/i }));
  expect(store.getState().cart.items).toHaveLength(1);
  expect(store.getState().cart.items[0]).toMatchObject({ id: 42, qty: 1 });
});
```

## Етап 16. Перевірка якості коду та збірка

Перед здаванням перевірила інструменти:

```
npm run lint    → ESLint: 0 помилок, 0 попереджень
npm test        → Vitest: 4 файли, 17 тестів — усі пройшли
npm run build   → збірка Vite успішна; сторінки зібрані окремими лінивими чанками
                  (ProductsPage, ProductPage, CartPage, CheckoutPage, AdminPage тощо)
```

Під час перевірки в браузері пройшла повний сценарій: каталог із фільтрами → сторінка товару → додавання в кошик → промокод SALE10 (знижка −10%) → три кроки оформлення з валідацією телефону → сторінка замовлення (кошик спорожнено) → адмін-розділ (194 товари, сортування за ціною, модальне редагування). Помилок у консолі браузера немає.

## Висновки

У ході роботи реалізовано клієнтську частину інтернет-магазину за всіма пунктами методички: каталог із фільтрами (категорія, ціна, рейтинг), debounce-пошуком, сортуванням і пагінацією; сторінка товару з галереєю, відгуками та схожими товарами; кошик зі знижками, промокодами та збереженням у localStorage; обране; авторизація з власною імітацією сервісу, токеном, ролями, захищеними маршрутами та автоматичним виходом; багатокрокове оформлення замовлення з валідацією кожного кроку; профіль з історією замовлень; адмін-розділ із таблицею, сортуванням за стовпцями та CRUD-операціями через API-шар. Технічні вимоги виконані: ледаче завантаження маршрутів, Error Boundary, централізований шар API на axios з інтерсепторами, кешування запитів RTK Query, семантичний HTML із aria-атрибутами, 17 автоматичних тестів, адаптивна верстка від 360 px. Код розкладено за каталогами (features/shared), логіка стану винесена в чисті зрізи, ESLint і Prettier працюють без помилок, продакшн-збірка успішна.
