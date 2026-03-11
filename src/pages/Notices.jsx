import { useState, useEffect } from 'react';
import api from '../utils/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices');
        setNotices(res.data);
      } catch (error) {
        console.error('Failed to fetch notices', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const filtered = filter === 'all' ? notices : notices.filter(n => n.category === filter);

  const getBadgeClass = (cat) => {
    switch (cat) {
      case 'internship': return 'c-badge-intern';
      case 'placement': return 'c-badge-place';
      case 'project': return 'c-badge-proj';
      default: return 'c-badge-appr';
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading notices...</div>;

  return (
    <section className="notices-page-wrapper">
      <div className="page-header">
        <h1>Campus Notices</h1>
      </div>
      <div className="campus-notices-container">
        <div className="board-header">
          <i className="fa-solid fa-thumbtack"></i> Notice Board
        </div>
        <div className="notice-filter-tabs">
          {['all', 'internship', 'placement', 'project', 'apprenticeship'].map((cat) => (
            <button
              key={cat}
              className={`notice-tab ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="campus-notice-list">
          {filtered.map((notice) => (
            <div key={notice.id} className={`campus-notice-card ${notice.pinned ? 'pinned-dark' : 'pinned-light'}`}>
              <div className="c-notice-header">
                <div className="c-notice-title">
                  {notice.pinned && <i className="fa-solid fa-thumbtack"></i>} {notice.title}
                </div>
                <span className={`c-badge ${getBadgeClass(notice.category)}`}>{notice.category}</span>
              </div>
              <p className="c-notice-desc">{notice.description}</p>
              <div className="c-notice-footer">
                <div className="c-notice-dates">
                  <span><i className="fa-regular fa-calendar"></i> Start: {notice.start_date}</span>
                  <span><i className="fa-regular fa-clock"></i> End: {notice.end_date}</span>
                </div>
                <div className="c-notice-posted">Posted {new Date(notice.posted_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Notices;