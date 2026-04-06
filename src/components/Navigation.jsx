import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, Briefcase, User, BarChart3, Bell, Settings, LogOut, Menu, X, Award, GraduationCap, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '../contexts/AuthContext';

const roleDisplayName = { student: 'Student', company: 'Company Recruiter', admin: 'Admin / Faculty' };
const roleInitials = { student: 'AS', company: 'PM', admin: 'SA' };
const roleMockName = { student: 'Arjun Sharma', company: 'Priya Mehta', admin: 'System Admin' };
const roleMockEmail = { student: 'arjun.sharma@college.edu', company: 'priya@techcorp.com', admin: 'admin@ccsconnect.in' };

export const Navigation = ({ currentPage, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, profile } = useAuth();
  const userRole = user?.role || 'student';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showOpportunities = userRole === 'student';

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, show: userRole !== 'admin' && userRole !== 'company' },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase, show: showOpportunities },
    { id: 'profile', label: 'My Profile', icon: User, show: true },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, show: true },
    { id: 'notices', label: 'Notices', icon: Bell, show: true },
    { id: 'interns', label: 'Interns', icon: Users, show: userRole === 'admin' || userRole === 'company' },
  ].filter(item => item.show);

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'company': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const userFullName = user?.full_name || (userRole === 'student' ? 'Student User' : userRole === 'company' ? 'Company Rep' : 'Admin');
  const userEmail = user?.email || (userRole === 'student' ? 'student@example.com' : userRole === 'company' ? 'company@example.com' : 'admin@example.com');

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700' : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-none">CCSconnect</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getRoleBadgeColor()}`}>{roleDisplayName[userRole]}</span>
            </div>
          </button>

          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <NotificationDropdown userRole={userRole} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-800 dark:bg-gray-700 text-white font-semibold text-sm">
                      {userFullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 mt-2 mr-4 dark:bg-gray-800 dark:border-gray-700" align="end">
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {userFullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{userFullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${getRoleBadgeColor()}`}>
                        {roleDisplayName[userRole]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="mr-2 h-4 w-4" /><span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('settings')}>
                    <Settings className="mr-2 h-4 w-4" /><span>Settings</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="dark:bg-gray-700" />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/30">
                  <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
            </motion.button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-1 pt-4">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};