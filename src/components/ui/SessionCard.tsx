import React from 'react';
import { SessionSlot } from '../../types';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { formatDate, formatTime } from '../../utils';
import { appService } from '../../services/appService';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Star,
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
  const tutorRating = appService.getUserRatingSummary(slot.tutor);

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
    <Card className="hover:border-[#1F5240] hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group bg-white border-[#DDE3DE]">
      <div>
        {/* Top Header: Category & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#1F5240] block mb-1">
              {slot.category || 'Peer Mentoring'}
            </span>
            <h3
              onClick={() => onView && onView(slot)}
              className="text-base font-bold text-[#1E2A24] group-hover:text-[#1F5240] transition-colors cursor-pointer leading-snug line-clamp-1"
              title={slot.skill}
            >
              {slot.skill}
            </h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Description snippet */}
        {slot.description && (
          <p className="text-xs text-[#6B7570] line-clamp-2 mb-3.5 leading-relaxed">
            {slot.description}
          </p>
        )}

        {/* Tutor info & Rating */}
        <div className="flex items-center gap-3 py-3 border-y border-[#DDE3DE]/60 mb-3.5 bg-[#F6F7F3] -mx-5 px-5 sm:-mx-6 sm:px-6">
          <Avatar name={slot.tutorNick} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-[#1E2A24] truncate">
                {slot.tutorNick}
                {isCurrentUserTutor && <span className="text-[#1F5240] font-semibold ml-1">(You)</span>}
              </p>
              {tutorRating.count > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#1F5240] bg-[#E4ECE5] px-1.5 py-0.5 rounded-full border border-[#DDE3DE]">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {tutorRating.average}
                </span>
              ) : (
                <span className="text-[10px] text-[#6B7570] bg-white px-1.5 py-0.5 rounded border border-[#DDE3DE]">{appService.isLive() ? 'Rating unavailable' : 'New Tutor'}</span>
              )}
            </div>
            <p className="text-[11px] text-[#6B7570] truncate flex items-center gap-1 mt-0.5 font-medium">
              <User className="w-3 h-3 inline text-[#6B7570]" />
              {slot.tutor.split('@')[0]}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 bg-[#E4ECE5] text-[#1F5240] border border-[#DDE3DE] px-2.5 py-1 rounded-xl text-xs font-extrabold shadow-2xs">
              <span>⏱</span> 1 Credit
            </span>
          </div>
        </div>

        {/* Location & Time Grid */}
        <div className="space-y-2 text-xs text-[#6B7570] mb-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#1F5240] shrink-0" />
            <span className="font-semibold text-[#1E2A24]">{formatDate(slot.date)}</span>
            <span className="text-slate-300">&bull;</span>
            <Clock className="w-3.5 h-3.5 text-[#6B7570] shrink-0" />
            <span className="text-[#6B7570]">{formatTime(slot.time)} (60 min)</span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#1F5240] shrink-0 mt-0.5" />
            <span className="truncate text-[#1E2A24] font-medium" title={slot.place}>
              {slot.place}
            </span>
          </div>
        </div>

        {/* Booked Confirmation status */}
        {slot.status === 'booked' && (
          <div className="bg-[#F6F7F3] p-3 rounded-xl border border-[#DDE3DE] mb-3.5 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#1E2A24]">
              <span>Tutor confirmation:</span>
              <span className={slot.tutorOk === 'yes' ? 'text-[#1F5240] font-bold' : 'text-[#8C5717]'}>
                {slot.tutorOk === 'yes' ? '✅ Confirmed' : '⏳ Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#1E2A24]">
              <span>Learner confirmation:</span>
              <span className={slot.learnerOk === 'yes' ? 'text-[#1F5240] font-bold' : 'text-[#8C5717]'}>
                {slot.learnerOk === 'yes' ? '✅ Confirmed' : '⏳ Pending'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#DDE3DE]/60 flex items-center justify-between gap-2">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(slot)}
            className="text-xs text-[#6B7570] hover:text-[#1E2A24]"
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
            Book Session
          </Button>
        )}

        {slot.status === 'open' && isCurrentUserTutor && (
          <div className="text-xs text-[#1F5240] py-1.5 px-3 font-semibold flex-1 text-center bg-[#E4ECE5] rounded-xl border border-[#DDE3DE]">
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
                Confirm Session
              </Button>
            )}
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-[#6B7570] hover:text-rose-600 hover:border-rose-300"
                onClick={() => onCancel(slot.slotId)}
              >
                Cancel Session
              </Button>
            )}
          </div>
        )}

        {slot.status === 'done' && (
          <div className="flex-1 text-center py-1.5 text-xs text-[#1F5240] font-bold bg-[#E4ECE5] rounded-xl border border-[#DDE3DE]">
            Completed &bull; Credit Transferred
          </div>
        )}
      </div>
    </Card>
  );
};
