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
  Award,
  Layers
} from 'lucide-react';

export const CampusAnalyticsSection: React.FC = () => {
  const analytics = mockService.getCampusAnalytics();

  // Find max count for normalized visual bar widths
  const maxWanted = Math.max(...analytics.topWantedSkills.map((s) => s.count), 1);
  const maxOffered = Math.max(...analytics.topOfferedSkills.map((s) => s.count), 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4 text-teal-600" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Campus Skills &amp; Exchange Analytics
            </h2>
            <Badge variant="teal">Day 13 Dashboard</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time supply and demand trends across School of Computer &amp; Information Sciences (SCIS)
          </p>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm" className="bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
            <p className="text-xl font-black text-slate-900">{analytics.totalUsers}</p>
          </div>
        </Card>

        <Card padding="sm" className="bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hours Exchanged</p>
            <p className="text-xl font-black text-slate-900">{analytics.totalHoursExchanged} hrs</p>
          </div>
        </Card>

        <Card padding="sm" className="bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Sessions</p>
            <p className="text-xl font-black text-slate-900">{analytics.activeOpenSlots}</p>
          </div>
        </Card>

        <Card padding="sm" className="bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</p>
            <p className="text-xl font-black text-slate-900">{analytics.completedSessions}</p>
          </div>
        </Card>
      </div>

      {/* Demand & Supply Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Most Wanted Skills (Demand) */}
        <Card className="bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                Highest Demand (Wants)
              </h3>
              <Badge variant="warning">Learner Demand</Badge>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Topics students actively want to learn:
            </p>
            <div className="space-y-3">
              {analytics.topWantedSkills.map((item, idx) => {
                const percent = Math.round((item.count / maxWanted) * 100);
                return (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-semibold">{idx + 1}. {item.skill}</span>
                      <span className="font-bold text-rose-600 text-[11px]">{item.count} learners</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-rose-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Top Offered Skills (Supply) */}
        <Card className="bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Top Taught Skills (Offers)
              </h3>
              <Badge variant="teal">Tutor Capacity</Badge>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Skills with strongest peer tutor availability:
            </p>
            <div className="space-y-3">
              {analytics.topOfferedSkills.map((item, idx) => {
                const percent = Math.round((item.count / maxOffered) * 100);
                return (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-semibold">{idx + 1}. {item.skill}</span>
                      <span className="font-bold text-teal-700 text-[11px]">{item.count} tutors</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-400 to-brand-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Verified Public Venues */}
        <Card className="bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                Public Campus Venues
              </h3>
              <Badge variant="brand">Verified Safe</Badge>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Peer-approved public study spaces:
            </p>
            <div className="space-y-3">
              {analytics.popularVenues.map((item) => (
                <div key={item.venue} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium truncate max-w-[190px]" title={item.venue}>
                    {item.venue}
                  </span>
                  <span className="font-bold text-brand-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px]">
                    {item.count} {item.count === 1 ? 'slot' : 'slots'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Looker Studio Notice Bar */}
      <div className="p-4 bg-gradient-to-r from-[#263778]/10 via-[#4969F5]/5 to-teal-500/10 border border-brand-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            📊
          </div>
          <div>
            <p className="font-bold text-slate-900">Google Looker Studio Connector Ready</p>
            <p className="text-[11px] text-slate-500">Live data synchronization with Google Sheets database (`Users`, `Slots`, `Ledger`, `Ratings` tabs)</p>
          </div>
        </div>
        <span className="font-bold text-brand-700 bg-white px-3 py-1 rounded-full border border-brand-200/80 shrink-0 text-center">
          IE209 Spec 4A Compliant
        </span>
      </div>
    </div>
  );
};
