import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          setProfile(res.data);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_role');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user_id, role } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_role', role);
    // Fetch full profile
    const userRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setUser(userRes.data);
    setProfile(userRes.data);
    return { user: userRes.data, role };
  };

  const registerStudent = async (studentId, email) => {
    const response = await api.post('/auth/register-student', null, {
      params: { student_id: studentId, email }
    });
    return response.data;
  };

  const registerCompany = async (fullName, email, password, companyName, industry) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      role: 'company',
      company_name: companyName,
      industry,
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, registerStudent, registerCompany, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};