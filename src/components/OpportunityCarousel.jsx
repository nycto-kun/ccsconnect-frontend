import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, DollarSign, Users, Building, Briefcase, Star, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export const OpportunityCarousel = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch regular jobs
        const jobsRes = await api.get('/jobs/?status=active');
        const jobs = jobsRes.data || [];
        
        // Enrich jobs with company names
        const enrichedJobs = await Promise.all(jobs.map(async (job) => {
          const companyRes = await api.get(`/companies/${job.company_id}`);
          return {
            ...job,
            company_name: companyRes.data?.name || 'Company',
            type: 'internship'
          };
        }));
        setOpportunities(enrichedJobs);
        
        // Fetch AI recommendations if student
        if (user?.role === 'student') {
          try {
            const recRes = await api.get(`/ai/recommendations/${user.id}`);
            if (recRes.data && recRes.data.length > 0) {
              const recs = recRes.data.map(item => ({
                ...item.job,
                match_score: item.match_score,
                is_recommended: true
              }));
              setRecommendations(recs);
            } else {
              setRecommendations(enrichedJobs.slice(0, 6));
            }
          } catch (recError) {
            console.log('AI recommendations not available, showing regular jobs');
            setRecommendations(enrichedJobs.slice(0, 6));
          }
        } else {
          setRecommendations(enrichedJobs.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
        toast.error('Failed to load opportunities');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const displayOpportunities = activeTab === 'recommended' && user?.role === 'student' 
    ? recommendations.slice(0, 4) 
    : opportunities.slice(0, 4);

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
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    }
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return 30;
    const diffDays = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (isLoading) {
    return (
      <section className="py-20 px-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Loading Opportunities...</h2>
          </div>
          <div className="flex space-x-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-none w-80 bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'recommended'
                  ? 'bg-gray-800 text-white dark:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Recommended for You
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-gray-800 text-white dark:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <Briefcase className="w-4 h-4 inline mr-2" />
              All Opportunities
            </button>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {activeTab === 'recommended' 
              ? 'Handpicked internships that match your skills and career aspirations'
              : 'Discover all available internship and job opportunities'}
          </p>
        </motion.div>

        <div className="relative">
          <div className="flex overflow-x-auto pb-6 space-x-6 scrollbar-hide">
            {displayOpportunities.map((opportunity, index) => {
              const isExpiringSoon = opportunity.expires_at && getDaysRemaining(opportunity.expires_at) <= 7;
              
              return (
                <motion.div 
                  key={opportunity.id} 
                  className="flex-none w-80" 
                  initial={{ opacity: 0, x: 50 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.6, delay: index * 0.1 }} 
                  viewport={{ once: true }} 
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group dark:bg-gray-800">
                    {opportunity.is_recommended && (
                      <div className="bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 text-white text-center py-1.5 text-xs font-medium">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        {opportunity.match_score}% Match Score
                      </div>
                    )}
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {opportunity.company_name?.charAt(0) || 'C'}
                        </div>
                        {opportunity.salary_range && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            {opportunity.salary_range}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-gray-900 transition-colors">
                        {opportunity.title}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <Building className="w-4 h-4 mr-2" />
                        <span className="text-sm">{opportunity.company_name}</span>
                      </div>
                      {opportunity.location && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{opportunity.location}</span>
                        </div>
                      )}
                      <div className="mb-4 flex-1">
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {opportunity.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        {opportunity.duration && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {opportunity.duration}
                          </div>
                        )}
                        {opportunity.expires_at && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {getDaysRemaining(opportunity.expires_at)} days left
                          </div>
                        )}
                      </div>
                      {isExpiringSoon && (
                        <Badge variant="destructive" className="mb-3 text-xs animate-pulse">
                          Expires Soon!
                        </Badge>
                      )}
                      <Button 
                        className="w-full bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white group-hover:shadow-lg transition-all" 
                        size="sm"
                        onClick={() => handleApply(opportunity.id)}
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {displayOpportunities.map((_, index) => (
                <div key={index} className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-500 cursor-pointer transition-colors" />
              ))}
            </div>
          </div>
        </div>

        <motion.div className="text-center mt-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => window.location.href = '/opportunities'}
          >
            View All Opportunities
          </Button>
        </motion.div>
      </div>
    </section>
  );
};