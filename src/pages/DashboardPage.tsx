import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appService } from '../services/appService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
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
  AlertCircle,
  GraduationCap,
  History,
  Repeat,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, totalCredits, availableCredits, reservedCredits, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [activeModalSlot, setActiveModalSlot] = useState<SessionSlot | null>(null);
  const [bookingMessage, setBookingMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Derive counts from shared data consistently
  const mySlots = appService.getMySlots();
  const bookedSessionsCount = [...mySlots.teaching, ...mySlots.learning].filter(
    (s) => s.status === 'booked'
  ).length;

  const recentTransactions = appService.getLedger().slice(0, 3);

  // Open slots: Prioritize matching user's "wants" topics
  const allOpenSlots = appService.searchOpenSlots();
  const userWantsLower = (user.wants || []).map((w) => w.toLowerCase());

  const recommendedSlots = [...allOpenSlots].sort((a, b) => {
    const aMatch = userWantsLower.some((w) => a.skill.toLowerCase().includes(w));
    const bMatch = userWantsLower.some((w) => b.skill.toLowerCase().includes(w));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  }).slice(0, 3);

  const handleBook = async (slotId: string) => {
    const confirmed = window.confirm(
      'Book this session for 1 credit?\n\nAcademic Integrity Rule: Sessions are for learning only; no doing assignments or exams for others.'
    );

    if (!confirmed) return;

    const result = await appService.bookSlot(slotId);
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
    <div className="space-y-7 animate-fade-in">
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-6 sm:p-8 text-white shadow-elevated">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SkillSwap UoH &bull; Learn Together. Grow Together.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Welcome back, <span className="text-amber-300">{user.nick}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              University of Hyderabad peer learning network. Trade skills in LaTeX, Python, Figma, and Excel with fellow campus scholars using Time Credits.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="credit"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4 text-slate-900" />}
                onClick={() => navigate('/teach')}
                className="shadow-md hover:shadow-lg hover:scale-102 transition-all"
              >
                Offer a Session
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<Search className="w-4 h-4 text-white" />}
                onClick={() => navigate('/discover')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                Explore Skills
              </Button>
            </div>
          </div>

          {/* Time Wallet Spotlight in Hero */}
          <div className="lg:min-w-[280px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white shadow-inner flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Your Time Wallet
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-sm shadow-md">
                ⏱
              </div>
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-300">{availableCredits}</span>
                <span className="text-xs font-medium text-blue-200">Credits Available</span>
              </div>
              <p className="text-[11px] text-blue-200/80 mt-1">
                {totalCredits} total balance &bull; {reservedCredits} in escrow
              </p>
            </div>
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
              <span className="text-[11px] text-blue-100">1 hr session = 1 credit</span>
              <Link to="/wallet" className="text-amber-300 font-bold hover:underline flex items-center gap-1">
                Ledger &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Honor Code Reminder */}
      <AcademicIntegrityBanner />

      {bookingMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 transition-all ${
            bookingMessage.type === 'success'
              ? 'bg-[#DDF7EB] border-[#bdf1d9] text-[#0A6B5B]'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{bookingMessage.text}</span>
        </div>
      )}

      {/* 2. Top Quick-Action Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Booked Sessions Card */}
        <Card
          variant="interactive"
          onClick={() => navigate('/sessions')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{bookedSessionsCount}</span>
            <span className="text-xs font-semibold text-slate-500">Upcoming</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">Tutor &amp; Learner</span>
            <span className="text-brand-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              View all &rarr;
            </span>
          </div>
        </Card>

        {/* Skills I Offer */}
        <Card
          variant="interactive"
          onClick={() => navigate('/profile')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Skills I Teach
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{user.offers.length}</span>
            <span className="text-xs font-semibold text-teal-700">Skills Listed</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px] truncate max-w-[120px]">
              {user.offers[0] || 'Add skills'}
            </span>
            <span className="text-brand-600 font-bold">Manage &rarr;</span>
          </div>
        </Card>

        {/* Skills I Want */}
        <Card
          variant="interactive"
          onClick={() => navigate('/profile')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Want to Learn
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{user.wants.length}</span>
            <span className="text-xs font-semibold text-brand-700">Topics</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px] truncate max-w-[120px]">
              {user.wants[0] || 'Add topics'}
            </span>
            <span className="text-brand-600 font-bold">Add &rarr;</span>
          </div>
        </Card>

        {/* Total Campus Hours Exchanged */}
        <Card
          variant="interactive"
          onClick={() => navigate('/wallet')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Credits
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              ⏱
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalCredits}</span>
            <span className="text-xs font-semibold text-amber-800">Time Credits</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">{availableCredits} Available</span>
            <span className="text-brand-600 font-bold">Wallet &rarr;</span>
          </div>
        </Card>
      </div>

      {/* 3. Quick Skill Explorer Chips */}
      <Card padding="sm" className="bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1 sm:p-2">
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
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

      {/* 4. Advanced Feature 1: Suggested Matches (Day 12 & Reciprocal Swaps) */}
      <SuggestedMatchesSection
        onSelectSlot={(slotId) => {
          const slot = allOpenSlots.find((s) => s.slotId === slotId);
          if (slot) setActiveModalSlot(slot);
        }}
      />

      {/* 5. Recommended Open Slots Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Recommended Peer Learning Slots
            </h2>
            <p className="text-xs text-slate-500">
              Personalized based on what you want to learn ({user.wants.join(', ') || 'all topics'})
            </p>
          </div>
          <Link
            to="/discover"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Explore all open slots</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recommendedSlots.length === 0 ? (
          <Card className="text-center p-8 bg-white">
            <p className="text-sm text-slate-500 font-medium">No open future slots available right now.</p>
            <Button
              className="mt-3.5"
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

      {/* 6. Recent Activity & Transaction Mini-Feed */}
      {recentTransactions.length > 0 && (
        <Card className="bg-white p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brand-500" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Recent Campus Ledger Activity
              </h3>
            </div>
            <Link to="/wallet" className="text-xs font-bold text-brand-600 hover:underline">
              Full Ledger &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {recentTransactions.map((tx) => {
              const isMine = tx.from.toLowerCase() === user.email.toLowerCase() || tx.to.toLowerCase() === user.email.toLowerCase();
              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                      ⏱
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {tx.skill}{' '}
                        <span className="text-slate-400 font-normal">
                          ({tx.fromNick} &rarr; {tx.toNick})
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">{tx.time}</p>
                    </div>
                  </div>
                  <span className="font-bold text-teal-700 bg-[#DDF7EB] px-2.5 py-0.5 rounded-full border border-[#bdf1d9]">
                    1 Credit Transferred
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 7. Advanced Feature 2: Campus Analytics (Day 13) */}
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
