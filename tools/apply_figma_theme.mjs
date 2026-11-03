import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 1. Color Tokens matching Figma:
// Primary Forest Green: #1B4332 -> &HFF1B4332
// Dark Forest Green: #143728 -> &HFF143728
// Cream / Soft Sage BG: #F8F9F5 -> &HFFF8F9F5
// Card / Surface White: #FFFFFF -> &HFFFFFFFF
// Soft Sage Button/Container: #F0F4EF -> &HFFF0F4EF
// Charcoal Text: #1C2A24 -> &HFF1C2A24
// Body Slate Text: #2D3748 -> &HFF2D3748
// Secondary Muted Text: #64748B -> &HFF64748B
// Input Placeholder / Border: #94A3B8 -> &HFF94A3B8
// Amber Gold Accent: #D97706 -> &HFFD97706
// Danger / Honor Code Red: #DC2626 -> &HFFDC2626
// Soft Danger BG: #FFF1F2 -> &HFFFF1F2
// Soft Gray Button BG: #F1F5F9 -> &HFFF1F5F9
// Transparent: &H00FFFFFF

const C = {
  primary: '&HFF1B4332',
  primaryDark: '&HFF143728',
  bgCream: '&HFFF8F9F5',
  cardWhite: '&HFFFFFFFF',
  softSage: '&HFFF0F4EF',
  textHeading: '&HFF1C2A24',
  textBody: '&HFF2D3748',
  textMuted: '&HFF64748B',
  placeholder: '&HFF94A3B8',
  amber: '&HFFD97706',
  danger: '&HFFDC2626',
  softGray: '&HFFF1F5F9',
  transparent: '&H00FFFFFF',
};

