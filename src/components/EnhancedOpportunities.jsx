import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Calendar, Building, Clock, DollarSign, Users, Star, Bookmark, BookmarkCheck, Eye, ChevronRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const EnhancedOpportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch approved jobs from backend
        const res = await api.get('/jobs?status=approved');
        // Map backend fields to frontend expectations
        const mapped = res.data.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company_name || 'Company',
          companyLogo: job.company_name?.charAt(0) || 'C',
          location: job.location || 'Remote',
          duration: job.duration || 'Not specified',
          stipend: job.salary_range || 'Competitive',
          type: job.type || 'internship',
          isRecommended: false, // you can compute match score later
          matchScore: 0,
          applicants: job.applicants_count || 0,
          views: job.views || 0,
          rating: 4.0,
          description: job.description,
          skills: job.requirements || [],
          benefits: [], // not in old schema
          deadline: job.expires_at || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          isBookmarked: false,
        }));
        setOpportunities(mapped);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    // Optionally call API to save bookmark
  };

  const getFilteredOpportunities = () => {
    let filtered = opportunities;
    if (activeTab !== 'all') {
      if (activeTab === 'recommended') filtered = filtered.filter(opp => opp.isRecommended);
      else if (activeTab === 'bookmarked') filtered = filtered.filter(opp => bookmarks.has(opp.id));
      else filtered = filtered.filter(opp => opp.type === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => opp.title.toLowerCase().includes(q) || opp.company.toLowerCase().includes(q) || opp.skills.some(s => s.toLowerCase().includes(q)));
    }
    if (selectedType !== 'all') filtered = filtered.filter(opp => opp.type === selectedType);
    if (selectedLocation !== 'all') filtered = filtered.filter(opp => opp.location.includes(selectedLocation));
    return filtered;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'internship': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'placement': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getDaysRemaining = (deadline) => {
    const diffDays = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) return <div className="text-center py-20">Loading opportunities...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Opportunities</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Discover internships, placements, and projects tailored to your skills and interests</p>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input placeholder="Search opportunities, companies, or skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="internship">Internships</SelectItem>
              <SelectItem value="placement">Placements</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all">All Locations</SelectItem>
              {[...new Set(opportunities.map(o => o.location))].map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto dark:bg-gray-800 dark:text-gray-200">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="internship">Internships</TabsTrigger>
          <TabsTrigger value="placement">Placements</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6">
        {getFilteredOpportunities().map((opportunity, index) => (
          <motion.div key={opportunity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ scale: 1.01 }} className="group">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {opportunity.companyLogo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{opportunity.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">{opportunity.company}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {opportunity.isRecommended && <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"><TrendingUp className="w-3 h-3 mr-1" />{opportunity.matchScore}% match</Badge>}
                          <Button variant="ghost" size="sm" onClick={() => toggleBookmark(opportunity.id)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                            {bookmarks.has(opportunity.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center space-x-1"><MapPin className="w-4 h-4" /><span>{opportunity.location}</span></div>
                        <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{opportunity.duration}</span></div>
                        <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4" /><span>{opportunity.stipend}</span></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getTypeColor(opportunity.type)}>{opportunity.type}</Badge>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{opportunity.applicants} applied</span></div>
                          <div className="flex items-center space-x-1"><Eye className="w-3 h-3" /><span>{opportunity.views} views</span></div>
                          <div className="flex items-center space-x-1"><Star className="w-3 h-3 text-yellow-500" /><span>{opportunity.rating}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{opportunity.description}</p>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.map((skill, i) => <Badge key={i} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">{skill}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Apply by {new Date(opportunity.deadline).toLocaleDateString()}</span>
                      <Badge variant="outline" className={`text-xs ${getDaysRemaining(opportunity.deadline) <= 7 ? 'text-red-600 border-red-200 dark:text-red-400 dark:border-red-800' : 'text-green-600 border-green-200 dark:text-green-400 dark:border-green-800'}`}>
                        {getDaysRemaining(opportunity.deadline)} days left
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">View Details</Button>
                      <Button className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white" size="sm">Apply Now <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {getFilteredOpportunities().length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-gray-400 dark:text-gray-500" /></div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No opportunities found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};