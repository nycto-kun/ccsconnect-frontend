import React from 'react';
import { Hero } from './Hero';
import { QuickAccess } from './QuickAccess';
import { OpportunityCarousel } from './OpportunityCarousel';
import { AnalyticsSnapshot } from './AnalyticsSnapshot';
import { NoticeBoard } from './NoticeBoard';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { user } = useAuth();
  return (
    <>
      <Hero user={user} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 py-20">
        <div className="lg:col-span-2"><QuickAccess /></div>
        <div className="lg:col-span-1"><NoticeBoard isHomePage={true} /></div>
      </div>
      <OpportunityCarousel />
      <AnalyticsSnapshot />
    </>
  );
};