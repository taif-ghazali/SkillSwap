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
      <Card className="w-full max-w-md p-6 bg-white shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Report Submitted</h3>
            <p className="text-xs text-slate-500">
              Reference ID: <span className="font-mono font-semibold">{reportId}</span>
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thank you for upholding academic integrity and community safety. Department administrators and the course coordinator will review this incident.
            </p>
            <div className="pt-2">
              <Button size="sm" onClick={handleModalClose}>
                Dismiss
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Report Policy Violation</h3>
            </div>

            <p className="text-xs text-slate-500">
              Target: <strong className="text-slate-700">{targetTitle}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Violation Type</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="academic_integrity">
                  Academic Integrity Violation (asking/doing assignments, exams, or lab records)
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
              <label className="block text-xs font-semibold text-slate-700">
                Additional Details (Confidential)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Briefly describe what occurred..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900">
              <strong>University Honor Code Reminder:</strong> False reports are punishable under university conduct guidelines. Submissions are securely logged.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
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
