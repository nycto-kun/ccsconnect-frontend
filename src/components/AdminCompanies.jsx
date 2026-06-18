// src/components/AdminCompanies.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building, Users, Briefcase, CheckCircle, XCircle, Clock,
  Search, Filter, Eye, ChevronDown, ChevronUp, RefreshCw,
  Loader2, Mail, Phone, MapPin, Calendar, Award, Star,
  UserCheck, FileText, TrendingUp, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const AdminCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    totalInterns: 0,
    totalJobs: 0
  });

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all companies
      const compRes = await api.get('/admin/companies');
      const companiesData = compRes.data || [];
      setCompanies(companiesData);
      
      // Calculate stats
      const verified = companiesData.filter(c => c.verified).length;
      const pending = companiesData.filter(c => !c.verified).length;
      
      // Get total interns and jobs for each company
      let totalInterns = 0;
      let totalJobs = 0;
      
      for (const company of companiesData) {
        // Count jobs
        const jobsRes = await api.get(`/jobs/?company_id=${company.id}`);
        const jobs = jobsRes.data || [];
        company.job_count = jobs.length;
        totalJobs += jobs.length;
        
        // Count interns (students assigned to this company)
        const internsRes = await api.get(`/assignments/?company_id=${company.id}`);
        const interns = internsRes.data || [];
        company.intern_count = interns.length;
        totalInterns += interns.length;
      }
      
      setStats({
        total: companiesData.length,
        verified,
        pending,
        totalInterns,
        totalJobs
      });
      
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle company verification toggle
  const handleToggleVerification = async (companyId, currentStatus) => {
    try {
      if (currentStatus) {
        // Unverify - only if admin confirms
        if (!confirm('Are you sure you want to unverify this company?')) return;
        await api.delete(`/admin/companies/${companyId}/verify`);
        toast.success('Company unverified');
      } else {
        await api.post(`/admin/companies/${companyId}/verify`);
        toast.success('Company verified');
      }
      fetchCompanies();
    } catch (error) {
      console.error('Failed to toggle verification:', error);
      toast.error(error.response?.data?.detail || 'Failed to update verification');
    }
  };

  // Handle company deletion
  const handleDeleteCompany = async (companyId, companyName) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This will also delete all associated jobs, applications, and data.`)) {
      return;
    }
    
    try {
      await api.delete(`/admin/companies/${companyId}`);
      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (error) {
      console.error('Failed to delete company:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete company');
    }
  };

  // Get filtered companies
  const getFilteredCompanies = () => {
    let filtered = [...companies];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(term) ||
        c.contact_email?.toLowerCase().includes(term) ||
        c.industry?.toLowerCase().includes(term) ||
        c.company_code?.toLowerCase().includes(term)
      );
    }
    
    if (filterStatus === 'verified') {
      filtered = filtered.filter(c => c.verified);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(c => !c.verified);
    }
    
    if (filterIndustry !== 'all') {
      filtered = filtered.filter(c => c.industry === filterIndustry);
    }
    
    return filtered;
  };

  // Get unique industries for filter
  const industries = ['all', ...new Set(companies.map(c => c.industry).filter(Boolean))];

  const filteredCompanies = getFilteredCompanies();

  // Company Detail Modal
  const CompanyDetailModal = ({ company, onClose }) => {
    if (!company) return null;
    
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Building className="w-6 h-6 text-gray-600" />
              <span>{company.name}</span>
              <Badge className={company.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                {company.verified ? '✓ Verified' : 'Pending'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Company Code</p>
                <p className="font-medium">{company.company_code || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Industry</p>
                <p className="font-medium">{company.industry || 'Not specified'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Contact Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {company.contact_email}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Registered</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>
              {company.website && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm text-gray-500">Website</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    {company.website} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {company.description && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{company.description}</p>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{company.job_count || 0}</div>
                <div className="text-sm text-gray-600">Jobs Posted</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{company.intern_count || 0}</div>
                <div className="text-sm text-gray-600">Active Interns</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{company.student_count || 0}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{company.application_count || 0}</div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant={company.verified ? "outline" : "default"}
                className={company.verified ? '' : 'bg-green-600 hover:bg-green-700 text-white'}
                onClick={() => {
                  handleToggleVerification(company.id, company.verified);
                  onClose();
                }}
              >
                {company.verified ? (
                  <> <XCircle className="w-4 h-4 mr-2" /> Unverify </> 
                ) : (
                  <> <CheckCircle className="w-4 h-4 mr-2" /> Verify Company </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDeleteCompany(company.id, company.name);
                  onClose();
                }}
              >
                Delete Company
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Company Management</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage all registered companies and their interns
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchCompanies} 
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Companies</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Interns</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalInterns}</p>
              </div>
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalJobs}</p>
              </div>
              <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search companies by name, email, or industry..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterIndustry} onValueChange={setFilterIndustry}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.filter(i => i !== 'all').map(industry => (
              <SelectItem key={industry} value={industry}>{industry}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No companies found</p>
              {(searchTerm || filterStatus !== 'all' || filterIndustry !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterIndustry('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company, index) => {
            const isExpanded = expandedCompany === company.id;
            
            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={`border-0 shadow-md hover:shadow-lg transition-all ${
                  company.verified ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'
                }`}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Company Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {company.name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{company.name}</h3>
                            <Badge className={company.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {company.verified ? '✓ Verified' : '⏳ Pending'}
                            </Badge>
                            {company.company_code && (
                              <Badge variant="outline">{company.company_code}</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                            {company.contact_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {company.contact_email}
                              </span>
                            )}
                            {company.industry && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> {company.industry}
                              </span>
                            )}
                            {company.created_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Joined {new Date(company.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats and Actions */}
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{company.job_count || 0}</div>
                          <div className="text-xs text-gray-500">Jobs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{company.intern_count || 0}</div>
                          <div className="text-xs text-gray-500">Interns</div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowCompanyDetail(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleToggleVerification(company.id, company.verified);
                            }}
                            className={company.verified ? 'text-yellow-600' : 'text-green-600'}
                          >
                            {company.verified ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeleteCompany(company.id, company.name)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Company Description */}
                          {company.description && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">About</h4>
                              <p className="text-sm text-gray-600">{company.description}</p>
                            </div>
                          )}
                          
                          {/* Additional Info */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Additional Info</h4>
                            <div className="space-y-1 text-sm">
                              {company.website && (
                                <p><span className="text-gray-500">Website:</span> <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{company.website}</a></p>
                              )}
                              {company.phone && (
                                <p><span className="text-gray-500">Phone:</span> {company.phone}</p>
                              )}
                              {company.address && (
                                <p><span className="text-gray-500">Address:</span> {company.address}</p>
                              )}
                              <p><span className="text-gray-500">Company Code:</span> {company.company_code || 'N/A'}</p>
                              <p><span className="text-gray-500">Created:</span> {new Date(company.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Company Detail Modal */}
      {showCompanyDetail && selectedCompany && (
        <CompanyDetailModal 
          company={selectedCompany} 
          onClose={() => {
            setShowCompanyDetail(false);
            setSelectedCompany(null);
          }}
        />
      )}
    </div>
  );
};