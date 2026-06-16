import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, Briefcase, TrendingUp, Bell, FileText, Building,
  CheckCircle, Clock, Shield, Plus, Edit, Trash2, Search,
  Filter, BarChart3, GraduationCap, Calendar, ChevronDown,
  ChevronUp, AlertTriangle, Star, Timer, Eye, UserCheck, Award,
  UserPlus, ExternalLink
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
import { useSharedData } from '../contexts/SharedDataContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const getStatusColor = (status) => {
  const m = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    interview: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    terminated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  };
  return m[status] || 'bg-gray-100 text-gray-700';
};

const getTypeColor = (type) => {
  const m = {
    internship: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    placement: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    project: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    workshop: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    assessment: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
  };
  return m[type] || 'bg-gray-100 text-gray-700';
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { assignments, attendance, getStudentHours, getAttendanceRate, getStudentAttendance, getFacultyReports } = useSharedData();

  // Real data from backend
  const [stats, setStats] = useState({ totalStudents: 0, activeJobs: 0, placementRate: 0 });
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companySearch, setCompanySearch] = useState('');

  // UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [newNotice, setNewNotice] = useState({
    title: '', content: '', type: 'internship', pinned: false,
    start_date: '', end_date: ''
  });

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
        
        const compRes = await api.get('/admin/pending-companies');
        setPendingCompanies(compRes.data);
        
        // Fetch all companies (verified and pending)
        const allCompaniesRes = await api.get('/companies');
        setCompanies(allCompaniesRes.data);
        
        const noticesRes = await api.get('/notices');
        setNotices(noticesRes.data);
      } catch (error) {
        console.error('Failed to load admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // Notice CRUD
  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      toast.error('Please fill title and content');
      return;
    }
    try {
      await api.post('/notices', newNotice);
      const noticesRes = await api.get('/notices');
      setNotices(noticesRes.data);
      setIsDialogOpen(false);
      setNewNotice({ title: '', content: '', type: 'internship', pinned: false, start_date: '', end_date: '' });
      toast.success('Notice created');
    } catch (error) {
      toast.error('Failed to create notice');
    }
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setNewNotice({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      pinned: notice.pinned,
      start_date: notice.start_date,
      end_date: notice.end_date,
    });
    setIsDialogOpen(true);
  };

  const handleUpdateNotice = async () => {
    if (!editingNotice) return;
    try {
      await api.put(`/notices/${editingNotice.id}`, newNotice);
      const noticesRes = await api.get('/notices');
      setNotices(noticesRes.data);
      setIsDialogOpen(false);
      setEditingNotice(null);
      setNewNotice({ title: '', content: '', type: 'internship', pinned: false, start_date: '', end_date: '' });
      toast.success('Notice updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDeleteNotice = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n.id !== id));
      toast.success('Notice deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleApproveCompany = async (id) => {
    try {
      await api.post(`/admin/approve-company/${id}`);
      setPendingCompanies(pendingCompanies.filter(c => c.id !== id));
      toast.success('Company approved');
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  // Data from SharedDataContext (remains for student progress)
  const facultyReports = getFacultyReports('fac-001');
  const successfulInterns = assignments.filter(a => a.status === 'completed').length;
  const totalActiveInterns = assignments.filter(a => a.status === 'active').length;
  const avgAttendance = assignments.length ? Math.round(assignments.reduce((s, a) => s + getAttendanceRate(a.studentId), 0) / assignments.length) : 0;
  const lowAttendanceCount = assignments.filter(a => getAttendanceRate(a.studentId) < 75).length;

  const departments = ['all', ...new Set(assignments.map(a => a.department))];
  const filteredAssignments = assignments.filter(a => {
    const ms = a.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
               a.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
               a.companyName.toLowerCase().includes(studentSearch.toLowerCase());
    const md = filterDept === 'all' || a.department === filterDept;
    return ms && md;
  });

  const filteredNotices = notices.filter(n => {
    const ms = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               n.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const mt = filterType === 'all' || n.type === filterType;
    return ms && mt;
  });

  // Filter companies by search
  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.contact_email?.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Get accepted interns for a company
  const getCompanyInterns = (companyId) => {
    return assignments.filter(a => 
      a.companyId === companyId && 
      (a.status === 'accepted' || a.status === 'active' || a.status === 'completed')
    );
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gray-800 dark:bg-gray-700 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Admin / Faculty Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage notices, users, companies, and track student internship progress</p>
          </div>
        </div>
      </motion.div>

      {/* Stats (real from backend) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 mb-1">Active Jobs</p><p className="text-2xl font-bold">{stats.activeJobs}</p></div>
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center"><Briefcase className="w-5 h-5 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 mb-1">Placement Rate</p><p className="text-2xl font-bold">{stats.placementRate}%</p></div>
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 mb-1">Pending Approvals</p><p className="text-2xl font-bold">{pendingCompanies.length}</p></div>
              <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center"><Building className="w-5 h-5 text-yellow-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 mb-1">Successful Interns</p><p className="text-2xl font-bold">{successfulInterns}</p></div>
              <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center"><Award className="w-5 h-5 text-teal-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="students"><GraduationCap className="w-4 h-4 mr-2" /> Student Progress</TabsTrigger>
          <TabsTrigger value="companies"><Building className="w-4 h-4 mr-2" /> Companies</TabsTrigger>
          <TabsTrigger value="notices"><Bell className="w-4 h-4 mr-2" /> Notices</TabsTrigger>
          <TabsTrigger value="approvals"><UserCheck className="w-4 h-4 mr-2" /> Company Approvals</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" /> Analytics</TabsTrigger>
          <TabsTrigger value="reports"><FileText className="w-4 h-4 mr-2" /> Student Reports</TabsTrigger>
        </TabsList>

        {/* Student Progress Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-gray-800 to-gray-900 text-white"><CardContent className="p-4 flex items-center gap-3"><UserCheck className="w-8 h-8 text-green-400" /><div><div className="text-2xl font-bold">{totalActiveInterns}</div><div className="text-gray-300 text-sm">Active Interns</div></div></CardContent></Card>
            <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-center gap-3"><Timer className="w-8 h-8 text-blue-500" /><div><div className="text-2xl font-bold">{avgAttendance}%</div><div className="text-gray-500 text-sm">Avg Attendance</div></div></CardContent></Card>
            <Card className={`border-0 shadow-md ${lowAttendanceCount > 0 ? 'border-l-4 border-l-red-500' : ''}`}><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className={`w-8 h-8 ${lowAttendanceCount > 0 ? 'text-red-500' : 'text-gray-300'}`} /><div><div className="text-2xl font-bold">{lowAttendanceCount}</div><div className="text-gray-500 text-sm">Below 75%</div></div></CardContent></Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search by name, roll no, company…" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="pl-9" /></div>
            <Select value={filterDept} onValueChange={setFilterDept}><SelectTrigger className="w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All Departments' : d}</SelectItem>)}</SelectContent></Select>
          </div>

          <div className="space-y-4">
            {filteredAssignments.map((a, i) => {
              const totalHours = getStudentHours(a.studentId);
              const rate = getAttendanceRate(a.studentId);
              const pct = Math.min(100, Math.round((totalHours / a.totalRequiredHours) * 100));
              const isLow = rate < 75;
              const isExpanded = expandedStudent === a.studentId;
              const logs = getStudentAttendance(a.studentId);
              const presentDays = logs.filter(r => r.status === 'present').length;
              const halfDays = logs.filter(r => r.status === 'half-day').length;
              const absentDays = logs.filter(r => r.status === 'absent').length;

              return (
                <motion.div key={a.studentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card className={`border-0 shadow-md overflow-hidden ${isLow ? 'border-l-4 border-l-red-400' : ''}`}>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${isLow ? 'bg-red-600' : 'bg-gray-800'}`}>{a.studentName.split(' ').map(n=>n[0]).join('')}</div>
                          <div><div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold">{a.studentName}</h3><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{a.rollNumber}</span>{isLow && <Badge className="bg-red-100 text-red-700">Low Attendance</Badge>}<Badge className={getStatusColor(a.status)}>{a.status}</Badge></div><p className="text-sm text-gray-500">{a.department} · {a.year}</p><p className="text-xs text-gray-400">{a.jobTitle} at {a.companyName}</p></div>
                        </div>
                        <div className="flex gap-5 text-center"><div><div className={`text-xl font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{rate}%</div><div className="text-xs text-gray-400">Attendance</div></div><div><div className="text-xl font-bold">{totalHours}h</div><div className="text-xs text-gray-400">Hours</div></div><div><div className="text-xl font-bold">{pct}%</div><div className="text-xs text-gray-400">Complete</div></div></div>
                        <button onClick={() => setExpandedStudent(isExpanded ? null : a.studentId)} className="text-gray-400">{isExpanded ? <ChevronUp /> : <ChevronDown />}</button>
                      </div>
                      <div className="mt-4"><div className="flex justify-between text-xs text-gray-400"><span>Hours: {totalHours} / {a.totalRequiredHours}</span><span>{a.startDate} → {a.endDate}</span></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-gradient-to-r from-gray-500 to-gray-800'}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} /></div></div>
                      {isExpanded && (<div className="mt-5 pt-4 border-t"><div className="grid grid-cols-1 sm:grid-cols-2 gap-6"><div><p className="text-sm font-semibold mb-3">Attendance Breakdown</p><div className="grid grid-cols-3 gap-2 mb-4"><div className="bg-green-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-green-700">{presentDays}</div><div className="text-xs text-green-600">Present</div></div><div className="bg-yellow-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-yellow-700">{halfDays}</div><div className="text-xs text-yellow-600">Half Day</div></div><div className="bg-red-50 rounded-lg p-3 text-center"><div className="text-xl font-bold text-red-700">{absentDays}</div><div className="text-xs text-red-600">Absent</div></div></div><div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1"><div className="flex justify-between"><span className="text-gray-500">Stipend</span><span className="font-semibold">{a.stipend}</span></div><div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-semibold">{a.companyName}</span></div><div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-semibold">{a.jobTitle}</span></div></div></div><div><p className="text-sm font-semibold mb-3">Recent Activity</p><div className="space-y-2 max-h-52 overflow-y-auto">{logs.slice(0,6).map(log => (<div key={log.id} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded-lg"><span className={`w-2 h-2 rounded-full ${log.status==='present'?'bg-green-500':log.status==='absent'?'bg-red-500':'bg-yellow-500'}`} /><span className="text-gray-400 w-24">{log.date}</span><span className="text-gray-600 flex-1 truncate">{log.task}</span><span className="text-gray-400 flex items-center gap-0.5"><Timer className="w-3 h-3" />{log.hoursWorked}h</span></div>))}</div></div></div></div>)}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {filteredAssignments.length === 0 && <Card><CardContent className="py-16 text-center text-gray-400"><GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No students found</p></CardContent></Card>}
          </div>
        </TabsContent>

        {/* Companies Tab - NEW */}
        <TabsContent value="companies" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Companies & Interns</h2>
              <p className="text-gray-600 dark:text-gray-400">View all registered companies and their accepted interns</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search companies..." 
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.length === 0 ? (
              <Card className="lg:col-span-2">
                <CardContent className="py-16 text-center text-gray-400">
                  <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No companies found</p>
                </CardContent>
              </Card>
            ) : (
              filteredCompanies.map((company) => {
                const interns = getCompanyInterns(company.id);
                const isExpanded = selectedCompany === company.id;
                
                return (
                  <Card key={company.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-gray-400" />
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            <Badge className={company.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {company.verified ? '✓ Verified' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{company.contact_email}</p>
                          {company.industry && (
                            <p className="text-xs text-gray-400 mt-0.5">Industry: {company.industry}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedCompany(isExpanded ? null : company.id)}
                        >
                          {isExpanded ? 'Hide Interns' : 'View Interns'}
                          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Interns: <strong className="text-gray-800">{interns.length}</strong></span>
                        <span>Jobs: <strong className="text-gray-800">{company.job_count || 0}</strong></span>
                        <span>Joined: <strong className="text-gray-800">{new Date(company.created_at).toLocaleDateString()}</strong></span>
                      </div>
                      
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Accepted Interns</p>
                          {interns.length === 0 ? (
                            <p className="text-sm text-gray-400">No accepted interns yet</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {interns.map((intern) => (
                                <div key={intern.studentId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{intern.studentName}</p>
                                    <p className="text-xs text-gray-500">{intern.jobTitle} • {intern.rollNumber}</p>
                                  </div>
                                  <Badge className={getStatusColor(intern.status)}>{intern.status}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Notices Tab */}
        <TabsContent value="notices" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between">
                <div><CardTitle>Notice Management</CardTitle><CardDescription>Create, edit, and manage campus notices</CardDescription></div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild><Button className="bg-gray-800" onClick={() => { setEditingNotice(null); setNewNotice({ title: '', content: '', type: 'internship', pinned: false, start_date: '', end_date: '' }); }}><Plus className="w-4 h-4 mr-2" /> Create Notice</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>{editingNotice ? 'Edit Notice' : 'Create New Notice'}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div><Label>Title *</Label><Input value={newNotice.title} onChange={e => setNewNotice({...newNotice, title:e.target.value})} /></div>
                      <div><Label>Content *</Label><Textarea rows={4} value={newNotice.content} onChange={e => setNewNotice({...newNotice, content:e.target.value})} /></div>
                      <div className="grid grid-cols-2 gap-4"><div><Label>Type</Label><Select value={newNotice.type} onValueChange={v => setNewNotice({...newNotice, type:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="internship">Internship</SelectItem><SelectItem value="placement">Placement</SelectItem><SelectItem value="workshop">Workshop</SelectItem></SelectContent></Select></div><div><Label>Pin Notice</Label><Select value={newNotice.pinned ? 'yes' : 'no'} onValueChange={v => setNewNotice({...newNotice, pinned: v==='yes'})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></div></div>
                      <div className="grid grid-cols-2 gap-4"><div><Label>Start Date</Label><Input type="date" value={newNotice.start_date} onChange={e => setNewNotice({...newNotice, start_date:e.target.value})} /></div><div><Label>End Date</Label><Input type="date" value={newNotice.end_date} onChange={e => setNewNotice({...newNotice, end_date:e.target.value})} /></div></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button className="bg-gray-800" onClick={editingNotice ? handleUpdateNotice : handleCreateNotice}>{editingNotice ? 'Update' : 'Create'}</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-5"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search notices…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" /></div><Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-44"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="internship">Internship</SelectItem><SelectItem value="placement">Placement</SelectItem><SelectItem value="workshop">Workshop</SelectItem></SelectContent></Select></div>
              <div className="space-y-3">{filteredNotices.map(notice => (<div key={notice.id} className="p-4 bg-gray-50 rounded-xl border"><div className="flex justify-between"><div><div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold">{notice.title}</h3><Badge className={getTypeColor(notice.type)}>{notice.type}</Badge>{notice.pinned && <Badge variant="outline">📌 Pinned</Badge>}</div><p className="text-sm text-gray-600 mb-2">{notice.content}</p><div className="flex gap-3 text-xs text-gray-400"><span>📅 {notice.start_date} → {notice.end_date}</span><span>👤 {notice.created_by}</span></div></div><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => handleEditNotice(notice)}><Edit className="w-4 h-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDeleteNotice(notice.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button></div></div></div>))}</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle>Company Approvals</CardTitle><CardDescription>Review new employer accounts</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingCompanies.length === 0 ? <p className="text-center py-8 text-gray-500">No pending companies</p> : pendingCompanies.map(company => (
                  <div key={company.id} className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                    <div><h4 className="font-semibold">{company.name}</h4><p className="text-sm text-gray-500">{company.contact_email} · {company.industry}</p><p className="text-xs text-gray-400">Submitted: {company.created_at?.split('T')[0]}</p></div>
                    <div className="flex gap-2"><Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveCompany(company.id)}>Approve</Button><Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Reject</Button></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-5 h-5" /> User Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Students', value: stats.totalStudents, total: stats.totalStudents + stats.activeJobs + 50 },
                    { label: 'Companies', value: stats.activeJobs, total: stats.totalStudents + stats.activeJobs + 50 },
                  ].map((item,i) => (
                    <div key={i}><div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span>{item.value}</span></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div className="h-full bg-gray-700" initial={{width:0}} animate={{width:`${(item.value/item.total)*100}%`}} transition={{delay:i*0.1,duration:0.7}} /></div></div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Internship Analytics</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Active Internships', value: totalActiveInterns },
                  { label: 'Avg Attendance Rate', value: avgAttendance + '%' },
                  { label: 'Low Attendance Alerts', value: lowAttendanceCount },
                  { label: 'Placements This Semester', value: 67 },
                ].map((item,i) => (<div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm">{item.label}</span><span className="font-bold">{item.value}</span></div>))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Student Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="dark:text-gray-100">Student Daily Reports</CardTitle><CardDescription>Reports submitted by your assigned students</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {facultyReports.length === 0 ? <p className="text-center py-8 text-gray-500">No reports yet</p> : facultyReports.map(report => (
                  <div key={report.id} className="p-4 bg-gray-50 rounded-xl border">
                    <div className="flex justify-between items-start mb-2"><div><h3 className="font-semibold">{report.title}</h3><p className="text-sm text-gray-500">by {report.studentName}</p></div><Badge variant="outline">{report.date}</Badge></div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex justify-between text-xs text-gray-400"><span>Hours: {report.hours}h</span>{report.tasks && <span>Tasks: {report.tasks}</span>}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};