import React, { useState, useEffect } from 'react';
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
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';

export const ProfilePage = ({ userRole: propRole }) => {
  const { user, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    department: '',
    year: '',
    github: '',
    linkedin: '',
    portfolio: '',
    skills: [],
    resume_url: '',
    student_id: '',
    gpa: null,
  });
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    profileViews: 0
  });

  const userRole = propRole || user?.role || 'student';

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        const data = response.data;
        
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          department: data.department || '',
          year: data.year || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
          portfolio: data.portfolio || '',
          skills: data.skills || [],
          resume_url: data.resume_url || '',
          student_id: data.student_id || '',
          gpa: data.gpa || null,
        });
        
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
          portfolio: data.portfolio || '',
        });
        
        // Fetch stats if student
        if (userRole === 'student') {
          const appsRes = await api.get(`/applications/?student_id=${user.id}`);
          const apps = appsRes.data || [];
          setStats({
            applications: apps.length,
            interviews: apps.filter(a => a.status === 'interview').length,
            offers: apps.filter(a => a.status === 'accepted').length,
            profileViews: 23 // This would come from analytics in production
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchProfile();
  }, [user, userRole]);

  const handleSave = async () => {
    try {
      const response = await api.put('/auth/profile/', formData);
      setProfileData(prev => ({ ...prev, ...response.data }));
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData(prev => ({ ...prev, resume_url: response.data.url }));
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Failed to upload resume:', error);
      toast.error('Failed to upload resume');
    }
  };

  const profileCompletion = () => {
    let completed = 0;
    let total = 0;
    
    if (profileData.full_name) { completed++; total++; }
    if (profileData.email) { completed++; total++; }
    if (profileData.phone) { completed++; total++; }
    if (profileData.location) { completed++; total++; }
    if (profileData.bio) { completed++; total++; }
    if (profileData.skills?.length > 0) { completed++; total++; }
    if (profileData.resume_url) { completed++; total++; }
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Cover Photo */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-gray-700 to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 to-gray-900/60" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl -mt-16 mb-8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="relative -mt-20 sm:-mt-24 flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl border-4 border-white dark:border-gray-700 shadow-lg flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {profileData.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {profileData.full_name || 'User'}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700">
                  {userRole === 'student' ? 'Student' : userRole === 'company' ? 'Company' : 'Admin'}
                </span>
              </div>
              {userRole === 'student' && profileData.student_id && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Student ID: {profileData.student_id}
                </p>
              )}
              {profileData.department && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {profileData.department} {profileData.year ? `· Year ${profileData.year}` : ''}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-2 ${editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
              >
                {editMode ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Profile Completion</span>
              <span className="font-medium">{profileCompletion()}%</span>
            </div>
            <Progress value={profileCompletion()} className="h-2" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Contact */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="dark:bg-gray-700"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    {profileData.bio || 'No bio added yet.'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-500" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-gray-700 dark:text-gray-300">{profileData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Phone</p>
                    {editMode ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone number"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{profileData.phone || 'Not set'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Location</p>
                    {editMode ? (
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{profileData.location || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link className="w-5 h-5 text-gray-500" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">GitHub</p>
                  {editMode ? (
                    <Input
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="username"
                      className="dark:bg-gray-700"
                    />
                  ) : (
                    profileData.github ? (
                      <a href={`https://github.com/${profileData.github}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        github.com/{profileData.github}
                      </a>
                    ) : <p className="text-gray-500 text-sm">Not set</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">LinkedIn</p>
                  {editMode ? (
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="dark:bg-gray-700"
                    />
                  ) : (
                    profileData.linkedin ? (
                      <a href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {profileData.linkedin}
                      </a>
                    ) : <p className="text-gray-500 text-sm">Not set</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Portfolio</p>
                  {editMode ? (
                    <Input
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      placeholder="yourwebsite.com"
                      className="dark:bg-gray-700"
                    />
                  ) : (
                    profileData.portfolio ? (
                      <a href={profileData.portfolio.startsWith('http') ? profileData.portfolio : `https://${profileData.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {profileData.portfolio}
                      </a>
                    ) : <p className="text-gray-500 text-sm">Not set</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resume Upload */}
            {userRole === 'student' && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    {profileData.resume_url ? (
                      <>
                        <p className="text-sm text-green-600 mb-2">Resume uploaded!</p>
                        <Button variant="outline" size="sm" onClick={() => window.open(profileData.resume_url, '_blank')}>
                          <Download className="w-4 h-4 mr-2" />
                          View Resume
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-700 text-sm mb-2">Upload your resume (PDF)</p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label htmlFor="resume-upload">
                          <Button variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </span>
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Skills */}
          <div className="lg:col-span-2 space-y-6">
            {userRole === 'student' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.applications}</div>
                    <div className="text-xs text-gray-500">Applications</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.interviews}</div>
                    <div className="text-xs text-gray-500">Interviews</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.offers}</div>
                    <div className="text-xs text-gray-500">Offers</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.profileViews}</div>
                    <div className="text-xs text-gray-500">Profile Views</div>
                  </div>
                </div>

                {/* Skills */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code className="w-5 h-5 text-gray-500" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills && profileData.skills.length > 0 ? (
                        profileData.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      )}
                    </div>
                    {editMode && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => {
                        const newSkill = prompt('Enter a skill:');
                        if (newSkill) {
                          setProfileData(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), newSkill]
                          }));
                        }
                      }}>
                        + Add Skill
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Academics */}
                {profileData.gpa && (
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-gray-500" />
                        Academics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">CGPA</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">{profileData.gpa}</span>
                          <span className="text-gray-400 text-sm">/ 10.0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Save button for edit mode */}
            {editMode && (
              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};