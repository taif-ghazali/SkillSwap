import { SessionSlot, UserProfile, LedgerTransaction, RatingReview, UserRatingSummary } from '../types';
import { CURRENT_USER, MOCK_USERS, MOCK_SLOTS, MOCK_TRANSACTIONS, MOCK_REVIEWS } from '../data/mockData';

// Local storage keys
const STORAGE_KEY_CURRENT_USER_EMAIL = 'skillswap_current_email';
const STORAGE_KEY_USERS = 'skillswap_users_directory';
const STORAGE_KEY_SLOTS = 'skillswap_slots';
const STORAGE_KEY_LEDGER = 'skillswap_ledger';
const STORAGE_KEY_REVIEWS = 'skillswap_reviews';

export class MockDataService {
  private currentEmail: string;
  private users: Record<string, UserProfile>;
  private slots: SessionSlot[];
  private ledger: LedgerTransaction[];
  private reviews: RatingReview[];

  constructor() {
    this.users = this.loadUsers();
    this.currentEmail = this.loadCurrentEmail();
    this.slots = this.loadFromStorage(STORAGE_KEY_SLOTS, MOCK_SLOTS);
    this.ledger = this.loadFromStorage(STORAGE_KEY_LEDGER, MOCK_TRANSACTIONS);
    this.reviews = this.loadFromStorage(STORAGE_KEY_REVIEWS, MOCK_REVIEWS);

    // Ensure the current user exists in users table
    if (!this.users[this.currentEmail]) {
      this.users[this.currentEmail] = { ...CURRENT_USER };
      this.saveUsers();
    }
  }

