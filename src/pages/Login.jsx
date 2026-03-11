import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleClick = (selectedRole) => setRole(selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user_id, role: userRole } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('user_role', userRole);

      // Redirect based on role
      if (userRole === 'student') navigate('/dashboard/student');
      else if (userRole === 'company') navigate('/dashboard/company');
      else if (userRole === 'admin') navigate('/dashboard/admin');
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Welcome Back</h1>
        <p>Access your CCSConnect Portal</p>
      </header>

      <div className="login-card">
        <div className="role-selector">
          {['Student', 'Company', 'Admin'].map((r) => (
            <button
              key={r}
              className={`role-btn ${role === r ? 'active' : ''}`}
              onClick={() => handleRoleClick(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="icon-header">
          <div className="mail-icon"><i className="fa-solid fa-right-to-bracket"></i></div>
          <h2>{role} Login</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope input-icon"></i>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'} toggle-icon`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>

          <div className="remember-me-row">
            <label><input type="checkbox" /> Remember me</label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="footer-links">
          <p>
            Don't have an account? <Link to="/register" className="signup-link">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;