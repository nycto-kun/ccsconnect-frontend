import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Key, Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await api.post('/auth/forgot-password', null, { params: { email } });
      setMessage('If an account exists with that email, a password reset link has been sent.');
    } catch (err) {
      console.error('Password reset request failed', err);
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Simple Navigation */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-white font-bold text-lg">CCSconnect</span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/login" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium">Login</Link>
              <Link to="/register" className="bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium">Sign up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Forgot Password Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen pt-16 pb-12">
        <div className="w-full max-w-md px-4">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Reset Password</CardTitle>
              <p className="text-gray-500 mt-2">We'll send a password reset link to your inbox.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center text-sm">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="pl-10 h-12 border-gray-300 focus:border-gray-500"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-gray-700 hover:bg-gray-800 text-white">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
              <div className="text-center text-sm text-gray-600">
                <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;