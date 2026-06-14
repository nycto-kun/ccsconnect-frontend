import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase, FileText, UserCheck, Calendar, ClipboardList, Bell,
  Plus, Trash2, Users, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Timer, Edit, Eye, X, RefreshCw, Loader2
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
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useSharedData } from '../contexts/SharedDataContext';
import api from '../utils/api';

const statusColor = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  shortlisted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  interview: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const applicationStatusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-purple-100 text-purple-700',
  interview: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export const CompanyDashboard = () => {
  const { user } = useAuth();
  const { 
    jobs: jobPosts, 
    applications, 
    attendance, 
    reports, 
    interns, 
    notices: sharedNotices,
    loading,
    refreshData,
    error
  } = useSharedData();

  console.log('CompanyDashboard - loading:', loading);
  console.log('CompanyDashboard - interns:', interns);
  console.log('CompanyDashboard - error:', error);
  
  // Local state for UI only (not data fetching)
  const [notices, setNotices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dialog states
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Form states
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    type: 'internship',
    salary_range: '',
    duration: '3 months',
    requirements: '',
    expires_at: ''
  });
  
  const [attendanceForm, setAttendanceForm] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    hours_worked: '8',
    status: 'present',
    task: ''
  });
  
  const [applicationStatus, setApplicationStatus] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  
  // Loading states for actions
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isVerifyingReport, setIsVerifyingReport] = useState(false);
  const [isDeletingJob, setIsDeletingJob] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoggingAttendance, setIsLoggingAttendance] = useState(false);

  // Combine notices
  const allNotices = sharedNotices.length > 0 ? sharedNotices : notices;

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Create new job
  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.description) {
      toast.error('Please fill in title and description');
      return;
    }
    
    setIsCreatingJob(true);
    try {
      const jobData = {
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        salary_range: newJob.salary_range,
        duration: newJob.duration,
        requirements: newJob.requirements ? newJob.requirements.split(',').map(s => s.trim()) : [],
        expires_at: newJob.expires_at,
        status: 'active'
      };
      
      await api.post('/jobs/', jobData);
      toast.success('Job posted successfully');
      setIsJobDialogOpen(false);
      setNewJob({
        title: '',
        description: '',
        location: '',
        type: 'internship',
        salary_range: '',
        duration: '3 months',
        requirements: '',
        expires_at: ''
      });
      refreshData();
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error(error.response?.data?.detail || 'Failed to post job');
    } finally {
      setIsCreatingJob(false);
    }
  };

  // Verify report
  const handleVerifyReport = async (reportId, status) => {
    setIsVerifyingReport(true);
    try {
      await api.patch(`/reports/${reportId}/verify`, null, { 
        params: { status: status } 
      });
      toast.success(`Report ${status}`);
      refreshData();
    } catch (error) {
      console.error('Failed to update report status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update report status');
    } finally {
      setIsVerifyingReport(false);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeletingJob(true);
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      refreshData();
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete job');
    } finally {
      setIsDeletingJob(false);
    }
  };

  // Update application status
  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/applications/${applicationId}`, null, {
        params: { status: newStatus }
      });
      toast.success(`Application status updated to ${newStatus}`);
      refreshData();
      setIsApplicationDialogOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Log attendance
  const handleLogAttendance = async () => {
    if (!attendanceForm.student_id || !attendanceForm.date) {
      toast.error('Please select a student and date');
      return;
    }
    
    if (attendanceForm.status !== 'absent' && !attendanceForm.task.trim()) {
      toast.error('Please enter the task/work done');
      return;
    }
    
    setIsLoggingAttendance(true);
    try {
      const response = await api.post('/attendance/', {
        student_id: attendanceForm.student_id,
        date_str: attendanceForm.date,
        hours_worked: parseFloat(attendanceForm.hours_worked),
        status: attendanceForm.status,
        task: attendanceForm.task,
      });
      
      if (response.data) {
        toast.success('Attendance logged successfully');
        setIsAttendanceDialogOpen(false);
        setAttendanceForm({
          student_id: '',
          date: new Date().toISOString().split('T')[0],
          hours_worked: '8',
          status: 'present',
          task: ''
        });
        refreshData();
      }
    } catch (error) {
      console.error('Failed to log attendance:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to log attendance';
      toast.error(errorMsg);
    } finally {
      setIsLoggingAttendance(false);
    }
  };

  // Calculate stats from context data
  const activeJobs = jobPosts.filter(j => j.status === 'active').length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const totalAttendance = attendance.length;
  const activeInterns = interns.filter(i => i.status === 'active').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="mb-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Company Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">
                {user?.full_name || 'Company'} — Manage jobs, applications, and interns
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{activeJobs}</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Applications</p>
                <p className="text-2xl font-bold text-purple-600">{totalApplications}</p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingApplications}</p>
              </div>
              <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Interns</p>
                <p className="text-2xl font-bold text-green-600">{activeInterns}</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Attendance Logs</p>
                <p className="text-2xl font-bold text-orange-600">{totalAttendance}</p>
              </div>
              <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending Reports</p>
                <p className="text-2xl font-bold text-red-600">{pendingReports}</p>
              </div>
              <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notices Section */}
      {allNotices.length > 0 && (
        <Card className="border-0 shadow-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600" />
              Announcements
            </CardTitle>
            <CardDescription>Latest updates and announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allNotices.slice(0, 4).map(notice => (
                <div key={notice.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-l-gray-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{notice.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notice.content}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {notice.type && (
                      <Badge variant="outline" className="capitalize">{notice.type}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="jobs" className="rounded-lg">
            <Briefcase className="w-4 h-4 mr-2" /> Job Posts
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg">
            <FileText className="w-4 h-4 mr-2" /> Student Reports
          </TabsTrigger>
          <TabsTrigger value="applications" className="rounded-lg">
            <FileText className="w-4 h-4 mr-2" /> Applications
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg">
            <ClipboardList className="w-4 h-4 mr-2" /> Attendance
          </TabsTrigger>
          <TabsTrigger value="interns" className="rounded-lg">
            <Users className="w-4 h-4 mr-2" /> Interns
          </TabsTrigger>
        </TabsList>

        {/* REPORTS TAB */}
        <TabsContent value="reports">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Student Daily Reports</CardTitle>
              <CardDescription>Review and verify reports submitted by your interns</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No reports submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <div key={report.id} className="p-4 bg-gray-50 rounded-xl border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{report.title}</h4>
                            <Badge className={
                              report.status === 'approved' ? 'bg-green-100 text-green-700' :
                              report.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {report.status || 'pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{report.description}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span>Student: {report.student_name || 'Student'}</span>
                            <span>Date: {report.date}</span>
                            <span>Hours: {report.hours}h</span>
                            {report.tasks && <span>Tasks: {report.tasks}</span>}
                          </div>
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleVerifyReport(report.id, 'approved')}
                              disabled={isVerifyingReport}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => handleVerifyReport(report.id, 'rejected')}
                              disabled={isVerifyingReport}
                            >
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* JOBS TAB */}
        <TabsContent value="jobs">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Posts</CardTitle>
                  <CardDescription>Manage your job postings and internship opportunities</CardDescription>
                </div>
                <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-800 hover:bg-gray-700">
                      <Plus className="w-4 h-4 mr-2" /> Post New Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Post New Job</DialogTitle>
                      <DialogDescription>Fill in the details to create a new job posting</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Job Title *</Label>
                        <Input 
                          value={newJob.title} 
                          onChange={e => setNewJob({ ...newJob, title: e.target.value })} 
                          placeholder="e.g., Software Engineer Intern"
                        />
                      </div>
                      <div>
                        <Label>Job Description *</Label>
                        <Textarea 
                          value={newJob.description} 
                          onChange={e => setNewJob({ ...newJob, description: e.target.value })} 
                          rows={4}
                          placeholder="Describe the role, responsibilities, and what you're looking for..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Location</Label>
                          <Input 
                            value={newJob.location} 
                            onChange={e => setNewJob({ ...newJob, location: e.target.value })} 
                            placeholder="e.g., Remote, Bangalore, Hybrid"
                          />
                        </div>
                        <div>
                          <Label>Salary Range</Label>
                          <Input 
                            value={newJob.salary_range} 
                            onChange={e => setNewJob({ ...newJob, salary_range: e.target.value })} 
                            placeholder="e.g., ₱50,000 - ₱80,000/month"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Duration</Label>
                          <Select value={newJob.duration} onValueChange={v => setNewJob({ ...newJob, duration: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2 months">2 months</SelectItem>
                              <SelectItem value="3 months">3 months</SelectItem>
                              <SelectItem value="4 months">4 months</SelectItem>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="1 year">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Application Deadline</Label>
                          <Input 
                            type="date" 
                            value={newJob.expires_at} 
                            onChange={e => setNewJob({ ...newJob, expires_at: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Requirements (comma-separated)</Label>
                        <Input 
                          value={newJob.requirements} 
                          onChange={e => setNewJob({ ...newJob, requirements: e.target.value })} 
                          placeholder="e.g., Python, React, Communication Skills"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>Cancel</Button>
                      <Button className="bg-gray-800" onClick={handleCreateJob} disabled={isCreatingJob}>
                        {isCreatingJob ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        {isCreatingJob ? 'Posting...' : 'Post Job'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {jobPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No job posts yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setIsJobDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Create Your First Job Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobPosts.map(job => (
                    <div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge className={statusColor[job.status] || 'bg-gray-100'}>
                              {job.status || 'active'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{job.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {job.location && <span>📍 {job.location}</span>}
                            {job.salary_range && <span>💰 {job.salary_range}</span>}
                            {job.duration && <span>⏱️ {job.duration}</span>}
                            {job.expires_at && (
                              <span>⏰ Deadline: {new Date(job.expires_at).toLocaleDateString()}</span>
                            )}
                            <span>👁️ {job.views || 0} views</span>
                            <span>📄 {job.applicants_count || 0} applications</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteJob(job.id, job.title)} 
                          className="text-red-500 hover:text-red-700"
                          disabled={isDeletingJob}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPLICATIONS TAB */}
        <TabsContent value="applications">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Review and manage candidate applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No applications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <div 
                      key={app.id} 
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border cursor-pointer hover:shadow-md transition"
                      onClick={() => {
                        setSelectedApplication(app);
                        setIsApplicationDialogOpen(true);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{app.student_name || 'Student'}</p>
                          <p className="text-sm text-gray-600">{app.job_title}</p>
                          <p className="text-xs text-gray-400">
                            Applied: {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={applicationStatusColor[app.status] || 'bg-gray-100'}>
                            {app.status || 'pending'}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ATTENDANCE TAB */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-gray-500" />
                  Log Attendance
                </CardTitle>
                <CardDescription>Record daily attendance for your interns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Intern *</Label>
                  <Select 
                    value={attendanceForm.student_id} 
                    onValueChange={v => setAttendanceForm({ ...attendanceForm, student_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select intern" />
                    </SelectTrigger>
                    <SelectContent>
                      {interns.length === 0 ? (
                        <SelectItem value="no-interns" disabled>No interns assigned yet</SelectItem>
                      ) : (
                        interns.map(intern => (
                          <SelectItem key={intern.student_id} value={intern.student_id}>
                            {intern.student_name || intern.student_id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Date *</Label>
                  <Input 
                    type="date" 
                    value={attendanceForm.date} 
                    onChange={e => setAttendanceForm({ ...attendanceForm, date: e.target.value })} 
                  />
                </div>
                
                <div>
                  <Label>Status *</Label>
                  <div className="flex gap-2 mt-1">
                    {['present', 'half-day', 'absent'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAttendanceForm({ 
                          ...attendanceForm, 
                          status: s, 
                          hours_worked: s === 'absent' ? '0' : s === 'half-day' ? '4' : '8' 
                        })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          attendanceForm.status === s 
                            ? s === 'present' 
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : s === 'half-day'
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {s === 'half-day' ? 'Half Day' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {attendanceForm.status !== 'absent' && (
                  <>
                    <div>
                      <Label>Hours Worked</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="12" 
                        step="0.5"
                        value={attendanceForm.hours_worked} 
                        onChange={e => setAttendanceForm({ ...attendanceForm, hours_worked: e.target.value })} 
                      />
                    </div>
                    <div>
                      <Label>Task / Work Done *</Label>
                      <Textarea 
                        placeholder="Describe work done..." 
                        rows={2} 
                        value={attendanceForm.task} 
                        onChange={e => setAttendanceForm({ ...attendanceForm, task: e.target.value })} 
                      />
                    </div>
                  </>
                )}
                
                <Button 
                  onClick={handleLogAttendance} 
                  className="w-full bg-gray-800 hover:bg-gray-700"
                  disabled={interns.length === 0 || isLoggingAttendance}
                >
                  {isLoggingAttendance ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoggingAttendance ? 'Logging...' : 'Log Attendance'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Recent Attendance Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto space-y-2">
                {attendance.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No attendance logs yet</p>
                  </div>
                ) : (
                  attendance.slice(0, 20).map(log => (
                    <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{log.student_name || 'Student'}</p>
                          <p className="text-xs text-gray-500">{log.date} • {log.hours_worked} hours</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{log.task}</p>
                        </div>
                        <Badge className={
                          log.status === 'present' ? 'bg-green-100 text-green-700' :
                          log.status === 'half-day' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INTERNS TAB */}
        <TabsContent value="interns">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Assigned Interns</CardTitle>
              <CardDescription>Track your interns' progress and attendance</CardDescription>
            </CardHeader>
            <CardContent>
              {interns.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No interns assigned yet</p>
                  <p className="text-sm mt-2">Interns will appear here once they are assigned to your company</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interns.map(intern => {
                    const internAttendance = attendance.filter(a => a.student_id === intern.student_id);
                    const totalHours = internAttendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0);
                    const presentDays = internAttendance.filter(a => a.status === 'present' || a.status === 'half-day').length;
                    const attendanceRate = internAttendance.length ? Math.round((presentDays / internAttendance.length) * 100) : 0;
                    
                    return (
                      <div key={intern.student_id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{intern.student_name || 'Student'}</h4>
                            <p className="text-sm text-gray-500">{intern.job_title || 'Intern'}</p>
                            {intern.roll_number && (
                              <p className="text-xs text-gray-400">ID: {intern.roll_number}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <span className="font-medium">{totalHours}</span>
                              <span className="text-gray-500"> / {intern.total_required_hours || 480} hrs</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{attendanceRate}%</span>
                              <span className="text-gray-500"> attendance</span>
                            </div>
                            <Badge className={intern.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                              {intern.status || 'active'}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min(100, (totalHours / (intern.total_required_hours || 480)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <Label>Student</Label>
                <p className="font-medium">{selectedApplication.student_name || 'Student'}</p>
                <p className="text-sm text-gray-500">{selectedApplication.roll_number}</p>
              </div>
              <div>
                <Label>Applied for</Label>
                <p>{selectedApplication.job_title}</p>
              </div>
              <div>
                <Label>Applied on</Label>
                <p>{new Date(selectedApplication.applied_at).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Current Status</Label>
                <Badge className={applicationStatusColor[selectedApplication.status]}>
                  {selectedApplication.status}
                </Badge>
              </div>
              <div>
                <Label>Update Status</Label>
                <Select onValueChange={setApplicationStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApplicationDialogOpen(false)}>Cancel</Button>
                <Button 
                  className="bg-gray-800"
                  onClick={() => handleUpdateApplicationStatus(selectedApplication.id, applicationStatus)}
                  disabled={!applicationStatus || isUpdatingStatus}
                >
                  {isUpdatingStatus ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};