import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { SkillTag } from '../components/ui/SkillTag';
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import { POPULAR_CAMPUS_SKILLS } from '../data/mockData';
import {
  Sparkles,
  BookOpen,
  Plus,
  Save,
  CheckCircle2,
  Building,
  Calendar,
  Star,
  User,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, totalCredits, updateProfile, resetDemoData } = useAuth();

  const [nick, setNick] = useState(user.nick);
  const [offersInput, setOffersInput] = useState('');
  const [wantsInput, setWantsInput] = useState('');
  const [offersList, setOffersList] = useState<string[]>(user.offers || []);
  const [wantsList, setWantsList] = useState<string[]>(user.wants || []);
  const [bio, setBio] = useState(user.bio || '');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    setNick(user.nick);
    setOffersList(user.offers || []);
    setWantsList(user.wants || []);
    setBio(user.bio || '');
  }, [user]);

  // Dynamic rating summary
  const ratingSummary = mockService.getUserRatingSummary(user.email);
  const reviews = mockService.getReviewsForUser(user.email);

  const handleAddOffer = (skillToAdd?: string) => {
    setValidationError(null);
    const s = (skillToAdd || offersInput).trim();
    if (!s) {
      setValidationError('Skill name cannot be empty.');
      return;
    }
    // Case-insensitive duplicate check
    if (offersList.some((existing) => existing.toLowerCase() === s.toLowerCase())) {
      setValidationError(`Skill "${s}" is already in your offered skills list.`);
      return;
    }
    setOffersList([...offersList, s]);
    if (!skillToAdd) setOffersInput('');
  };

  const handleRemoveOffer = (skillToRemove: string) => {
    setOffersList(offersList.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  const handleAddWant = (skillToAdd?: string) => {
    setValidationError(null);
    const s = (skillToAdd || wantsInput).trim();
    if (!s) {
      setValidationError('Topic name cannot be empty.');
      return;
    }
    // Case-insensitive duplicate check
    if (wantsList.some((existing) => existing.toLowerCase() === s.toLowerCase())) {
      setValidationError(`Topic "${s}" is already in your learning list.`);
      return;
    }
    setWantsList([...wantsList, s]);
    if (!skillToAdd) setWantsInput('');
  };

  const handleRemoveWant = (skillToRemove: string) => {
    setWantsList(wantsList.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanNick = nick.trim();
    if (!cleanNick) {
      setValidationError('Please enter a campus nickname (cannot be empty).');
      return;
    }

    const res = updateProfile({
      nick: cleanNick,
      offers: offersList,
      wants: wantsList,
      bio,
    });

    if (res.success) {
      setSuccessMessage('Profile and skills updated and persisted successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setValidationError(res.error || 'Failed to update profile.');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (credits, slots, bookings, reviews) back to default initial state?')) {
      resetDemoData();
      alert('Demo data has been reset to defaults.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="My Campus Profile & Skills"
        subtitle="Manage your public nickname, skills offered to teach, and topics you want to learn"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Profile' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetData}
            title="Reset test data to initial defaults"
          >
            Reset Demo Data
          </Button>
        }
      />

      <AcademicIntegrityBanner />

      {/* Validation / Feedback Alerts */}
      {validationError && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user.nick} size="xl" isOnline />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user.nick}</h2>
                <Badge variant="brand">Verified UoH Student</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {user.department || 'School of Computer and Information Sciences (SCIS)'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {user.joinedDate || '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Time Credit & Rating summary */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-center min-w-[120px]">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide block">
                Time Credits
              </span>
              <div className="text-2xl font-black text-amber-950 mt-0.5">
                ⏱ {totalCredits}
              </div>
              <span className="text-[10px] text-amber-800">1 credit = 1 hr</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center min-w-[120px]">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
                Tutor Rating
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                <span>{ratingSummary.count > 0 ? ratingSummary.average : '5.0'}</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {ratingSummary.count} {ratingSummary.count === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Nickname & Privacy Note */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Public Nickname &amp; Privacy
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Only your nickname, university email, and skills are visible to fellow students. Phone numbers and private IDs are never stored.
          </p>
          <div className="max-w-md">
            <Input
              label="Campus Nickname"
              id="userNick"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              helperText="Displayed on all session slots, booking details, and reviews"
              required
            />
          </div>
        </Card>

        {/* Skills I Offer (To Teach) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Skills I Can Teach (Offers)
              </h3>
              <p className="text-xs text-slate-500">
                Peers searching for these topics will be able to find you and book sessions (FR-2)
              </p>
            </div>
            <Badge variant="success">{offersList.length} Offered</Badge>
          </div>

          {/* Active Offer Tags */}
          <div className="flex flex-wrap gap-2 my-4 min-h-[44px] p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl items-center">
            {offersList.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No skills listed yet. Add skills below!</span>
            ) : (
              offersList.map((skill) => (
                <SkillTag
                  key={skill}
                  skill={skill}
                  variant="offer"
                  onRemove={() => handleRemoveOffer(skill)}
                />
              ))
            )}
          </div>

          {/* Add Offer Input */}
          <div className="flex gap-2">
            <Input
              id="addOfferInput"
              placeholder="Add skill you can teach (e.g. Python, LaTeX, Git, Figma)..."
              value={offersInput}
              onChange={(e) => setOffersInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOffer();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleAddOffer()}
            >
              Add
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">Quick suggestions:</span>
            {POPULAR_CAMPUS_SKILLS.slice(0, 5).map((s) => (
              <SkillTag
                key={s}
                skill={s}
                size="sm"
                variant="interactive"
                onClick={() => handleAddOffer(s)}
              />
            ))}
          </div>
        </Card>

        {/* Skills I Want (To Learn) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Skills I Want to Learn (Wants)
              </h3>
              <p className="text-xs text-slate-500">
                Used to suggest matching tutors and peer sessions on your dashboard (FR-2)
              </p>
            </div>
            <Badge variant="brand">{wantsList.length} Wanted</Badge>
          </div>

          {/* Active Want Tags */}
          <div className="flex flex-wrap gap-2 my-4 min-h-[44px] p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl items-center">
            {wantsList.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No topics listed yet. Add what you want to learn!</span>
            ) : (
              wantsList.map((skill) => (
                <SkillTag
                  key={skill}
                  skill={skill}
                  variant="want"
                  onRemove={() => handleRemoveWant(skill)}
                />
              ))
            )}
          </div>

          {/* Add Want Input */}
          <div className="flex gap-2">
            <Input
              id="addWantInput"
              placeholder="Add skill you want to learn (e.g. Spoken English, Excel, Machine Learning)..."
              value={wantsInput}
              onChange={(e) => setWantsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddWant();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleAddWant()}
            >
              Add
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">Quick suggestions:</span>
            {POPULAR_CAMPUS_SKILLS.slice(5, 10).map((s) => (
              <SkillTag
                key={s}
                skill={s}
                size="sm"
                variant="interactive"
                onClick={() => handleAddWant(s)}
              />
            ))}
          </div>
        </Card>

        {/* Bio */}
        <Card className="p-6">
          <div className="space-y-1.5 mb-3">
            <h3 className="text-base font-bold text-slate-900">
              Student Bio &amp; About Me
            </h3>
            <p className="text-xs text-slate-500">
              Brief introduction for peers booking your sessions
            </p>
          </div>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell peers about your academic interests, preferred study hours, or teaching style..."
            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 placeholder:text-slate-400"
          />
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Changes persist to your browser profile immediately across refreshes
          </span>
          <Button
            type="submit"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Student Reviews & Ratings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Peer Reviews &amp; Ratings Received
            </h3>
            <p className="text-xs text-slate-500">
              Feedback from students who attended your teaching sessions (FR-8)
            </p>
          </div>
          <Badge variant="credit">
            ★ {ratingSummary.average} ({ratingSummary.count} {ratingSummary.count === 1 ? 'review' : 'reviews'})
          </Badge>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No peer reviews yet. Complete a teaching session with a student to receive feedback!
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{rev.fromNick}</span>
                    <span className="text-slate-400 text-[11px]">&bull; {rev.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-slate-600 text-[11px]">({rev.stars}.0)</span>
                  </div>
                </div>
                {rev.comment && <p className="text-slate-600 leading-relaxed">{rev.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
