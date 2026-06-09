import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Clock, Users, Briefcase, Award, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FileText } from 'lucide-react';

export const AnalyticsSnapshot = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeJobs: 0,
    placementRate: 0,
    totalApplications: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch admin stats
        const statsRes = await api.get('/admin/stats/');
        setStats(statsRes.data);
        
        // Fetch recent applications
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
        
        // Add some sample department stats (you can replace with real data from your backend)
        const deptStats = [
          { department: 'Computer Science', placed: 45, total: 60 },
          { department: 'Information Technology', placed: 38, total: 50 },
          { department: 'Electronics', placed: 30, total: 45 },
          { department: 'Mechanical', placed: 25, total: 40 },
        ];
        setDepartmentStats(deptStats);
        setRecentActivities(activities);
        
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Fallback data
        setStats({ totalStudents: 0, activeJobs: 0, placementRate: 0, totalApplications: 0 });
        setRecentActivities([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Placement Analytics</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Real-time insights into campus placement performance</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }}>
            <Card className="border-0 shadow-lg text-center">
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
            <Card className="border-0 shadow-lg text-center">
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
            <Card className="border-0 shadow-lg text-center">
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
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalApplications}</div>
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