import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase, FileText, UserCheck, Calendar, ClipboardList, Bell,
  Plus, Trash2, Users, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Timer
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
import { useSharedData } from '../contexts/SharedDataContext';

const statusColor = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  shortlisted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  interview: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export const CompanyDashboard = () => {
  const { user } = useAuth();
  // Real data from API
  const [jobPosts, setJobPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modals
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', location: '', type: 'internship', deadline: '' });
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '8',
    status: 'present',
    task: ''
  });
  // SharedDataContext for assignments (temporary, until you create assignments endpoint)
  const { assignments, getStudentHours, getAttendanceRate } = useSharedData();

  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const jobsRes = await api.get(`/jobs?company_id=${user.id}`);
        setJobPosts(jobsRes.data);
        const appsRes = await api.get(`/applications?company_id=${user.id}`);
        setApplications(appsRes.data);
        const attRes = await api.get(`/attendance?company_id=${user.id}`);
        setAttendance(attRes.data);
      } catch (error) {
        console.error('Failed to fetch company data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCompanyData();
  }, [user]);

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.deadline) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      const res = await api.post('/jobs', {
        company_id: user.id,
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        duration: '3 months',
        salary_range: 'Competitive',
        requirements: [],
        expires_at: newJob.deadline,
      });
      setJobPosts([res.data, ...jobPosts]);
      setIsJobDialogOpen(false);
      setNewJob({ title: '', description: '', location: '', type: 'internship', deadline: '' });
      toast.success('Job posted successfully');
    } catch (error) {
      toast.error('Failed to post job');
    }
  };

  const handleLogAttendance = async () => {
    if (!attendanceForm.studentId || !attendanceForm.date) {
      toast.error('Please select a student and date');
      return;
    }
    if (attendanceForm.status !== 'absent' && !attendanceForm.task.trim()) {
      toast.error('Please enter the task/work done');
      return;
    }
    try {
      await api.post('/attendance', {
        student_id: attendanceForm.studentId,
        date_str: attendanceForm.date,
        hours_worked: parseFloat(attendanceForm.hoursWorked),
        status: attendanceForm.status,
        task: attendanceForm.task,
      });
      toast.success('Attendance logged');
      // refresh attendance
      const attRes = await api.get(`/attendance?company_id=${user.id}`);
      setAttendance(attRes.data);
      setAttendanceForm({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        hoursWorked: '8',
        status: 'present',
        task: ''
      });
    } catch (error) {
      toast.error('Failed to log attendance');
    }
  };

  const myAssignments = assignments.filter(a => a.companyId === user?.id && a.status === 'active');

  const companyStats = [
    { label: 'Active Jobs', value: jobPosts.filter(j => j.status === 'active').length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Assigned Interns', value: myAssignments.length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Applications', value: applications.length, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'Attendance Logs', value: attendance.length, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gray-800 dark:bg-gray-700 rounded-xl flex items-center justify-center"><Briefcase className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Company Dashboard</h1><p className="text-gray-500 dark:text-gray-400">{user?.full_name || 'Company'} — Recruiter Portal</p></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {companyStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${stat.color}`} /></div>
                    <div><div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</div><div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white"><Briefcase className="w-4 h-4 mr-2" /> Job Posts</TabsTrigger>
          <TabsTrigger value="applications" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white"><FileText className="w-4 h-4 mr-2" /> Applications</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white"><ClipboardList className="w-4 h-4 mr-2" /> Log Attendance</TabsTrigger>
          <TabsTrigger value="interns" className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white"><Users className="w-4 h-4 mr-2" /> Interns</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle className="dark:text-gray-100">Job Posts</CardTitle><CardDescription className="dark:text-gray-400">Manage your job postings</CardDescription></div>
                <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"><Plus className="w-4 h-4 mr-2" />Post New Job</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
                    <DialogHeader><DialogTitle className="dark:text-gray-100">Post New Job</DialogTitle><DialogDescription className="dark:text-gray-400">Fill in the details to create a new job posting</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div><Label className="dark:text-gray-300">Job Title *</Label><Input value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="e.g., Software Engineer Intern" className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                      <div><Label className="dark:text-gray-300">Job Description *</Label><Textarea value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} rows={3} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                      <div><Label className="dark:text-gray-300">Location</Label><Input value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} placeholder="e.g., Bangalore, Remote" className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                      <div><Label className="dark:text-gray-300">Deadline *</Label><Input type="date" value={newJob.deadline} onChange={e => setNewJob({ ...newJob, deadline: e.target.value })} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsJobDialogOpen(false)} className="dark:border-gray-600 dark:text-gray-300">Cancel</Button><Button className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600" onClick={handleCreateJob}>Post Job</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobPosts.length === 0 ? <p className="text-center py-8 text-gray-500">No job posts yet</p> : jobPosts.map(job => (
                  <div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">{job.title}</h3>
                          <Badge className={statusColor[job.status] || 'bg-gray-100'}>{job.status || 'active'}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{job.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {job.location && <span>📍 {job.location}</span>}
                          <span>⏳ Deadline: {job.expires_at?.split('T')[0] || 'N/A'}</span>
                          <span>👁 {job.views || 0} views</span>
                          <span>📄 {job.applicants_count || 0} applications</span>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
                            try { 
                              await api.delete(`/jobs/${job.id}`); 
                              setJobPosts(jobPosts.filter(j => j.id !== job.id)); 
                              toast.success('Job deleted successfully'); 
                            } catch (e) { 
                              console.error('Delete error:', e);
                              toast.error(e.response?.data?.detail || 'Failed to delete job'); 
                            }
                          }
                        }} 
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
            <CardHeader><CardTitle className="dark:text-gray-100">Applications</CardTitle><CardDescription className="dark:text-gray-400">Review candidates for your positions</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications.length === 0 ? <p className="text-center py-8 text-gray-500">No applications yet</p> : applications.map(app => (
                  <div key={app.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{app.student_name || 'Student'}</p>
                        <p className="text-sm text-gray-500">{app.job_title}</p>
                        <p className="text-xs text-gray-400">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                      </div>
                      <Badge className={statusColor[app.status] || 'bg-gray-100'}>{app.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Log Attendance Tab */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-5 h-5 text-gray-500" /> Log Attendance</CardTitle><CardDescription>Record daily attendance for your interns</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Intern *</Label><Select value={attendanceForm.studentId} onValueChange={v => setAttendanceForm({ ...attendanceForm, studentId: v })}><SelectTrigger className="dark:bg-gray-700"><SelectValue placeholder="Select intern" /></SelectTrigger><SelectContent>{myAssignments.map(a => <SelectItem key={a.studentId} value={a.studentId}>{a.studentName}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Date *</Label><Input type="date" value={attendanceForm.date} onChange={e => setAttendanceForm({ ...attendanceForm, date: e.target.value })} className="dark:bg-gray-700" /></div>
                <div><Label>Status *</Label><div className="flex gap-2">{['present','half-day','absent'].map(s => <button key={s} onClick={() => setAttendanceForm({ ...attendanceForm, status: s, hoursWorked: s === 'absent' ? '0' : s === 'half-day' ? '4' : '8' })} className={`px-4 py-2 rounded-lg text-sm font-medium border ${attendanceForm.status === s ? (s === 'present' ? 'border-green-500 bg-green-50 text-green-700' : s === 'half-day' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-gray-200 text-gray-600'}`}>{s === 'half-day' ? 'Half Day' : s.charAt(0).toUpperCase()+s.slice(1)}</button>)}</div></div>
                {attendanceForm.status !== 'absent' && <div><Label>Hours Worked</Label><Input type="number" min="1" max="12" value={attendanceForm.hoursWorked} onChange={e => setAttendanceForm({ ...attendanceForm, hoursWorked: e.target.value })} className="dark:bg-gray-700" /></div>}
                {attendanceForm.status !== 'absent' && <div><Label>Task / Work Done *</Label><Textarea placeholder="Describe work done..." rows={2} value={attendanceForm.task} onChange={e => setAttendanceForm({ ...attendanceForm, task: e.target.value })} className="dark:bg-gray-700" /></div>}
                <Button onClick={handleLogAttendance} className="w-full bg-gray-800 hover:bg-gray-700">Log Attendance</Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-5 h-5 text-gray-500" /> Recent Logs</CardTitle></CardHeader>
              <CardContent className="max-h-96 overflow-y-auto space-y-2">
                {attendance.slice(0, 10).map(log => (
                  <div key={log.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                    <div><p className="text-sm font-medium">{log.student_name}</p><p className="text-xs text-gray-500">{log.date} • {log.hoursWorked}h</p><p className="text-xs truncate max-w-[200px]">{log.task}</p></div>
                    <Badge className={statusColor[log.status]}>{log.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interns Tab (still uses SharedDataContext) */}
        <TabsContent value="interns">
          <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
            <CardHeader><CardTitle className="dark:text-gray-100">Assigned Interns</CardTitle><CardDescription>Track progress and attendance</CardDescription></CardHeader>
            <CardContent>
              {myAssignments.length === 0 ? <p className="text-center py-8 text-gray-500">No interns assigned yet</p> : myAssignments.map(a => {
                const hours = getStudentHours(a.studentId);
                const rate = getAttendanceRate(a.studentId);
                return (
                  <div key={a.studentId} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-3">
                    <div className="flex justify-between items-center">
                      <div><h4 className="font-semibold">{a.studentName}</h4><p className="text-sm text-gray-500">{a.jobTitle}</p></div>
                      <div className="text-right"><div>{hours} / {a.totalRequiredHours} hrs</div><div>Attendance: {rate}%</div></div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};