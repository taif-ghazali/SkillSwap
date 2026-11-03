import React from 'react';
import { useAuth } from '../context/AuthContext';
import { appService } from '../services/appService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Search,
  History,
  Lock,
  Calendar,
  RotateCcw,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WalletPage: React.FC = () => {
  const { user, totalCredits, availableCredits, reservedCredits, resetDemoData } = useAuth();
  const navigate = useNavigate();

  const ledger = appService.getLedger();
  const mySessions = appService.getMySlots();
  const pendingReservations = mySessions.learning.filter((s) => s.status === 'booked');

  const handleResetData = () => {
    if (appService.isLive()) return;
    if (window.confirm('Reset demo transactions and credit balances back to defaults?')) {
      resetDemoData();
      alert('Wallet and ledger have been reset.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Time Credit Wallet & Ledger"
        subtitle="Transparent immutable ledger of your campus time credits (1 hour peer teaching = 1 credit)"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Time Wallet' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleResetData}
              disabled={appService.isLive()}
            >
              Reset Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Search className="w-3.5 h-3.5" />}
              onClick={() => navigate('/discover')}
            >
              Spend Credits
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={() => navigate('/teach')}
            >
              Earn Credits
            </Button>
          </div>
        }
      />

      <AcademicIntegrityBanner />

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-[#fffbf2] via-[#fef5e0] to-white border-[#fde7be] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8c5717] uppercase tracking-wider">
              Total Credit Balance
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center text-lg font-bold shadow-inner text-amber-900">
              ⏱
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{totalCredits}</span>
            <span className="text-sm font-bold text-amber-800">Credits</span>
          </div>
          <p className="mt-2 text-[11px] text-[#8c5717] font-medium">
            Initial grant: 2 credits upon registration with @uohyd.ac.in
          </p>
        </Card>

        {/* Available to Book */}
        <Card className="border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available to Book
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#DDF7EB] text-[#0A6B5B] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{availableCredits}</span>
            <span className="text-sm font-semibold text-emerald-700">Free to Spend</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">
            Formula: Total credits ({totalCredits}) &minus; pending bookings ({reservedCredits})
          </p>
        </Card>

        {/* Pending Reservations */}
        <Card className="border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Held in Escrow
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{reservedCredits}</span>
            <span className="text-sm font-semibold text-slate-500">Reserved</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">
            Transfers to tutor only after session completion &amp; mutual confirmation
          </p>
        </Card>
      </div>

      {/* Pending Reservations Breakdown if any */}
      {pendingReservations.length > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50/50 shadow-sm">
          <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            Active Bookings Holding Time Credits ({pendingReservations.length})
          </h3>
          <div className="divide-y divide-amber-200/60 text-xs">
            {pendingReservations.map((slot) => (
              <div key={slot.slotId} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{slot.skill}</span>
                  <span className="text-slate-500 ml-2">with tutor <strong className="text-brand-600">{slot.tutorNick}</strong> on {slot.date}</span>
                </div>
                <Badge variant="credit">1 Credit Reserved</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ledger History Table */}
      <Card className="p-6 bg-white shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-600" />
              Time Credit Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Immutable server ledger record for every credit transferred upon completed session
            </p>
          </div>
          <Badge variant="brand">LockService Protected</Badge>
        </div>

        {ledger.length === 0 ? (
          <EmptyState
            title="No Transactions Recorded Yet"
            description="Complete a peer learning session with mutual confirmation to record your first transaction."
          />
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">From (Learner)</th>
                  <th className="py-3 px-4">To (Tutor)</th>
                  <th className="py-3 px-4">Skill Session</th>
                  <th className="py-3 px-4 text-right">Credit Movement</th>
                  <th className="py-3 px-4 text-right">Slot ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((tx) => {
                  const isIncoming = tx.to.toLowerCase() === user.email.toLowerCase();
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {tx.time}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {tx.fromNick || tx.from.split('@')[0]}
                        {tx.from.toLowerCase() === user.email.toLowerCase() && (
                          <span className="ml-1 text-[10px] text-brand-600 font-bold">(You)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {tx.toNick || tx.to.split('@')[0]}
                        {tx.to.toLowerCase() === user.email.toLowerCase() && (
                          <span className="ml-1 text-[10px] text-brand-600 font-bold">(You)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {tx.skill}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold whitespace-nowrap">
                        {isIncoming ? (
                          <span className="inline-flex items-center gap-1 text-[#0A6B5B] bg-[#DDF7EB] px-2.5 py-1 rounded-full border border-[#bdf1d9]">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> +{tx.credits} Credit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                            <ArrowUpRight className="w-3.5 h-3.5" /> -{tx.credits} Credit
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                        {tx.slotId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
