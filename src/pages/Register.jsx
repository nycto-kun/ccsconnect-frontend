import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [role, setRole] = useState('Student');
  const [studentId, setStudentId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = (newRole) => setRole(newRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        email,
        password,
        full_name: fullName,
        role: role.toLowerCase(),
        ...(role === 'Student' && { student_id: studentId })
      };
      await api.post('/auth/register', userData);
      setRegistered(true);
    } catch (error) {
      console.error('Registration failed', error);
      alert('Registration failed. ' + (error.response?.data?.detail || 'Try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="icon-header">
            <div className="mail-icon"><i className="fa-solid fa-envelope"></i></div>
            <h2>Verify Your Email</h2>
          </div>
          <p className="instruction-text">
            We've sent a confirmation email to <strong>{email}</strong>.<br />
            Please check your inbox and click the link to verify your account.
          </p>
          <p>After verification, you can <Link to="/login">log in</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Create Account</h1>
        <p>Join the AI-Enhanced CCS Internship Portal</p>
      </header>

      <div className="role-switcher">
        <button
          className={`role-btn ${role === 'Student' ? 'active' : ''}`}
          onClick={() => handleRoleSwitch('Student')}
        >
          <i className="fa-solid fa-user-graduate"></i> Student
        </button>
        <button
          className={`role-btn ${role === 'Company' ? 'active' : ''}`}
          onClick={() => handleRoleSwitch('Company')}
        >
          <i className="fa-solid fa-building"></i> Company
        </button>
      </div>

      <div className="login-card">
        <div className="icon-header">
          <div className="mail-icon"><i className="fa-solid fa-user-plus"></i></div>
          <h2>{role} Sign Up</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'Student' && (
            <div className="input-group">
              <label>Student Number</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-id-card input-icon"></i>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2022-00001-MN-0"
                  required
                />
              </div>
              <small className="helper-text">
                <i className="fa-solid fa-circle-info"></i> Verified via University Registrar API
              </small>
            </div>
          )}

          {role === 'Company' && (
            <>
              <div className="input-group">
                <label>Company Name</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-briefcase input-icon"></i>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter Registered Business Name"
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Industry</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-industry input-icon"></i>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Tech, Finance, BPO"
                  />
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-user input-icon"></i>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope input-icon"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="footer-links">
          <p>
            Already have an account? <Link to="/login" className="signup-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;