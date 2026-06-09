import React from 'react';
import { Hero } from './Hero';
import { QuickAccess } from './QuickAccess';
import { OpportunityCarousel } from './OpportunityCarousel';
import { AnalyticsSnapshot } from './AnalyticsSnapshot';
import { NoticeBoard } from './NoticeBoard';
import { useAuth } from '../contexts/AuthContext';

export const Home = ({ onNavigate }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  return (
    <>
      <Hero onNavigate={onNavigate} />
      
      {userRole === 'student' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 py-12">
            <div className="lg:col-span-2">
              <QuickAccess onNavigate={onNavigate} />
            </div>
            <div className="lg:col-span-1">
              <NoticeBoard isHomePage={true} />
            </div>
          </div>
          <OpportunityCarousel />
          <AnalyticsSnapshot />
        </>
      )}
      
      {userRole === 'company' && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <QuickAccess onNavigate={onNavigate} />
        </div>
      )}
      
      {userRole === 'admin' && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <QuickAccess onNavigate={onNavigate} />
          <div className="mt-8">
            <NoticeBoard isHomePage={false} />
          </div>
        </div>
      )}
    </>
  );
};