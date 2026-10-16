import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { load, save } from '../../shared/utils/storage';

// ВЛАСНА ІМІТАЦІЯ СЕРВІСУ АВТОРИЗАЦІЇ (методичка дозволяє).
// Користувачі живуть у localStorage; токен — "підроблений JWT"
// з часом життя, щоб реалізувати автоматичний вихід.

const USERS_KEY = 'reactshop:users';
const SESSION_KEY = 'reactshop:session';
const TOKEN_TTL = 60 * 60 * 1000; // 1 година

const seedUsers = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    firstName: 'Олег',
    lastName: 'Адміністратор',
    email: 'admin@reactshop.ua',
    address: 'Одеса, вул. Думанська, 1',
  },
  {
    username: 'user',
    password: 'user123',
    role: 'user',
    firstName: 'Анна',
    lastName: 'Клієнт',
    email: 'anna@reactshop.ua',
    address: 'Київ, вул. Хрещатик, 10',
  },
];

const allUsers = () => [...seedUsers, ...load(USERS_KEY, [])];

// Публічна частина профілю — пароль у стан не потрапляє
const publicUser = ({ username, firstName, lastName, email, role, address }) => ({
  username,
  firstName,
  lastName,
  email,
  role,
  address: address ?? '',
});

const makeToken = (username) =>
  btoa(JSON.stringify({ sub: username, exp: Date.now() + TOKEN_TTL }));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    await delay(300); // імітація мережевого запиту
    const user = allUsers().find((u) => u.username === username.trim().toLowerCase());
    if (!user || user.password !== password) return rejectWithValue('Невірний логін або пароль');
    return { user: publicUser(user), token: makeToken(user.username), exp: Date.now() + TOKEN_TTL };
  },
);

export const register = createAsyncThunk('auth/register', async (form, { rejectWithValue }) => {
  await delay(300);
  const username = form.username.trim().toLowerCase();
  if (allUsers().some((u) => u.username === username))
    return rejectWithValue('Такий логін уже існує');
  const user = { ...form, username, role: 'user', address: '' };
  save(USERS_KEY, [...load(USERS_KEY, []), user]);
  return { user: publicUser(user), token: makeToken(username), exp: Date.now() + TOKEN_TTL };
});

// Сесія переживає перезавантаження, якщо токен ще дійсний
const saved = load(SESSION_KEY, null);
const alive = saved && saved.user && saved.exp > Date.now();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: alive ? saved.user : null,
    token: alive ? saved.token : null,
    exp: alive ? saved.exp : null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.exp = null;
      state.status = 'idle';
      state.error = null;
    },
    updateProfile(state, action) {
      if (state.user) Object.assign(state.user, action.payload);
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const fulfilled = (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.exp = action.payload.exp;
    };
    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Сталася помилка';
    };
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected);
  },
});

export const { logout, updateProfile } = authSlice.actions;

export default authSlice.reducer;
