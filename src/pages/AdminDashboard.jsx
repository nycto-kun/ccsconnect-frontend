import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, activeJobs: 0, placementRate: 0 });
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch admin stats
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);

        // Fetch pending company approvals
        const companiesRes = await api.get('/admin/pending-companies');
        setPendingCompanies(companiesRes.data);

        // Fetch recent activity
        const activityRes = await api.get('/admin/recent-activity');
        setRecentActivity(activityRes.data);
      } catch (error) {
        console.error('Failed to load admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/approve-company/${id}`);
      setPendingCompanies(pendingCompanies.filter(c => c.id !== id));
    } catch (error) {
      console.error('Approval failed', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/reject-company/${id}`);
      setPendingCompanies(pendingCompanies.filter(c => c.id !== id));
    } catch (error) {
      console.error('Rejection failed', error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading admin dashboard...</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">CCSConnect <span>Admin Portal</span></div>
        <nav>
          <Link to="/admin-dashboard" className="active"><i className="fa-solid fa-chart-line"></i> Overview</Link>
          <Link to="/admin/companies"><i className="fa-solid fa-building-circle-check"></i> Company Approvals</Link>
          <Link to="/admin/students"><i className="fa-solid fa-users"></i> Student Roster</Link>
          <Link to="/admin/reports"><i className="fa-solid fa-file-contract"></i> MOA & Reports</Link>
        </nav>
        <div className="logout-container">
          <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="admin-header">
          <div>
            <h2>Faculty Coordination Dashboard</h2>
            <p>Monitor OJT deployments and institutional metrics.</p>
          </div>
          <div className="user-profile">Admin <i className="fa-solid fa-shield-halved"></i></div>
        </div>

        <div className="dash-stats-grid">
          <div className="stat-card">
            <h3>Total Enrolled Students</h3>
            <p className="stat-number">{stats.totalStudents}</p>
            <span className="stat-label">Verified via Registrar</span>
          </div>
          <div className="stat-card">
            <h3>Active Job Postings</h3>
            <p className="stat-number">{stats.activeJobs}</p>
            <span className="stat-label">Across approved partners</span>
          </div>
          <div className="stat-card">
            <h3>Overall Placement Rate</h3>
            <p className="stat-number">{stats.placementRate}%</p>
            <span className="match-badge">Target: 85%</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '25px' }}>
          <section className="data-section">
            <h3><i className="fa-solid fa-bell" style={{ color: '#f59e0b' }}></i> Action Required: Company Approvals</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Review new employer accounts before they can post jobs to students.
            </p>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Company Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Industry</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingCompanies.map((company) => (
                  <tr key={company.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                      <strong>{company.name}</strong><br />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{company.email}</span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>{company.industry}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                      <span className="badge-warning">Pending Review</span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                      <div className="action-btns" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="btn-approve" onClick={() => handleApprove(company.id)}>
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button className="btn-reject" onClick={() => handleReject(company.id)}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="data-section" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
            <h3>Recent System Activity</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px', fontSize: '0.9rem' }}>
              {recentActivity.map((act) => (
                <li key={act.id} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className={act.icon} style={{ color: act.color }}></i>
                  <span>{act.text}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>{act.time}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;