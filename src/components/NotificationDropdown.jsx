import { useState, useRef, useEffect } from 'react';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock notifications – later replace with API data
  const notifications = [
    {
      id: 1,
      icon: 'fa-solid fa-circle-check',
      bgColor: '#dcfce7',
      color: '#15803d',
      text: '<strong>StartupXYZ</strong> updated your application status to <strong>Accepted</strong>.',
      time: '10 minutes ago',
      unread: true,
    },
    {
      id: 2,
      icon: 'fa-regular fa-clock',
      bgColor: '#ffedd5',
      color: '#c2410c',
      text: '<strong>Reminder:</strong> Your Technical Interview with TechCorp starts in 1 hour.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      icon: 'fa-solid fa-briefcase',
      bgColor: '#e0f2fe',
      color: '#0284c7',
      text: '<strong>Creative Web Studio</strong> posted a new Frontend Developer Intern role.',
      time: 'Yesterday',
      unread: false,
    },
    {
      id: 4,
      icon: 'fa-regular fa-eye',
      bgColor: '#f3e8ff',
      color: '#7e22ce',
      text: 'Your profile appeared in <strong>12 search results</strong> this week.',
      time: '2 days ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <div onClick={toggleDropdown}>
        <i className="fa-regular fa-bell"></i>
        {unreadCount > 0 && <div className="notif-badge-dot"></div>}
      </div>

      <div className={`notification-dropdown ${isOpen ? 'show' : ''}`}>
        <div className="notif-header">
          <h3>Notifications</h3>
          <span className="mark-read">Mark all as read</span>
        </div>

        <div className="notif-body">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${notif.unread ? 'unread' : ''}`}
            >
              <div
                className="notif-icon"
                style={{ background: notif.bgColor, color: notif.color }}
              >
                <i className={notif.icon}></i>
              </div>
              <div className="notif-content">
                <p dangerouslySetInnerHTML={{ __html: notif.text }} />
                <span className="notif-time">{notif.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;