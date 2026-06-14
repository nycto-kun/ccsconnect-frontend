import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const [stats, setStats] = useState({
    applicationsSent: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
    profileViews: 0
  });

  // Fetch all student data with abort controller
  const fetchStudentData = useCallback(async () => {
    if (!user || user.role !== 'student') return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      
      // Run all requests in parallel for faster loading
      const [
        appsResult,
        attResult,
        repResult,
        jobsResult,
        noticesResult
      ] = await Promise.allSettled([
        api.get(`/applications/?student_id=${user.id}`),
        api.get(`/attendance/?student_id=${user.id}`),
        api.get(`/reports/?student_id=${user.id}`),
        api.get('/jobs/?status=active'),
        api.get('/notices/')
      ]);
      
      if (!controller.signal.aborted) {
        const apps = appsResult.status === 'fulfilled' ? appsResult.value.data || [] : [];
        const attData = attResult.status === 'fulfilled' ? attResult.value.data || [] : [];
        const repData = repResult.status === 'fulfilled' ? repResult.value.data || [] : [];
        
        setApplications(apps);
        setAttendance(attData);
        setReports(repData);
        setJobs(jobsResult.status === 'fulfilled' ? jobsResult.value.data || [] : []);
        setNotices(noticesResult.status === 'fulfilled' ? noticesResult.value.data || [] : []);
        
        // Update stats
        setStats({
          applicationsSent: apps.length,
          interviewsScheduled: apps.filter(a => a.status === 'interview').length,
          offersReceived: apps.filter(a => a.status === 'accepted').length,
          profileViews: apps.reduce((sum, a) => sum + (a.views || 0), 0)
        });
        
        // Log any failed requests for debugging
        if (appsResult.status === 'rejected') console.error('Applications fetch failed:', appsResult.reason);
        if (attResult.status === 'rejected') console.error('Attendance fetch failed:', attResult.reason);
        if (repResult.status === 'rejected') console.error('Reports fetch failed:', repResult.reason);
      }
      
    } catch (error) {
      if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
        console.error('Failed to fetch student data:', error);
        setError('Failed to load data. Please refresh.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [user]);

  // Fetch admin data
  const fetchAdminData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      setLoading(true);
      setError(null);
      
      const [statsResult, noticesResult, jobsResult] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/notices/'),
        api.get('/jobs/')
      ]);
      
      if (!controller.signal.aborted) {
        if (statsResult.status === 'fulfilled') setStats(statsResult.value.data);
        setNotices(noticesResult.status === 'fulfilled' ? noticesResult.value.data || [] : []);
        setJobs(jobsResult.status === 'fulfilled' ? jobsResult.value.data || [] : []);
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch admin data:', error);
        setError('Failed to load admin data');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [user]);

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    if (!user || user.role !== 'company') return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      setLoading(true);
      setError(null);
      
      const [jobsResult, appsResult, attResult, noticesResult] = await Promise.allSettled([
        api.get(`/jobs/?company_id=${user.id}`),
        api.get(`/applications/?company_id=${user.id}`),
        api.get(`/attendance/?company_id=${user.id}`),
        api.get('/notices/')
      ]);
      
      if (!controller.signal.aborted) {
        setJobs(jobsResult.status === 'fulfilled' ? jobsResult.value.data || [] : []);
        setApplications(appsResult.status === 'fulfilled' ? appsResult.value.data || [] : []);
        setAttendance(attResult.status === 'fulfilled' ? attResult.value.data || [] : []);
        setNotices(noticesResult.status === 'fulfilled' ? noticesResult.value.data || [] : []);
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch company data:', error);
        setError('Failed to load company data');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    if (user.role === 'student') fetchStudentData();
    else if (user.role === 'admin') fetchAdminData();
    else if (user.role === 'company') fetchCompanyData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, fetchStudentData, fetchAdminData, fetchCompanyData]);

  // Helper functions (memoized for performance)
  const getStudentAttendance = useCallback((studentId) => {
    return attendance.filter(r => r.student_id === studentId).sort((a, b) => b.date?.localeCompare(a.date));
  }, [attendance]);

  const getStudentHours = useCallback((studentId) => {
    return attendance.filter(r => r.student_id === studentId).reduce((sum, r) => sum + (r.hours_worked || 0), 0);
  }, [attendance]);

  const getAttendanceRate = useCallback((studentId) => {
    const records = attendance.filter(r => r.student_id === studentId);
    if (!records.length) return 0;
    const present = records.filter(r => r.status === 'present' || r.status === 'half-day').length;
    return Math.round((present / records.length) * 100);
  }, [attendance]);

  const refreshData = useCallback(() => {
    if (user?.role === 'student') fetchStudentData();
    else if (user?.role === 'admin') fetchAdminData();
    else if (user?.role === 'company') fetchCompanyData();
  }, [user, fetchStudentData, fetchAdminData, fetchCompanyData]);

  const value = {
    applications,
    attendance,
    reports,
    jobs,
    notices,
    stats,
    loading,
    error,
    getStudentAttendance,
    getStudentHours,
    getAttendanceRate,
    refreshData,
  };

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
};