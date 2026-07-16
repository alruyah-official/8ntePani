import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

// Mock Data
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'message',
    isRead: false,
    content: <><b>Sarah Connor</b> sent you a new message regarding "Website Redesign".</>,
    time: '10 minutes ago',
    link: '/messages/123'
  },
  {
    id: 2,
    type: 'proposal',
    isRead: false,
    content: <>Your proposal for <b>Fullstack React App</b> was accepted!</>,
    time: '2 hours ago',
    link: '/jobs/456'
  },
  {
    id: 3,
    type: 'payment',
    isRead: true,
    content: <>A payment of <b>$450.00</b> has been successfully processed.</>,
    time: '1 day ago',
    link: '/dashboard'
  },
  {
    id: 4,
    type: 'system',
    isRead: true,
    content: <>Welcome to 8ntePani! Please complete your profile to attract more clients.</>,
    time: '3 days ago',
    link: '/profile/me'
  },
  {
    id: 5,
    type: 'proposal',
    isRead: true,
    content: <><b>John Doe</b> invited you to interview for "E-commerce Development".</>,
    time: '1 week ago',
    link: '/jobs/789'
  }
];

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif) => {
    // Mark as read visually
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    // Redirect to the relevant page
    navigate(notif.link);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'message':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'proposal':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'payment':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      case 'system':
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
    }
  };

  return (
    <div className="notifications-page">
      <div className="container notifications-container">
        
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="notifications-tabs">
          <button 
            className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h3>No {activeTab === 'unread' ? 'unread ' : ''}notifications</h3>
              <p>When you have new activity, it will show up here.</p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notif-card ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notif)}
              >
                {!notif.isRead && <div className="notif-indicator"></div>}
                
                <div className={`notif-icon-wrapper ${notif.type}`}>
                  {getIconForType(notif.type)}
                </div>
                
                <div className="notif-content">
                  <p className="notif-text">{notif.content}</p>
                  <span className="notif-time">{notif.time}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
