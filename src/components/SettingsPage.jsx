import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Bell, Eye, Palette, Save, Moon, Sun, Laptop, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';
import ChangePassword from './ChangePassword';

export const SettingsPage = () => {
  const { user, login } = useAuth();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    github: '',
    linkedin: '',
    portfolio: '',
    skills: [],
  });
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    applications: true,
    messages: true,
    marketing: false,
  });
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'recruiters',
    showEmail: true,
    showPhone: false,
  });

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data;
        setProfileForm({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          location: userData.location || '',
          bio: userData.bio || '',
          github: userData.github || '',
          linkedin: userData.linkedin || '',
          portfolio: userData.portfolio || '',
          skills: userData.skills || [],
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast.error('Failed to load profile data');
      }
    };
    fetchUserData();
  }, []);

  // Add skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // Update AI embedding when skills change
  const updateAIEmbedding = async (skills) => {
    if (!skills || skills.length === 0) return;
    
    try {
      await api.post('/ai/student-embedding', {
        skills: skills,
        resume_text: ''
      });
      console.log('AI embedding updated with skills:', skills);
    } catch (error) {
      console.error('Failed to update AI embedding:', error);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', profileForm);
      toast.success('Profile updated successfully');
      
      // Update AI embedding if skills exist
      if (profileForm.skills && profileForm.skills.length > 0) {
        await updateAIEmbedding(profileForm.skills);
      }
      
      // Refresh user data
      const userResponse = await api.get('/auth/me');
      
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Save notification preferences
  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await api.put('/auth/preferences', { notifications });
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Failed to save notifications:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  // Save privacy settings
  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      await api.put('/auth/privacy', privacy);
      toast.success('Privacy settings saved');
    } catch (error) {
      console.error('Failed to save privacy:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and privacy</p>
        </motion.div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" /> Account
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-2" /> Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" /> Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" /> Appearance
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <User className="w-5 h-5 text-gray-500" /> Profile Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Update your personal details and skills for better job matching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      value={profileForm.full_name}
                      onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+63 XXX XXX XXXX"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</Label>
                    <Input
                      value={profileForm.location}
                      onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="City, Country"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub Username</Label>
                    <Input
                      value={profileForm.github}
                      onChange={e => setProfileForm({ ...profileForm, github: e.target.value })}
                      placeholder="username"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</Label>
                    <Input
                      value={profileForm.linkedin}
                      onChange={e => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio Website</Label>
                    <Input
                      value={profileForm.portfolio}
                      onChange={e => setProfileForm({ ...profileForm, portfolio: e.target.value })}
                      placeholder="yourwebsite.com"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</Label>
                    <textarea
                      value={profileForm.bio}
                      onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills (for AI job matching)</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profileForm.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., Python, React, JavaScript)"
                        className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Button type="button" onClick={handleAddSkill} variant="outline">
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Skills help our AI match you with relevant job opportunities
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading} className="bg-gray-800 hover:bg-gray-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Lock className="w-5 h-5 text-gray-500" /> Security Settings
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowChangePassword(true)}
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" /> Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Bell className="w-5 h-5 text-gray-500" /> Notification Preferences
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Choose what updates you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={checked => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Get real-time alerts</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={checked => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                  <Separator className="dark:bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Updates</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status changes for your applications</p>
                    </div>
                    <Switch
                      checked={notifications.applications}
                      onCheckedChange={checked => setNotifications({ ...notifications, applications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Messages</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">New messages and replies</p>
                    </div>
                    <Switch
                      checked={notifications.messages}
                      onCheckedChange={checked => setNotifications({ ...notifications, messages: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketing & Promotions</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">News, offers, and career tips</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={checked => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={loading} className="bg-gray-800 hover:bg-gray-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Eye className="w-5 h-5 text-gray-500" /> Privacy Controls
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Manage who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Visibility</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={value => setPrivacy({ ...privacy, profileVisibility: value })}
                  >
                    <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public – Anyone can view</SelectItem>
                      <SelectItem value="recruiters">Recruiters only – Only verified companies</SelectItem>
                      <SelectItem value="private">Private – Only your connections</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Email Address</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Visible to recruiters and verified users</p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={checked => setPrivacy({ ...privacy, showEmail: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Phone Number</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Visible only to recruiters when you apply</p>
                    </div>
                    <Switch
                      checked={privacy.showPhone}
                      onCheckedChange={checked => setPrivacy({ ...privacy, showPhone: checked })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSavePrivacy} disabled={loading} className="bg-gray-800 hover:bg-gray-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Privacy Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Palette className="w-5 h-5 text-gray-500" /> Appearance
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Customize how CCSconnect looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                        theme === 'light'
                          ? 'border-gray-800 bg-gray-50 dark:bg-gray-700'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span className="text-xs">Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                        theme === 'dark'
                          ? 'border-gray-800 bg-gray-50 dark:bg-gray-700'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                      <span className="text-xs">Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                        theme === 'system'
                          ? 'border-gray-800 bg-gray-50 dark:bg-gray-700'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Laptop className="w-5 h-5" />
                      <span className="text-xs">System</span>
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
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