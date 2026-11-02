import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../../utils';

export interface AcademicIntegrityBannerProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const AcademicIntegrityBanner: React.FC<AcademicIntegrityBannerProps> = ({
  className,
  variant = 'compact',
}) => {
  if (variant === 'full') {
    return (
      <div className={cn('p-5 rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50/70 via-white to-teal-50/50 text-slate-800 text-xs shadow-card', className)}>
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-brand-500 text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              University of Hyderabad Academic Honor Code &amp; Safety Policy
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Learning &amp; Concept Clarification Only:</strong> SkillSwap sessions are strictly for peer mentoring and software tutoring. Doing graded coursework, lab records, thesis chapters, or exams for others is strictly prohibited per university regulations.
            </p>
            <div className="pt-1 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-teal-700 font-semibold">&bull; Public campus venues or Google Meet only</span>
              <span className="flex items-center gap-1.5 text-amber-800 font-semibold">&bull; Time credits only (1 hr = 1 credit)</span>
              <span className="flex items-center gap-1.5 text-brand-700 font-semibold">&bull; University @uohyd.ac.in accounts only</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-50/80 via-white to-teal-50/50 border border-brand-200/70 text-slate-700 text-xs shadow-2xs', className)}>
      <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
      <span className="font-medium text-slate-700">
        <strong className="text-slate-900 font-bold">Academic Integrity Rule:</strong> Peer mentoring only &mdash; no doing assignments or exams for others.
      </span>
    </div>
  );
};
