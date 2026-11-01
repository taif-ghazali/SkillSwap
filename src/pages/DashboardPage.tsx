import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkillTag } from '../components/ui/SkillTag';
import { SessionCard } from '../components/ui/SessionCard';
import { SessionDetailsModal } from '../components/ui/SessionDetailsModal';
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import { SuggestedMatchesSection } from '../components/shared/SuggestedMatchesSection';
import { CampusAnalyticsSection } from '../components/shared/CampusAnalyticsSection';
import { POPULAR_CAMPUS_SKILLS } from '../data/mockData';
import { SessionSlot } from '../types';
import {
  Sparkles,
  BookOpen,
  Calendar,
  ArrowRight,
  PlusCircle,
  Search,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, totalCredits, availableCredits, reservedCredits, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [activeModalSlot, setActiveModalSlot] = useState<SessionSlot | null>(null);
  const [bookingMessage, setBookingMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Derive counts from shared data consistently
  const mySlots = mockService.getMySlots();
  const bookedSessionsCount = [...mySlots.teaching, ...mySlots.learning].filter(
    (s) => s.status === 'booked'
  ).length;

  // Open slots: Prioritize matching user's "wants" topics
  const allOpenSlots = mockService.searchOpenSlots();
  const userWantsLower = (user.wants || []).map((w) => w.toLowerCase());

  const recommendedSlots = [...allOpenSlots].sort((a, b) => {
    const aMatch = userWantsLower.some((w) => a.skill.toLowerCase().includes(w));
    const bMatch = userWantsLower.some((w) => b.skill.toLowerCase().includes(w));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  }).slice(0, 3);

  const handleBook = (slotId: string) => {
    const confirmed = window.confirm(
      'Book this session for 1 credit?\n\nAcademic Integrity Rule: Sessions are for learning only; no doing assignments or exams for others.'
    );

    if (!confirmed) return;

    const result = mockService.bookSlot(slotId);
    if (result.success) {
      refreshUserData();
      setBookingMessage({
        type: 'success',
        text: 'Session booked successfully! 1 credit reserved. View it under My Sessions.',
      });
    } else {
      setBookingMessage({
        type: 'error',
        text: result.error || 'Failed to book session.',
      });
    }

    setTimeout(() => {
      setBookingMessage(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.nick}!`}
        subtitle="University of Hyderabad student skill exchange &bull; Peer-to-peer learning"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Search className="w-4 h-4" />}
              onClick={() => navigate('/discover')}
            >
              Browse Skills
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/teach')}
            >
              Offer a Session
            </Button>
          </div>
        }
      />

      {/* Campus Honor Code Reminder */}
      <AcademicIntegrityBanner />

      {bookingMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 transition-all ${
            bookingMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{bookingMessage.text}</span>
        </div>
      )}

      {/* Top Stats Overview (Shared Data Consistency) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Credit Card */}
        <Card className="bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
              Time Credits
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm shadow-inner">
              ⏱
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-950">{totalCredits}</span>
            <span className="text-xs text-amber-800">total ({availableCredits} free)</span>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-200/60 flex justify-between items-center text-xs">
            <span className="text-amber-800 text-[11px]">{reservedCredits} held in escrow</span>
            <Link to="/wallet" className="text-amber-900 font-semibold hover:underline">
              Ledger &rarr;
            </Link>
          </div>
        </Card>

        {/* Active Booked Sessions Card */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Bookings
            </span>
            <Calendar className="w-4 h-4 text-brand-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{bookedSessionsCount}</span>
            <span className="text-xs text-slate-500">sessions</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 text-[11px]">Tutor & Learner</span>
            <Link to="/sessions" className="text-brand-600 font-semibold hover:underline">
              View all &rarr;
            </Link>
          </div>
        </Card>

        {/* Skills I Offer */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Skills I Teach
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{user.offers.length}</span>
            <span className="text-xs text-emerald-700">offered</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 text-[11px] truncate">
              {user.offers[0] || 'None yet'}
            </span>
            <Link to="/profile" className="text-brand-600 font-semibold hover:underline">
              Manage &rarr;
            </Link>
          </div>
        </Card>

        {/* Skills I Want */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Want to Learn
            </span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{user.wants.length}</span>
            <span className="text-xs text-indigo-700">topics</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 text-[11px] truncate">
              {user.wants[0] || 'None yet'}
            </span>
            <Link to="/profile" className="text-brand-600 font-semibold hover:underline">
              Add &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Skill Explorer Chips */}
      <Card padding="sm" className="bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Popular at UoH:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CAMPUS_SKILLS.slice(0, 7).map((skill) => (
              <SkillTag
                key={skill}
                skill={skill}
                variant="interactive"
                size="sm"
                onClick={() => navigate(`/discover?q=${encodeURIComponent(skill)}`)}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Advanced Feature 1: Suggested Matches (Day 12) */}
      <SuggestedMatchesSection onSelectSlot={(slotId) => {
        const slot = allOpenSlots.find(s => s.slotId === slotId);
        if (slot) setActiveModalSlot(slot);
      }} />

      {/* Recommended Open Slots Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recommended Peer Learning Slots
            </h2>
            <p className="text-xs text-slate-500">
              Personalized based on what you want to learn ({user.wants.join(', ') || 'all topics'})
            </p>
          </div>
          <Link
            to="/discover"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Explore all open slots <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedSlots.length === 0 ? (
          <Card className="text-center p-8">
            <p className="text-sm text-slate-500">No open future slots available right now.</p>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => navigate('/teach')}
            >
              Publish the First Slot
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedSlots.map((slot) => (
              <SessionCard
                key={slot.slotId}
                slot={slot}
                onBook={handleBook}
                onView={(s) => setActiveModalSlot(s)}
                isCurrentUserTutor={slot.tutor.toLowerCase() === user.email.toLowerCase()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Advanced Feature 2: Campus Analytics (Day 13) */}
      <CampusAnalyticsSection />

      {/* Session Details Modal */}
      <SessionDetailsModal
        slot={activeModalSlot}
        onClose={() => setActiveModalSlot(null)}
        onBook={handleBook}
        isCurrentUserTutor={activeModalSlot ? activeModalSlot.tutor.toLowerCase() === user.email.toLowerCase() : false}
      />
    </div>
  );
};
