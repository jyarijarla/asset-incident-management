import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedOrg = localStorage.getItem('org');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      if (storedOrg) setOrg(JSON.parse(storedOrg));
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenData, orgData = null) => {
    setUser(userData);
    setToken(tokenData);
    setOrg(orgData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    if (orgData) localStorage.setItem('org', JSON.stringify(orgData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOrg(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('org');
  };

  return (
    <AuthContext.Provider value={{ user, org, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);