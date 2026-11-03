import React from 'react';
import { useNavigate } from 'react-router-dom';
import { appService } from '../../services/appService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { SkillTag } from '../ui/SkillTag';
import { Sparkles, ArrowRight, Repeat, Calendar, Star, CheckCircle } from 'lucide-react';

export interface SuggestedMatchesSectionProps {
  onSelectSlot?: (slotId: string) => void;
}

export const SuggestedMatchesSection: React.FC<SuggestedMatchesSectionProps> = ({ onSelectSlot }) => {
  const navigate = useNavigate();
  const matches = appService.getSuggestedMatches();

  if (matches.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-brand-500" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Smart Peer Matches
            </h2>
            <Badge variant="brand">Day 12 Algorithm</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Peer recommendations tailored to your interests, highlighting reciprocal two-way learning swaps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {matches.slice(0, 3).map((m) => {
          const tutorRating = appService.getUserRatingSummary(m.peer.email);

          return (
            <Card
              key={m.peer.email}
              className={`p-5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                m.isTwoWayMatch
                  ? 'border-brand-300 bg-gradient-to-br from-brand-50/70 via-white to-teal-50/40 shadow-card hover:shadow-card-hover hover:border-brand-400'
                  : 'bg-white hover:border-slate-300 hover:shadow-card-hover'
              }`}
            >
              {/* Distinctive Top Ribbon for Two-Way Swaps */}
              {m.isTwoWayMatch && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-500 to-teal-500 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-lg tracking-wider shadow-2xs flex items-center gap-1">
                  <Repeat className="w-2.5 h-2.5" /> 2-Way Swap
                </div>
              )}

              <div>
                {/* Header: Peer info & Score */}
                <div className="flex items-start justify-between gap-2 mb-3.5 pr-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={m.peer.nick} size="md" isOnline />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{m.peer.nick}</h4>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5 font-medium">
                        <span className="flex items-center text-[#8c5717] font-semibold bg-[#fef5e0] px-1 rounded">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-0.5 inline" />
                          {tutorRating.count > 0 ? tutorRating.average : '5.0'}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="truncate">{m.peer.department?.split('(')[0].trim() || 'SCIS'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Match Explanation */}
                <div className="space-y-3 mb-4 text-xs">
                  {m.peerOffersIWant.length > 0 && (
                    <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Teaches what you want:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.peerOffersIWant.map((s) => (
                          <SkillTag key={s} skill={s} variant="offer" size="sm" />
                        ))}
                      </div>
                    </div>
                  )}

                  {m.isTwoWayMatch && m.iOfferPeerWants.length > 0 && (
                    <div className="bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/60">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <Repeat className="w-3 h-3 text-teal-600" />
                        Wants what you teach:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.iOfferPeerWants.map((s) => (
                          <SkillTag key={s} skill={s} variant="want" size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Open slots available or search */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {m.matchingSlots.length > 0 ? (
                  <Button
                    size="sm"
                    variant={m.isTwoWayMatch ? 'primary' : 'teal'}
                    className="w-full text-xs shadow-sm"
                    onClick={() => {
                      if (onSelectSlot) {
                        onSelectSlot(m.matchingSlots[0].slotId);
                      } else {
                        navigate(`/discover?q=${encodeURIComponent(m.matchingSlots[0].skill)}`);
                      }
                    }}
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  >
                    Book Open Slot ({m.matchingSlots[0].skill})
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs hover:border-brand-400 hover:text-brand-600"
                    onClick={() => navigate(`/discover?q=${encodeURIComponent(m.peerOffersIWant[0] || '')}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Browse Peer Slots
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
