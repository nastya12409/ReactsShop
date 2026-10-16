// Оболонка над localStorage: зберігання не падає, якщо сховище недоступне
// (приватний режим браузера або вичерпана квота).

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* сховище недоступне або переповнене */
  }
}
