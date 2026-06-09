import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Pin, ExternalLink, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import api from '../utils/api';
import { toast } from 'sonner';

export const NoticeBoard = ({ isHomePage = false }) => {
  const [notices, setNotices] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/notices/');
        const sorted = (response.data || []).sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setNotices(sorted);
      } catch (error) {
        console.error('Failed to fetch notices:', error);
        toast.error('Failed to load notices');
        setNotices([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(notice => activeTab === 'all' || notice.type === activeTab);
  const displayNotices = isHomePage ? filteredNotices.slice(0, 4) : filteredNotices;

  const getTypeColor = (type) => {
    const colors = {
      internship: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      placement: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      project: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      workshop: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      assessment: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const diffDays = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className={isHomePage ? '' : 'max-w-4xl mx-auto'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="border-0 shadow-lg dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="dark:text-gray-100">Notice Board</span>
              </CardTitle>
              {isHomePage && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.href = '/notices/'}
                  className="text-gray-700 dark:text-gray-300"
                >
                  View All <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isHomePage && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-5 dark:bg-gray-700">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="internship">Internships</TabsTrigger>
                  <TabsTrigger value="placement">Placements</TabsTrigger>
                  <TabsTrigger value="workshop">Workshops</TabsTrigger>
                  <TabsTrigger value="assessment">Assessments</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="space-y-4">
              {displayNotices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Pin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notices available</p>
                </div>
              ) : (
                displayNotices.map((notice, index) => (
                  <motion.div 
                    key={notice.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 hover:shadow-md transition-all cursor-pointer ${
                      notice.pinned
                        ? 'border-l-gray-600 bg-gray-100 dark:bg-gray-700/50'
                        : 'border-l-gray-300 bg-white dark:bg-gray-800/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {notice.pinned && <Pin className="w-4 h-4 text-gray-600 fill-current flex-shrink-0" />}
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{notice.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Badge className={getTypeColor(notice.type)}>{notice.type}</Badge>
                        {isExpiringSoon(notice.end_date) && (
                          <Badge variant="destructive" className="animate-pulse">Expires Soon</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{notice.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        {notice.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Start: {formatDate(notice.start_date)}</span>
                          </div>
                        )}
                        {notice.end_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>End: {formatDate(notice.end_date)}</span>
                          </div>
                        )}
                      </div>
                      <span>Posted {formatDate(notice.created_at)}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};