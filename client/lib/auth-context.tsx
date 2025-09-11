import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getAuthToken } from './api';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  userInfo: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loginError: string | null;
  loginSuccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getAuthToken();
      setToken(storedToken);
      if (storedToken) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          setUserInfo(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          authAPI.logout();
          setToken(null);
          setUser(null);
          setUserInfo(null);
        }
      } else {
        setUser(null);
        setUserInfo(null);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(false);
    const response = await authAPI.login(email, password);
    console.log('Login response:', response);
    if (response.token && response.user) {
      window.localStorage.setItem('authToken', response.token);
      window.localStorage.setItem('currentUser', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      setUserInfo(response.user);
      setLoginSuccess(true);
      setLoginError(null);
      setTimeout(() => {
        console.log('AuthContext fields after login:');
        console.log('user:', response.user);
        console.log('userInfo:', response.user);
        console.log('token:', response.token);
        console.log('isAuthenticated:', true);
        console.log('loading:', false);
        console.log('loginError:', null);
        console.log('loginSuccess:', true);
      }, 0);
    } else {
      setUser(null);
      setUserInfo(null);
      setToken(null);
      setLoginError('No token or user received, login failed.');
      setLoginSuccess(false);
      console.log('No token or user received, login failed.');
      console.log('AuthContext fields after login:');
      console.log('user:', null);
      console.log('userInfo:', null);
      console.log('token:', null);
      console.log('isAuthenticated:', false);
      console.log('loading:', false);
      console.log('loginError:', 'No token or user received, login failed.');
      console.log('loginSuccess:', false);
    }
    setLoading(false);
  };

  const logout = () => {
  authAPI.logout();
  setUser(null);
  setUserInfo(null);
  setToken(null);
  setLoginError(null);
  setLoginSuccess(false);
  };

  const value = {
  user,
  userInfo,
  loading,
  login,
  logout,
  isAuthenticated,
  loginError,
  loginSuccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
