import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
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
      <div className={cn('p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-950 text-xs shadow-2xs', className)}>
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-blue-900 text-sm">University of Hyderabad Honor Code & Safety</h4>
            <p className="text-blue-800 leading-relaxed">
              <strong>Learning only:</strong> SkillSwap sessions are strictly for peer mentoring and concept explanation. Doing assignments, lab records, course projects, or exams for others is strictly prohibited and leads to immediate account ban.
            </p>
            <div className="pt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-blue-700">
              <span>&bull; Public campus venues or verified online calls only</span>
              <span>&bull; Time credits only &mdash; no monetary exchange permitted</span>
              <span>&bull; Only university email (@uohyd.ac.in) verified</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs', className)}>
      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
      <span className="font-medium">
        <strong>Campus Integrity Rule:</strong> Peer learning only &mdash; strictly no doing assignments or exams for others.
      </span>
    </div>
  );
};
