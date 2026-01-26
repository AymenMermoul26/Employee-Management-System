import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const initialUser = {
  id: 'demo-user',
  role: 'ADMIN',
  accountStatus: 'ACTIF'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);

  const value = useMemo(() => {
    const isAuthenticated = Boolean(user);
    return {
      user,
      isAuthenticated,
      setUser
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