// Component-level overrides map
const overrides = {
  // Screen-level
  Screen1: {
    Title: 'SkillSwap UoH',
    BackgroundColor: C.bgCream,
  },
  
  // Header Wallet
  lblWallet: {
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    Text: '🪙 Time Wallet: 0 credits',
    FontSize: '16.0',
    TextAlignment: '1',
    FontBold: 'True',
  },

  // Page 1: Login
  vaLogin: {
    BackgroundColor: C.cardWhite,
  },
  lblAppName: {
    Text: 'SkillSwap',
    TextColor: C.primary,
    FontSize: '28.0',
    FontBold: 'True',
    TextAlignment: '1',
  },
  lblTagline: {
    Text: 'Teach what you know, learn what you need',
    BackgroundColor: C.transparent,
    TextColor: C.textMuted,
    FontSize: '14.0',
    TextAlignment: '1',
    FontBold: 'False',
  },
  lblWelcome: {
    Text: 'Welcome to Campus Skill Exchange',
    BackgroundColor: C.transparent,
    TextColor: C.textHeading,
    FontSize: '18.0',
    TextAlignment: '1',
    FontBold: 'True',
  },
  lblEmail: {
    Text: 'University Email (@uohyd.ac.in)',
    BackgroundColor: C.transparent,
    TextColor: C.textBody,
    FontSize: '14.0',
    FontBold: 'True',
  },
  txtEmail: {
    BackgroundColor: C.cardWhite,
    Hint: 'e.g. rollno.26cs@uohyd.ac.in',
    HintColor: C.placeholder,
    TextColor: C.textHeading,
    FontSize: '15.0',
  },
  lblNick: {
    Text: 'Your Nickname',
    BackgroundColor: C.transparent,
    TextColor: C.textBody,
    FontSize: '14.0',
    FontBold: 'True',
  },
  txtNick: {
    BackgroundColor: C.cardWhite,
    Hint: 'Enter your display name',
    HintColor: C.placeholder,
    TextColor: C.textHeading,
    FontSize: '15.0',
  },
  btnLogin: {
    Text: 'Sign In / Get Started',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '16.0',
  },
  lblLoginInfo: {
    Text: 'Sign in with your university email to get started.',
    TextColor: C.textMuted,
    FontSize: '13.0',
    TextAlignment: '1',
    FontBold: 'False',
  },

  // Page 2: Profile
  vaProfile: {
    BackgroundColor: C.cardWhite,
  },
  lblProfileTitle: {
    Text: 'My Profile & Skills',
    TextColor: C.primary,
    FontSize: '22.0',
    FontBold: 'True',
    TextAlignment: '1',
  },
  lblCredits: {
    Text: '🪙 Time Wallet: 2 credits',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontSize: '16.0',
    FontBold: 'True',
    TextAlignment: '1',
  },
  lblOffersTitle: {
    Text: 'Skills I Can Teach (Offers)',
    TextColor: C.textHeading,
    FontSize: '15.0',
    FontBold: 'True',
  },
  txtOffers: {
    BackgroundColor: C.cardWhite,
    Hint: 'e.g. Python, LaTeX, Figma, Excel',
    HintColor: C.placeholder,
    TextColor: C.textHeading,
    FontSize: '14.0',
    FontBold: 'False',
  },
  lblWantsTitle: {
    Text: 'Skills I Want to Learn (Wants)',
    TextColor: C.textHeading,
    FontSize: '15.0',
    FontBold: 'True',
  },
  txtWants: {
    BackgroundColor: C.cardWhite,
    Hint: 'e.g. Java, Deep Learning, UI Design, Spoken English',
    HintColor: C.placeholder,
    TextColor: C.textHeading,
    FontSize: '14.0',
    FontBold: 'False',
  },
  btnSave: {
    Text: 'Save Profile ✔',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '15.0',
  },
  lblProfileInfo: {
    Text: 'Share your skills and discover peer mentors on campus.',
    TextColor: C.textMuted,
    FontSize: '13.0',
    TextAlignment: '1',
    FontBold: 'False',
  },

  // Page 3: Search
  vaSearch: {
    BackgroundColor: C.cardWhite,
  },
  lblSearchTitle: {
    Text: 'Find a Tutor 🔍',
    TextColor: C.primary,
    FontSize: '22.0',
    FontBold: 'True',
    TextAlignment: '1',
  },
  lblSearchInfo: {
    Text: 'Search by topic or skill to find available peer slots',
    BackgroundColor: C.transparent,
    TextColor: C.textMuted,
    FontSize: '13.0',
    FontBold: 'False',
  },
  txtSkill: {
    BackgroundColor: C.cardWhite,
    Hint: 'Enter skill (e.g. Python, LaTeX, Figma)',
    HintColor: C.placeholder,
    TextColor: C.textHeading,
    FontSize: '15.0',
    FontBold: 'False',
  },
  btnSearch: {
    Text: 'Search Available Sessions',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '15.0',
  },
  lblResultsTitle: {
    Text: 'Available Peer Mentoring Sessions',
    BackgroundColor: C.transparent,
    TextColor: C.textHeading,
    FontSize: '15.0',
    FontBold: 'True',
  },
  lvSlots: {
    BackgroundColor: C.cardWhite,
    TextColor: C.textHeading,
    TextColorDetail: C.textMuted,
  },

  // Page 4: Slot Details
  vaSlot: {
    BackgroundColor: C.cardWhite,
  },
  lblSlotTitle: {
    Text: 'Session Details',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontSize: '18.0',
    FontBold: 'True',
    TextAlignment: '1',
  },
  lblSkill: {
    TextColor: C.textHeading,
    FontSize: '17.0',
    FontBold: 'True',
  },
  lblTutor: {
    TextColor: C.textBody,
    FontSize: '15.0',
    FontBold: 'False',
  },
  lblWhen: {
    TextColor: C.textBody,
    FontSize: '15.0',
    FontBold: 'False',
  },
  lblPlace: {
    TextColor: C.textBody,
    FontSize: '15.0',
    FontBold: 'False',
  },
  lblSlotCredits: {
    Text: '🪙 Cost: 1 Time Credit',
    TextColor: C.amber,
    FontSize: '16.0',
    FontBold: 'True',
  },
  btnBook: {
    Text: 'Book This Session (1 Credit)',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '16.0',
  },
  lblIntegrity: {
    Text: '⚠️ Campus Honor Code: Learning and peer mentoring only. No graded assignment or exam help.',
    TextColor: C.danger,
    FontSize: '12.0',
    TextAlignment: '1',
    FontBold: 'True',
  },

  // Page 5: Teach
  vaTeach: {
    BackgroundColor: C.cardWhite,
  },
  lblTeachTitle: {
    Text: 'Publish a Teaching Slot',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontSize: '18.0',
    FontBold: 'True',
    TextAlignment: '1',
  },
  lblTeachInfo: {
    Text: 'Share your knowledge with peers and earn time credits',
    BackgroundColor: C.transparent,
    TextColor: C.textMuted,
    FontSize: '13.0',
    TextAlignment: '1',
    FontBold: 'False',
  },
  lblSkillTitle: {
    Text: 'Skill You Can Teach',
    TextColor: C.textHeading,
    FontSize: '14.0',
    FontBold: 'True',
  },
  txtSlotSkill: {
    BackgroundColor: C.cardWhite,
    Hint: 'e.g. Python, LaTeX, Figma, Excel',
    HintColor: C.placeholder,
    TextColor: C.textHeading,
    FontSize: '15.0',
  },
  lblDateTitle: {
    Text: 'Session Date',
    TextColor: C.textHeading,
    FontSize: '14.0',
    FontBold: 'True',
  },
  dpDate: {
    Text: 'Select Date 📅',
    BackgroundColor: C.softSage,
    TextColor: C.primary,
    FontBold: 'True',
    FontSize: '15.0',
  },
  lblTimeTitle: {
    Text: 'Session Time (HH:mm IST)',
    TextColor: C.textHeading,
    FontSize: '14.0',
    FontBold: 'True',
  },
  tpTime: {
    Text: 'Select Time ⏰',
    BackgroundColor: C.softSage,
    TextColor: C.primary,
    FontBold: 'True',
    FontSize: '15.0',
  },
  lblPlaceTitle: {
    Text: 'Campus Location or Online Meeting Link',
    TextColor: C.textHeading,
    FontSize: '14.0',
    FontBold: 'True',
  },
  txtPlace: {
    BackgroundColor: C.cardWhite,
    Hint: 'Library, SCIS lab, canteen, or Online link',
    HintColor: C.placeholder,
    TextColor: C.textHeading,
    FontSize: '14.0',
    FontBold: 'False',
  },
  btnPublish: {
    Text: 'Publish Session Slot',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '16.0',
  },
  lblTeachNote: {
    Text: 'Public campus locations or online only. Campus time: IST (HH:mm).',
    TextColor: C.textMuted,
    FontSize: '12.0',
    TextAlignment: '1',
    FontBold: 'False',
  },

  // Page 6: Sessions
  vaSessions: {
    BackgroundColor: C.cardWhite,
  },
  lblSessionsTitle: {
    Text: 'My Sessions & Bookings',
    TextColor: C.primary,
    FontSize: '22.0',
    FontBold: 'True',
    TextAlignment: '1',
  },
  lvSessions: {
    BackgroundColor: C.cardWhite,
    TextColor: C.textHeading,
    TextColorDetail: C.textMuted,
    Height: '260',
  },
  btnConfirm: {
    Text: 'Confirm Session (Transfer Credit) ✔',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '15.0',
  },
  btnCancel: {
    Text: 'Cancel Session (≥ 2h before) ✕',
    BackgroundColor: C.softGray,
    TextColor: C.danger,
    FontBold: 'True',
    FontSize: '14.0',
  },
  btnRate: {
    Text: 'Rate Session (1-5 Stars) ★',
    BackgroundColor: C.amber,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '14.0',
  },
  lblSessionsInfo: {
    Text: 'Select a session to manage confirmations, cancellations, or ratings.',
    TextColor: C.textMuted,
    FontSize: '13.0',
    TextAlignment: '1',
    FontBold: 'False',
  },

  // Bottom Navigation Bar
  haNav: {
    BackgroundColor: C.softSage,
  },
  btnSearchTab: {
    Text: '🔍 Search',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '13.0',
  },
  btnTeachTab: {
    Text: '➕ Teach',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '13.0',
  },
  btnSessionsTab: {
    Text: '📅 Sessions',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '13.0',
  },
  btnProfileTab: {
    Text: '👤 Profile',
    BackgroundColor: C.primary,
    TextColor: C.cardWhite,
    FontBold: 'True',
    FontSize: '13.0',
  },
};

export function updateScmProperties(scmData) {
  // Apply Screen1 properties
  if (overrides.Screen1) {
    Object.assign(scmData.Properties, overrides.Screen1);
  }

  function applyOverrides(component) {
    const name = component.$Name;
    if (overrides[name]) {
      Object.assign(component, overrides[name]);
    }
    if (component.$Components) {
      for (const child of component.$Components) {
        applyOverrides(child);
      }
    }
  }

  applyOverrides(scmData.Properties);
  return scmData;
}

console.log('Figma theme updater ready.');

