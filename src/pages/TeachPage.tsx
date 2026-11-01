import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SkillTag } from '../components/ui/SkillTag';
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import { POPULAR_CAMPUS_SKILLS, CAMPUS_LOCATIONS } from '../data/mockData';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const TeachPage: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();

  // Tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState<'Programming' | 'Tools & Tech' | 'Academics & Writing' | 'Design & Media' | 'Languages' | 'Other'>('Programming');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('16:00');
  const [place, setPlace] = useState(CAMPUS_LOCATIONS[0]);
  const [customPlace, setCustomPlace] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSlotId, setSuccessSlotId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) {
      alert('Please enter the skill or topic you want to teach.');
      return;
    }

    const finalPlace = place === 'custom' ? customPlace.trim() : place;
    if (!finalPlace) {
      alert('Please specify a public campus location or online meeting link.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newSlot = mockService.createSlot({
        skill: skill.trim(),
        category,
        date,
        time,
        place: finalPlace,
        description: description.trim() || undefined,
      });

      refreshUserData();
      setIsSubmitting(false);
      setSuccessSlotId(newSlot.slotId);
    }, 400);
  };

  if (successSlotId) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <Card className="text-center p-8 border-emerald-200 bg-white">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Session Slot Published!
          </h2>
          <p className="text-xs text-slate-500 font-mono mb-4">Slot ID: {successSlotId}</p>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Your session for <strong>{skill}</strong> on {date} at {time} is now live. Other students across campus can book it with their time credits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/sessions')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View in My Sessions
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccessSlotId(null);
                setSkill('');
                setDescription('');
              }}
            >
              Publish Another Slot
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Publish a Teaching Slot"
        subtitle="Share your knowledge with fellow students and earn 1 Time Credit per 1-hour session"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Teach a Skill' },
        ]}
      />

      <AcademicIntegrityBanner />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Skill Name */}
          <div>
            <Input
              label="Skill or Topic to Teach"
              id="skill"
              placeholder="e.g. Python, LaTeX Typesetting, Figma Auto-Layout, Excel VLOOKUP"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              helperText="Be specific about what concepts will be covered in 1 hour"
              required
            />

            {/* Quick Skills Pick */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400">Popular on campus:</span>
              {POPULAR_CAMPUS_SKILLS.slice(0, 6).map((s) => (
                <SkillTag
                  key={s}
                  skill={s}
                  size="sm"
                  variant={skill.toLowerCase() === s.toLowerCase() ? 'offer' : 'interactive'}
                  onClick={() => setSkill(s)}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Programming">Programming (Python, React, C++, Data Structures)</option>
              <option value="Academics & Writing">Academics & Writing (LaTeX, Paper Review, Proofreading)</option>
              <option value="Tools & Tech">Tools & Tech (Git, Docker, Excel, Linux)</option>
              <option value="Design & Media">Design & Media (Figma, UI/UX, Video Editing)</option>
              <option value="Languages">Languages & Soft Skills (Spoken English, Interview Prep)</option>
              <option value="Other">Other Skills</option>
            </select>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Date (YYYY-MM-DD)"
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                required
              />
            </div>
            <div>
              <Input
                label="Time (HH:mm)"
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                leftIcon={<Clock className="w-4 h-4" />}
                helperText="1 standard session = 60 minutes"
                required
              />
            </div>
          </div>

          {/* Venue / Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
              Meeting Location / Venue (Public campus places or Online only)
            </label>
            <select
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
              <option value="custom">Other public campus location...</option>
            </select>

            {place === 'custom' && (
              <Input
                placeholder="Enter specific public spot on campus (e.g. SCIS Seminar Room 2)..."
                value={customPlace}
                onChange={(e) => setCustomPlace(e.target.value)}
                className="mt-2"
                required
              />
            )}
            <p className="text-[11px] text-slate-500">
              Per university safety guidelines, peer sessions must be in public campus areas or online.
            </p>
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
              Session Overview / Prerequisites (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What will the learner achieve in this 1-hour session? (e.g. Setting up LaTeX bibliography with Overleaf, creating templates...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder:text-slate-400"
            />
          </div>

          {/* Earning Rate Banner */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="text-base">⏱</span>
              <span>
                You will receive <strong>1 Time Credit</strong> automatically upon mutual confirmation.
              </span>
            </div>
            <span className="font-semibold text-amber-800">1 hr = 1 credit</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Publish Peer Learning Slot
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
