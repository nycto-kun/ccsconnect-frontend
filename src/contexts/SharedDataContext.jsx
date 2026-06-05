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
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data from real API
  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch assignments (based on user role)
      let assignmentsUrl = '/assignments';
      if (user.role === 'student') {
        assignmentsUrl = `/assignments?student_id=${user.id}`;
      } else if (user.role === 'company') {
        assignmentsUrl = `/assignments?company_id=${user.id}`;
      } else if (user.role === 'admin') {
        assignmentsUrl = '/assignments';
      }
      
      const assignmentsRes = await api.get(assignmentsUrl);
      setAssignments(assignmentsRes.data);
      
      // Fetch attendance
      let attendanceUrl = '/attendance';
      if (user.role === 'student') {
        attendanceUrl = `/attendance?student_id=${user.id}`;
      } else if (user.role === 'company') {
        attendanceUrl = `/attendance?company_id=${user.id}`;
      }
      const attendanceRes = await api.get(attendanceUrl);
      setAttendance(attendanceRes.data);
      
      // Fetch reports (for admin/faculty view)
      if (user.role === 'admin' || user.role === 'faculty') {
        const reportsRes = await api.get('/reports');
        setReports(reportsRes.data);
      } else if (user.role === 'student') {
        const reportsRes = await api.get(`/reports?student_id=${user.id}`);
        setReports(reportsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch shared data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Helper functions
  const getStudentAttendance = (studentId) => {
    return attendance.filter(r => r.student_id === studentId).sort((a, b) => b.date.localeCompare(a.date));
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

  const getStudentAssignment = (studentId) => {
    return assignments.find(a => a.student_id === studentId);
  };

  const getFacultyReports = (facultyId) => {
    // Get student IDs assigned to this faculty
    const studentIds = assignments
      .filter(a => a.faculty_id === facultyId)
      .map(a => a.student_id);
    return reports.filter(r => studentIds.includes(r.student_id));
  };

  const refreshData = () => {
    fetchData();
  };

  return (
    <SharedDataContext.Provider
      value={{
        assignments,
        attendance,
        reports,
        loading,
        getStudentAttendance,
        getStudentHours,
        getAttendanceRate,
        getStudentAssignment,
        getFacultyReports,
        refreshData,
      }}
    >
      {children}
    </SharedDataContext.Provider>
  );
};