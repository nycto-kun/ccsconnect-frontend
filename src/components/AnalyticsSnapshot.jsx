import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Clock, Users, Briefcase, Award, Calendar, 
  CheckCircle, AlertCircle, FileText, UserCheck, BarChart3, 
  Send, Eye, Star, Target, BookOpen, Download, MessageCircle, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export const AnalyticsSnapshot = () => {
  const { user } = useAuth();
  
  // Admin stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeJobs: 0,
    placementRate: 0,
    totalApplications: 0
  });
  
  // Student stats
  const [studentStats, setStudentStats] = useState({
    applicationsSent: 0,
    interviews: 0,
    offers: 0,
    attendanceRate: 0,
    totalHours: 0,
    profileViews: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [skillGap, setSkillGap] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch admin stats (only for admin users)
        if (user?.role === 'admin') {
          try {
            const statsRes = await api.get('/admin/stats/');
            setStats(statsRes.data);
          } catch (statsError) {
            console.log('Admin stats not available');
          }
        }
        
        // Fetch student-specific stats (for student users)
        if (user?.role === 'student') {
          try {
            // Fetch applications
            const appsRes = await api.get(`/applications/?student_id=${user.id}`);
            const applications = appsRes.data || [];
            
            // Fetch attendance
            const attRes = await api.get(`/attendance/?student_id=${user.id}`);
            const attendance = attRes.data || [];
            
            // Fetch user profile for skills
            const profileRes = await api.get('/auth/me');
            const userSkills = profileRes.data?.skills || [];
            
            const totalHours = attendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0);
            const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'half-day').length;
            const attendanceRate = attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0;
            
            setStudentStats({
              applicationsSent: applications.length,
              interviews: applications.filter(a => a.status === 'interview').length,
              offers: applications.filter(a => a.status === 'accepted').length,
              attendanceRate: attendanceRate,
              totalHours: totalHours,
              profileViews: 42 // This would come from analytics in production
            });
            
            // Calculate skill gap based on job requirements
            const jobsRes = await api.get('/jobs/?status=active');
            const jobs = jobsRes.data || [];
            const allRequiredSkills = jobs.flatMap(job => job.requirements || []);
            const skillFrequency = {};
            allRequiredSkills.forEach(skill => {
              skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
            });
            
            const topSkills = Object.entries(skillFrequency)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([skill, count]) => ({
                skill,
                demand: count,
                hasSkill: userSkills.includes(skill)
              }));
            
            setSkillGap(topSkills);
            
          } catch (studentError) {
            console.log('Student stats not available:', studentError);
          }
        }
        
        // Fetch recent applications for activity feed
        const appsRes = await api.get('/applications/');
        const applications = appsRes.data || [];
        
        // Create recent activities from applications
        const activities = applications.slice(0, 8).map(app => ({
          type: app.status === 'accepted' ? 'placement' : 
                app.status === 'interview' ? 'interview' : 'application',
          message: `${app.student_name || 'A student'} applied for ${app.job_title || 'a position'} at ${app.company_name || 'a company'}`,
          time: new Date(app.applied_at).toLocaleDateString(),
          status: app.status
        }));
        
        setRecentActivities(activities);
        
        // Department stats (for admin)
        setDepartmentStats([
          { department: 'Computer Science', placed: 45, total: 60 },
          { department: 'Information Technology', placed: 38, total: 50 },
          { department: 'Electronics', placed: 30, total: 45 },
          { department: 'Mechanical', placed: 25, total: 40 },
        ]);
        
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user]);

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-gray-200 mx-auto"></div>
        </div>
      </section>
    );
  }

  // ============================================================
  // STUDENT ANALYTICS VIEW
  // ============================================================
  if (user?.role === 'student') {
    return (
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12" 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Your Performance Analytics</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Track your internship journey, application progress, and skill development
            </p>
          </motion.div>

          {/* Student Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-md text-center dark:bg-gray-800">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{studentStats.applicationsSent}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Applications</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-md text-center dark:bg-gray-800">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{studentStats.interviews}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Interviews</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-md text-center dark:bg-gray-800">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{studentStats.offers}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Offers</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-md text-center dark:bg-gray-800">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{studentStats.totalHours}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Hours</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-md text-center dark:bg-gray-800">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{studentStats.attendanceRate}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Attendance</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Application Progress */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-md dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                    Application Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Applications Sent</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{studentStats.applicationsSent}</span>
                    </div>
                    <Progress value={Math.min(100, (studentStats.applicationsSent / 20) * 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Interview Rate</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {Math.round((studentStats.interviews / Math.max(1, studentStats.applicationsSent)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.round((studentStats.interviews / Math.max(1, studentStats.applicationsSent)) * 100)} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Offer Rate</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {Math.round((studentStats.offers / Math.max(1, studentStats.applicationsSent)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.round((studentStats.offers / Math.max(1, studentStats.applicationsSent)) * 100)} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skill Gap Analysis */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-md dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Star className="w-5 h-5 text-gray-600" />
                    Skill Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skillGap.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Complete your profile to see skill recommendations</p>
                    </div>
                  ) : (
                    skillGap.map((skill, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{skill.skill}</span>
                          {skill.hasSkill ? (
                            <Badge className="bg-green-100 text-green-700">✓ You have this</Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-300 text-orange-600">Recommended to learn</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Appears in {skill.demand} job posting{skill.demand !== 1 ? 's' : ''}
                        </div>
                      </div>
                    ))
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => window.location.href = '/profile'}
                  >
                    Update Your Skills
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }} 
            viewport={{ once: true }} 
            className="mt-8"
          >
            <Card className="border-0 shadow-md dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Your Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No recent activity yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => window.location.href = '/opportunities'}
                    >
                      Browse Opportunities
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentActivities.slice(0, 6).map((activity, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'placement' ? 'bg-green-500' : 
                          activity.type === 'interview' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-gray-800 dark:text-gray-200 font-medium text-sm">{activity.message}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{activity.time}</p>
                        </div>
                        <Badge className={
                          activity.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          activity.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {activity.status || 'pending'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Tip Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.3 }} 
            viewport={{ once: true }} 
            className="mt-8"
          >
            <Card className="border-0 shadow-md bg-gradient-to-r from-gray-800 to-gray-900 text-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Pro Tip</h3>
                    <p className="text-gray-200 text-sm">
                      {skillGap.length > 0 && skillGap.some(s => !s.hasSkill) 
                        ? `Learn ${skillGap.filter(s => !s.hasSkill).map(s => s.skill).join(', ')} to increase your chances of getting hired!`
                        : 'Complete your profile and add more skills to get better job matches!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  // ============================================================
  // ADMIN ANALYTICS VIEW
  // ============================================================
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Placement Analytics</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Real-time insights into campus placement performance</p>
        </motion.div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }}>
            <Card className="border-0 shadow-lg text-center dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalStudents}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} viewport={{ once: true }}>
            <Card className="border-0 shadow-lg text-center dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.activeJobs}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Jobs</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} viewport={{ once: true }}>
            <Card className="border-0 shadow-lg text-center dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.placementRate}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Placement Rate</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} viewport={{ once: true }}>
            <Card className="border-0 shadow-lg text-center dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalApplications || recentActivities.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Applications</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Wise Placement */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <Card className="border-0 shadow-lg h-full dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
                  <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span>Department Wise Placement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {departmentStats.map((dept, index) => {
                  const percentage = Math.round((dept.placed / dept.total) * 100);
                  return (
                    <motion.div key={index} className="space-y-2" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} viewport={{ once: true }}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{dept.department}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{dept.placed}/{dept.total}</span>
                      </div>
                      <Progress value={percentage} className="h-3 dark:bg-gray-700" />
                      <div className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">{percentage}%</div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <Card className="border-0 shadow-lg h-full dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
                  <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span>Recent Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No recent activities</p>
                  </div>
                ) : (
                  recentActivities.map((activity, index) => (
                    <motion.div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} viewport={{ once: true }}>
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'placement' ? 'bg-green-500' : 
                        activity.type === 'interview' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200 font-medium text-sm">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{activity.time}</p>
                          <Badge className={
                            activity.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            activity.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {activity.status || 'pending'}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};