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
  
  // State for all data types
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    applicationsSent: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
    profileViews: 0
  });
  
  const abortControllerRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Fetch all student data
  const fetchStudentData = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    if (isFetchingRef.current) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      
      const [appsResult, attResult, repResult, jobsResult, noticesResult] = await Promise.allSettled([
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
        
        setStats({
          applicationsSent: apps.length,
          interviewsScheduled: apps.filter(a => a.status === 'interview').length,
          offersReceived: apps.filter(a => a.status === 'accepted').length,
          profileViews: apps.reduce((sum, a) => sum + (a.views || 0), 0)
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch student data:', error);
        setError('Failed to load data');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [user]);

  // Fetch admin data
  const fetchAdminData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    if (isFetchingRef.current) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const [statsResult, noticesResult, jobsResult, appsResult] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/notices/'),
        api.get('/jobs/'),
        api.get('/applications/')
      ]);
      
      if (!controller.signal.aborted) {
        if (statsResult.status === 'fulfilled') setStats(statsResult.value.data);
        setNotices(noticesResult.status === 'fulfilled' ? noticesResult.value.data || [] : []);
        setJobs(jobsResult.status === 'fulfilled' ? jobsResult.value.data || [] : []);
        setApplications(appsResult.status === 'fulfilled' ? appsResult.value.data || [] : []);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch admin data:', error);
        setError('Failed to load admin data');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  // Fetch company data (single source of truth)
  const fetchCompanyData = useCallback(async () => {
    if (!user || user.role !== 'company') return;
    if (isFetchingRef.current) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get company_id from user profile
      let companyId = null;
      try {
        const userRes = await api.get('/auth/me');
        companyId = userRes.data?.company_id;
      } catch (e) {
        console.log('Could not get company_id, using fallback');
      }
      
      // Fetch all company data in parallel
      const [jobsResult, appsResult, attResult, assignmentsResult, reportsResult, noticesResult] = await Promise.allSettled([
        api.get(`/jobs/?company_id=${companyId || user.id}`),
        api.get(`/applications/?company_id=${companyId || user.id}`),
        api.get(`/attendance/?company_id=${companyId || user.id}`),
        api.get(`/assignments/?company_id=${companyId || user.id}`),
        api.get(`/reports/?company_id=${companyId || ''}`),
        api.get('/notices/')
      ]);
      
      if (!controller.signal.aborted) {
        setJobs(jobsResult.status === 'fulfilled' ? jobsResult.value.data || [] : []);
        setApplications(appsResult.status === 'fulfilled' ? appsResult.value.data || [] : []);
        setAttendance(attResult.status === 'fulfilled' ? attResult.value.data || [] : []);
        setInterns(assignmentsResult.status === 'fulfilled' ? assignmentsResult.value.data || [] : []);
        setReports(reportsResult.status === 'fulfilled' ? reportsResult.value.data || [] : []);
        setNotices(noticesResult.status === 'fulfilled' ? noticesResult.value.data || [] : []);
        
        // Calculate company stats
        const activeJobs = (jobsResult.status === 'fulfilled' ? jobsResult.value.data || [] : []).filter(j => j.status === 'active').length;
        setStats(prev => ({
          ...prev,
          activeJobs,
          totalApplications: appsResult.status === 'fulfilled' ? (appsResult.value.data || []).length : 0,
          activeInterns: assignmentsResult.status === 'fulfilled' ? (assignmentsResult.value.data || []).filter(i => i.status === 'active').length : 0
        }));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch company data:', error);
        setError('Failed to load company data');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
      isFetchingRef.current = false;
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

  // Helper functions
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
    interns,
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