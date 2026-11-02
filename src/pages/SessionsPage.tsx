import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { SessionCard } from '../components/ui/SessionCard';
import { SessionDetailsModal } from '../components/ui/SessionDetailsModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import { SessionSlot } from '../types';
import {
  CalendarCheck,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Star,
  AlertCircle,
  X
} from 'lucide-react';

export const SessionsPage: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'learning' | 'teaching' | 'completed'>('learning');
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Rating modal state
  const [ratingSlot, setRatingSlot] = useState<SessionSlot | null>(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Details modal
  const [activeModalSlot, setActiveModalSlot] = useState<SessionSlot | null>(null);

  const { teaching, learning } = mockService.getMySlots();

  const bookedLearning = learning.filter((s) => s.status === 'booked');
  const bookedTeaching = teaching.filter((s) => s.status === 'booked' || s.status === 'open');
  const completedSessions = [...learning, ...teaching].filter((s) => s.status === 'done');

  const handleConfirm = (slotId: string) => {
    const result = mockService.confirmSession(slotId);
    refreshUserData();

    if (result.success) {
      if (result.transferred) {
        setActionAlert({
          type: 'success',
          message: 'Both participants confirmed! 1 Time Credit transferred successfully. ✔',
        });
        // Prompt for rating
        const completedSlot = [...learning, ...teaching].find((s) => s.slotId === slotId);
        if (completedSlot) {
          setRatingSlot(completedSlot);
          setRatingError(null);
        }
      } else {
        setActionAlert({
          type: 'success',
          message: result.message,
        });
      }
    } else {
      setActionAlert({
        type: 'error',
        message: result.message || 'Confirmation failed.',
      });
    }

    setTimeout(() => {
      setActionAlert(null);
    }, 6000);
  };

  const handleCancel = (slotId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?\n\nCancellation rule: Permitted only when at least 2 hours remain before session start.'
    );
    if (!confirmed) return;

    const result = mockService.cancelSlot(slotId);
    refreshUserData();

    if (result.success) {
      setActionAlert({
        type: 'success',
        message: 'Session booking cancelled successfully. Reserved credit released.',
      });
    } else {
      setActionAlert({
        type: 'error',
        message: result.error || 'Too late to cancel (must be >= 2 hours prior to start).',
      });
    }

    setTimeout(() => {
      setActionAlert(null);
    }, 6000);
  };

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingSlot) return;

    setRatingError(null);
    const result = mockService.addRating(ratingSlot.slotId, selectedStars, ratingComment);

    if (result.success) {
      refreshUserData();
      setActionAlert({
        type: 'success',
        message: `Thank you for rating! (${selectedStars} stars submitted)`,
      });
      setRatingSlot(null);
      setRatingComment('');
    } else {
      setRatingError(result.error || 'Could not submit rating.');
    }

    setTimeout(() => {
      setActionAlert(null);
    }, 5000);
  };

  const currentList =
    activeTab === 'learning'
      ? bookedLearning
      : activeTab === 'teaching'
      ? bookedTeaching
      : completedSessions;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Sessions & Schedule"
        subtitle="Manage peer learning sessions you are attending as learner, hosting as tutor, or completed"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Sessions' },
        ]}
      />

      <AcademicIntegrityBanner />

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 transition-all ${
            actionAlert.type === 'success'
              ? 'bg-[#DDF7EB] border-[#bdf1d9] text-[#0A6B5B]'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{actionAlert.message}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <Tabs
        tabs={[
          {
            id: 'learning',
            label: 'Attending as Learner',
            count: bookedLearning.length,
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            id: 'teaching',
            label: 'Hosting as Tutor',
            count: bookedTeaching.length,
            icon: <GraduationCap className="w-4 h-4" />,
          },
          {
            id: 'completed',
            label: 'Completed History',
            count: completedSessions.length,
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        variant="pills"
      />

      {/* Sessions Grid */}
      {currentList.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'learning'
              ? 'No Active Learning Bookings'
              : activeTab === 'teaching'
              ? 'No Published Slots Yet'
              : 'No Completed Sessions Yet'
          }
          description={
            activeTab === 'learning'
              ? 'You have not booked any peer sessions yet. Browse open slots across campus to learn a new skill!'
              : activeTab === 'teaching'
              ? 'You have not published any teaching slots. Create a slot to share your expertise and earn credits!'
              : 'When both tutor and learner confirm completion, completed sessions and credit transfers appear here.'
          }
          actionLabel={activeTab === 'learning' ? 'Discover Open Slots' : 'Publish a Slot'}
          onAction={() => {
            window.location.hash = '';
            window.location.pathname = activeTab === 'learning' ? '/discover' : '/teach';
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentList.map((slot) => (
            <SessionCard
              key={slot.slotId}
              slot={slot}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onView={(s) => setActiveModalSlot(s)}
              isCurrentUserTutor={slot.tutor.toLowerCase() === user.email.toLowerCase()}
              isCurrentUserLearner={slot.learner?.toLowerCase() === user.email.toLowerCase()}
            />
          ))}
        </div>
      )}

      {/* Session Details Modal */}
      <SessionDetailsModal
        slot={activeModalSlot}
        onClose={() => setActiveModalSlot(null)}
        isCurrentUserTutor={activeModalSlot ? activeModalSlot.tutor.toLowerCase() === user.email.toLowerCase() : false}
      />

      {/* Polished 5-Star Rating Modal */}
      {ratingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 sm:p-7 bg-white shadow-2xl relative animate-fade-in border-slate-200">
            <button
              onClick={() => setRatingSlot(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
              Rate Your Peer Mentorship Session
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Session: <strong className="text-slate-800">{ratingSlot.skill}</strong> with{' '}
              <strong className="text-brand-600">
                {ratingSlot.tutor.toLowerCase() === user.email.toLowerCase() ? ratingSlot.learnerNick : ratingSlot.tutorNick}
              </strong>
            </p>

            {ratingError && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{ratingError}</span>
              </div>
            )}

            <form onSubmit={handleRateSubmit} className="space-y-4">
              {/* Star Picker */}
              <div className="flex flex-col items-center justify-center py-4 bg-[#fef5e0]/60 border border-[#fde7be] rounded-2xl">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStars(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= selectedStars
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#8c5717] mt-2">
                  {selectedStars} out of 5 Stars
                </span>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Feedback or Review (Optional)
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="How was the explanation, clarity, and pacing?"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-3 focus:ring-brand-500/15"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRatingSlot(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Submit Rating
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
