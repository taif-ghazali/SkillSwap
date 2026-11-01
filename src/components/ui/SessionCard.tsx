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
  Info,
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
        return <Badge variant="success">Open</Badge>;
      case 'booked':
        return <Badge variant="brand">Booked</Badge>;
      case 'done':
        return <Badge variant="default">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{slot.status}</Badge>;
    }
  };

  return (
    <Card className="hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header: Category & Status */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-600 block mb-0.5">
              {slot.category || 'Peer Learning'}
            </span>
            <h3
              onClick={() => onView && onView(slot)}
              className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer"
            >
              {slot.skill}
            </h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Description snippet */}
        {slot.description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {slot.description}
          </p>
        )}

        {/* Tutor info & Rating */}
        <div className="flex items-center gap-2.5 py-2.5 border-y border-slate-100 mb-3">
          <Avatar name={slot.tutorNick} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {slot.tutorNick}
                {isCurrentUserTutor && <span className="text-brand-600 font-normal ml-1">(You)</span>}
              </p>
              {tutorRating.count > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {tutorRating.average}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-50 px-1 py-0.2 rounded">New Tutor</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <User className="w-3 h-3 inline text-slate-400" />
              {slot.tutor.split('@')[0]}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded text-xs font-semibold">
              <span>⏱</span> 1 Credit
            </span>
          </div>
        </div>

        {/* Location & Time Grid */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{formatDate(slot.date)}</span>
            <span className="text-slate-300">&bull;</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formatTime(slot.time)} (1 hr)</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate text-slate-600" title={slot.place}>
              {slot.place}
            </span>
          </div>
        </div>

        {/* Booked Confirmation status */}
        {slot.status === 'booked' && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mb-3 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Tutor confirmed: {slot.tutorOk === 'yes' ? '✅ Yes' : '⏳ Pending'}</span>
              <span>Learner confirmed: {slot.learnerOk === 'yes' ? '✅ Yes' : '⏳ Pending'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
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
            className="flex-1"
            onClick={() => onBook(slot.slotId)}
            isLoading={isBookingLoading}
          >
            Book Slot
          </Button>
        )}

        {slot.status === 'open' && isCurrentUserTutor && (
          <div className="text-xs text-slate-500 py-1 font-medium flex-1 text-center bg-slate-50 rounded">
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
                Confirm
              </Button>
            )}
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-slate-600 hover:text-rose-600"
                onClick={() => onCancel(slot.slotId)}
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {slot.status === 'done' && (
          <div className="flex-1 text-center py-1 text-xs text-emerald-700 font-medium bg-emerald-50 rounded border border-emerald-100">
            Completed &bull; Credit Transferred
          </div>
        )}
      </div>
    </Card>
  );
};
