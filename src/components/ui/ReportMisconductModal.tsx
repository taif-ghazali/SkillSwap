import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { mockService } from '../../services/mockService';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react';

export interface ReportMisconductModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string; // e.g. slotId or user email
  targetType: 'slot' | 'user';
  targetTitle: string;
}

export const ReportMisconductModal: React.FC<ReportMisconductModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
}) => {
  const [reason, setReason] = useState<string>('academic_integrity');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = mockService.reportMisconduct({
      targetId,
      targetType,
      reason,
      details: details.trim() || undefined,
    });

    if (result.success) {
      setReportId(result.reportId);
      setIsSubmitted(true);
    }
  };

  const handleModalClose = () => {
    setIsSubmitted(false);
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-7 bg-white shadow-elevated relative animate-fade-in border-slate-200">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-5 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#DDF7EB] text-[#0A6B5B] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Report Submitted</h3>
            <p className="text-xs text-slate-400 font-mono">
              Reference ID: <span className="font-bold text-slate-800">{reportId}</span>
            </p>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Thank you for upholding academic integrity and community safety. Department course administrators will review this incident.
            </p>
            <div className="pt-3">
              <Button size="sm" variant="primary" onClick={handleModalClose}>
                Dismiss
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Report Campus Violation</h3>
                <p className="text-xs text-slate-400">Strict academic integrity &amp; safety enforcement</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              Target Session: <strong className="text-slate-900 font-bold">{targetTitle}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Violation Type
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-3 focus:ring-rose-500/15"
              >
                <option value="academic_integrity">
                  Academic Integrity (asking to do someone's assignments, lab records, exams)
                </option>
                <option value="money_solicitation">
                  Financial Solicitation (asking for cash or paid tutoring instead of time credits)
                </option>
                <option value="private_room_venue">
                  Inappropriate Meeting Location (asking to meet in private rooms instead of public campus spots)
                </option>
                <option value="harassment_misconduct">
                  Harassment or Inappropriate Conduct
                </option>
                <option value="no_show">
                  No-Show without Prior Cancellation
                </option>
                <option value="other">Other Campus Policy Breach</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Additional Details (Confidential)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Briefly describe what occurred..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-3 focus:ring-rose-500/15"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-[#8c5717]">
              <strong>University Honor Code Reminder:</strong> False reports are punishable under university conduct guidelines. Submissions are securely logged.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button type="button" variant="outline" size="sm" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
