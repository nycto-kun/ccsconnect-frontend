import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const NotificationDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        // Fetch recent applications for student
        if (user.role === 'student') {
          const appsRes = await api.get(`/applications?student_id=${user.id}`);
          const apps = appsRes.data || [];
          
          const newNotifications = apps.slice(0, 10).map(app => ({
            id: app.id,
            title: 'Application Update',
            description: `Your application for ${app.job_title || 'a position'} is ${app.status}`,
            timestamp: new Date(app.updated_at || app.applied_at),
            read: false,
            type: 'info'
          }));
          setNotifications(newNotifications);
          setUnreadCount(newNotifications.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    
    fetchNotifications();
  }, [user]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              setUnreadCount(0);
            }}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div key={notification.id} className="p-4 cursor-pointer hover:bg-gray-50">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};