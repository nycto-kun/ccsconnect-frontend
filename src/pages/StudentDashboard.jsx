import { useState, useEffect } from 'react';
import api from '../utils/api';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ applicationsSent: 0, interviewsScheduled: 0, offersReceived: 0, profileViews: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        // Fetch applications
        const appsRes = await api.get(`/applications?student_id=${userId}`);
        const apps = appsRes.data;
        setStats({
          applicationsSent: apps.length,
          interviewsScheduled: apps.filter(a => a.status === 'interview').length,
          offersReceived: apps.filter(a => a.status === 'accepted').length,
          profileViews: 23, // replace with actual endpoint later
        });
        setRecentApplications(apps.slice(0, 3));

        // Fetch upcoming events
        const eventsRes = await api.get(`/events?student_id=${userId}`);
        setUpcomingEvents(eventsRes.data);
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusClass = (status) => {
    switch (status) {
      case 'interview': return 'badge-interview';
      case 'pending': return 'badge-pending';
      case 'accepted': return 'badge-accepted';
      default: return '';
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading dashboard...</div>;

  return (
    <section className="dashboard-page-wrapper">
      <div className="page-header">
        <h1>Student Dashboard</h1>
        <p>Track your internship applications and manage your career journey</p>
      </div>

      <div className="dashboard-container">
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-info">
              <p>Applications Sent</p>
              <h3>{stats.applicationsSent}</h3>
            </div>
            <div className="dash-stat-icon icon-blue"><i className="fa-regular fa-file-lines"></i></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info">
              <p>Interviews Scheduled</p>
              <h3>{stats.interviewsScheduled}</h3>
            </div>
            <div className="dash-stat-icon icon-green"><i className="fa-regular fa-calendar-check"></i></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info">
              <p>Offers Received</p>
              <h3>{stats.offersReceived}</h3>
            </div>
            <div className="dash-stat-icon icon-yellow"><i className="fa-solid fa-medal"></i></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-info">
              <p>Profile Views</p>
              <h3>{stats.profileViews}</h3>
            </div>
            <div className="dash-stat-icon icon-purple"><i className="fa-solid fa-user-group"></i></div>
          </div>
        </div>

        <div className="dash-content-grid">
          <div className="dash-panel">
            <div className="dash-panel-header">
              <i className="fa-regular fa-file-lines" style={{ color: '#3b82f6' }}></i>
              <h2>Recent Applications</h2>
            </div>
            <div className="dash-app-list">
              {recentApplications.map((app) => (
                <div key={app.id} className="dash-app-card">
                  <div className="app-info">
                    <h4>{app.job_title}</h4>
                    <p className="app-company">{app.company_name}</p>
                    <p className="app-date">{new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`app-status ${statusClass(app.status)}`}>{app.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-panel">
            <div className="dash-panel-header">
              <i className="fa-regular fa-calendar" style={{ color: '#22c55e' }}></i>
              <h2>Upcoming Events</h2>
            </div>
            <div className="dash-event-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="dash-event-card">
                  <div className="event-dot"></div>
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p>{new Date(event.datetime).toLocaleString()}</p>
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

export default StudentDashboard;