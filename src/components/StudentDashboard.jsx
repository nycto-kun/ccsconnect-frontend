import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Calendar, FileText, Award, Clock, BookOpen, Send, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { EventCalendar } from './EventCalendar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'interview': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ applicationsSent: 0, interviewsScheduled: 0, offersReceived: 0, profileViews: 23 });
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [newReport, setNewReport] = useState({ date: new Date().toISOString().split('T')[0], title: '', description: '', hours: '', tasks: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch applications
        const appsRes = await api.get(`/applications?student_id=${user.id}`);
        const apps = appsRes.data;
        setApplications(apps);
        setStats({
          applicationsSent: apps.length,
          interviewsScheduled: apps.filter(a => a.status === 'interview').length,
          offersReceived: apps.filter(a => a.status === 'accepted').length,
          profileViews: 23,
        });

        // Fetch attendance
        const attRes = await api.get(`/attendance?student_id=${user.id}`);
        setAttendance(attRes.data);

        // Fetch reports
        const repRes = await api.get(`/reports?student_id=${user.id}`);
        setReports(repRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!newReport.title || !newReport.description || !newReport.hours) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await api.post('/reports', {
        date_str: newReport.date,
        title: newReport.title,
        description: newReport.description,
        hours: parseFloat(newReport.hours),
        tasks: newReport.tasks,
      });
      // Refresh reports
      const repRes = await api.get(`/reports?student_id=${user.id}`);
      setReports(repRes.data);
      setShowReportForm(false);
      setNewReport({ date: new Date().toISOString().split('T')[0], title: '', description: '', hours: '', tasks: '' });
    } catch (error) {
      console.error('Failed to submit report', error);
      alert('Failed to submit report');
    }
  };

  // Calculate attendance rate and total hours
  const totalHours = attendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0);
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const totalDays = attendance.length;
  const attendanceRate = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;

  const recentApplications = applications.slice(0, 3);

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Your internship journey is on track. Here's what's happening today.</p>
      </motion.div>

      {/* Event Calendar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <Card className="border-0 shadow-md overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" /><span className="dark:text-gray-100">My Calendar</span></CardTitle></CardHeader>
          <CardContent className="p-0"><EventCalendar userRole="student" /></CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"><div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.applicationsSent}</div><div className="text-sm text-gray-500 dark:text-gray-400">Applications Sent</div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.interviewsScheduled}</div><div className="text-sm text-gray-500 dark:text-gray-400">Interviews</div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"><div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.offersReceived}</div><div className="text-sm text-gray-500 dark:text-gray-400">Offers</div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"><div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.profileViews}</div><div className="text-sm text-gray-500 dark:text-gray-400">Profile Views</div></div>
      </div>

      {/* Recent Applications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
        <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" /><span className="dark:text-gray-100">Recent Applications</span></CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentApplications.length === 0 ? <p className="text-center text-gray-500 py-4">No applications yet</p> : recentApplications.map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div><div className="font-medium text-gray-800 dark:text-gray-200">{app.job_title || 'Position'}</div><div className="text-sm text-gray-500 dark:text-gray-400">{app.company_name || 'Company'}</div></div>
                <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Reports Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
        <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Edit3 className="w-5 h-5 text-gray-600 dark:text-gray-400" /><span className="dark:text-gray-100">Daily Reports</span></CardTitle><Button variant="ghost" size="sm" onClick={() => setShowReportForm(!showReportForm)} className="text-gray-600 dark:text-gray-400">{showReportForm ? 'Cancel' : 'New Report'}</Button></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showReportForm && (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div><Label className="text-xs text-gray-500 dark:text-gray-400">Date</Label><Input type="date" value={newReport.date} onChange={e => setNewReport({ ...newReport, date: e.target.value })} required className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                <div><Label className="text-xs text-gray-500 dark:text-gray-400">Title *</Label><Input placeholder="What did you work on?" value={newReport.title} onChange={e => setNewReport({ ...newReport, title: e.target.value })} required className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                <div><Label className="text-xs text-gray-500 dark:text-gray-400">Description *</Label><Textarea placeholder="Describe your work in detail..." rows={3} value={newReport.description} onChange={e => setNewReport({ ...newReport, description: e.target.value })} required className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                <div><Label className="text-xs text-gray-500 dark:text-gray-400">Hours Worked *</Label><Input type="number" min="0" step="0.5" placeholder="e.g., 4" value={newReport.hours} onChange={e => setNewReport({ ...newReport, hours: e.target.value })} required className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                <div><Label className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</Label><Input placeholder="List key tasks" value={newReport.tasks} onChange={e => setNewReport({ ...newReport, tasks: e.target.value })} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
                <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"><Send className="w-4 h-4 mr-2" />Submit Report</Button>
              </form>
            )}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reports.slice(0, 5).map(report => (
                <div key={report.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><div className="flex justify-between items-start mb-1"><h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{report.title}</h4><span className="text-xs text-gray-400 dark:text-gray-500">{report.date}</span></div><p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{report.description}</p><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400"><span>{report.hours}h</span>{report.tasks && <span>Tasks: {report.tasks}</span>}</div></div>
              ))}
              {reports.length === 0 && !showReportForm && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No reports yet. Add your first report!</p>}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Attendance Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
        <Card className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" /><span className="dark:text-gray-100">Attendance Summary</span></CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div><span className="text-sm text-gray-500">Total Hours</span><div className="text-2xl font-bold">{totalHours}h</div></div>
              <div><span className="text-sm text-gray-500">Attendance Rate</span><div className="text-2xl font-bold">{attendanceRate}%</div></div>
              <div><span className="text-sm text-gray-500">Present Days</span><div className="text-2xl font-bold">{presentDays}/{totalDays}</div></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pro Tip */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="border-0 shadow-md bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white"><CardContent className="p-5"><div className="flex items-start gap-3"><BookOpen className="w-8 h-8 text-gray-300" /><div><h3 className="font-semibold text-lg mb-1">Pro Tip</h3><p className="text-sm text-gray-200">Update your portfolio with recent projects to stand out to recruiters.</p></div></div></CardContent></Card>
      </motion.div>
    </div>
  );
};