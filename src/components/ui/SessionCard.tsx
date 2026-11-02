import React from 'react';
import { SessionSlot } from '../../types';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { formatDate, formatTime } from '../../utils';
import { mockService } from '../../services/mockService';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Star,
  ChevronRight
} from 'lucide-react';

export interface SessionCardProps {
  slot: SessionSlot;
  onBook?: (slotId: string) => void;
  onConfirm?: (slotId: string) => void;
  onCancel?: (slotId: string) => void;
  onView?: (slot: SessionSlot) => void;
  isCurrentUserTutor?: boolean;
  isCurrentUserLearner?: boolean;
  isBookingLoading?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  slot,
  onBook,
  onConfirm,
  onCancel,
  onView,
  isCurrentUserTutor,
  isCurrentUserLearner,
  isBookingLoading,
}) => {
  const tutorRating = mockService.getUserRatingSummary(slot.tutor);

  const getStatusBadge = () => {
    switch (slot.status) {
      case 'open':
        return <Badge variant="success">Open for Booking</Badge>;
      case 'booked':
        return <Badge variant="brand">Booked</Badge>;
      case 'done':
        return <Badge variant="teal">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{slot.status}</Badge>;
    }
  };

  return (
    <Card className="hover:border-brand-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group bg-white">
      <div>
        {/* Top Header: Category & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-brand-500 block mb-1">
              {slot.category || 'Peer Mentoring'}
            </span>
            <h3
              onClick={() => onView && onView(slot)}
              className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer leading-snug line-clamp-1"
              title={slot.skill}
            >
              {slot.skill}
            </h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Description snippet */}
        {slot.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3.5 leading-relaxed">
            {slot.description}
          </p>
        )}

        {/* Tutor info & Rating */}
        <div className="flex items-center gap-3 py-3 border-y border-slate-100 mb-3.5 bg-slate-50/50 -mx-5 px-5 sm:-mx-6 sm:px-6">
          <Avatar name={slot.tutorNick} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-900 truncate">
                {slot.tutorNick}
                {isCurrentUserTutor && <span className="text-brand-600 font-semibold ml-1">(You)</span>}
              </p>
              {tutorRating.count > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#8c5717] bg-[#fef5e0] px-1.5 py-0.5 rounded-full border border-[#fde7be]">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {tutorRating.average}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">New Tutor</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5 font-medium">
              <User className="w-3 h-3 inline text-slate-400" />
              {slot.tutor.split('@')[0]}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 bg-[#fef5e0] text-[#8c5717] border border-[#fde7be] px-2.5 py-1 rounded-xl text-xs font-extrabold shadow-2xs">
              <span>⏱</span> 1 Credit
            </span>
          </div>
        </div>

        {/* Location & Time Grid */}
        <div className="space-y-2 text-xs text-slate-600 mb-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="font-semibold text-slate-800">{formatDate(slot.date)}</span>
            <span className="text-slate-300">&bull;</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500">{formatTime(slot.time)} (60 min)</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span className="truncate text-slate-600 font-medium" title={slot.place}>
              {slot.place}
            </span>
          </div>
        </div>

        {/* Booked Confirmation status */}
        {slot.status === 'booked' && (
          <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 mb-3.5 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span>Tutor confirmation:</span>
              <span className={slot.tutorOk === 'yes' ? 'text-emerald-700 font-bold' : 'text-amber-800'}>
                {slot.tutorOk === 'yes' ? '✅ Confirmed' : '⏳ Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span>Learner confirmation:</span>
              <span className={slot.learnerOk === 'yes' ? 'text-emerald-700 font-bold' : 'text-amber-800'}>
                {slot.learnerOk === 'yes' ? '✅ Confirmed' : '⏳ Pending'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(slot)}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            Details
          </Button>
        )}

        {slot.status === 'open' && !isCurrentUserTutor && onBook && (
          <Button
            size="sm"
            variant="primary"
            className="flex-1 shadow-sm"
            onClick={() => onBook(slot.slotId)}
            isLoading={isBookingLoading}
          >
            Book Slot (1 Credit)
          </Button>
        )}

        {slot.status === 'open' && isCurrentUserTutor && (
          <div className="text-xs text-brand-700 py-1.5 px-3 font-semibold flex-1 text-center bg-brand-50/70 rounded-xl border border-brand-200/60">
            Your Published Slot
          </div>
        )}

        {slot.status === 'booked' && (
          <div className="flex items-center gap-2 flex-1 justify-end">
            {onConfirm && (
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => onConfirm(slot.slotId)}
              >
                Confirm Done
              </Button>
            )}
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-slate-600 hover:text-rose-600 hover:border-rose-300"
                onClick={() => onCancel(slot.slotId)}
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {slot.status === 'done' && (
          <div className="flex-1 text-center py-1.5 text-xs text-[#0A6B5B] font-bold bg-[#DDF7EB] rounded-xl border border-[#bdf1d9]">
            Completed &bull; Credit Transferred
          </div>
        )}
      </div>
    </Card>
  );
};
