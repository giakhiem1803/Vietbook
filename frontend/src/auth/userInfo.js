const USER_KEY = 'vietbook_user';

export function setUserInfo(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getUserInfo() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function clearUserInfo() {
  localStorage.removeItem(USER_KEY);
}