  private loadUsers(): Record<string, UserProfile> {
    const raw = this.loadFromStorage<Record<string, UserProfile> | null>(STORAGE_KEY_USERS, null);
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw;
    }
    // Initialize directory from MOCK_USERS
    const initialMap: Record<string, UserProfile> = {};
    for (const u of MOCK_USERS) {
      initialMap[u.email.toLowerCase()] = { ...u };
    }
    return initialMap;
  }

  private saveUsers(): void {
    this.saveToStorage(STORAGE_KEY_USERS, this.users);
  }

  private loadCurrentEmail(): string {
    try {
      const email = localStorage.getItem(STORAGE_KEY_CURRENT_USER_EMAIL);
      if (email && email.trim()) {
        return email.toLowerCase().trim();
      }
    } catch {
      // storage disabled or error
    }
    return CURRENT_USER.email.toLowerCase();
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (parsed === null || parsed === undefined) return fallback;
      return parsed;
    } catch {
      return fallback;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore write errors (e.g., quota exceeded or privacy mode)
    }
  }

  // ==========================================
  // USER & PROFILE MANAGEMENT
  // ==========================================

  public getCurrentUser(): UserProfile {
    const user = this.users[this.currentEmail];
    if (user) {
      return { ...user };
    }
    return { ...CURRENT_USER };
  }

  public getAllUsers(): UserProfile[] {
    return Object.values(this.users);
  }

  public getUser(email: string): UserProfile | undefined {
    return this.users[email.toLowerCase()];
  }

  public updateProfile(params: {
    nick?: string;
    offers: string[];
    wants: string[];
    bio?: string;
  }): { success: boolean; user: UserProfile; error?: string } {
    const currentUser = this.getCurrentUser();

    // Sanitize and validate nickname
    let updatedNick = currentUser.nick;
    if (params.nick !== undefined) {
      const trimmedNick = params.nick.trim();
      if (!trimmedNick) {
        return { success: false, user: currentUser, error: 'Nickname cannot be empty' };
      }
      updatedNick = trimmedNick;
    }

    // Sanitize and deduplicate offers (case-insensitive deduplication)
    const cleanOffers: string[] = [];
    const seenOffers = new Set<string>();
    for (const raw of params.offers) {
      const trimmed = raw.trim();
      if (trimmed && !seenOffers.has(trimmed.toLowerCase())) {
        seenOffers.add(trimmed.toLowerCase());
        cleanOffers.push(trimmed);
      }
    }

    // Sanitize and deduplicate wants (case-insensitive deduplication)
    const cleanWants: string[] = [];
    const seenWants = new Set<string>();
    for (const raw of params.wants) {
      const trimmed = raw.trim();
      if (trimmed && !seenWants.has(trimmed.toLowerCase())) {
        seenWants.add(trimmed.toLowerCase());
        cleanWants.push(trimmed);
      }
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      nick: updatedNick,
      offers: cleanOffers,
      wants: cleanWants,
      bio: params.bio !== undefined ? params.bio.trim() : currentUser.bio,
    };

    this.users[this.currentEmail] = updatedUser;
    this.saveUsers();

    // Update tutorNick on open slots published by this user to keep consistent
    this.slots = this.slots.map((s) => {
      if (s.tutor.toLowerCase() === this.currentEmail) {
        return { ...s, tutorNick: updatedNick };
      }
      if (s.learner && s.learner.toLowerCase() === this.currentEmail) {
        return { ...s, learnerNick: updatedNick };
      }
      return s;
    });
    this.saveToStorage(STORAGE_KEY_SLOTS, this.slots);

    return { success: true, user: updatedUser };
  }

  public loginWithEmail(email: string, nick?: string): { user: UserProfile; isNew: boolean } {
    const cleanEmail = email.toLowerCase().trim();
    this.currentEmail = cleanEmail;
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_EMAIL, cleanEmail);
    } catch {
      // ignore
    }

    if (this.users[cleanEmail]) {
      return { user: { ...this.users[cleanEmail] }, isNew: false };
    }

    // FR-1: New user starts with exactly 2 credits
    const newUser: UserProfile = {
      email: cleanEmail,
      nick: nick?.trim() || cleanEmail.split('@')[0],
      offers: [],
      wants: [],
      credits: 2,
      department: 'School of Computer and Information Sciences (SCIS)',
      role: 'student',
      joinedDate: 'October 2026',
    };

    this.users[cleanEmail] = newUser;
    this.saveUsers();
    return { user: { ...newUser }, isNew: true };
  }

  // ==========================================
  // CREDIT ENGINE & BALANCES
  // ==========================================

  public getCreditBreakdown(email?: string): {
    total: number;
    reserved: number;
    available: number;
  } {
    const userEmail = (email || this.currentEmail).toLowerCase();
    const user = this.users[userEmail];
    const total = user ? user.credits : 0;

    // Reserved credits: Pending booked sessions where this user is the learner
    const reserved = this.slots.filter(
      (s) => s.learner?.toLowerCase() === userEmail && s.status === 'booked'
    ).length;

    const available = Math.max(0, total - reserved);
    return { total, reserved, available };
  }

  public getAvailableCredits(): number {
    return this.getCreditBreakdown().available;
  }

  // ==========================================
  // SLOTS & SEARCH (DISCOVERY)
  // ==========================================

  public getAllSlots(): SessionSlot[] {
    return [...this.slots];
  }

  public searchOpenSlots(skillQuery?: string, category?: string): SessionSlot[] {
    const now = new Date();
    const currentEmail = this.currentEmail;

    return this.slots.filter((s) => {
      // Must not be user's own slot
      const isNotOwn = s.tutor.toLowerCase() !== currentEmail;
      // Must be open status
      const isOpen = s.status === 'open';

      // Must be in the future
      let isFuture = false;
      try {
        const slotTime = new Date(`${s.date}T${s.time}`);
        isFuture = !isNaN(slotTime.getTime()) && slotTime > now;
      } catch {
        isFuture = false;
      }

      // Case-insensitive, partial skill-name matching
      const matchesSkill =
        !skillQuery ||
        skillQuery.trim() === '' ||
        s.skill.toLowerCase().includes(skillQuery.toLowerCase().trim());

      // Category matching
      const matchesCategory =
        !category || category === 'all' || s.category === category;

      return isNotOwn && isOpen && isFuture && matchesSkill && matchesCategory;
    });
  }

  public getMySlots(): { teaching: SessionSlot[]; learning: SessionSlot[] } {
    const email = this.currentEmail;
    const teaching = this.slots.filter((s) => s.tutor.toLowerCase() === email);
    const learning = this.slots.filter((s) => s.learner?.toLowerCase() === email);
    return { teaching, learning };
  }

  public getSlotById(slotId: string): SessionSlot | undefined {
    return this.slots.find((s) => s.slotId === slotId);
  }

  public createSlot(slot: Omit<SessionSlot, 'slotId' | 'tutor' | 'tutorNick' | 'status' | 'creditsCost'>): SessionSlot {
    const currentUser = this.getCurrentUser();
    const newSlot: SessionSlot = {
      ...slot,
      slotId: `SL${Date.now()}`,
      tutor: currentUser.email,
      tutorNick: currentUser.nick,
      status: 'open',
      creditsCost: 1,
    };
    this.slots = [newSlot, ...this.slots];
    this.saveToStorage(STORAGE_KEY_SLOTS, this.slots);
    return newSlot;
  }

  // ==========================================
  // BOOKING ENGINE (PHASE 3)
  // ==========================================

  public bookSlot(slotId: string): { success: boolean; error?: string } {
    const slot = this.slots.find((s) => s.slotId === slotId);
    if (!slot) {
      return { success: false, error: 'Session slot not found' };
    }

    // 1. Only open slots can be booked
    if (slot.status !== 'open') {
      return { success: false, error: 'This slot is no longer open for booking' };
    }

    // 2. Prevent booking own slot
    if (slot.tutor.toLowerCase() === this.currentEmail) {
      return { success: false, error: 'You cannot book your own published session' };
    }

    // 3. Prevent booking past slots
    try {
      const slotTime = new Date(`${slot.date}T${slot.time}`);
      if (isNaN(slotTime.getTime()) || slotTime <= new Date()) {
        return { success: false, error: 'Cannot book a session slot in the past' };
      }
    } catch {
      return { success: false, error: 'Invalid session date and time' };
    }

    // 4. Check available credits (credits - pending bookings >= 1)
    const breakdown = this.getCreditBreakdown();
    if (breakdown.available < 1) {
      return {
        success: false,
        error: 'Not enough available credits (1 required). Teach a session to earn credits!',
      };
    }

    // 5. Update slot status to booked
    const currentUser = this.getCurrentUser();
    slot.status = 'booked';
    slot.learner = currentUser.email;
    slot.learnerNick = currentUser.nick;
    slot.tutorOk = '';
    slot.learnerOk = '';

    this.saveToStorage(STORAGE_KEY_SLOTS, this.slots);
    return { success: true };
  }

  // ==========================================
  // CANCELLATION ENGINE (PHASE 3)
  // ==========================================

  public cancelSlot(slotId: string): { success: boolean; error?: string } {
    const slot = this.slots.find((s) => s.slotId === slotId);
    if (!slot) {
      return { success: false, error: 'Slot not found' };
    }

    const email = this.currentEmail;
    const isLearner = slot.learner?.toLowerCase() === email;
    const isTutor = slot.tutor.toLowerCase() === email;

    if (!isLearner && !isTutor) {
      return { success: false, error: 'You are not a participant in this session' };
    }

    if (slot.status !== 'booked') {
      return { success: false, error: 'Only booked sessions can be cancelled' };
    }

    // FR-6: Cancellation allowed only when at least 2 hours remain before start
    const slotDate = new Date(`${slot.date}T${slot.time}`);
    const now = new Date();
    const diffHours = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return {
        success: false,
        error: 'Cancellation window closed: must cancel at least 2 hours prior to start',
      };
    }

    if (isLearner) {
      // Reopen slot and release learner reservation
      slot.status = 'open';
      slot.learner = undefined;
      slot.learnerNick = undefined;
      slot.tutorOk = undefined;
      slot.learnerOk = undefined;
    } else {
      // Tutor cancelled
      slot.status = 'cancelled';
    }

    this.saveToStorage(STORAGE_KEY_SLOTS, this.slots);
    return { success: true };
  }

  // ==========================================
  // MUTUAL CONFIRMATION & ESCROW (PHASE 3)
  // ==========================================

  public confirmSession(slotId: string): {
    success: boolean;
    transferred: boolean;
    message: string;
  } {
    const slot = this.slots.find((s) => s.slotId === slotId);
    if (!slot) {
      return { success: false, transferred: false, message: 'Slot not found' };
    }

    if (slot.status === 'done') {
      return {
        success: false,
        transferred: false,
        message: 'This session is already completed and credit was already transferred',
      };
    }

    if (slot.status !== 'booked') {
      return {
        success: false,
        transferred: false,
        message: 'Session is not in a booked state',
      };
    }

    const email = this.currentEmail;
    const isTutor = slot.tutor.toLowerCase() === email;
    const isLearner = slot.learner?.toLowerCase() === email;

    if (!isTutor && !isLearner) {
      return { success: false, transferred: false, message: 'You are not a participant in this session' };
    }

    // Check if user already confirmed their side (prevent duplicate click side-effects)
    if (isTutor && slot.tutorOk === 'yes') {
      return {
        success: true,
        transferred: false,
        message: 'You have already confirmed. Waiting for the learner to confirm.',
      };
    }
    if (isLearner && slot.learnerOk === 'yes') {
      return {
        success: true,
        transferred: false,
        message: 'You have already confirmed. Waiting for the tutor to confirm.',
      };
    }

    // Mark current participant's confirmation
    if (isTutor) slot.tutorOk = 'yes';
    if (isLearner) slot.learnerOk = 'yes';

    // Check if BOTH participants have now confirmed
    if (slot.tutorOk === 'yes' && slot.learnerOk === 'yes') {
      slot.status = 'done';

      const learnerEmail = slot.learner!.toLowerCase();
      const tutorEmail = slot.tutor.toLowerCase();

      // Transfer exactly 1 credit from learner to tutor in authoritative users directory
      if (this.users[learnerEmail]) {
        this.users[learnerEmail].credits = Math.max(0, this.users[learnerEmail].credits - 1);
      }
      if (this.users[tutorEmail]) {
        this.users[tutorEmail].credits += 1;
      }

      // Record exactly ONE transaction in ledger
      const tx: LedgerTransaction = {
        id: `TX${Date.now()}`,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        from: slot.learner!,
        to: slot.tutor,
        fromNick: slot.learnerNick || slot.learner!.split('@')[0],
        toNick: slot.tutorNick || slot.tutor.split('@')[0],
        credits: 1,
        slotId: slot.slotId,
        skill: slot.skill,
      };
      this.ledger = [tx, ...this.ledger];

      this.saveUsers();
      this.saveToStorage(STORAGE_KEY_SLOTS, this.slots);
      this.saveToStorage(STORAGE_KEY_LEDGER, this.ledger);

      return {
        success: true,
        transferred: true,
        message: 'Both parties confirmed! 1 Time Credit transferred successfully.',
      };
    }

    // Only one side confirmed so far
    this.saveToStorage(STORAGE_KEY_SLOTS, this.slots);
    return {
      success: true,
      transferred: false,
      message: 'Your confirmation was recorded. Waiting for the other participant to confirm.',
    };
  }

  // ==========================================
  // RATINGS & REVIEWS (PHASE 4)
  // ==========================================

  public getUserRatingSummary(email: string): UserRatingSummary {
    const cleanEmail = email.toLowerCase().trim();
    const userReviews = this.reviews.filter((r) => r.to.toLowerCase() === cleanEmail);
    if (userReviews.length === 0) {
      return { average: 5.0, count: 0 };
    }
    const sum = userReviews.reduce((acc, r) => acc + r.stars, 0);
    const avg = Number((sum / userReviews.length).toFixed(1));
    return { average: avg, count: userReviews.length };
  }

  public addRating(
    slotId: string,
    stars: number,
    comment?: string
  ): { success: boolean; error?: string } {
    const slot = this.slots.find((s) => s.slotId === slotId);
    if (!slot) {
      return { success: false, error: 'Session slot not found' };
    }

    // 1. Only completed sessions can be rated
    if (slot.status !== 'done') {
      return { success: false, error: 'Only completed sessions can be rated' };
    }

    const email = this.currentEmail;
    const isLearner = slot.learner?.toLowerCase() === email;
    const isTutor = slot.tutor.toLowerCase() === email;

    // 2. Only participants can rate
    if (!isLearner && !isTutor) {
      return { success: false, error: 'Only session participants can submit a rating' };
    }

    // 3. Prevent duplicate rating from same participant
    const existing = this.reviews.find(
      (r) => r.slotId === slotId && r.from.toLowerCase() === email
    );
    if (existing) {
      return { success: false, error: 'You have already submitted a rating for this session' };
    }

    // 4. Validate star rating
    const validStars = Math.max(1, Math.min(5, Math.round(stars)));

    const currentUser = this.getCurrentUser();
    const toEmail = isLearner ? slot.tutor : slot.learner!;

    const newReview: RatingReview = {
      id: `REV${Date.now()}`,
      slotId,
      from: currentUser.email,
      fromNick: currentUser.nick,
      to: toEmail,
      stars: validStars,
      comment: comment?.trim() || undefined,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    this.reviews = [newReview, ...this.reviews];
    this.saveToStorage(STORAGE_KEY_REVIEWS, this.reviews);
    return { success: true };
  }

  public getReviewsForUser(email?: string): RatingReview[] {
    const userEmail = (email || this.currentEmail).toLowerCase();
    return this.reviews.filter((r) => r.to.toLowerCase() === userEmail);
  }

  public getLedger(): LedgerTransaction[] {
    return [...this.ledger];
  }

  public getReviews(): RatingReview[] {
    return [...this.reviews];
  }

  // ==========================================
  // DEMO DATA RESET (PHASE 4)
  // ==========================================

  public resetToDefault(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER_EMAIL);
      localStorage.removeItem(STORAGE_KEY_USERS);
      localStorage.removeItem(STORAGE_KEY_SLOTS);
      localStorage.removeItem(STORAGE_KEY_LEDGER);
      localStorage.removeItem(STORAGE_KEY_REVIEWS);
    } catch {
      // ignore
    }

    // Reinitialize state
    const initialMap: Record<string, UserProfile> = {};
    for (const u of MOCK_USERS) {
      initialMap[u.email.toLowerCase()] = { ...u };
    }
    this.users = initialMap;
    this.currentEmail = CURRENT_USER.email.toLowerCase();
    this.slots = [...MOCK_SLOTS];
    this.ledger = [...MOCK_TRANSACTIONS];
    this.reviews = [...MOCK_REVIEWS];

    this.saveUsers();
    this.saveToStorage(STORAGE_KEY_SLOTS, this.slots);
    this.saveToStorage(STORAGE_KEY_LEDGER, this.ledger);
    this.saveToStorage(STORAGE_KEY_REVIEWS, this.reviews);
  }
}

export const mockService = new MockDataService();
