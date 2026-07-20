import { useState, useCallback } from 'react';
import { getToken, clearToken } from './token';
import { getUserInfo, clearUserInfo } from './userInfo';

export function useAuth() {
  const [, forceRerender] = useState(0);

  const token = getToken();
  const user = getUserInfo();

  const logout = useCallback(() => {
    clearToken();
    clearUserInfo();
    forceRerender((n) => n + 1);
  }, []);

  return {
    isAuthenticated: Boolean(token),
    role: user?.role || 'CUSTOMER',
    user,
    logout,
  };
}
