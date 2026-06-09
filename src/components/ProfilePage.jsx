import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap,
  Award, Star, FileText, Edit3, Upload, CheckCircle, Clock,
  Link, Github, Linkedin, Globe, Shield, Code, Save, Eye, EyeOff,
  Camera, Download, Trophy, BookOpen, Users, Lock, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';

export const ProfilePage = ({ userRole: propRole }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCoverDialog, setShowCoverDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState(null); // 'avatar' or 'cover'
  
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
    avatar_url: '',
    cover_url: '',
    joined_date: '',
  });
  
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
          avatar_url: data.avatar_url || '',
          cover_url: data.cover_url || '',
          joined_date: data.created_at ? new Date(data.created_at).toLocaleDateString() : '2024',
        });
        
        // Fetch stats if student
        if (userRole === 'student') {
          const appsRes = await api.get(`/applications?student_id=${user.id}`);
          const apps = appsRes.data || [];
          setStats({
            applications: apps.length,
            interviews: apps.filter(a => a.status === 'interview').length,
            offers: apps.filter(a => a.status === 'accepted').length,
            profileViews: 23
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

  // Handle file selection
  const handleFileSelect = (type) => {
    setUploadType(type);
    setSelectedFile(null);
    if (type === 'avatar') {
      setShowAvatarDialog(true);
    } else {
      setShowCoverDialog(true);
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Upload image
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', uploadType);
    
    try {
      const response = await api.post('/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (uploadType === 'avatar') {
        setProfileData(prev => ({ ...prev, avatar_url: response.data.url }));
        toast.success('Profile picture updated');
        setShowAvatarDialog(false);
      } else {
        setProfileData(prev => ({ ...prev, cover_url: response.data.url }));
        toast.success('Cover photo updated');
        setShowCoverDialog(false);
      }
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const profileCompletion = () => {
    let completed = 0;
    let total = 0;
    if (profileData.full_name) { completed++; total++; }
    if (profileData.bio) { completed++; total++; }
    if (profileData.skills?.length > 0) { completed++; total++; }
    if (profileData.resume_url) { completed++; total++; }
    if (profileData.phone) { completed++; total++; }
    if (profileData.location) { completed++; total++; }
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
      <div className="relative h-52 overflow-hidden">
        {profileData.cover_url ? (
          <img 
            src={profileData.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 to-gray-900/60" />
        <button 
          onClick={() => handleFileSelect('cover')}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all"
        >
          <Camera className="w-4 h-4" /> Change Cover
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl -mt-16 mb-8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative -mt-20 sm:-mt-24 flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl border-4 border-white dark:border-gray-700 shadow-lg flex items-center justify-center overflow-hidden">
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {profileData.full_name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <button 
                onClick={() => handleFileSelect('avatar')}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-gray-600 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {profileData.full_name || 'User'}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {userRole === 'student' ? 'Student' : userRole === 'company' ? 'Company' : 'Admin'}
                </span>
              </div>
              {userRole === 'student' && profileData.student_id && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">Student ID: {profileData.student_id}</p>
              )}
              {profileData.department && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {profileData.department} {profileData.year ? `· Year {profileData.year}` : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profileData.location || 'Location not set'}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {profileData.joined_date}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Button 
                onClick={() => window.location.href = '/settings'}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile Info
              </Button>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
              <span className="font-medium dark:text-gray-200">{profileCompletion()}%</span>
            </div>
            <Progress value={profileCompletion()} className="h-2" />
          </div>
        </div>

        {/* Main Content - Display Only (No Edit Forms) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Contact */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                  <User className="w-5 h-5 text-gray-500" /> About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {profileData.bio || 'No bio added yet. Go to Settings to add one.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                  <Phone className="w-5 h-5 text-gray-500" /> Contact Info
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
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-gray-700 dark:text-gray-300">{profileData.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-gray-700 dark:text-gray-300">{profileData.location || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                  <Link className="w-5 h-5 text-gray-500" /> Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">GitHub</p>
                  {profileData.github ? (
                    <a href={`https://github.com/${profileData.github}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      github.com/{profileData.github}
                    </a>
                  ) : <p className="text-gray-500 text-sm">Not set</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">LinkedIn</p>
                  {profileData.linkedin ? (
                    <a href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {profileData.linkedin}
                    </a>
                  ) : <p className="text-gray-500 text-sm">Not set</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Portfolio</p>
                  {profileData.portfolio ? (
                    <a href={profileData.portfolio.startsWith('http') ? profileData.portfolio : `https://${profileData.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {profileData.portfolio}
                    </a>
                  ) : <p className="text-gray-500 text-sm">Not set</p>}
                </div>
              </CardContent>
            </Card>

            {/* Resume Upload */}
            {userRole === 'student' && (
              <Card className="border-0 shadow-md dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                    <FileText className="w-5 h-5 text-gray-500" /> Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileData.resume_url ? (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(profileData.resume_url, '_blank')}>
                      <Download className="w-4 h-4 mr-2" /> View Resume
                    </Button>
                  ) : (
                    <p className="text-gray-500 text-sm text-center">No resume uploaded</p>
                  )}
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
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.applications}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Applications</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.interviews}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Interviews</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.offers}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Offers</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.profileViews}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Profile Views</div>
                  </div>
                </div>

                {/* Skills */}
                <Card className="border-0 shadow-md dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                      <Code className="w-5 h-5 text-gray-500" /> Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills && profileData.skills.length > 0 ? (
                        profileData.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1 dark:bg-gray-700">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Update skills in Settings → Account
                    </p>
                  </CardContent>
                </Card>

                {/* Academics */}
                {profileData.gpa && (
                  <Card className="border-0 shadow-md dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                        <GraduationCap className="w-5 h-5 text-gray-500" /> Academics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">CGPA</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold dark:text-gray-200">{profileData.gpa}</span>
                          <span className="text-gray-400 text-sm">/ 10.0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cover Photo Dialog */}
      <Dialog open={showCoverDialog} onOpenChange={setShowCoverDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Cover Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {selectedFile && (
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCoverDialog(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading} className="bg-gray-800">
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Avatar Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {selectedFile && (
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-32 h-32 object-cover rounded-full mx-auto" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarDialog(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading} className="bg-gray-800">
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};