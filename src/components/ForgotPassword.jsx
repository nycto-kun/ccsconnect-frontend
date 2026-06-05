import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Key, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api from '../utils/api';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/auth/forgot-password', null, { params: { email } });
      setSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (err) {
      console.error('Password reset request failed:', err);
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to reset your password. The link expires in 24 hours.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-4">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Reset Password</CardTitle>
            <p className="text-gray-500 mt-2">Enter your email and we'll send you a reset link</p>
          </CardHeader>
          <CardContent>
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
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-gray-700 hover:bg-gray-800 text-white">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            <div className="text-center text-sm text-gray-600 mt-6">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;