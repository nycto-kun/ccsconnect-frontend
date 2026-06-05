import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, Briefcase, TrendingUp, Bell, FileText, Building,
  CheckCircle, Clock, Shield, Plus, Edit, Trash2, Search,
  Filter, BarChart3, GraduationCap, Calendar, ChevronDown,
  ChevronUp, AlertTriangle, Star, Timer, Eye, UserCheck, Award,
  X, RefreshCw, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  
  // State for real data
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeJobs: 0,
    placementRate: 0,
    pendingApprovals: 0,
    totalApplications: 0,
    lastUpdated: null
  });
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [notices, setNotices] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dialog states
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '', content: '', type: 'internship', pinned: false,
    start_date: '', end_date: ''
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      
      // Fetch pending companies
      const compRes = await api.get('/admin/pending-companies');
      setPendingCompanies(compRes.data || []);
      
      // Fetch notices
      const noticesRes = await api.get('/notices');
      setNotices(noticesRes.data || []);
      
      // Fetch all students
      const studentsRes = await api.get('/users?role=student');
      setStudents(studentsRes.data || []);
      
      // Fetch all applications
      const appsRes = await api.get('/applications');
      setApplications(appsRes.data || []);
      
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Notice CRUD operations
  const handleCreateNotice = async () => {
    if (!noticeForm.title || !noticeForm.content) {
      toast.error('Please fill title and content');
      return;
    }
    try {
      await api.post('/notices', noticeForm);
      toast.success('Notice created');
      fetchAdminData(); // Refresh
      setIsNoticeDialogOpen(false);
      setNoticeForm({ title: '', content: '', type: 'internship', pinned: false, start_date: '', end_date: '' });
    } catch (error) {
      toast.error('Failed to create notice');
    }
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      pinned: notice.pinned,
      start_date: notice.start_date || '',
      end_date: notice.end_date || '',
    });
    setIsNoticeDialogOpen(true);
  };

  const handleUpdateNotice = async () => {
    if (!editingNotice) return;
    try {
      await api.put(`/notices/${editingNotice.id}`, noticeForm);
      toast.success('Notice updated');
      fetchAdminData();
      setIsNoticeDialogOpen(false);
      setEditingNotice(null);
      setNoticeForm({ title: '', content: '', type: 'internship', pinned: false, start_date: '', end_date: '' });
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success('Notice deleted');
      fetchAdminData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleApproveCompany = async (id) => {
    try {
      await api.post(`/admin/approve-company/${id}`);
      toast.success('Company approved');
      fetchAdminData();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleRejectCompany = async (id) => {
    if (!confirm('Reject this company registration?')) return;
    try {
      await api.delete(`/admin/reject-company/${id}`);
      toast.success('Company rejected');
      fetchAdminData();
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      interview: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type) => {
    const colors = {
      internship: 'bg-blue-100 text-blue-700',
      placement: 'bg-green-100 text-green-700',
      workshop: 'bg-pink-100 text-pink-700',
      assessment: 'bg-indigo-100 text-indigo-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
              <p className="text-gray-500">Manage users, notices, and track placement progress</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAdminData} 
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Placement Rate</p>
                <p className="text-2xl font-bold">{stats.placementRate}%</p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending Approvals</p>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
              </div>
              <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications || applications.length}</p>
              </div>
              <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notices" className="space-y-6">
        <TabsList className="bg-gray-100 rounded-xl p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="notices" className="rounded-lg">
            <Bell className="w-4 h-4 mr-2" /> Notices
          </TabsTrigger>
          <TabsTrigger value="companies" className="rounded-lg">
            <Building className="w-4 h-4 mr-2" /> Company Approvals
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg">
            <Users className="w-4 h-4 mr-2" /> Students
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">
            <BarChart3 className="w-4 h-4 mr-2" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* NOTICES TAB */}
        <TabsContent value="notices" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notice Management</CardTitle>
                  <CardDescription>Create, edit, and manage campus notices</CardDescription>
                </div>
                <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-800" onClick={() => {
                      setEditingNotice(null);
                      setNoticeForm({ title: '', content: '', type: 'internship', pinned: false, start_date: '', end_date: '' });
                    }}>
                      <Plus className="w-4 h-4 mr-2" /> Create Notice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingNotice ? 'Edit Notice' : 'Create New Notice'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Title *</Label>
                        <Input 
                          value={noticeForm.title} 
                          onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} 
                        />
                      </div>
                      <div>
                        <Label>Content *</Label>
                        <Textarea 
                          rows={4} 
                          value={noticeForm.content} 
                          onChange={e => setNoticeForm({...noticeForm, content: e.target.value})} 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type</Label>
                          <Select value={noticeForm.type} onValueChange={v => setNoticeForm({...noticeForm, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="internship">Internship</SelectItem>
                              <SelectItem value="placement">Placement</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="assessment">Assessment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Pin Notice</Label>
                          <Select value={noticeForm.pinned ? 'yes' : 'no'} onValueChange={v => setNoticeForm({...noticeForm, pinned: v === 'yes'})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="yes">Yes (Stays on top)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date (Optional)</Label>
                          <Input 
                            type="date" 
                            value={noticeForm.start_date} 
                            onChange={e => setNoticeForm({...noticeForm, start_date: e.target.value})} 
                          />
                        </div>
                        <div>
                          <Label>End Date (Optional)</Label>
                          <Input 
                            type="date" 
                            value={noticeForm.end_date} 
                            onChange={e => setNoticeForm({...noticeForm, end_date: e.target.value})} 
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsNoticeDialogOpen(false)}>Cancel</Button>
                      <Button className="bg-gray-800" onClick={editingNotice ? handleUpdateNotice : handleCreateNotice}>
                        {editingNotice ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search notices..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="pl-9" 
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-44">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="placement">Placement</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notices List */}
              <div className="space-y-3">
                {filteredNotices.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No notices found</p>
                  </div>
                ) : (
                  filteredNotices.map(notice => (
                    <div key={notice.id} className="p-4 bg-gray-50 rounded-xl border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold">{notice.title}</h3>
                            <Badge className={getTypeColor(notice.type)}>{notice.type}</Badge>
                            {notice.pinned && <Badge variant="outline">📌 Pinned</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notice.content}</p>
                          <div className="flex gap-3 text-xs text-gray-400">
                            {notice.start_date && <span>📅 Start: {notice.start_date}</span>}
                            {notice.end_date && <span>⏰ End: {notice.end_date}</span>}
                            <span>👤 Posted: {new Date(notice.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button size="sm" variant="ghost" onClick={() => handleEditNotice(notice)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteNotice(notice.id)} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPANY APPROVALS TAB */}
        <TabsContent value="companies" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Company Approvals</CardTitle>
              <CardDescription>Review and verify new company registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCompanies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                  <p>No pending company approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingCompanies.map(company => (
                    <div key={company.id} className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{company.name}</h4>
                        <p className="text-sm text-gray-500">{company.contact_email}</p>
                        <p className="text-sm text-gray-500">{company.industry || 'Industry not specified'}</p>
                        <p className="text-xs text-gray-400">Registered: {new Date(company.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveCompany(company.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleRejectCompany(company.id)}>
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STUDENTS TAB */}
        <TabsContent value="students" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>View all registered students and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No students registered yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student, i) => {
                    const studentApps = applications.filter(a => a.student_id === student.id);
                    const isExpanded = expandedStudent === student.id;
                    
                    return (
                      <motion.div 
                        key={student.id} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-white font-bold">
                                  {student.full_name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{student.full_name || 'Student'}</h3>
                                  <p className="text-xs text-gray-500">{student.email}</p>
                                  {student.student_id && (
                                    <p className="text-xs text-gray-400">ID: {student.student_id}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">{studentApps.length}</div>
                                  <div className="text-xs text-gray-500">Applications</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {studentApps.filter(a => a.status === 'accepted').length}
                                  </div>
                                  <div className="text-xs text-gray-500">Offers</div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-2">Recent Applications</h4>
                                {studentApps.length === 0 ? (
                                  <p className="text-sm text-gray-500">No applications yet</p>
                                ) : (
                                  <div className="space-y-2">
                                    {studentApps.slice(0, 5).map(app => (
                                      <div key={app.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <div>
                                          <p className="text-sm font-medium">{app.job_title || 'Position'}</p>
                                          <p className="text-xs text-gray-500">{app.company_name}</p>
                                        </div>
                                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Placement Stats */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Placement Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Placement Rate</span>
                    <span className="font-bold">{stats.placementRate}%</span>
                  </div>
                  <Progress value={stats.placementRate} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{stats.activeJobs}</div>
                    <div className="text-sm text-gray-600">Active Jobs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Stats */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Pending', count: applications.filter(a => a.status === 'pending').length, color: 'bg-yellow-500' },
                    { label: 'Interview', count: applications.filter(a => a.status === 'interview').length, color: 'bg-blue-500' },
                    { label: 'Accepted', count: applications.filter(a => a.status === 'accepted').length, color: 'bg-green-500' },
                    { label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length, color: 'bg-red-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span>{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color}`} 
                          style={{ width: `${applications.length ? (item.count / applications.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {applications.slice(0, 10).map(app => (
                  <div key={app.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{app.student_name || 'Student'}</span>
                        {' applied for '}
                        <span className="font-medium">{app.job_title || 'position'}</span>
                      </p>
                      <p className="text-xs text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};