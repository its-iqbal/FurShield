import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

// ── Context ───────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ── Reducer ───────────────────────────────────────────────────────────────────
const initialState = {
  user:          null,
  token:         null,
  isAuthenticated: false,
  isLoading:     true,   // true on mount while we check localStorage
  error:         null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      };
    case 'AUTH_FAIL':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Persist helpers ───────────────────────────────────────────────────────────
  const persistAuth = (token, user) => {
    localStorage.setItem('furshield_token', token);
    localStorage.setItem('furshield_user', JSON.stringify(user));
  };

  const clearAuth = () => {
    localStorage.removeItem('furshield_token');
    localStorage.removeItem('furshield_user');
  };

  // ── Rehydrate from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    const token   = localStorage.getItem('furshield_token');
    const userStr = localStorage.getItem('furshield_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Silently validate token against /auth/me
        api.get('/auth/me')
          .then(({ data }) => {
            dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.data, token } });
          })
          .catch(() => {
            clearAuth();
            dispatch({ type: 'LOGOUT' });
          });
      } catch {
        clearAuth();
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────────

  const register = useCallback(async (formData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.post('/auth/register', formData);
      persistAuth(data.data.token, data.data.user);
      dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
      return { success: true, user: data.data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persistAuth(data.data.token, data.data.user);
      dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
      return { success: true, user: data.data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearAuth();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem('furshield_user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  // ── Dashboard path helper ─────────────────────────────────────────────────────
  const getDashboardPath = useCallback((role) => {
    const map = { petOwner: '/dashboard', veterinarian: '/vet/dashboard', shelter: '/shelter/dashboard' };
    return map[role] || '/dashboard';
  }, []);

  const value = {
    ...state,
    register,
    login,
    logout,
    updateUser,
    clearError,
    getDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
