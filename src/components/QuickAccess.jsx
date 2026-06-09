import React from 'react';
import { motion } from 'motion/react';
import { Search, FileText, Calendar, BookOpen, TrendingUp, Briefcase, Award, Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useAuth } from '../contexts/AuthContext';

export const QuickAccess = ({ onNavigate }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  // Different quick actions based on role
  const getQuickActions = () => {
    if (userRole === 'student') {
      return [
        { icon: Search, title: 'Find Internships', description: 'Browse available opportunities', color: 'from-blue-500 to-blue-600', page: 'opportunities' },
        { icon: TrendingUp, title: 'AI Recommendations', description: 'Personalized job matches', color: 'from-purple-500 to-purple-600', page: 'opportunities' },
        { icon: FileText, title: 'My Applications', description: 'Track application status', color: 'from-green-500 to-green-600', page: 'dashboard' },
        { icon: Calendar, title: 'Event Calendar', description: 'View interviews and deadlines', color: 'from-orange-500 to-orange-600', page: 'calendar' },
        { icon: BookOpen, title: 'Resource Library', description: 'Access guides and templates', color: 'from-teal-500 to-teal-600', page: 'resources' },
        { icon: Award, title: 'Offer Vault', description: 'Manage and compare offers', color: 'from-pink-500 to-pink-600', page: 'offers' },
      ];
    } else if (userRole === 'company') {
      return [
        { icon: Briefcase, title: 'Post Job', description: 'Create new job listings', color: 'from-blue-500 to-blue-600', page: 'dashboard' },
        { icon: Users, title: 'Applications', description: 'Review candidates', color: 'from-green-500 to-green-600', page: 'dashboard' },
        { icon: Calendar, title: 'Attendance', description: 'Log intern attendance', color: 'from-orange-500 to-orange-600', page: 'dashboard' },
        { icon: FileText, title: 'Reports', description: 'View intern reports', color: 'from-purple-500 to-purple-600', page: 'dashboard' },
      ];
    } else {
      return [
        { icon: Users, title: 'Student Management', description: 'Track student progress', color: 'from-blue-500 to-blue-600', page: 'dashboard' },
        { icon: Briefcase, title: 'Job Postings', description: 'Manage job listings', color: 'from-green-500 to-green-600', page: 'dashboard' },
        { icon: FileText, title: 'Reports', description: 'Generate analytics', color: 'from-purple-500 to-purple-600', page: 'dashboard' },
        { icon: Bell, title: 'Notices', description: 'Post announcements', color: 'from-orange-500 to-orange-600', page: 'notices' },
      ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage your {userRole === 'student' ? 'internship journey' : userRole === 'company' ? 'recruitment' : 'administrative tasks'} in one place
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
                onClick={() => onNavigate && onNavigate(action.page)}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 transition-all duration-300">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};