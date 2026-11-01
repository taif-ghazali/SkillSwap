import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { SkillTag } from '../ui/SkillTag';
import { Sparkles, ArrowRight, Repeat, Calendar, Star } from 'lucide-react';

export interface SuggestedMatchesSectionProps {
  onSelectSlot?: (slotId: string) => void;
}

export const SuggestedMatchesSection: React.FC<SuggestedMatchesSectionProps> = ({ onSelectSlot }) => {
  const navigate = useNavigate();
  const matches = mockService.getSuggestedMatches();

  if (matches.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Smart Peer Matches
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Day 12 Algorithm
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Peers matched with what you want to learn (plus mutual two-way learning swaps)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.slice(0, 3).map((m) => {
          const tutorRating = mockService.getUserRatingSummary(m.peer.email);

          return (
            <Card
              key={m.peer.email}
              className={`p-4 transition-all duration-200 flex flex-col justify-between ${
                m.isTwoWayMatch
                  ? 'border-indigo-300 bg-linear-to-br from-indigo-50/60 via-white to-white shadow-subtle'
                  : 'hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Peer info & Match Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={m.peer.nick} size="md" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{m.peer.nick}</h4>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{tutorRating.count > 0 ? tutorRating.average : '5.0'}</span>
                        <span>&bull;</span>
                        <span className="truncate">{m.peer.department?.split(' ')[0] || 'SCIS'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {m.isTwoWayMatch ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <Repeat className="w-3 h-3" /> 2-Way Swap
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {m.score}% Match
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Explanation */}
                <div className="space-y-2 mb-3 text-xs">
                  {m.peerOffersIWant.length > 0 && (
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block mb-1">
                        Teaches what you want:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.peerOffersIWant.map((s) => (
                          <SkillTag key={s} skill={s} variant="offer" size="sm" />
                        ))}
                      </div>
                    </div>
                  )}

                  {m.isTwoWayMatch && m.iOfferPeerWants.length > 0 && (
                    <div className="pt-1.5 border-t border-indigo-100/80">
                      <span className="text-[11px] text-indigo-900 font-medium block mb-1">
                        Wants what you teach:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.iOfferPeerWants.map((s) => (
                          <SkillTag key={s} skill={s} variant="want" size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Open slots available or browse */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {m.matchingSlots.length > 0 ? (
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full text-xs"
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
                    className="w-full text-xs"
                    onClick={() => navigate(`/discover?q=${encodeURIComponent(m.peerOffersIWant[0] || '')}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Search Similar Tutors
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
