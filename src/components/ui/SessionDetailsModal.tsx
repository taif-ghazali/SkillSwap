import React, { useState } from 'react';
import { SessionSlot } from '../../types';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { formatDate, formatTime } from '../../utils';
import { mockService } from '../../services/mockService';
import { ReportMisconductModal } from './ReportMisconductModal';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  ShieldAlert,
  X,
  User,
  BookOpen
} from 'lucide-react';

export interface SessionDetailsModalProps {
  slot: SessionSlot | null;
  onClose: () => void;
  onBook?: (slotId: string) => void;
  isCurrentUserTutor?: boolean;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  slot,
  onClose,
  onBook,
  isCurrentUserTutor,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  if (!slot) return null;

  const tutorRating = mockService.getUserRatingSummary(slot.tutor);
  const tutorReviews = mockService.getReviewsForUser(slot.tutor);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-lg p-6 bg-white shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category & Title */}
        <div className="mb-4 pr-8">
          <span className="text-xs font-semibold tracking-wider uppercase text-brand-600 block mb-1">
            {slot.category || 'Peer Learning Session'}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">{slot.skill}</h2>
        </div>

        {/* Tutor Info Banner */}
        <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 mb-5">
          <Avatar name={slot.tutorNick} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">{slot.tutorNick}</h3>
              {tutorRating.count > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {tutorRating.average} ({tutorRating.count})
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  New Tutor
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-slate-400 inline" />
              {slot.tutor}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold">
              ⏱ 1 Credit
            </span>
          </div>
        </div>

        {/* Schedule & Venue Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs text-slate-700">
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Date & Time</span>
            </div>
            <p className="font-semibold text-slate-900">{formatDate(slot.date)}</p>
            <p className="text-slate-500">{formatTime(slot.time)} (1 hour standard session)</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Campus Meeting Place</span>
            </div>
            <p className="font-semibold text-slate-900 truncate" title={slot.place}>
              {slot.place}
            </p>
            <p className="text-[11px] text-slate-500">Public campus or online meetup</p>
          </div>
        </div>

        {/* Description / Learning Goals */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            What You Will Cover
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
            {slot.description ||
              `Hands-on peer mentoring session covering fundamental concepts, problem solving, and best practices in ${slot.skill}.`}
          </p>
        </div>

        {/* Academic Integrity Notice */}
        <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs mb-5 flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Honor Code:</strong> SkillSwap is strictly for learning and concept clarification.
              Doing homework, exams, or graded project submissions for others is prohibited.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="text-[11px] text-rose-600 hover:text-rose-800 underline shrink-0 font-medium flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Report Violation
          </button>
        </div>

        {/* Recent Tutor Reviews if any */}
        {tutorReviews.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              Recent Reviews for Tutor ({tutorReviews.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {tutorReviews.slice(0, 2).map((rev) => (
                <div key={rev.id} className="p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">{rev.fromNick}</span>
                    <span className="text-amber-500 font-bold">★ {rev.stars}.0</span>
                  </div>
                  {rev.comment && <p className="text-slate-600 text-[11px]">{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Report Issue
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {slot.status === 'open' && !isCurrentUserTutor && onBook && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onBook(slot.slotId);
                  onClose();
                }}
              >
                Book Session (1 Credit)
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Misconduct Report Dialog */}
      <ReportMisconductModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={slot.slotId}
        targetType="slot"
        targetTitle={`${slot.skill} (Tutor: ${slot.tutorNick})`}
      />
    </div>
  );
};
