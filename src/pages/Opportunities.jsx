import { useState, useEffect } from 'react';
import api from '../utils/api';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        let data;
        if (userId) {
          // Fetch recommendations for logged-in student
          const res = await api.get(`/jobs/recommendations/${userId}`);
          data = res.data.map(item => ({ ...item.job, match_score: item.match_score }));
        } else {
          // Fetch all approved jobs
          const res = await api.get('/jobs?status=approved');
          data = res.data;
        }
        setOpportunities(data);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Filtering
  const filtered = opportunities.filter((job) => {
    if (activeTab !== 'all' && job.type !== activeTab) return false;
    if (filterType !== 'all' && job.type !== filterType) return false;
    if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !job.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading opportunities...</div>;

  return (
    <section className="opportunities-page">
      <div className="page-header">
        <h1>Opportunities</h1>
        <p>Discover internships, placements, and projects tailored to your skills and interests</p>
      </div>

      <div className="filter-section">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search opportunities, companies, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="internship">Internship</option>
          <option value="placement">Placement</option>
        </select>
        <select className="filter-select" defaultValue="all">
          <option value="all">All Locations</option>
        </select>
      </div>

      <div className="category-tabs">
        {['all', 'recommended', 'internship', 'placement', 'bookmarked'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="opportunities-list">
        {filtered.length === 0 ? (
          <p>No opportunities match your criteria.</p>
        ) : (
          filtered.map((job) => (
            <div key={job.id} className="opp-card">
              <div className="opp-card-header">
                <div className="opp-logo">{job.company_name?.charAt(0) || 'C'}</div>
                <div className="opp-main-info">
                  <div className="opp-title-row">
                    <h3>{job.title}</h3>
                    <div className="opp-actions">
                      {job.match_score && (
                        <span className="opp-match-badge">
                          <i className="fa-solid fa-arrow-trend-up"></i> {job.match_score}% match
                        </span>
                      )}
                      <button className="opp-bookmark"><i className="fa-regular fa-bookmark"></i></button>
                    </div>
                  </div>
                  <div className="opp-company">{job.company_name}</div>
                  <div className="opp-meta">
                    <span><i className="fa-solid fa-location-dot"></i> {job.location}</span>
                    <span><i className="fa-regular fa-clock"></i> {job.duration}</span>
                    <span><i className="fa-solid fa-indian-rupee-sign"></i> {job.salary_range}</span>
                  </div>
                  <div className="opp-tags-stats">
                    <span className="opp-tag-internship">{job.type}</span>
                    <div className="opp-stats">
                      <span><i className="fa-solid fa-user-group"></i> {job.applicants_count || 0} applied</span>
                      <span><i className="fa-regular fa-eye"></i> {job.views || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="opp-card-body">
                <p className="opp-description">{job.description}</p>

                <div className="opp-section">
                  <h4>Required Skills</h4>
                  <div className="opp-skills">
                    {job.requirements?.map((skill, idx) => <span key={idx}>{skill}</span>)}
                  </div>
                </div>

                <hr className="opp-divider" />

                <div className="opp-card-footer">
                  <div className="opp-deadline">
                    <i className="fa-regular fa-calendar"></i> Apply by {job.expires_at}
                  </div>
                  <div className="opp-footer-btns">
                    <button className="opp-btn-outline">View Details</button>
                    <button className="opp-btn-primary">Apply Now <i className="fa-solid fa-chevron-right"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Opportunities;