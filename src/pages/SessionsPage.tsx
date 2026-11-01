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
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import { SessionSlot } from '../types';
import {
  CalendarCheck,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Star,
  AlertCircle
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
    <div className="space-y-6">
      <PageHeader
        title="My Sessions & Schedule"
        subtitle="Manage peer learning sessions you are attending, hosting, or completing"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Sessions' },
        ]}
      />

      <AcademicIntegrityBanner />

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 transition-all ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionAlert.message}</span>
        </div>
      )}

      {/* Tabs */}
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

      {/* Rating Modal */}
      {ratingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Rate Your Peer Session
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Session: <strong>{ratingSlot.skill}</strong> with{' '}
              {ratingSlot.tutor === user.email ? ratingSlot.learnerNick : ratingSlot.tutorNick}
            </p>

            {ratingError && (
              <div className="p-3 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{ratingError}</span>
              </div>
            )}

            <form onSubmit={handleRateSubmit} className="space-y-4">
              {/* Star Picker */}
              <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStars(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= selectedStars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Feedback or Review (Optional)
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="How was the explanation, clarity, and pacing?"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRatingSlot(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
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
