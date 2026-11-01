import { UserProfile, SessionSlot, LedgerTransaction, RatingReview } from '../types';

export const CURRENT_USER: UserProfile = {
  email: 'ravi.23mcse01@uohyd.ac.in',
  nick: 'Ravi Teja',
  department: 'School of Computer and Information Sciences (SCIS)',
  role: 'student',
  offers: ['Python', 'LaTeX', 'Git & GitHub', 'Data Structures'],
  wants: ['Figma', 'Spoken English', 'React'],
  credits: 2,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  bio: 'M.Tech CS student at SCIS. Passionate about algorithms and open source. Happy to teach Python and LaTeX typesetting for academic papers!',
  joinedDate: 'August 2024',
};

export const MOCK_USERS: UserProfile[] = [
  CURRENT_USER,
  {
    email: 'priya.ai@uohyd.ac.in',
    nick: 'Priya Sharma',
    department: 'Centre for Neural & Cognitive Sciences',
    role: 'research_scholar',
    offers: ['Machine Learning', 'Python', 'PyTorch', 'Data Analysis'],
    wants: ['LaTeX', 'Academic Paper Writing'],
    credits: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    bio: 'PhD scholar exploring neuro-symbolic AI. Love explaining complex ML concepts simply.',
    joinedDate: 'January 2024',
  },
  {
    email: 'sneha.des@uohyd.ac.in',
    nick: 'Sneha Rao',
    department: 'Sarojini Naidu School of Arts & Communication',
    role: 'student',
    offers: ['Figma', 'UI/UX Design', 'Wireframing', 'Color Theory'],
    wants: ['Python', 'Excel for Research'],
    credits: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    bio: 'Visual designer with 2+ years making student app mockups and design systems in Figma.',
    joinedDate: 'July 2024',
  },
  {
    email: 'farhan.stat@uohyd.ac.in',
    nick: 'Farhan Khan',
    department: 'School of Mathematics & Statistics',
    role: 'student',
    offers: ['Excel & VLOOKUP', 'Applied Statistics', 'R Programming'],
    wants: ['Spoken English', 'Public Speaking', 'Git & GitHub'],
    credits: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    bio: 'Stats nerd who can solve any spreadsheet problem or regression question.',
    joinedDate: 'September 2024',
  },
  {
    email: 'ananya.eng@uohyd.ac.in',
    nick: 'Ananya Das',
    department: 'Centre for Applied Linguistics & Translation Studies',
    role: 'student',
    offers: ['Spoken English', 'Technical Presentation Skills', 'Academic Proofreading'],
    wants: ['Python Basics', 'Excel Formulas'],
    credits: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    bio: 'Helped 20+ UoH scholars prepare for international conference presentations.',
    joinedDate: 'February 2024',
  },
  {
    email: 'karthik.cs@uohyd.ac.in',
    nick: 'Karthik Varma',
    department: 'School of Computer and Information Sciences (SCIS)',
    role: 'student',
    offers: ['React', 'TypeScript', 'Tailwind CSS', 'Web Architecture'],
    wants: ['Machine Learning', 'PyTorch'],
    credits: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    bio: 'Fullstack frontend developer. Building campus apps and open-source UI libraries.',
    joinedDate: 'March 2024',
  }
];

