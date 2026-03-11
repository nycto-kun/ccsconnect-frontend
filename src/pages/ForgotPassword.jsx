import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // You'll need to implement this endpoint on the backend
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to send reset link', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Forgot Password</h1>
        <p>Enter your email to reset your account</p>
      </header>

      <div className="login-card">
        <div className="icon-header">
          <div className="mail-icon"><i className="fa-solid fa-key"></i></div>
          <h2>Reset Password</h2>
        </div>

        {!submitted ? (
          <>
            <p className="instruction-text">We'll send a password reset link to your inbox.</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-envelope input-icon"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <p>If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.</p>
          </div>
        )}

        <div className="footer-links">
          <p>Remember your password? <Link to="/login" className="signup-link">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;