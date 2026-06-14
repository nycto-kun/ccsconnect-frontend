import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search, MapPin, Calendar, Building, Clock, DollarSign, Users,
  Star, Bookmark, BookmarkCheck, Eye, ChevronRight, TrendingUp, Briefcase, Loader2
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

  // Fetch AI recommendations for student
  const fetchAIRecommendations = async () => {
    if (!user || user.role !== 'student') return [];
    
    try {
      const response = await api.get(`/ai/recommendations/${user.id}`);
      if (response.data && response.data.length > 0) {
        console.log('AI Recommendations found:', response.data.length);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
    }
    return [];
  };

  // Fetch company name for a job
  const fetchCompanyName = async (companyId) => {
    if (!companyId) return 'Company';
    try {
      const response = await api.get(`/companies/${companyId}/`);
      return response.data?.name || 'Company';
    } catch (error) {
      return 'Company';
    }
  };

const fetchOpportunities = async () => {
  try {
    setLoading(true);
    
    // For students, try to get AI recommendations
    if (user?.role === 'student') {
      try {
        const recRes = await api.get(`/ai/recommendations/${user.id}`);
        console.log('AI Recommendations API response:', recRes.data);
        
        if (recRes.data && recRes.data.length > 0) {
          // Process recommendations
          const data = await Promise.all(recRes.data.map(async (item) => {
            const companyName = await fetchCompanyName(item.job.company_id);
            return {
              ...item.job,
              matchScore: item.match_score,
              isRecommended: true,
              company_name: companyName,
              companyLogo: companyName?.charAt(0) || 'C',
              type: item.job.type || 'internship',
              applicants: item.job.applicants_count || 0,
              views: item.job.views || 0,
              skills: item.job.requirements || [],
            };
          }));
          setOpportunities(data);
          setLoading(false);
          return;
        } else {
          console.log('No AI recommendations found, using regular jobs');
        }
      } catch (recError) {
        console.error('AI recommendations failed:', recError);
      }
    }
    
    // Fallback to regular jobs
    const jobsRes = await api.get('/jobs/?status=active');
    const jobs = jobsRes.data || [];
    
    const data = await Promise.all(jobs.map(async (job) => {
      const companyName = await fetchCompanyName(job.company_id);
      return {
        ...job,
        isRecommended: false,
        matchScore: 0,
        company_name: companyName,
        companyLogo: companyName?.charAt(0) || 'C',
        type: job.type || 'internship',
        skills: job.requirements || [],
      };
    }));
    setOpportunities(data);
    
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
    toast.error('Failed to load opportunities');
  } finally {
    setLoading(false);
  }
};

  const fetchBookmarks = async () => {
    if (user?.role === 'student') {
      try {
        const response = await api.get('/bookmarks/');
        const bookmarkedIds = new Set(response.data.map(b => b.job_id));
        setBookmarks(bookmarkedIds);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      }
    }
  };

  const fetchAppliedJobs = async () => {
    if (user?.role === 'student') {
      try {
        const response = await api.get(`/applications/?student_id=${user.id}`);
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
      await api.post('/applications/', null, { params: { job_id: jobId } });
      toast.success('Application submitted successfully!');
      setAppliedJobs(prev => new Set(prev).add(jobId));
      fetchOpportunities();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to submit application';
      toast.error(errorMsg);
    }
  };

  const handleToggleBookmark = async (jobId) => {
    if (!user || user.role !== 'student') {
      toast.error('Please login to bookmark');
      return;
    }
    
    const isBookmarked = bookmarks.has(jobId);
    
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${jobId}/`);
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.success('Removed from bookmarks');
      } else {
        await api.post(`/bookmarks/${jobId}/`);
        setBookmarks(prev => new Set(prev).add(jobId));
        toast.success('Added to bookmarks');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update bookmark');
    }
  };

const getFilteredOpportunities = () => {
  let filtered = [...opportunities];
  
  console.log('Filtering opportunities. Active tab:', activeTab);
  console.log('Total opportunities:', filtered.length);
  console.log('Recommended opportunities:', filtered.filter(o => o.isRecommended).length);
  
  if (activeTab === 'recommended') {
    filtered = filtered.filter(opp => opp.isRecommended === true && opp.matchScore > 0);
    console.log('After recommended filter:', filtered.length);
  } else if (activeTab === 'bookmarked') {
    filtered = filtered.filter(opp => bookmarks.has(opp.id));
    console.log('After bookmarked filter:', filtered.length);
  } else if (activeTab !== 'all') {
    filtered = filtered.filter(opp => opp.type === activeTab);
  }
  
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(opp => 
      opp.title?.toLowerCase().includes(q) || 
      opp.company_name?.toLowerCase().includes(q) || 
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

  const getDaysRemaining = (deadline) => {
    if (!deadline) return 30;
    const diffDays = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const filteredOpportunities = getFilteredOpportunities();
  const locations = [...new Set(opportunities.map(o => o.location).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Opportunities</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Discover internships, placements, and projects tailored to your skills
        </p>
      </motion.div>

      {/* Search and Filter */}
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
            <SelectTrigger className="dark:bg-gray-700">
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
            <SelectTrigger className="dark:bg-gray-700">
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
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No opportunities found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOpportunities.map((opp, idx) => (
            <motion.div 
              key={opp.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {opp.companyLogo}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-gray-600 transition-colors">
                              {opp.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">{opp.company_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {opp.isRecommended && (
                              <Badge className="bg-green-100 text-green-700">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {opp.matchScore}% match
                              </Badge>
                            )}
                            {user?.role === 'student' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleBookmark(opp.id)}
                              >
                                {bookmarks.has(opp.id) ? 
                                  <BookmarkCheck className="w-5 h-5 text-gray-600" /> : 
                                  <Bookmark className="w-5 h-5 text-gray-400" />
                                }
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {opp.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{opp.location}</span>
                            </div>
                          )}
                          {opp.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{opp.duration}</span>
                            </div>
                          )}
                          {opp.salary_range && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{opp.salary_range}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge variant="secondary" className="capitalize">{opp.type || 'internship'}</Badge>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{opp.applicants_count || 0} applied</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{opp.views || 0} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 mb-4">
                    {opp.description}
                  </p>
                  {opp.skills && opp.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {opp.skills.slice(0, 4).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {opp.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{opp.skills.length - 4}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      {opp.expires_at && (
                        <>
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Apply by {new Date(opp.expires_at).toLocaleDateString()}</span>
                          <Badge variant="outline" className={`text-xs ${getDaysRemaining(opp.expires_at) <= 7 ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}`}>
                            {getDaysRemaining(opp.expires_at)} days left
                          </Badge>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `/opportunities/${opp.id}`}>
                        View Details
                      </Button>
                      {user?.role === 'student' && (
                        <Button 
                          className="bg-gray-800 hover:bg-gray-700 text-white" 
                          size="sm"
                          onClick={() => handleApply(opp.id)}
                          disabled={appliedJobs.has(opp.id)}
                        >
                          {appliedJobs.has(opp.id) ? 'Applied' : 'Apply Now'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};