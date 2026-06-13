import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase, FileText, UserCheck, Calendar, ClipboardList, Bell,
  Plus, Trash2, Users, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Timer, Edit, Eye, X, RefreshCw, Loader2,
  CheckSquare, Square
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
import api from '../utils/api';

const statusColor = {
  active: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  shortlisted: 'bg-blue-100 text-blue-700',
  interview: 'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
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
  
  const [jobPosts, setJobPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [interns, setInterns] = useState([]);
  const [studentReports, setStudentReports] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  const [newJob, setNewJob] = useState({
    title: '', description: '', location: '', salary_range: '',
    duration: '3 months', requirements: '', expires_at: ''
  });
  
  const [attendanceForm, setAttendanceForm] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    hours_worked: '8',
    status: 'present',
    task: ''
  });
  
  const [applicationStatus, setApplicationStatus] = useState('');

  // Fetch all company data
  const fetchCompanyData = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      
      let companyId = null;
      try {
        const userRes = await api.get('/auth/me');
        companyId = userRes.data?.company_id;
      } catch (e) {
        console.log('Could not get company_id from user profile');
      }
      
      // Fetch jobs
      const jobsRes = await api.get(`/jobs/?company_id=${companyId || ''}`);
      setJobPosts(jobsRes.data || []);
      
      // Fetch applications
      const appsRes = await api.get(`/applications/?company_id=${companyId || ''}`);
      setApplications(appsRes.data || []);
      
      // Fetch attendance
      const attRes = await api.get(`/attendance/`);
      setAttendance(attRes.data || []);
      
      // Fetch assigned interns
      const assignmentsRes = await api.get(`/assignments/?company_id=${companyId || ''}`);
      setInterns(assignmentsRes.data || []);
      
      // Fetch student reports (for company's interns)
      const reportsRes = await api.get(`/reports/?company_id=${companyId || ''}`);
      setStudentReports(reportsRes.data || []);
      
      // Fetch notices
      const noticesRes = await api.get('/notices/');
      setNotices(noticesRes.data || []);
      
    } catch (error) {
      console.error('Failed to fetch company data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [user]);

  // Create job
  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.description) {
      toast.error('Please fill in title and description');
      return;
    }
    
    try {
      await api.post('/jobs/', {
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        salary_range: newJob.salary_range,
        duration: newJob.duration,
        requirements: newJob.requirements ? newJob.requirements.split(',').map(s => s.trim()) : [],
        expires_at: newJob.expires_at,
      });
      toast.success('Job posted successfully');
      setIsJobDialogOpen(false);
      setNewJob({
        title: '', description: '', location: '', salary_range: '',
        duration: '3 months', requirements: '', expires_at: ''
      });
      fetchCompanyData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to post job');
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!confirm(`Delete "${jobTitle}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted');
      fetchCompanyData();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  // Update application status
  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await api.patch(`/applications/${applicationId}`, null, {
        params: { status: newStatus }
      });
      toast.success(`Status updated to ${newStatus}`);
      fetchCompanyData();
      setIsApplicationDialogOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      toast.error('Failed to update status');
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
    
    try {
      await api.post('/attendance/', {
        student_id: attendanceForm.student_id,
        date_str: attendanceForm.date,
        hours_worked: parseFloat(attendanceForm.hours_worked),
        status: attendanceForm.status,
        task: attendanceForm.task,
      });
      toast.success('Attendance logged');
      setIsAttendanceDialogOpen(false);
      setAttendanceForm({
        student_id: '',
        date: new Date().toISOString().split('T')[0],
        hours_worked: '8',
        status: 'present',
        task: ''
      });
      fetchCompanyData();
    } catch (error) {
      toast.error('Failed to log attendance');
    }
  };

  // Verify a student report (company approves)
  const handleVerifyReport = async (reportId, newStatus) => {
    try {
      await api.patch(`/reports/${reportId}/verify`, null, { params: { status: newStatus } });
      toast.success(`Report ${newStatus}`);
      fetchCompanyData();
    } catch (error) {
      toast.error('Failed to update report status');
    }
  };

  const stats = {
    activeJobs: jobPosts.filter(j => j.status === 'active').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    totalAttendance: attendance.length,
    activeInterns: interns.filter(i => i.status === 'active').length,
    pendingReports: studentReports.filter(r => r.status === 'pending').length,
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Company Dashboard</h1>
          <p className="text-gray-500">{user?.full_name || 'Company'} — Manage jobs, applications, interns</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCompanyData} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{stats.activeJobs}</div><div className="text-xs text-gray-500">Active Jobs</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{stats.totalApplications}</div><div className="text-xs text-gray-500">Applications</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div><div className="text-xs text-gray-500">Pending Review</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.activeInterns}</div><div className="text-xs text-gray-500">Active Interns</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-orange-600">{stats.totalAttendance}</div><div className="text-xs text-gray-500">Attendance Logs</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-red-600">{stats.pendingReports}</div><div className="text-xs text-gray-500">Pending Reports</div></CardContent></Card>
      </div>

      {/* Notices */}
      {notices.length > 0 && (
        <Card className="mb-8">
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Announcements</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{notices.slice(0, 3).map(n => (<div key={n.id} className="p-2 bg-gray-50 rounded"><p className="font-semibold">{n.title}</p><p className="text-sm text-gray-600">{n.content}</p></div>))}</div></CardContent>
        </Card>
      )}

      <Tabs defaultValue="jobs">
        <TabsList><TabsTrigger value="jobs">Jobs</TabsTrigger><TabsTrigger value="applications">Applications</TabsTrigger><TabsTrigger value="attendance">Attendance</TabsTrigger><TabsTrigger value="reports">Student Reports</TabsTrigger><TabsTrigger value="interns">Interns</TabsTrigger></TabsList>

        {/* JOBS TAB */}
        <TabsContent value="jobs">
          <Card><CardHeader><div className="flex justify-between"><div><CardTitle>Job Posts</CardTitle><CardDescription>Manage your job listings</CardDescription></div><Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Post Job</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Post New Job</DialogTitle></DialogHeader><div className="space-y-4"><Input placeholder="Title" value={newJob.title} onChange={e=>setNewJob({...newJob,title:e.target.value})} /><Textarea placeholder="Description" rows={4} value={newJob.description} onChange={e=>setNewJob({...newJob,description:e.target.value})} /><Input placeholder="Location" value={newJob.location} onChange={e=>setNewJob({...newJob,location:e.target.value})} /><Input placeholder="Salary Range" value={newJob.salary_range} onChange={e=>setNewJob({...newJob,salary_range:e.target.value})} /><Input placeholder="Requirements (comma separated)" value={newJob.requirements} onChange={e=>setNewJob({...newJob,requirements:e.target.value})} /><Input type="date" placeholder="Deadline" value={newJob.expires_at} onChange={e=>setNewJob({...newJob,expires_at:e.target.value})} /></div><DialogFooter><Button variant="outline" onClick={()=>setIsJobDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateJob}>Post</Button></DialogFooter></DialogContent></Dialog></div></CardHeader><CardContent>{jobPosts.length===0?<p className="text-center py-8 text-gray-500">No jobs yet</p>:jobPosts.map(job=>(<div key={job.id} className="p-4 border rounded mb-3"><div className="flex justify-between"><div><h3 className="font-semibold">{job.title}</h3><p className="text-sm text-gray-600">{job.location} • {job.salary_range}</p><p className="text-xs text-gray-400">Deadline: {job.expires_at?new Date(job.expires_at).toLocaleDateString():'N/A'}</p></div><Button variant="ghost" size="sm" onClick={()=>handleDeleteJob(job.id,job.title)} className="text-red-500"><Trash2 className="w-4 h-4"/></Button></div></div>))}</CardContent></Card>
        </TabsContent>

        {/* APPLICATIONS TAB */}
        <TabsContent value="applications">
          <Card><CardHeader><CardTitle>Applications</CardTitle><CardDescription>Review candidate applications</CardDescription></CardHeader><CardContent>{applications.length===0?<p className="text-center py-8 text-gray-500">No applications yet</p>:applications.map(app=>(<div key={app.id} className="p-4 border rounded mb-3 cursor-pointer hover:bg-gray-50" onClick={()=>{setSelectedApplication(app);setIsApplicationDialogOpen(true);}}><div className="flex justify-between"><div><p className="font-semibold">{app.student_name||'Student'}</p><p className="text-sm">{app.job_title}</p><p className="text-xs text-gray-400">Applied: {new Date(app.applied_at).toLocaleDateString()}</p></div><Badge className={applicationStatusColor[app.status]}>{app.status}</Badge></div></div>))}</CardContent></Card>
        </TabsContent>

        {/* ATTENDANCE TAB */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Log Attendance</CardTitle></CardHeader><CardContent className="space-y-4"><Select value={attendanceForm.student_id} onValueChange={v=>setAttendanceForm({...attendanceForm,student_id:v})}><SelectTrigger><SelectValue placeholder="Select intern" /></SelectTrigger><SelectContent>{interns.map(i=><SelectItem key={i.student_id} value={i.student_id}>{i.student_name||i.student_id}</SelectItem>)}</SelectContent></Select><Input type="date" value={attendanceForm.date} onChange={e=>setAttendanceForm({...attendanceForm,date:e.target.value})} /><div className="flex gap-2">{['present','half-day','absent'].map(s=><button key={s} onClick={()=>setAttendanceForm({...attendanceForm,status:s,hours_worked:s==='absent'?'0':s==='half-day'?'4':'8'})} className={`px-3 py-1 rounded border ${attendanceForm.status===s?(s==='present'?'bg-green-50 border-green-500':s==='half-day'?'bg-yellow-50 border-yellow-500':'bg-red-50 border-red-500'):'bg-gray-50'}`}>{s}</button>)}</div>{attendanceForm.status!=='absent'&&<><Input type="number" placeholder="Hours worked" value={attendanceForm.hours_worked} onChange={e=>setAttendanceForm({...attendanceForm,hours_worked:e.target.value})} /><Textarea placeholder="Task description" rows={2} value={attendanceForm.task} onChange={e=>setAttendanceForm({...attendanceForm,task:e.target.value})} /></>}<Button onClick={handleLogAttendance} className="w-full" disabled={interns.length===0}>Log Attendance</Button></CardContent></Card>
            <Card><CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader><CardContent className="max-h-96 overflow-y-auto">{attendance.length===0?<p className="text-center py-8 text-gray-500">No logs yet</p>:attendance.slice(0,20).map(log=>(<div key={log.id} className="p-2 border-b"><div className="flex justify-between"><span className="font-medium">{log.student_name}</span><Badge className={log.status==='present'?'bg-green-100':log.status==='half-day'?'bg-yellow-100':'bg-red-100'}>{log.status}</Badge></div><div className="text-xs text-gray-500">{log.date} • {log.hours_worked}h</div><div className="text-xs">{log.task}</div></div>))}</CardContent></Card>
          </div>
        </TabsContent>

        {/* STUDENT REPORTS TAB */}
        <TabsContent value="reports">
          <Card><CardHeader><CardTitle>Student Daily Reports</CardTitle><CardDescription>Review and verify reports submitted by interns</CardDescription></CardHeader><CardContent>{studentReports.length===0?<p className="text-center py-8 text-gray-500">No reports submitted yet</p>:studentReports.map(report=>(<div key={report.id} className="p-4 border rounded mb-3"><div className="flex justify-between items-start"><div><p className="font-semibold">{report.student_name||'Student'}</p><p className="text-sm">{report.title}</p><p className="text-xs text-gray-500">{report.date} • {report.hours} hours</p><p className="text-sm mt-1">{report.description}</p>{report.tasks&&<p className="text-xs text-gray-500 mt-1">Tasks: {report.tasks}</p>}</div><div className="flex flex-col items-end gap-2"><Badge className={report.status==='pending'?'bg-yellow-100':report.status==='approved'?'bg-green-100':'bg-red-100'}>{report.status||'pending'}</Badge>{report.status==='pending'&&(<div className="flex gap-1"><Button size="sm" variant="outline" className="border-green-500 text-green-600" onClick={()=>handleVerifyReport(report.id,'approved')}>Approve</Button><Button size="sm" variant="outline" className="border-red-500 text-red-600" onClick={()=>handleVerifyReport(report.id,'rejected')}>Reject</Button></div>)}</div></div></div>))}</CardContent></Card>
        </TabsContent>

        {/* INTERNS TAB */}
        <TabsContent value="interns">
          <Card><CardHeader><CardTitle>Assigned Interns</CardTitle><CardDescription>Track intern progress</CardDescription></CardHeader><CardContent>{interns.length===0?<p className="text-center py-8 text-gray-500">No interns assigned yet</p>:interns.map(intern=>{const internAttendance=attendance.filter(a=>a.student_id===intern.student_id);const totalHours=internAttendance.reduce((s,a)=>s+(a.hours_worked||0),0);const rate=internAttendance.length?Math.round((internAttendance.filter(a=>a.status==='present'||a.status==='half-day').length/internAttendance.length)*100):0;return(<div key={intern.student_id} className="p-4 border rounded mb-3"><div className="flex justify-between"><div><h4 className="font-semibold">{intern.student_name}</h4><p className="text-sm text-gray-600">{intern.job_title}</p><p className="text-xs text-gray-400">ID: {intern.roll_number}</p></div><div className="text-right"><div>{totalHours}/{intern.total_required_hours||480} hrs</div><div>Attendance: {rate}%</div><Badge className={intern.status==='active'?'bg-green-100':'bg-gray-100'}>{intern.status}</Badge></div></div><div className="mt-2 h-2 bg-gray-200 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width:`${Math.min(100,(totalHours/(intern.total_required_hours||480))*100)}%`}}/></div></div>)})}</CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}><DialogContent>{selectedApplication&&(<div className="space-y-4"><div><Label>Student</Label><p className="font-medium">{selectedApplication.student_name}</p><p className="text-sm text-gray-500">{selectedApplication.roll_number}</p></div><div><Label>Position</Label><p>{selectedApplication.job_title}</p></div><div><Label>Applied on</Label><p>{new Date(selectedApplication.applied_at).toLocaleDateString()}</p></div><div><Label>Status</Label><Badge className={applicationStatusColor[selectedApplication.status]}>{selectedApplication.status}</Badge></div><div><Label>Update Status</Label><Select onValueChange={setApplicationStatus}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="reviewed">Reviewed</SelectItem><SelectItem value="shortlisted">Shortlisted</SelectItem><SelectItem value="interview">Interview</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div><DialogFooter><Button variant="outline" onClick={()=>setIsApplicationDialogOpen(false)}>Cancel</Button><Button onClick={()=>handleUpdateApplicationStatus(selectedApplication.id,applicationStatus)} disabled={!applicationStatus}>Update</Button></DialogFooter></div>)}</DialogContent></Dialog>
    </div>
  );
};