import { useState, useEffect } from 'react';
import api from '../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;
        const res = await api.get(`/notifications?user_id=${userId}`);
        setNotifications(res.data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => n.unread)
    : notifications.filter(n => n.type === filter.slice(0, -1));

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading notifications...</div>;

  return (
    <section className="page-notif-wrapper">
      <div className="page-notif-container">
        <div className="page-notif-header">
          <div>
            <h1>Your Notifications</h1>
            <p>Manage your application updates, interview invites, and alerts.</p>
          </div>
          <button className="btn-outline" onClick={markAllRead}>Mark all as read</button>
        </div>

        <div className="page-notif-filters">
          {['all', 'unread', 'applications', 'interviews'].map((f) => (
            <button
              key={f}
              className={`notice-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="page-notif-list">
          {filtered.map((notif) => (
            <div key={notif.id} className={`page-notif-card ${notif.unread ? 'unread' : ''}`}>
              <div className="page-notif-icon" style={{ background: notif.bgColor, color: notif.color }}>
                <i className={notif.icon}></i>
              </div>
              <div className="page-notif-content">
                <h3>{notif.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: notif.description }} />
                <span className="page-notif-time">{notif.time}</span>
              </div>
              {notif.actionable && (
                <div className="page-notif-actions">
                  <button className="btn-orange">{notif.actionLabel}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Notifications;