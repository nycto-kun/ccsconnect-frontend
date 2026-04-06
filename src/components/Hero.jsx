import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Users, Briefcase, Award, Bell, Calendar, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

export const Hero = ({ user }) => {
  const stats = [
    { icon: Users, value: '120+', label: 'Students Placed' },
    { icon: Briefcase, value: '50+', label: 'Active Internships' },
    { icon: Award, value: '95%', label: 'Placement Rate' },
  ];

  const noticeTicker = [
    "🎯 New Google SDE internship applications open - Apply by Dec 31st",
    "📚 Resume building workshop this Friday 4 PM - Register now",
    "🏆 Microsoft diversity scholarship applications now live",
    "💼 Tech Career Fair next week - 50+ companies participating",
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Background animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute top-20 left-10 w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full opacity-60" animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-40 right-20 w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full opacity-40" animate={{ y: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gray-400 dark:bg-gray-600 rounded-full opacity-50" animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          {user ? (
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Welcome back, {user.full_name?.split(' ')[0]}! 👋
            </h1>
          ) : (
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Launch Your Career Journey
            </h1>
          )}
          <motion.p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
            Connect with top companies, find meaningful internships, and build the career you've always dreamed of.
          </motion.p>

          <motion.div className="mb-8 overflow-hidden bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="font-semibold text-gray-800 dark:text-gray-100">Latest Updates</span>
            </div>
            <div className="relative overflow-hidden">
              <motion.div className="flex space-x-8" animate={{ x: ["100%", "-100%"] }} transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 20, ease: "linear" } }}>
                {noticeTicker.map((notice, index) => (
                  <span key={index} className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm">{notice}</span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} className="glass-effect rounded-2xl p-6 text-center hover-lift" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }} whileHover={{ scale: 1.05 }}>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4">
                  <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};