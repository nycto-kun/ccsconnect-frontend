import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap,
  Award, Star, FileText, Edit3, Upload, CheckCircle, Clock, XCircle,
  TrendingUp, Target, Link, Github, Linkedin, Globe, Shield,
  Code, Database, Palette, Save, Eye, EyeOff, AlertTriangle, Timer,
  Camera, Download, Trophy, BookOpen, Users, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import ChangePassword from './ChangePassword';

export const ProfilePage = ({ userRole: propRole }) => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Mock data – replace with API calls later
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || 'Arjun Sharma',
    email: user?.email || 'arjun.sharma@college.edu',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    bio: 'Passionate software engineer with a strong foundation in full-stack development and machine learning. Actively seeking impactful internship opportunities.',
    department: 'Computer Science & Engineering',
    year: '4th Year (Final)',
    cgpa: 8.7,
    github: 'github.com/arjunsharma',
    linkedin: 'linkedin.com/in/arjunsharma',
    portfolio: 'arjunsharma.dev',
    skills: [
      { name: 'React.js', level: 90 },
      { name: 'Node.js', level: 80 },
      { name: 'Python', level: 85 },
      { name: 'Machine Learning', level: 70 },
      { name: 'PostgreSQL', level: 75 },
      { name: 'Docker', level: 60 },
    ],
    badges: [
      { name: 'Early Bird', icon: '🌅', desc: 'First to apply this semester', color: 'bg-yellow-100 border-yellow-300' },
      { name: 'Top Performer', icon: '🏆', desc: 'Top 10% CGPA in batch', color: 'bg-blue-100 border-blue-300' },
      { name: 'Verified Profile', icon: '✅', desc: 'All documents verified', color: 'bg-green-100 border-green-300' },
      { name: 'Resume Star', icon: '⭐', desc: 'Resume rated 95/100', color: 'bg-purple-100 border-purple-300' },
    ],
    certificates: [
      { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: 'Dec 2023', credentialId: 'AWS-CP-12345' },
      { name: 'Google Data Analytics', issuer: 'Google', date: 'Oct 2023', credentialId: 'GDA-67890' },
      { name: 'Internship Completion', issuer: 'Razorpay', date: 'Aug 2023', credentialId: 'RAZ-INT-2023' },
    ],
    projects: [
      { name: 'AI Placement Predictor', tech: 'Python · TensorFlow · React', stars: 42 },
      { name: 'Campus Connect App', tech: 'React Native · Node.js · MongoDB', stars: 27 },
      { name: 'Smart Resume Parser', tech: 'NLP · FastAPI · PostgreSQL', stars: 18 },
    ],
    stats: {
      applications: 12,
      interviews: 4,
      offers: 1,
      profileViews: 78,
    },
  });

  const [formData, setFormData] = useState({
    full_name: profileData.full_name,
    email: profileData.email,
    phone: profileData.phone,
    location: profileData.location,
    bio: profileData.bio,
    github: profileData.github,
    linkedin: profileData.linkedin,
    portfolio: profileData.portfolio,
  });

  const userRole = propRole || user?.role || 'student';

  const handleSave = () => {
    setEditMode(false);
    setProfileData({
      ...profileData,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      bio: formData.bio,
      github: formData.github,
      linkedin: formData.linkedin,
      portfolio: formData.portfolio,
    });
    alert('Profile updated! (backend integration coming soon)');
  };

  const profileCompletion = 82;

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Cover Photo */}
      <div className="relative h-52 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1770208741251-0fe9609459d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwcm9maWxlJTIwY292ZXIlMjBhYnN0cmFjdCUyMGdyYXl8ZW58MXx8fHwxNzczNjcwNTE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 to-gray-900/60" />
        <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all">
          <Camera className="w-4 h-4" /> Change Cover
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Profile Header Card */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl -mt-16 mb-8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="relative -mt-20 sm:-mt-24 flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700 rounded-2xl border-4 border-white dark:border-gray-700 shadow-lg flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-white">{profileData.full_name.charAt(0)}</span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-700 dark:bg-gray-600 rounded-full flex items-center justify-center shadow-md hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{profileData.full_name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {userRole === 'student' ? 'Student' : userRole === 'company' ? 'Company Recruiter' : 'Admin'}
                </span>
                {profileCompletion === 100 && (
                  <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">
                {profileData.department} · {profileData.year}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profileData.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined August 2021</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  editMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600'
                }`}
              >
                {editMode ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
              </button>
              {userRole === 'student' && (
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                  <Download className="w-4 h-4" /> Resume
                </button>
              )}
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mb-12">
          <TabsList className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-1 mb-8 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            {userRole === 'student' && (
              <>
                <TabsTrigger value="skills" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                  <Code className="w-4 h-4 mr-2" /> Skills & Resume
                </TabsTrigger>
                <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                  <Trophy className="w-4 h-4 mr-2" /> Achievements
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
              <Edit3 className="w-4 h-4 mr-2" /> Edit Info
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><User className="w-5 h-5 text-gray-500" /> About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-700"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{profileData.bio}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Star className="w-5 h-5 text-gray-500" /> Top Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.slice(0, 6).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-blue-600">{profileData.stats.applications}</div>
                    <div className="text-xs text-gray-500">Applications</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-green-600">{profileData.stats.interviews}</div>
                    <div className="text-xs text-gray-500">Interviews</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-yellow-600">{profileData.stats.offers}</div>
                    <div className="text-xs text-gray-500">Offers</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-purple-600">{profileData.stats.profileViews}</div>
                    <div className="text-xs text-gray-500">Profile Views</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Phone className="w-5 h-5 text-gray-500" /> Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div><p className="text-xs text-gray-400">Email</p><p className="text-gray-700 dark:text-gray-300">{profileData.email}</p></div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-700 dark:text-gray-300">{showPhone ? profileData.phone : '••••• •••••'}</p>
                          <button onClick={() => setShowPhone(!showPhone)}>
                            {showPhone ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div><p className="text-xs text-gray-400">Location</p><p className="text-gray-700 dark:text-gray-300">{profileData.location}</p></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Link className="w-5 h-5 text-gray-500" /> Social Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <a href="#" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">
                      <Github className="w-4 h-4" /> {profileData.github}
                    </a>
                    <a href="#" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">
                      <Linkedin className="w-4 h-4" /> {profileData.linkedin}
                    </a>
                    <a href="#" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">
                      <Globe className="w-4 h-4" /> {profileData.portfolio}
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="w-5 h-5 text-gray-500" /> Academics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">CGPA</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{profileData.cgpa}</span>
                        <span className="text-gray-400 text-sm">/ 10.0</span>
                      </div>
                    </div>
                    <Progress value={(profileData.cgpa / 10) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Batch Rank: <span className="font-semibold">14 / 240</span></span>
                      <span>Top <span className="font-semibold">6%</span></span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Skills & Resume Tab */}
          {userRole === 'student' && (
            <TabsContent value="skills">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Code className="w-5 h-5 text-gray-500" /> Skills & Proficiency</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profileData.skills.map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
                          <span className="text-sm text-gray-500">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><FileText className="w-5 h-5 text-gray-500" /> Resume / CV</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-700 font-medium">Arjun_Sharma_Resume_2024.pdf</p>
                        <p className="text-xs text-gray-400 mt-1">Last updated: Jan 15, 2024 · 245 KB</p>
                        <div className="flex justify-center gap-3 mt-4">
                          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Replace
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-5 h-5 text-gray-500" /> Projects</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profileData.projects.map((proj, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{proj.name}</p>
                            <p className="text-xs text-gray-500">{proj.tech}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            <span className="font-medium">{proj.stars}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Achievements Tab */}
          {userRole === 'student' && (
            <TabsContent value="achievements">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Award className="w-5 h-5 text-gray-500" /> Badges Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {profileData.badges.map((badge, i) => (
                        <div key={i} className={`p-4 rounded-xl border-2 ${badge.color} text-center`}>
                          <div className="text-3xl mb-2">{badge.icon}</div>
                          <div className="font-semibold text-gray-800 text-sm">{badge.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{badge.desc}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Shield className="w-5 h-5 text-gray-500" /> Certificates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profileData.certificates.map((cert, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Award className="w-8 h-8 text-gray-500" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{cert.name}</p>
                          <p className="text-xs text-gray-500">{cert.issuer} · {cert.date}</p>
                          <p className="text-xs text-gray-400 font-mono">{cert.credentialId}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Edit Info Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><User className="w-5 h-5 text-gray-500" /> Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Full Name</label>
                      <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Email</label>
                      <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Phone</label>
                      <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Location</label>
                      <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase block mb-1">GitHub</label>
                      <Input value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} placeholder="username" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase block mb-1">LinkedIn</label>
                      <Input value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} placeholder="linkedin.com/in/..." />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Portfolio</label>
                      <Input value={formData.portfolio} onChange={e => setFormData({ ...formData, portfolio: e.target.value })} placeholder="yourwebsite.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Bio</label>
                    <textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 text-sm" />
                  </div>
                  <Button onClick={handleSave} className="bg-gray-800 hover:bg-gray-700 text-white">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </CardContent>
              </Card>

              {/* Change Password Card */}
              <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Lock className="w-5 h-5 text-gray-500" /> Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setShowChangePassword(true)} className="w-full">
                    <Lock className="w-4 h-4 mr-2" /> Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <ChangePassword onClose={() => setShowChangePassword(false)} />
          </div>
        </div>
      )}
    </div>
  );
};