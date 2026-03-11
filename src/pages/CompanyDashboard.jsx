import { useState, useEffect } from 'react';
import api from '../utils/api';

const CompanyDashboard = () => {
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, interviewsScheduled: 0, offersMade: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyId = localStorage.getItem('user_id');
        if (!companyId) return;

        // Fetch company's jobs
        const jobsRes = await api.get(`/jobs?company_id=${companyId}`);
        const jobs = jobsRes.data;
        setRecentJobs(jobs.slice(0, 3));
        setStats({
          activeJobs: jobs.filter(j => j.status === 'active').length,
          totalApplicants: jobs.reduce((acc, j) => acc + (j.applicants_count || 0), 0),
          interviewsScheduled: 0, // need endpoint for interviews
          offersMade: 0,
        });

        // Fetch recent applicants
        const applicantsRes = await api.get(`/applications?company_id=${companyId}&limit=3`);
        setRecentApplicants(applicantsRes.data);
      } catch (error) {
        console.error('Failed to load company dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading dashboard...</div>;

  return (
    <section className="dashboard-page-wrapper">
      <div className="page-header">
        <h1>Company Dashboard</h1>
        <p>Manage your job postings and review applicants</p>
      </div>

      <div className="dashboard-container">
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-info"><p>Active Jobs</p><h3>{stats.activeJobs}</h3></div>
            <div className="dash-stat-icon icon-blue"><i className="fa-solid fa-briefcase"></i></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info"><p>Total Applicants</p><h3>{stats.totalApplicants}</h3></div>
            <div className="dash-stat-icon icon-green"><i className="fa-solid fa-users"></i></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info"><p>Interviews Scheduled</p><h3>{stats.interviewsScheduled}</h3></div>
            <div className="dash-stat-icon icon-yellow"><i className="fa-regular fa-calendar-check"></i></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info"><p>Offers Made</p><h3>{stats.offersMade}</h3></div>
            <div className="dash-stat-icon icon-purple"><i className="fa-solid fa-medal"></i></div>
          </div>
        </div>

        <div className="dash-content-grid">
          <div className="dash-panel">
            <div className="dash-panel-header"><i className="fa-solid fa-briefcase" style={{ color: '#3b82f6' }}></i><h2>Your Job Postings</h2></div>
            <div className="dash-app-list">
              {recentJobs.map((job) => (
                <div key={job.id} className="dash-app-card">
                  <div className="app-info">
                    <h4>{job.title}</h4>
                    <p className="app-company">{job.applicants_count || 0} applicants</p>
                  </div>
                  <div className={`app-status ${job.status === 'active' ? 'badge-interview' : 'badge-pending'}`}>{job.status}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>+ Post New Job</button>
          </div>

          <div className="dash-panel">
            <div className="dash-panel-header"><i className="fa-solid fa-user-clock" style={{ color: '#22c55e' }}></i><h2>Recent Applicants</h2></div>
            <div className="dash-event-list">
              {recentApplicants.map((app) => (
                <div key={app.id} className="dash-event-card">
                  <div className="event-dot"></div>
                  <div className="event-info">
                    <h4>{app.student_name}</h4>
                    <p>{app.job_title} • Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {app.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyDashboard;