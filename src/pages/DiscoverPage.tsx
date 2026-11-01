import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockService } from '../services/mockService';
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
    { id: 'all', label: 'All Categories' },
    { id: 'Programming', label: 'Programming' },
    { id: 'Design & Media', label: 'Design & Media' },
    { id: 'Tools & Tech', label: 'Tools & Tech' },
    { id: 'Academics & Writing', label: 'Academics & Writing' },
    { id: 'Languages', label: 'Languages' },
  ];

  const filteredSlots = useMemo(() => {
    return mockService.searchOpenSlots(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory]);

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
    // Populate and immediately activate the search
    updateFilters(skill, selectedCategory);
  };

  const handleCategoryClick = (catId: string) => {
    // If clicking already selected category (other than 'all'), toggle back to 'all'
    const nextCategory = selectedCategory === catId && catId !== 'all' ? 'all' : catId;
    updateFilters(searchTerm, nextCategory);
  };

  const handleClearAll = () => {
    updateFilters('', 'all');
  };

  const handleBook = (slotId: string) => {
    const confirmed = window.confirm(
      'Book this session for 1 credit?\n\nAcademic Integrity Rule: Sessions are for learning only; no doing assignments or exams for others.'
    );

    if (!confirmed) return;

    const result = mockService.bookSlot(slotId);
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
    <div className="space-y-6">
      <PageHeader
        title="Discover Peer Mentors & Sessions"
        subtitle="Search campus slots by skill, date, and venue at the University of Hyderabad"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discover & Search' },
        ]}
      />

      <AcademicIntegrityBanner />

      {bookingMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 transition-all ${
            bookingMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{bookingMessage.text}</span>
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-subtle space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <Input
            id="skillSearch"
            placeholder="Search by skill name (e.g. LaTeX, Python, Figma, Excel)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full"
          />
          <Button type="submit" size="md">
            Search
          </Button>
          {(searchTerm || selectedCategory !== 'all') && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClearAll}
            >
              Reset Filters
            </Button>
          )}
        </form>

        {/* Quick Skill Tags & Match My Wants */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-semibold text-slate-500">Quick suggestions:</span>
          {user.wants && user.wants.length > 0 && (
            <button
              type="button"
              onClick={() => handleQuickSkillClick(user.wants[0])}
              className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>My Want: {user.wants[0]}</span>
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
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-medium shrink-0">Category:</span>
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                  isCatActive
                    ? 'bg-brand-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div>
          Showing <strong>{filteredSlots.length}</strong> available open session{filteredSlots.length !== 1 ? 's' : ''}
          {searchTerm && <span> matching &ldquo;{searchTerm}&rdquo;</span>}
          {selectedCategory !== 'all' && <span> in {selectedCategory}</span>}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Available credits to book:</span>
          <strong className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
            ⏱ {availableCredits}
          </strong>
        </div>
      </div>

      {/* Slots Grid or Empty State */}
      {filteredSlots.length === 0 ? (
        <EmptyState
          title="No Open Slots Found"
          description={
            searchTerm || selectedCategory !== 'all'
              ? `No tutors have open future slots matching your search criteria. Try a different skill, clear the filters, or publish your own slot.`
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
