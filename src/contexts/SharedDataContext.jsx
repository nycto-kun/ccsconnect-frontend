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
    profileViews: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    activeInterns: 0,
    totalAttendance: 0,
    pendingReports: 0
  });
  
  const abortControllerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const initialFetchDone = useRef(false);

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
          profileViews: apps.reduce((sum, a) => sum + (a.views || 0), 0),
          activeJobs: 0,
          totalApplications: 0,
          pendingApplications: 0,
          activeInterns: 0,
          totalAttendance: 0,
          pendingReports: 0
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
      
      const [statsResult, noticesResult, jobsResult, appsResult, usersResult] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/notices/'),
        api.get('/jobs/'),
        api.get('/applications/'),
        api.get('/admin/users/?role=student')
      ]);
      
      if (!controller.signal.aborted) {
        if (statsResult.status === 'fulfilled') setStats(prev => ({ ...prev, ...statsResult.value.data }));
        setNotices(noticesResult.status === 'fulfilled' ? noticesResult.value.data || [] : []);
        setJobs(jobsResult.status === 'fulfilled' ? jobsResult.value.data || [] : []);
        setApplications(appsResult.status === 'fulfilled' ? appsResult.value.data || [] : []);
        
        if (usersResult.status === 'fulfilled') {
          setInterns(usersResult.value.data || []);
        }
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

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    console.log('fetchCompanyData called, user role:', user?.role);
    
    if (!user) {
      console.log('No user, skipping fetch');
      return;
    }
    
    if (user.role !== 'company') {
      console.log('User role is not company, skipping fetch. Role:', user.role);
      return;
    }
    
    if (isFetchingRef.current) {
      console.log('Already fetching, skipping');
      return;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching company data for user:', user.id);
      
      // Get company_id from user profile first
      let companyId = null;
      try {
        const userRes = await api.get('/auth/me');
        companyId = userRes.data?.company_id;
        console.log('Company ID from user profile:', companyId);
      } catch (e) {
        console.log('Could not get company_id from user profile');
      }
      
      // If no company_id, try to get it from companies table
      if (!companyId) {
        try {
          const companyRes = await api.get('/companies?contact_email=' + user.email);
          if (companyRes.data && companyRes.data.length > 0) {
            companyId = companyRes.data[0].id;
            console.log('Company ID from companies table:', companyId);
          }
        } catch (e) {
          console.log('Company lookup failed');
        }
      }
      
      // Use companyId or fallback to user.id
      const queryCompanyId = companyId || user.id;
      console.log('Using company_id for queries:', queryCompanyId);
      
      // Fetch all company data in parallel
      console.log('Fetching jobs...');
      const jobsResult = await api.get(`/jobs/?company_id=${queryCompanyId}`);
      console.log('Jobs result:', jobsResult.data?.length || 0, 'jobs found');
      
      console.log('Fetching applications...');
      const appsResult = await api.get(`/applications/?company_id=${queryCompanyId}`);
      console.log('Applications result:', appsResult.data?.length || 0, 'applications found');
      
      console.log('Fetching attendance...');
      const attResult = await api.get(`/attendance/?company_id=${queryCompanyId}`);
      console.log('Attendance result:', attResult.data?.length || 0, 'records found');
      
      console.log('Fetching assignments (interns)...');
      const assignmentsResult = await api.get(`/assignments/?company_id=${queryCompanyId}`);
      console.log('Assignments result:', assignmentsResult.data?.length || 0, 'assignments found');
      
      console.log('Fetching reports...');
      const reportsResult = await api.get(`/reports/?company_id=${queryCompanyId}`);
      console.log('Reports result:', reportsResult.data?.length || 0, 'reports found');
      
      console.log('Fetching notices...');
      const noticesResult = await api.get('/notices/');
      console.log('Notices result:', noticesResult.data?.length || 0, 'notices found');
      
      if (!controller.signal.aborted) {
        setJobs(jobsResult.data || []);
        setApplications(appsResult.data || []);
        setAttendance(attResult.data || []);
        setInterns(assignmentsResult.data || []);
        setReports(reportsResult.data || []);
        setNotices(noticesResult.data || []);
        
        // Calculate stats
        const activeJobsCount = (jobsResult.data || []).filter(j => j.status === 'active').length;
        const totalApps = (appsResult.data || []).length;
        const pendingApps = (appsResult.data || []).filter(a => a.status === 'pending').length;
        const activeInternsCount = (assignmentsResult.data || []).filter(i => i.status === 'active').length;
        const totalAttendanceCount = (attResult.data || []).length;
        const pendingReportsCount = (reportsResult.data || []).filter(r => r.status === 'pending').length;
        
        setStats({
          applicationsSent: totalApps,
          interviewsScheduled: (appsResult.data || []).filter(a => a.status === 'interview').length,
          offersReceived: (appsResult.data || []).filter(a => a.status === 'accepted').length,
          profileViews: 0,
          activeJobs: activeJobsCount,
          totalApplications: totalApps,
          pendingApplications: pendingApps,
          activeInterns: activeInternsCount,
          totalAttendance: totalAttendanceCount,
          pendingReports: pendingReportsCount
        });
        
        console.log('=== fetchCompanyData SUCCESS ===');
        console.log('Interns set to:', assignmentsResult.data?.length || 0);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch company data:', error);
        console.error('Error details:', error.response?.status, error.response?.data);
        setError(`Failed to load company data: ${error.response?.status || error.message}`);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [user]);

  // Use effect to trigger data fetch based on role
  useEffect(() => {
    console.log('SharedDataContext useEffect triggered. User:', user?.id, 'Role:', user?.role);
    
    if (!user) {
      console.log('No user, skipping data fetch');
      setLoading(false);
      return;
    }
    
    // Prevent multiple initial fetches
    if (initialFetchDone.current) {
      console.log('Initial fetch already done, skipping');
      return;
    }
    
    if (user.role === 'student') {
      console.log('Triggering student data fetch');
      fetchStudentData();
      initialFetchDone.current = true;
    } else if (user.role === 'admin') {
      console.log('Triggering admin data fetch');
      fetchAdminData();
      initialFetchDone.current = true;
    } else if (user.role === 'company') {
      console.log('Triggering company data fetch');
      fetchCompanyData();
      initialFetchDone.current = true;
    } else {
      console.log('Unknown role, no data fetch:', user.role);
      setLoading(false);
    }
    
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
    console.log('Manual refresh triggered');
    initialFetchDone.current = false;
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