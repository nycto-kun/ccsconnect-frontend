import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const SharedDataContext = createContext(undefined);

export const useSharedData = () => {
  const ctx = useContext(SharedDataContext);
  if (!ctx) throw new Error('useSharedData must be used within SharedDataProvider');
  return ctx;
};

export const SharedDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    applicationsSent: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
    profileViews: 0
  });

  // Fetch all student data
  const fetchStudentData = async () => {
    if (!user || user.role !== 'student') return;

    try {
      setLoading(true);
      
      // Fetch applications
      const appsRes = await api.get(`/applications?student_id=${user.id}`);
      const apps = appsRes.data || [];
      setApplications(apps);
      
      // Fetch attendance
      const attRes = await api.get(`/attendance?student_id=${user.id}`);
      setAttendance(attRes.data || []);
      
      // Fetch reports
      const repRes = await api.get(`/reports?student_id=${user.id}`);
      setReports(repRes.data || []);
      
      // Fetch jobs for opportunities
      const jobsRes = await api.get('/jobs?status=active');
      setJobs(jobsRes.data || []);
      
      // Fetch notices
      const noticesRes = await api.get('/notices');
      setNotices(noticesRes.data || []);
      
      // Update stats
      setStats({
        applicationsSent: apps.length,
        interviewsScheduled: apps.filter(a => a.status === 'interview').length,
        offersReceived: apps.filter(a => a.status === 'accepted').length,
        profileViews: apps.reduce((sum, a) => sum + (a.views || 0), 0)
      });
      
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin data
  const fetchAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setLoading(true);
      
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      
      const noticesRes = await api.get('/notices');
      setNotices(noticesRes.data || []);
      
      const jobsRes = await api.get('/jobs');
      setJobs(jobsRes.data || []);
      
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch company data
  const fetchCompanyData = async () => {
    if (!user || user.role !== 'company') return;
    
    try {
      setLoading(true);
      
      const jobsRes = await api.get(`/jobs?company_id=${user.id}`);
      setJobs(jobsRes.data || []);
      
      const appsRes = await api.get(`/applications?company_id=${user.id}`);
      setApplications(appsRes.data || []);
      
      const attRes = await api.get(`/attendance?company_id=${user.id}`);
      setAttendance(attRes.data || []);
      
      const noticesRes = await api.get('/notices');
      setNotices(noticesRes.data || []);
      
    } catch (error) {
      console.error('Failed to fetch company data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    if (user.role === 'student') fetchStudentData();
    else if (user.role === 'admin') fetchAdminData();
    else if (user.role === 'company') fetchCompanyData();
  }, [user]);

  // Helper functions
  const getStudentAttendance = (studentId) => {
    return attendance.filter(r => r.student_id === studentId).sort((a, b) => b.date?.localeCompare(a.date));
  };

  const getStudentHours = (studentId) => {
    return attendance.filter(r => r.student_id === studentId).reduce((sum, r) => sum + (r.hours_worked || 0), 0);
  };

  const getAttendanceRate = (studentId) => {
    const records = attendance.filter(r => r.student_id === studentId);
    if (!records.length) return 0;
    const present = records.filter(r => r.status === 'present' || r.status === 'half-day').length;
    return Math.round((present / records.length) * 100);
  };

  const refreshData = () => {
    if (user?.role === 'student') fetchStudentData();
    else if (user?.role === 'admin') fetchAdminData();
    else if (user?.role === 'company') fetchCompanyData();
  };

  return (
    <SharedDataContext.Provider
      value={{
        applications,
        attendance,
        reports,
        jobs,
        notices,
        stats,
        loading,
        getStudentAttendance,
        getStudentHours,
        getAttendanceRate,
        refreshData,
      }}
    >
      {children}
    </SharedDataContext.Provider>
  );
};