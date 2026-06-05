import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search, MapPin, Calendar, Building, Clock, DollarSign, Users,
  Star, Bookmark, BookmarkCheck, Eye, ChevronRight, TrendingUp, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';

export const EnhancedOpportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Fetch opportunities
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user?.role === 'student') {
        // Get AI recommendations for student
        const recRes = await api.get(`/ai/recommendations/${user.id}`);
        data = recRes.data.map(item => ({
          ...item.job,
          matchScore: item.match_score,
          isRecommended: true,
          companyLogo: item.job.company_name?.charAt(0) || 'C',
          type: item.job.type || 'internship',
          applicants: item.job.applicants_count || 0,
          views: item.job.views || 0,
          rating: 4.0,
          skills: item.job.requirements || [],
        }));
      } else {
        // Get all approved jobs
        const jobsRes = await api.get('/jobs?status=approved');
        data = jobsRes.data.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company_name || 'Company',
          company_id: job.company_id,
          companyLogo: job.company_name?.charAt(0) || 'C',
          location: job.location || 'Remote',
          duration: job.duration || 'Not specified',
          stipend: job.salary_range || 'Competitive',
          type: job.type || 'internship',
          isRecommended: false,
          matchScore: 0,
          applicants: job.applicants_count || 0,
          views: job.views || 0,
          rating: 4.0,
          description: job.description,
          skills: job.requirements || [],
          deadline: job.expires_at || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          status: job.status,
        }));
      }
      setOpportunities(data);
    } catch (error) {
      console.error('Failed to fetch opportunities', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's bookmarks (if student)
  const fetchBookmarks = async () => {
    if (user?.role === 'student') {
      try {
        const response = await api.get('/bookmarks');
        const bookmarkedIds = new Set(response.data.map(b => b.job_id));
        setBookmarks(bookmarkedIds);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      }
    }
  };

  // Fetch user's applications (to disable apply button if already applied)
  const fetchAppliedJobs = async () => {
    if (user?.role === 'student') {
      try {
        const response = await api.get(`/applications?student_id=${user.id}`);
        const appliedIds = new Set(response.data.map(a => a.job_id));
        setAppliedJobs(appliedIds);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      }
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchBookmarks();
    fetchAppliedJobs();
  }, [user]);

  // Handle apply to job
  const handleApply = async (jobId) => {
    if (!user) {
      toast.error('Please login to apply');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can apply');
      return;
    }
    
    try {
      await api.post('/applications', null, { params: { job_id: jobId } });
      toast.success('Application submitted successfully!');
      // Update applied jobs set
      setAppliedJobs(prev => new Set(prev).add(jobId));
      // Refresh opportunities to update counts
      fetchOpportunities();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to submit application';
      toast.error(errorMsg);
    }
  };

  // Handle bookmark toggle
  const handleToggleBookmark = async (jobId) => {
    if (!user || user.role !== 'student') {
      toast.error('Please login to bookmark');
      return;
    }
    
    const isBookmarked = bookmarks.has(jobId);
    
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${jobId}`);
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.success('Removed from bookmarks');
      } else {
        await api.post(`/bookmarks/${jobId}`);
        setBookmarks(prev => new Set(prev).add(jobId));
        toast.success('Added to bookmarks');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update bookmark');
    }
  };

  // View job details (navigate to detail page)
  const handleViewDetails = (jobId) => {
    window.location.href = `/opportunities/${jobId}`;
  };

  const getFilteredOpportunities = () => {
    let filtered = opportunities;
    
    if (activeTab !== 'all') {
      if (activeTab === 'recommended') {
        filtered = filtered.filter(opp => opp.isRecommended);
      } else if (activeTab === 'bookmarked') {
        filtered = filtered.filter(opp => bookmarks.has(opp.id));
      } else {
        filtered = filtered.filter(opp => opp.type === activeTab);
      }
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title?.toLowerCase().includes(q) || 
        opp.company?.toLowerCase().includes(q) || 
        opp.skills?.some(s => s.toLowerCase().includes(q))
      );
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(opp => opp.type === selectedType);
    }
    
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(opp => opp.location?.includes(selectedLocation));
    }
    
    return filtered;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'internship': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'placement': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'full-time': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return 30;
    const diffDays = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-gray-200"></div>
      </div>
    );
  }

  const filteredOpportunities = getFilteredOpportunities();
  const locations = [...new Set(opportunities.map(o => o.location).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Opportunities</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Discover internships, placements, and projects tailored to your skills</p>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search opportunities, companies, or skills..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-10 dark:bg-gray-700 dark:border-gray-600" 
              />
            </div>
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="internship">Internships</SelectItem>
              <SelectItem value="placement">Placements</SelectItem>
              <SelectItem value="full-time">Full-Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto dark:bg-gray-800">
          <TabsTrigger value="all">All</TabsTrigger>
          {user?.role === 'student' && <TabsTrigger value="recommended">Recommended</TabsTrigger>}
          <TabsTrigger value="internship">Internships</TabsTrigger>
          <TabsTrigger value="placement">Placements</TabsTrigger>
          {user?.role === 'student' && <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>}
        </TabsList>
      </Tabs>

      {/* Opportunities Grid */}
      <div className="grid gap-6">
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No opportunities found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredOpportunities.map((opp, idx) => (
            <motion.div 
              key={opp.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: idx * 0.05 }} 
              whileHover={{ scale: 1.01 }} 
              className="group"
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {opp.companyLogo}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                              {opp.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">{opp.company}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {opp.isRecommended && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {opp.matchScore}% match
                              </Badge>
                            )}
                            {user?.role === 'student' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleBookmark(opp.id)} 
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {bookmarks.has(opp.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {opp.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{opp.location}</span>
                            </div>
                          )}
                          {opp.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{opp.duration}</span>
                            </div>
                          )}
                          {opp.stipend && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{opp.stipend}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge className={getTypeColor(opp.type)}>{opp.type}</Badge>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{opp.applicants} applied</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{opp.views} views</span>
                            </div>
                            {opp.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span>{opp.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>
                    {opp.skills && opp.skills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {opp.skills.slice(0, 5).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs dark:border-gray-600">
                              {skill}
                            </Badge>
                          ))}
                          {opp.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">+{opp.skills.length - 5} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between pt-4 border-t gap-3">
                      <div className="flex items-center space-x-2 text-sm">
                        {opp.deadline && (
                          <>
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Apply by {new Date(opp.deadline).toLocaleDateString()}</span>
                            <Badge variant="outline" className={`text-xs ${getDaysRemaining(opp.deadline) <= 7 ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}`}>
                              {getDaysRemaining(opp.deadline)} days left
                            </Badge>
                          </>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(opp.id)}
                          className="dark:border-gray-600"
                        >
                          View Details
                        </Button>
                        {user?.role === 'student' && (
                          <Button 
                            className="bg-gray-700 hover:bg-gray-800 text-white" 
                            size="sm"
                            onClick={() => handleApply(opp.id)}
                            disabled={appliedJobs.has(opp.id)}
                          >
                            {appliedJobs.has(opp.id) ? 'Applied' : 'Apply Now'}
                            {!appliedJobs.has(opp.id) && <ChevronRight className="w-4 h-4 ml-1" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};