export const MOCK_SLOTS: SessionSlot[] = [
  {
    slotId: 'SL101',
    tutor: 'sneha.des@uohyd.ac.in',
    tutorNick: 'Sneha Rao',
    skill: 'Figma',
    category: 'Design & Media',
    date: '2026-10-30',
    time: '16:00',
    place: 'Indira Gandhi Memorial Library (IGML) - 2nd Floor Group Study',
    status: 'open',
    creditsCost: 1,
    description: 'Learn Figma auto-layout, component variants, and interactive prototyping hands-on.'
  },
  {
    slotId: 'SL102',
    tutor: 'priya.ai@uohyd.ac.in',
    tutorNick: 'Priya Sharma',
    skill: 'Machine Learning',
    category: 'Programming',
    date: '2026-10-31',
    time: '15:30',
    place: 'SCIS Building - Research Lab 3',
    status: 'open',
    creditsCost: 1,
    description: 'Practical introduction to gradient descent and implementing simple Neural Nets with PyTorch.'
  },
  {
    slotId: 'SL103',
    tutor: 'ananya.eng@uohyd.ac.in',
    tutorNick: 'Ananya Das',
    skill: 'Spoken English',
    category: 'Languages',
    date: '2026-11-01',
    time: '17:00',
    place: 'Campus Gazebo near Lake / Shopping Complex',
    status: 'open',
    creditsCost: 1,
    description: 'Conversational English fluency practice, viva presentation tips, and confidence building.'
  },
  {
    slotId: 'SL104',
    tutor: 'farhan.stat@uohyd.ac.in',
    tutorNick: 'Farhan Khan',
    skill: 'Excel & VLOOKUP',
    category: 'Tools & Tech',
    date: '2026-11-02',
    time: '14:00',
    place: 'School of Mathematics - Seminar Hall B',
    status: 'open',
    creditsCost: 1,
    description: 'Master pivot tables, XLOOKUP/VLOOKUP, conditional formatting, and cleaning messy research datasets.'
  },
  {
    slotId: 'SL105',
    tutor: 'karthik.cs@uohyd.ac.in',
    tutorNick: 'Karthik Varma',
    skill: 'React & Vite',
    category: 'Programming',
    date: '2026-11-03',
    time: '11:00',
    place: 'Online: Google Meet (link shared on booking)',
    status: 'open',
    creditsCost: 1,
    description: 'Building modern reactive apps with Vite, React Router, and state hooks.'
  },
  {
    slotId: 'SL106',
    tutor: 'ravi.23mcse01@uohyd.ac.in',
    tutorNick: 'Ravi Teja',
    skill: 'LaTeX & Overleaf',
    category: 'Academics & Writing',
    date: '2026-11-04',
    time: '16:30',
    place: 'SCIS Reading Room',
    status: 'open',
    creditsCost: 1,
    description: 'Typesetting IEEE/ACM research papers, bibliographies with BibTeX, and complex mathematical formulas.'
  },
  {
    slotId: 'SL107',
    tutor: 'ravi.23mcse01@uohyd.ac.in',
    tutorNick: 'Ravi Teja',
    skill: 'Python Basics',
    category: 'Programming',
    date: '2026-10-29',
    time: '18:00',
    place: 'CIS Computer Lab 1',
    status: 'booked',
    learner: 'farhan.stat@uohyd.ac.in',
    learnerNick: 'Farhan Khan',
    tutorOk: '',
    learnerOk: '',
    creditsCost: 1,
    description: 'Python fundamentals: loops, lists, dicts, and writing clean scripting utilities.'
  },
  {
    slotId: 'SL108',
    tutor: 'priya.ai@uohyd.ac.in',
    tutorNick: 'Priya Sharma',
    skill: 'Data Analysis with Pandas',
    category: 'Programming',
    date: '2026-10-25',
    time: '15:00',
    place: 'SCIS Lab 2',
    status: 'done',
    learner: 'ravi.23mcse01@uohyd.ac.in',
    learnerNick: 'Ravi Teja',
    tutorOk: 'yes',
    learnerOk: 'yes',
    creditsCost: 1,
    description: 'Hands-on exploratory data analysis with Pandas and Seaborn.'
  }
];

export const MOCK_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'TX901',
    time: '2026-10-25 16:05',
    from: 'ravi.23mcse01@uohyd.ac.in',
    to: 'priya.ai@uohyd.ac.in',
    fromNick: 'Ravi Teja',
    toNick: 'Priya Sharma',
    credits: 1,
    slotId: 'SL108',
    skill: 'Data Analysis with Pandas'
  },
  {
    id: 'TX900',
    time: '2026-10-20 12:30',
    from: 'farhan.stat@uohyd.ac.in',
    to: 'ravi.23mcse01@uohyd.ac.in',
    fromNick: 'Farhan Khan',
    toNick: 'Ravi Teja',
    credits: 1,
    slotId: 'SL092',
    skill: 'Git & GitHub Collaboration'
  }
];

export const MOCK_REVIEWS: RatingReview[] = [
  {
    id: 'REV01',
    slotId: 'SL108',
    from: 'ravi.23mcse01@uohyd.ac.in',
    fromNick: 'Ravi Teja',
    to: 'priya.ai@uohyd.ac.in',
    stars: 5,
    comment: 'Priya was fantastic! Explained DataFrame manipulation with intuitive diagrams. Worth every minute.',
    time: '2026-10-25 16:15'
  },
  {
    id: 'REV02',
    slotId: 'SL092',
    from: 'farhan.stat@uohyd.ac.in',
    fromNick: 'Farhan Khan',
    to: 'ravi.23mcse01@uohyd.ac.in',
    stars: 5,
    comment: 'Ravi helped me understand git merge conflicts and branches in just one session. Highly recommended!',
    time: '2026-10-20 12:45'
  }
];

export const POPULAR_CAMPUS_SKILLS = [
  'Python',
  'LaTeX',
  'Figma',
  'Excel & VLOOKUP',
  'Spoken English',
  'Data Structures',
  'Machine Learning',
  'React',
  'Git & GitHub',
  'MATLAB',
  'Academic Writing'
];

export const CAMPUS_LOCATIONS = [
  'Indira Gandhi Memorial Library (IGML) - 2nd Floor',
  'Indira Gandhi Memorial Library (IGML) - Ground Floor Discussion Area',
  'SCIS - Computer Lab 1',
  'SCIS - Research Lab 3',
  'SCIS - Ground Floor Reading Lounge',
  'School of Mathematics - Seminar Hall B',
  'Campus Lake Gazebo / Open Greenery',
  'Campus Shopping Complex Cafe',
  'Online: Google Meet (link provided upon confirmation)'
];
