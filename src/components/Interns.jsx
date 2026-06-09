import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Users, AlertCircle, GraduationCap, TrendingUp, Calendar, 
  Loader2, Search, Filter, RefreshCw, UserCheck, Clock,
  Briefcase, Mail, Phone, MapPin, Award, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const Interns = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch all data with proper error handling
  const fetchData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setRefreshing(true);
      
      // Fetch all students
      const studentsRes = await api.get('/admin/users/?role=student');
      const studentsData = studentsRes.data || [];
      setStudents(studentsData);
      
      // Fetch all applications
      const appsRes = await api.get('/applications/');
      const appsData = appsRes.data || [];
      setApplications(appsData);
      
      // Fetch attendance records
      const attRes = await api.get('/attendance/');
      const attData = attRes.data || [];
      setAttendances(attData);
      
    } catch (error) {
      console.error('Failed to fetch interns data:', error);
      toast.error('Failed to load interns data');
      setStudents([]);
      setApplications([]);
      setAttendances([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, fetchData]);

  // Helper functions
  const getStudentApplications = (studentId) => {
    return applications.filter(app => app.student_id === studentId);
  };

  const getStudentAttendance = (studentId) => {
    return attendances.filter(att => att.student_id === studentId);
  };

  const getStudentTotalHours = (studentId) => {
    return getStudentAttendance(studentId).reduce((sum, att) => sum + (att.hours_worked || 0), 0);
  };

  const getStudentAttendanceRate = (studentId) => {
    const records = getStudentAttendance(studentId);
    if (records.length === 0) return 0;
    const presentDays = records.filter(r => r.status === 'present' || r.status === 'half-day').length;
    return Math.round((presentDays / records.length) * 100);
  };

  // Filter students
  const getFilteredStudents = () => {
    let filtered = [...students];
    
    if (activeTab === 'withInternship') {
      filtered = filtered.filter(student => {
        const hasAcceptedOffer = applications.some(app => 
          app.student_id === student.id && app.status === 'accepted'
        );
        return hasAcceptedOffer;
      });
    } else if (activeTab === 'withoutInternship') {
      filtered = filtered.filter(student => {
        const hasAcceptedOffer = applications.some(app => 
          app.student_id === student.id && app.status === 'accepted'
        );
        return !hasAcceptedOffer;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.full_name?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.student_id?.toLowerCase().includes(term) ||
        student.department?.toLowerCase().includes(term)
      );
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(student => student.department === selectedDepartment);
    }
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(student => student.year === selectedYear);
    }
    
    return filtered;
  };

  // Get unique departments and years for filters
  const departments = ['all', ...new Set(students.map(s => s.department).filter(Boolean))];
  const years = ['all', ...new Set(students.map(s => s.year).filter(Boolean))];

  const filteredStudents = getFilteredStudents();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        <p className="text-gray-500">Loading interns data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Intern Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage all student interns, their applications, and attendance
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData} 
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">With Internship</p>
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => {
                    const hasAcceptedOffer = applications.some(app => 
                      app.student_id === s.id && app.status === 'accepted'
                    );
                    return hasAcceptedOffer;
                  }).length}
                </p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Without Internship</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {students.filter(s => {
                    const hasAcceptedOffer = applications.some(app => 
                      app.student_id === s.id && app.status === 'accepted'
                    );
                    return !hasAcceptedOffer;
                  }).length}
                </p>
              </div>
              <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Applications</p>
                <p className="text-2xl font-bold text-purple-600">{applications.length}</p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <TabsTrigger value="all">All Students</TabsTrigger>
          <TabsTrigger value="withInternship">With Internship</TabsTrigger>
          <TabsTrigger value="withoutInternship">Without Internship</TabsTrigger>
        </TabsList>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name, email, student ID, or department..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-9"
            />
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredStudents.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-16 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No students found</p>
                {(searchTerm || selectedDepartment !== 'all' || selectedYear !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDepartment('all');
                      setSelectedYear('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((student, index) => {
                const studentApps = getStudentApplications(student.id);
                const studentAttendance = getStudentAttendance(student.id);
                const totalHours = getStudentTotalHours(student.id);
                const attendanceRate = getStudentAttendanceRate(student.id);
                const hasActiveInternship = studentApps.some(app => app.status === 'accepted');
                const isExpanded = expandedStudent === student.id;
                
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className={`border-0 shadow-md hover:shadow-lg transition-all ${
                      hasActiveInternship ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'
                    }`}>
                      <CardContent className="p-5">
                        {/* Main row */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                              {student.full_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">{student.full_name || 'Student'}</h3>
                                <Badge className={hasActiveInternship ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                  {hasActiveInternship ? 'Active Intern' : 'No Internship'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{student.email}</p>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                                {student.student_id && <span>ID: {student.student_id}</span>}
                                {student.department && <span>📚 {student.department}</span>}
                                {student.year && <span>🎓 Year {student.year}</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-xl font-bold text-blue-600">{studentApps.length}</div>
                              <div className="text-xs text-gray-500">Applications</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-green-600">{totalHours}</div>
                              <div className="text-xs text-gray-500">Hours</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-purple-600">{attendanceRate}%</div>
                              <div className="text-xs text-gray-500">Attendance</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                              className="text-gray-500"
                            >
                              {isExpanded ? 'Show Less' : 'Show Details'}
                              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-5 pt-4 border-t"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Applications */}
                              <div>
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <Briefcase className="w-4 h-4" />
                                  Recent Applications
                                </h4>
                                {studentApps.length === 0 ? (
                                  <p className="text-sm text-gray-500">No applications yet</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {studentApps.slice(0, 5).map(app => (
                                      <div key={app.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <div>
                                          <p className="text-sm font-medium">{app.job_title || 'Position'}</p>
                                          <p className="text-xs text-gray-500">{app.company_name}</p>
                                        </div>
                                        <Badge className={
                                          app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                          app.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-gray-100 text-gray-700'
                                        }>
                                          {app.status || 'pending'}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Attendance History */}
                              <div>
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Recent Attendance
                                </h4>
                                {studentAttendance.length === 0 ? (
                                  <p className="text-sm text-gray-500">No attendance records</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {studentAttendance.slice(0, 5).map(att => (
                                      <div key={att.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <div>
                                          <p className="text-sm font-medium">{att.date}</p>
                                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{att.task}</p>
                                        </div>
                                        <Badge className={
                                          att.status === 'present' ? 'bg-green-100 text-green-700' :
                                          att.status === 'half-day' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-red-100 text-red-700'
                                        }>
                                          {att.status} • {att.hours_worked}h
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Progress */}
                            {hasActiveInternship && (
                              <div className="mt-4 pt-3 border-t">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Internship Progress</span>
                                  <span className="font-medium">{Math.min(100, Math.round((totalHours / 480) * 100))}%</span>
                                </div>
                                <Progress value={Math.min(100, Math.round((totalHours / 480) * 100))} className="h-2" />
                                <p className="text-xs text-gray-500 mt-2">
                                  {totalHours} / 480 hours completed
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};