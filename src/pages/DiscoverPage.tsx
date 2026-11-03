import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appService } from '../services/appService';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SessionCard } from '../components/ui/SessionCard';
import { SessionDetailsModal } from '../components/ui/SessionDetailsModal';
import { EmptyState } from '../components/ui/EmptyState';
import { SkillTag } from '../components/ui/SkillTag';
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import { POPULAR_CAMPUS_SKILLS } from '../data/mockData';
import { SessionSlot } from '../types';
import { Search, Filter, AlertCircle, Sparkles } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const { user, availableCredits, refreshUserData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryFromUrl = searchParams.get('q') || '';
  const categoryFromUrl = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState(queryFromUrl);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [bookingMessage, setBookingMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeModalSlot, setActiveModalSlot] = useState<SessionSlot | null>(null);

  // Sync state if URL query params change
  useEffect(() => {
    setSearchTerm(queryFromUrl);
    setSelectedCategory(categoryFromUrl);
  }, [queryFromUrl, categoryFromUrl]);

  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'Programming', label: 'Programming & CS' },
    { id: 'Design & Media', label: 'Design & UI/UX' },
    { id: 'Tools & Tech', label: 'Tools & Tech (Git/Docker)' },
    { id: 'Academics & Writing', label: 'LaTeX & Academic Writing' },
    { id: 'Languages', label: 'Languages & Soft Skills' },
  ];

  const filteredSlots = useMemo(() => {
    return appService.searchOpenSlots(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, user]);

  const updateFilters = (newSearch: string, newCategory: string) => {
    setSearchTerm(newSearch);
    setSelectedCategory(newCategory);
    const params: Record<string, string> = {};
    if (newSearch.trim()) params.q = newSearch.trim();
    if (newCategory !== 'all') params.category = newCategory;
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(searchTerm, selectedCategory);
  };

  const handleQuickSkillClick = (skill: string) => {
    updateFilters(skill, selectedCategory);
  };

  const handleCategoryClick = (catId: string) => {
    const nextCategory = selectedCategory === catId && catId !== 'all' ? 'all' : catId;
    updateFilters(searchTerm, nextCategory);
  };

  const handleClearAll = () => {
    updateFilters('', 'all');
  };

  const handleBook = async (slotId: string) => {
    const confirmed = window.confirm(
      'Book this session for 1 credit?\n\nAcademic Integrity Rule: Sessions are for learning only; no doing assignments or exams for others.'
    );

    if (!confirmed) return;

    const result = await appService.bookSlot(slotId);
    if (result.success) {
      refreshUserData();
      setBookingMessage({
        type: 'success',
        text: 'Session successfully booked! 1 time credit is reserved. You can view it under My Sessions.',
      });
    } else {
      setBookingMessage({
        type: 'error',
        text: result.error || 'Failed to book session.',
      });
    }

    setTimeout(() => {
      setBookingMessage(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Discover Peer Mentors & Sessions"
        subtitle="Search open campus slots by skill, date, and verified venue at the University of Hyderabad"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discover & Search' },
        ]}
      />

      <AcademicIntegrityBanner />

      {bookingMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 transition-all ${
            bookingMessage.type === 'success'
              ? 'bg-[#E4ECE5] border-[#DDE3DE] text-[#1F5240]'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{bookingMessage.text}</span>
        </div>
      )}

      {/* Search Bar & Filters Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DDE3DE] shadow-card space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <Input
            id="skillSearch"
            placeholder="Search by skill name (e.g. LaTeX, Python, Figma, Excel, Spoken English)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="md" className="shrink-0">
              Search Skills
            </Button>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleClearAll}
                className="shrink-0"
              >
                Reset
              </Button>
            )}
          </div>
        </form>

        {/* Quick Skill Tags & Match My Wants */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-bold text-[#6B7570] uppercase tracking-wider">Quick Suggestions:</span>
          {user.wants && user.wants.length > 0 && (
            <button
              type="button"
              onClick={() => handleQuickSkillClick(user.wants[0])}
              className="text-xs px-3 py-1 rounded-full font-bold bg-[#E4ECE5] text-[#1F5240] border border-[#DDE3DE] hover:bg-[#d8e3d9] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1F5240]" />
              <span>Match My Want: {user.wants[0]}</span>
            </button>
          )}
          {POPULAR_CAMPUS_SKILLS.map((skill) => {
            const isSelected = searchTerm.toLowerCase() === skill.toLowerCase();
            return (
              <SkillTag
                key={skill}
                skill={skill}
                variant={isSelected ? 'offer' : 'interactive'}
                size="sm"
                onClick={() => handleQuickSkillClick(skill)}
              />
            );
          })}
        </div>

        {/* Category Filter Pills (Clearable) */}
        <div className="pt-3 border-t border-[#DDE3DE]/60 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-[#6B7570] shrink-0" />
          <span className="text-xs text-[#6B7570] font-bold uppercase tracking-wider shrink-0">Filter:</span>
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                  isCatActive
                    ? 'bg-[#1F5240] text-white shadow-sm'
                    : 'bg-[#F6F7F3] text-[#6B7570] hover:bg-[#E4ECE5]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6B7570] px-1">
        <div>
          Showing <strong className="text-[#1E2A24] font-bold">{filteredSlots.length}</strong> available open session{filteredSlots.length !== 1 ? 's' : ''}
          {searchTerm && <span> matching &ldquo;<span className="text-[#1F5240] font-bold">{searchTerm}</span>&rdquo;</span>}
          {selectedCategory !== 'all' && <span> in <span className="font-semibold text-[#1E2A24]">{selectedCategory}</span></span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6B7570]">Available credits:</span>
          <strong className="text-[#1F5240] bg-[#E4ECE5] px-2.5 py-1 rounded-full border border-[#DDE3DE] font-bold">
            ⏱ {availableCredits} Credits
          </strong>
        </div>
      </div>

      {/* Slots Grid or Empty State */}
      {filteredSlots.length === 0 ? (
        <EmptyState
          title="No Open Slots Found"
          description={
            searchTerm || selectedCategory !== 'all'
              ? `No tutors have open future slots matching your search criteria. Try a different skill or clear the filters.`
              : 'There are currently no open future slots available. Be the first to publish a teaching slot!'
          }
          actionLabel="Clear All Filters"
          onAction={handleClearAll}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSlots.map((slot) => (
            <SessionCard
              key={slot.slotId}
              slot={slot}
              onBook={handleBook}
              onView={(s) => setActiveModalSlot(s)}
              isCurrentUserTutor={slot.tutor.toLowerCase() === user.email.toLowerCase()}
            />
          ))}
        </div>
      )}

      {/* Working Session Details Modal */}
      <SessionDetailsModal
        slot={activeModalSlot}
        onClose={() => setActiveModalSlot(null)}
        onBook={handleBook}
        isCurrentUserTutor={activeModalSlot ? activeModalSlot.tutor.toLowerCase() === user.email.toLowerCase() : false}
      />
    </div>
  );
};
