import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase, Building, GraduationCap, IdCard, Factory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { registerStudent, registerCompany } = useAuth();
  const [role, setRole] = useState('student');
  const [studentId, setStudentId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (role === 'student') {
        await registerStudent(studentId, email);
        setMessage('Account created! Check your email for the temporary password.');
      } else {
        await registerCompany(fullName, email, password, companyName, industry);
        setMessage('Registration successful! Please check your email to confirm your account before logging in.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed. Please check your details.');
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

      {/* Registration Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen pt-16 pb-12">
        <div className="w-full max-w-md px-4">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">
                {role === 'student' ? 'Student Registration' : 'Company Registration'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Role Switcher */}
              <div className="flex gap-4 mb-6 bg-white/20 p-1 rounded-xl shadow-sm">
                <button
                  onClick={() => setRole('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    role === 'student' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Student
                </button>
                <button
                  onClick={() => setRole('company')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    role === 'company' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Building className="w-4 h-4" /> Company
                </button>
              </div>

              {message ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center space-y-2">
                  <p>{message}</p>
                  {role === 'company' && (
                    <Link to="/login" className="text-green-700 font-medium underline inline-block">Go to Login</Link>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {role === 'student' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="studentId" className="text-gray-700">Student Number</Label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="studentId"
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="e.g. 2022-00001-MN-0"
                            className="pl-10 h-12 border-gray-300 focus:border-gray-500"
                            required
                          />
                        </div>
                      </div>
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
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="pl-10 h-12 border-gray-300 focus:border-gray-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-gray-700">Company Name</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter registered business name"
                            className="pl-10 h-12 border-gray-300 focus:border-gray-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-gray-700">Industry</Label>
                        <div className="relative">
                          <Factory className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="industry"
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="e.g. Technology, Finance"
                            className="pl-10 h-12 border-gray-300 focus:border-gray-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="pl-10 h-12 border-gray-300 focus:border-gray-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a strong password"
                            className="pl-10 h-12 border-gray-300 focus:border-gray-500"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center text-sm">{error}</div>}

                  <Button type="submit" disabled={loading} className="w-full h-12 bg-gray-700 hover:bg-gray-800 text-white">
                    {loading ? 'Processing...' : (role === 'student' ? 'Register' : 'Create Account')}
                  </Button>
                </form>
              )}

              <div className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">Sign in here</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;