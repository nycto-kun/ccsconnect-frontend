import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
  const [stats, setStats] = useState({ studentsPlaced: 0, activeInternships: 0, placementRate: 0 });
  const [updates, setUpdates] = useState([]);
  const [notices, setNotices] = useState([]);
  const [trackerCards, setTrackerCards] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    placementRate: 0,
    partnerCompanies: 0,
    avgPackage: '',
    deptStats: [],
    activities: [],
  });
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch global stats (you'll need to create these endpoints)
        // const statsRes = await api.get('/stats');
        // setStats(statsRes.data);

        // Fetch announcements for updates bar
        const updatesRes = await api.get('/announcements');
        setUpdates(updatesRes.data.map(a => a.message));

        // Fetch notices (latest 3)
        const noticesRes = await api.get('/notices?limit=3');
        setNotices(noticesRes.data);

        // Fetch testimonials
        const testimonialsRes = await api.get('/testimonials');
        setTestimonials(testimonialsRes.data);

        // If user is logged in, fetch their tracker and recommendations
        const userId = localStorage.getItem('user_id');
        if (userId) {
          const trackerRes = await api.get(`/applications?student_id=${userId}&limit=3`);
          setTrackerCards(trackerRes.data);

          const recRes = await api.get(`/jobs/recommendations/${userId}`);
          setRecommendations(recRes.data);
        }

        // Fetch analytics (admin only? but we can show public stats)
        // const analyticsRes = await api.get('/analytics');
        // setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <>
      {/* Hero Section */}
      <section className="main-section">
        <main className="content">
          <section className="hero">
            <h1>Launch Your<br />Career Journey</h1>
            <p>
              Connect with top companies, find meaningful internships, and build
              <br />the career you've always dreamed of. Your future starts here.
            </p>
            <div className="hero-btns">
              <Link to="/opportunities" className="btn-primary">
                Explore Opportunities <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <Link to="/profile" className="btn-secondary">Complete Your Profile</Link>
            </div>
          </section>

          {/* Updates Bar */}
          <div className="updates-bar">
            <div className="updates-label"><i className="fa-solid fa-bell"></i> Latest Updates</div>
            <div className="updates-container">
              <div className="updates-scroll">
                {updates.length > 0 ? updates.map((msg, idx) => <span key={idx}>{msg}</span>) : <span>No updates</span>}
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

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><i className="fa-solid fa-users"></i></div>
              <h3>{stats.studentsPlaced}+</h3>
              <p>Students Placed</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><i className="fa-solid fa-briefcase"></i></div>
              <h3>{stats.activeInternships}+</h3>
              <p>Active Internships</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><i className="fa-solid fa-award"></i></div>
              <h3>{stats.placementRate}%</h3>
              <p>Placement Rate</p>
            </div>
          </div>
        </main>
      </section>

      {/* Quick Actions + Notice Sidebar */}
      <section className="dashboard-content">
        <div className="actions-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <p>Everything you need to manage your internship journey in one place</p>
          </div>
          <div className="actions-grid">
            <Link to="/profile" className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-user"></i></div>
              <h3>Complete Profile</h3>
              <p>Set up your resume and skills</p>
            </Link>
            <Link to="/opportunities" className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-magnifying-glass"></i></div>
              <h3>Find Internships</h3>
              <p>Browse available opportunities</p>
            </Link>
            <Link to="/resources" className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-book-open"></i></div>
              <h3>Resource Library</h3>
              <p>Access guides and templates</p>
            </Link>
            <Link to="/mentors" className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-users"></i></div>
              <h3>Alumni Mentorship</h3>
              <p>Connect with experienced mentors</p>
            </Link>
            <Link to="/calendar" className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-calendar-days"></i></div>
              <h3>Event Calendar</h3>
              <p>View interviews and deadlines</p>
            </Link>
            <Link to="/offers" className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-file-lines"></i></div>
              <h3>Offer Vault</h3>
              <p>Manage and compare offers</p>
            </Link>
            <Link to="/scholarships" className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-graduation-cap"></i></div>
              <h3>Scholarships</h3>
              <p>Find funding opportunities</p>
            </Link>
            <Link to="/certificates" className="action-card">
              <div className="card-icon-box"><i className="fa-solid fa-award"></i></div>
              <h3>Certificates</h3>
              <p>Download your achievements</p>
            </Link>
          </div>
        </div>

        <aside className="notice-sidebar">
          <div className="sidebar-header">
            <h3><i className="fa-solid fa-thumbtack"></i> Notice Board</h3>
            <Link to="/notices" className="view-all">View All <i className="fa-solid fa-arrow-up-right-from-square"></i></Link>
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
                  <span><i className="fa-regular fa-calendar"></i> Start: {notice.start_date}</span>
                  <span><i className="fa-regular fa-clock"></i> End: {notice.end_date}</span>
                  <span>Posted {new Date(notice.posted_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Application Tracker (only if logged in) */}
      {localStorage.getItem('user_id') && trackerCards.length > 0 && (
        <section className="tracker-section">
          <div className="tracker-header">
            <h2>Application Tracker</h2>
            <p>Monitor your application progress and stay updated on next steps</p>
          </div>
          {trackerCards.map((app) => (
            <div key={app.id} className="tracker-card">
              {/* Render tracker card using app data – you'll need to structure accordingly */}
            </div>
          ))}
        </section>
      )}

      {/* Recommended Opportunities */}
      <section className="opportunities-section">
        <div className="section-header">
          <h2>Recommended Opportunities</h2>
          <p>Handpicked internships that match your skills and career aspirations</p>
        </div>
        <div className="opportunities-grid">
          {recommendations.slice(0, 3).map((rec) => (
            <div key={rec.job.id} className="opp-card">
              {rec.job.banner && <div className="banner"><i className="fa-solid fa-star"></i> {rec.job.banner}</div>}
              <div className="card-body">
                <div className="body-header">
                  <span className="emoji-icon">🚀</span>
                  <span className="category-tag">{rec.job.category}</span>
                </div>
                <h3>{rec.job.title}</h3>
                <div className="info-list">
                  <span><i className="fa-solid fa-building"></i> {rec.job.company_name}</span>
                  <span><i className="fa-solid fa-location-dot"></i> {rec.job.location}</span>
                  <span className="salary">{rec.job.salary_range}</span>
                  <span><i className="fa-regular fa-clock"></i> {rec.job.duration}</span>
                </div>
                <div className="tech-stack">
                  {rec.job.requirements?.map((skill, idx) => <span key={idx}>{skill}</span>)}
                </div>
                <div className="card-footer">
                  <span className="apply-by">Apply by {rec.job.expires_at}</span>
                  <span className="match-badge">{rec.match_score}% match</span>
                </div>
                <button className="apply-btn">Apply Now</button>
              </div>
            </div>
          ))}
        </div>
        <Link to="/opportunities" className="view-all-btn">View All Opportunities</Link>
      </section>

      {/* Analytics Section (public summary) */}
      <section className="analytics-section">
        <div className="section-header">
          <h2>Analytics Dashboard</h2>
          <p>Real-time insights into our campus placement performance</p>
        </div>
        <div className="stats-summary-grid">
          <div className="summary-card">
            <div className="card-top">
              <div className="icon-bg blue"><i className="fa-solid fa-users"></i></div>
              <span className="badge positive">+12%</span>
            </div>
            <h3>{analytics.totalStudents}</h3>
            <p>Total Students</p>
          </div>
          {/* ... other summary cards */}
        </div>
        {/* Department stats and activities can be added when backend ready */}
      </section>

      {/* Success Stories */}
      <section className="success-stories">
        <div className="section-header">
          <h2>Success Stories</h2>
          <p>Hear from our alumni who found their dream careers through CCSConnect</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.id} className="testimonial-card">
              <div className="card-top">
                <i className="fa-solid fa-quote-left quote-icon"></i>
                <div className="stars">{Array(5).fill().map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}</div>
              </div>
              <p className="testimonial-text">"{t.quote}"</p>
              <div className="alumnus-info">
                <div className="avatar">{t.avatar_initials}</div>
                <div className="details">
                  <h4 className="name">{t.alumnus_name}</h4>
                  <p className="role">{t.role}</p>
                  <p className="batch">{t.batch}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;