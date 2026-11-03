export type SlotStatus = 'open' | 'booked' | 'done' | 'cancelled';

export interface UserProfile {
  email: string;
  nick: string;
  department?: string;
  role?: 'student' | 'research_scholar' | 'faculty';
  offers: string[];
  wants: string[];
  credits: number;
  avatarUrl?: string;
  bio?: string;
  joinedDate?: string;
}

export interface SessionSlot {
  slotId: string;
  tutor: string; // tutor email
  tutorNick: string;
  tutorBio?: string;
  skill: string;
  category?: 'Programming' | 'Tools & Tech' | 'Academics & Writing' | 'Design & Media' | 'Languages' | 'AI & Automation' | 'Math & Science' | 'Content & Video' | 'Marketing & Business' | 'Sports & Fitness' | 'Other';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  place: string; // "Library 2nd Floor", "CIS Lab 1", "Campus Cafe", "Online - GMeet"
  status: SlotStatus;
  learner?: string; // learner email
  learnerNick?: string;
  tutorOk?: 'yes' | 'no' | '';
  learnerOk?: 'yes' | 'no' | '';
  creditsCost: number; // usually 1 credit (1 hour = 1 credit)
  description?: string;
}

export interface LedgerTransaction {
  id: string;
  time: string;
  from: string; // learner email
  to: string; // tutor email
  fromNick?: string;
  toNick?: string;
  credits: number;
  slotId: string;
  skill: string;
}

export interface RatingReview {
  id: string;
  slotId: string;
  from: string;
  fromNick: string;
  to: string;
  stars: number;
  comment?: string;
  time: string;
}

export interface UserRatingSummary {
  average: number;
  count: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
