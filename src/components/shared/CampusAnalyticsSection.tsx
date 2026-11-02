import React from 'react';
import { mockService } from '../../services/mockService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  TrendingUp,
  BarChart3,
  Users,
  Clock,
  MapPin,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const CampusAnalyticsSection: React.FC = () => {
  const analytics = mockService.getCampusAnalytics();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600" />
            Campus Skills &amp; Exchange Analytics
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Day 13 Dashboard
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time supply and demand trends across School of Computer &amp; Information Sciences (SCIS)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most Wanted Skills (Demand) */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              Highest Demand Skills
            </h3>
            <Badge variant="warning">Learner Wants</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Most requested topics students want to learn on campus:
          </p>
          <div className="space-y-2">
            {analytics.topWantedSkills.map((item, idx) => (
              <div key={item.skill} className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-medium">
                  {idx + 1}. {item.skill}
                </span>
                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                  {item.count} {item.count === 1 ? 'seeker' : 'seekers'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Most Offered Skills (Supply) */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Top Taught Skills
            </h3>
            <Badge variant="success">Tutor Offers</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Skills with highest peer tutoring capacity:
          </p>
          <div className="space-y-2">
            {analytics.topOfferedSkills.map((item, idx) => (
              <div key={item.skill} className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-medium">
                  {idx + 1}. {item.skill}
                </span>
                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                  {item.count} {item.count === 1 ? 'tutor' : 'tutors'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Safe Campus Meeting Venues */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              Verified Public Venues
            </h3>
            <Badge variant="brand">Campus Safety</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Approved public locations for mentoring:
          </p>
          <div className="space-y-2">
            {analytics.popularVenues.map((item) => (
              <div key={item.venue} className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-medium truncate max-w-[190px]" title={item.venue}>
                  {item.venue}
                </span>
                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                  {item.count} slots
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Looker Studio Notice */}
      <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between text-xs text-indigo-950">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
            📊
          </div>
          <span>
            <strong>Looker Studio Dashboard Ready:</strong> Connects directly to Google Sheets database tabs (`Users`, `Slots`, `Ledger`) for university reporting.
          </span>
        </div>
        <span className="font-semibold text-indigo-700 text-[11px]">IE209 Spec 4A</span>
      </div>
    </div>
  );
};

