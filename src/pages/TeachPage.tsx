import type { SessionSlot } from '../types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appService } from '../services/appService';
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
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const TeachPage: React.FC = () => {
  const { refreshUserData } = useAuth();
  const navigate = useNavigate();

  // Tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState<SessionSlot['category']>('Programming');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('16:00');
  const [place, setPlace] = useState(CAMPUS_LOCATIONS[0]);
  const [customPlace, setCustomPlace] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSlotId, setSuccessSlotId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      const newSlot = await appService.createSlot({
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
    } catch (error) { alert(error instanceof Error ? error.message : 'Publication failed.'); }
    finally { setIsSubmitting(false); }
  };

  if (successSlotId) {
    return (
      <div className="max-w-xl mx-auto py-10 animate-fade-in">
        <Card className="text-center p-8 sm:p-10 border-[#DDE3DE] bg-white shadow-elevated">
          <div className="w-16 h-16 rounded-2xl bg-[#E4ECE5] text-[#1F5240] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-[#1E2A24] mb-2 tracking-tight">
            Session Slot Published!
          </h2>
          <p className="text-xs text-[#6B7570] font-mono mb-4">Slot Reference: {successSlotId}</p>
          <p className="text-sm text-[#6B7570] mb-6 max-w-md mx-auto leading-relaxed">
            Your session for <strong className="text-[#1E2A24] font-bold">{skill}</strong> on{' '}
            <strong>{date}</strong> at <strong>{time}</strong> is now live. Other students across campus can book it with their time credits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/sessions')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View in My Sessions
            </Button>
            <Button
              variant="outline"
              size="md"
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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Publish a Teaching Slot"
        subtitle="Share your knowledge with fellow students and earn 1 Time Credit per 1-hour session"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Teach a Skill' },
        ]}
      />

      <AcademicIntegrityBanner />

      <Card className="p-6 sm:p-8 bg-white shadow-card border-[#DDE3DE]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Name */}
          <div>
            <Input
              label="Skill or Topic to Teach"
              id="skill"
              placeholder="e.g. Python, LaTeX Typesetting, Figma Auto-Layout, Excel VLOOKUP"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              helperText="Be specific about the concept covered in the 60-minute session"
              required
            />

            {/* Quick Skills Pick */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#6B7570] uppercase tracking-wider">Popular Topics:</span>
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
            <label className="block text-xs font-bold text-[#1E2A24] tracking-wide uppercase">
              Academic Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SessionSlot['category'])}
              className="w-full rounded-xl border border-[#DDE3DE] bg-white px-4 py-2.5 text-sm text-[#1E2A24] focus:border-[#1F5240] focus:outline-none focus:ring-3 focus:ring-[#1F5240]/15"
            >
              <option value="Programming">Programming &amp; CS (Python, React, C++, Data Structures)</option>
              <option value="Academics & Writing">Academics &amp; Writing (LaTeX, Paper Review, Proofreading)</option>
              <option value="Tools & Tech">Tools &amp; Tech (Git, Docker, Excel, Linux)</option>
              <option value="Design & Media">Design &amp; Media (Figma, UI/UX, Video Editing)</option>
              <option value="Languages">Languages &amp; Soft Skills (Spoken English, Interview Prep)</option>
              <option value="AI & Automation">AI &amp; Automation (AI agents, prototyping, workflows)</option>
              <option value="Math & Science">Math &amp; Science (statistics, physics, lab skills)</option>
              <option value="Content & Video">Content &amp; Video (storytelling, editing, VFX)</option>
              <option value="Marketing & Business">Marketing &amp; Business (social media, pitching)</option>
              <option value="Sports & Fitness">Sports &amp; Fitness (running, marathon preparation)</option>
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
                helperText="1 standard peer mentorship session = 60 minutes"
                required
              />
            </div>
          </div>

          {/* Venue / Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1E2A24] tracking-wide uppercase">
              Meeting Location / Venue (Public campus places or Online only)
            </label>
            <select
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full rounded-xl border border-[#DDE3DE] bg-white px-4 py-2.5 text-sm text-[#1E2A24] focus:border-[#1F5240] focus:outline-none focus:ring-3 focus:ring-[#1F5240]/15"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
              <option value="custom">Other verified campus location...</option>
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
            <p className="text-[11px] text-[#6B7570] flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F5240] inline" />
              <span>Per campus safety policy, peer sessions must be in public university areas or online. Hostels are strictly prohibited.</span>
            </p>
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1E2A24] tracking-wide uppercase">
              Session Overview / Prerequisites (Optional)
            </label>
            <textarea
              rows={4}
              maxLength={1500}
              placeholder="Example: Edit a short video together. Bring a laptop and a practice clip. Beginners welcome."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#DDE3DE] bg-white p-3.5 text-sm text-[#1E2A24] focus:border-[#1F5240] focus:outline-none focus:ring-3 focus:ring-[#1F5240]/15 placeholder:text-[#6B7570]"
            />
          </div>

          {/* Earning Rate Banner */}
          <div className="p-4 rounded-2xl bg-[#E4ECE5]/50 border border-[#DDE3DE] flex items-center justify-between text-xs text-[#1E2A24]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E4ECE5] text-[#1F5240] flex items-center justify-center font-bold text-base">
                ⏱
              </div>
              <span>
                Help others learn and earn credits! You will receive <strong className="font-extrabold text-[#1F5240]">1 Time Credit</strong> automatically upon mutual confirmation.
              </span>
            </div>
            <span className="font-extrabold text-[#1F5240] bg-white px-2.5 py-1 rounded-lg border border-[#DDE3DE]">
              1 hr = 1 credit
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full shadow-md"
              size="lg"
              isLoading={isSubmitting}
            >
              Publish Session
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
