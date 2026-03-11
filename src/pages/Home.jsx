import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Home = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const noticesRes = await api.get('/notices?limit=3');
        setNotices(noticesRes.data);

        // If user is logged in, fetch recommendations; else fetch general opportunities
        if (user) {
          const recRes = await api.get(`/jobs/recommendations/${user.id}`);
          setOpportunities(recRes.data);
        } else {
          const jobsRes = await api.get('/jobs?status=approved&limit=3');
          setOpportunities(jobsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [user]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <>
      {/* Hero Section – conditional */}
      <section className="hero">
        {!user ? (
          <>
            <h1>Launch Your Career Journey</h1>
            <p>Connect with top companies, find meaningful internships, and build the career you've always dreamed of.</p>
            <div className="hero-btns">
              <Link to="/login" className="btn-primary">Login <i className="fa-solid fa-arrow-right"></i></Link>
              <Link to="/register" className="btn-secondary">Create Account</Link>
            </div>
          </>
        ) : (
          <>
            <h1>Welcome back, {user.full_name}!</h1>
            <p>Continue your internship journey from where you left off.</p>
            <div className="hero-btns">
              <Link to="/opportunities" className="btn-primary">Browse Opportunities</Link>
              <Link to="/dashboard" className="btn-secondary">Go to Dashboard</Link>
            </div>
          </>
        )}
      </section>

      {/* Updates Bar (public) */}
      <div className="updates-bar">
        <div className="updates-label"><i className="fa-solid fa-bell"></i> Latest Updates</div>
        <div className="updates-container">
          <div className="updates-scroll">
            <span>Resume building workshop this Friday 4 PM - Register now</span>
            <span>🏆 Microsoft diversity scholarship applications now live</span>
            <span>💼 Tech Career Fair next week - 50+ companies participating</span>
          </div>
        </div>
      </div>

      {/* Features Grid (static) */}
      <div className="features-grid">
        <div className="feature-card"><div className="card-icon"><i className="fa-solid fa-book-open"></i></div><p>Resource Hub</p></div>
        <div className="feature-card"><div className="card-icon"><i className="fa-solid fa-award"></i></div><p>Offer Vault</p></div>
        <div className="feature-card"><div className="card-icon"><i className="fa-solid fa-comments"></i></div><p>Alumni Mentors</p></div>
        <div className="feature-card"><div className="card-icon"><i className="fa-solid fa-calendar-days"></i></div><p>Events Calendar</p></div>
      </div>

      {/* Quick Actions (public) */}
      <section className="dashboard-content">
        <div className="actions-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <p>Everything you need to manage your internship journey</p>
          </div>
          <div className="actions-grid">
            <Link to={user ? "/profile" : "/register"} className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-user"></i></div>
              <h3>{user ? "Complete Profile" : "Create Account"}</h3>
              <p>{user ? "Set up your resume and skills" : "Sign up to get started"}</p>
            </Link>
            <Link to={user ? "/opportunities" : "/login"} className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-magnifying-glass"></i></div>
              <h3>Find Internships</h3>
              <p>{user ? "Browse opportunities" : "Login to browse"}</p>
            </Link>
            <div className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-book-open"></i></div>
              <h3>Resource Library</h3>
              <p>Guides and templates</p>
            </div>
            <div className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-calendar-days"></i></div>
              <h3>Events Calendar</h3>
              <p>Interviews and deadlines</p>
            </div>
          </div>
        </div>

        {/* Notice Board – always visible */}
        <aside className="notice-sidebar">
          <div className="sidebar-header">
            <h3><i className="fa-solid fa-thumbtack"></i> Notice Board</h3>
            <Link to="/notices" className="view-all">View All</Link>
          </div>
          <div className="notice-list">
            {notices.map((notice) => (
              <div key={notice.id} className={`notice-card border-${notice.borderColor || 'blue'}`}>
                <div className="notice-title-row">
                  <h4>{notice.title}</h4>
                  <span className={`badge ${notice.category}`}>{notice.category}</span>
                </div>
                <p className="notice-desc">{notice.description}</p>
                <div className="notice-footer">
                  <span><i className="fa-regular fa-calendar"></i> {notice.start_date}</span>
                  <span>Posted {notice.posted_at}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Recommended Opportunities */}
      <section className="opportunities-section">
        <div className="section-header">
          <h2>{user ? "Recommended for You" : "Latest Opportunities"}</h2>
          <p>{user ? "Handpicked internships that match your skills" : "Check out the latest openings"}</p>
        </div>
        <div className="opportunities-grid">
          {opportunities.slice(0, 3).map((item) => {
            const job = item.job || item;
            return (
              <div key={job.id} className="opp-card">
                <div className="card-body">
                  <div className="body-header">
                    <span className="emoji-icon">🚀</span>
                    <span className="category-tag">{job.type}</span>
                  </div>
                  <h3>{job.title}</h3>
                  <div className="info-list">
                    <span><i className="fa-solid fa-building"></i> {job.company_name}</span>
                    <span><i className="fa-solid fa-location-dot"></i> {job.location}</span>
                    <span className="salary">{job.salary_range}</span>
                  </div>
                  <button className="apply-btn" disabled={!user}>
                    {user ? "Apply Now" : "Login to Apply"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <Link to={user ? "/opportunities" : "/login"} className="view-all-btn">
          {user ? "View All Opportunities" : "Login to See All"}
        </Link>
      </section>
    </>
  );
};

export default Home;