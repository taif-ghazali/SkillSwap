import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { MockDataService } from '../services/mockService';
import { calculateSuggestedMatches } from '../utils/matching';
import { UserProfile, SessionSlot } from '../types';

// Mock localStorage for Node test runner
const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => (key in memoryStore ? memoryStore[key] : null),
  setItem: (key: string, val: string) => {
    memoryStore[key] = String(val);
  },
  removeItem: (key: string) => {
    delete memoryStore[key];
  },
  clear: () => {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  },
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockLocalStorage;
}

describe('SkillSwap IE209 Acceptance Test Suite (T1 - T8 & Core Requirements)', () => {
  let service: MockDataService;

  beforeEach(() => {
    globalThis.localStorage.clear();
    service = new MockDataService();
    service.resetToDefault();
  });

  // T1: New user -> 2 credits (FR-1)
  it('T1: New user registration with @uohyd.ac.in email receives exactly 2 credits', () => {
    const email = 'newstudent.26cs@uohyd.ac.in';
    const result = service.loginWithEmail(email, 'New Student');

    expect(result.isNew).toBe(true);
    expect(result.user.credits).toBe(2);
    expect(result.user.email).toBe(email);

    const breakdown = service.getCreditBreakdown(email);
    expect(breakdown.total).toBe(2);
    expect(breakdown.available).toBe(2);
    expect(breakdown.reserved).toBe(0);
  });

  // T2: Book with 2 credits and 2 pending bookings -> Not enough credits (FR-5)
  it('T2: Booking is blocked when available credits (credits - pending bookings) < 1', () => {
    // Register user with 2 credits
    const email = 'learner.t2@uohyd.ac.in';
    service.loginWithEmail(email, 'Learner T2');

    // Create 3 open future slots by another tutor
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    service.loginWithEmail('tutor.t2@uohyd.ac.in', 'Tutor T2');
    const slot1 = service.createSlot({ skill: 'Skill 1', date: dateStr, time: '10:00', place: 'SCIS Lab 1' });
    const slot2 = service.createSlot({ skill: 'Skill 2', date: dateStr, time: '12:00', place: 'SCIS Lab 1' });
    const slot3 = service.createSlot({ skill: 'Skill 3', date: dateStr, time: '14:00', place: 'SCIS Lab 1' });

    // Switch back to learner with 2 credits
    service.loginWithEmail(email, 'Learner T2');

    // 1st booking succeeds (1 credit reserved, 1 credit available)
    const book1 = service.bookSlot(slot1.slotId);
    expect(book1.success).toBe(true);
    expect(service.getCreditBreakdown(email).available).toBe(1);

    // 2nd booking succeeds (2 credits reserved, 0 credits available)
    const book2 = service.bookSlot(slot2.slotId);
    expect(book2.success).toBe(true);
    expect(service.getCreditBreakdown(email).available).toBe(0);

    // 3rd booking fails: available credits is 0 (< 1 required)
    const book3 = service.bookSlot(slot3.slotId);
    expect(book3.success).toBe(false);
    expect(book3.error).toContain('Not enough available credits');
  });

  // T3: Book your own slot -> Not possible now (FR-5)
  it('T3: User cannot book their own published slot', () => {
    const tutorEmail = 'self.tutor@uohyd.ac.in';
    service.loginWithEmail(tutorEmail, 'Self Tutor');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const slot = service.createSlot({
      skill: 'Own Skill',
      date: tomorrow.toISOString().split('T')[0],
      time: '15:00',
      place: 'Library Ground Floor',
    });

    const bookResult = service.bookSlot(slot.slotId);
    expect(bookResult.success).toBe(false);
    expect(bookResult.error).toContain('cannot book your own');
  });

  // T4: Cancel 3 h before -> Slot open again (FR-6)
  it('T4: Cancellation at least 2 hours before start reopens the slot and releases credits', () => {
    // Create slot 5 hours in the future
    const futureDate = new Date(Date.now() + 5 * 36e5);
    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = `${String(futureDate.getHours()).padStart(2, '0')}:${String(futureDate.getMinutes()).padStart(2, '0')}`;

    service.loginWithEmail('tutor.t4@uohyd.ac.in', 'Tutor T4');
    const slot = service.createSlot({ skill: 'Future Skill', date: dateStr, time: timeStr, place: 'Library' });

    service.loginWithEmail('learner.t4@uohyd.ac.in', 'Learner T4');
    service.bookSlot(slot.slotId);

    // Verify slot is booked and credit is held
    expect(service.getSlotById(slot.slotId)?.status).toBe('booked');
    expect(service.getCreditBreakdown().reserved).toBe(1);

    // Cancel slot (> 2 hours remaining)
    const cancelResult = service.cancelSlot(slot.slotId);
    expect(cancelResult.success).toBe(true);

    const updatedSlot = service.getSlotById(slot.slotId);
    expect(updatedSlot?.status).toBe('open');
    expect(updatedSlot?.learner).toBeUndefined();
    expect(service.getCreditBreakdown().reserved).toBe(0);
  });

  // T5: Cancel 1 h before -> too late (FR-6)
  it('T5: Cancellation less than 2 hours before start is rejected', () => {
    // Create slot 1 hour in the future
    const nearDate = new Date(Date.now() + 1 * 36e5);
    const dateStr = nearDate.toISOString().split('T')[0];
    const timeStr = `${String(nearDate.getHours()).padStart(2, '0')}:${String(nearDate.getMinutes()).padStart(2, '0')}`;

    service.loginWithEmail('tutor.t5@uohyd.ac.in', 'Tutor T5');
    const slot = service.createSlot({ skill: 'Near Skill', date: dateStr, time: timeStr, place: 'Library' });

    service.loginWithEmail('learner.t5@uohyd.ac.in', 'Learner T5');
    service.bookSlot(slot.slotId);

    // Try to cancel with only 1 hour left
    const cancelResult = service.cancelSlot(slot.slotId);
    expect(cancelResult.success).toBe(false);
    expect(cancelResult.error).toContain('Cancellation window closed');

    // Slot remains booked
    expect(service.getSlotById(slot.slotId)?.status).toBe('booked');
  });

  // T6: Only learner confirms -> No transfer yet (FR-7)
  it('T6: When only one participant confirms, credits are not transferred yet', () => {
    const tomorrow = new Date(Date.now() + 24 * 36e5);
    const dateStr = tomorrow.toISOString().split('T')[0];

    service.loginWithEmail('tutor.t6@uohyd.ac.in', 'Tutor T6');
    const slot = service.createSlot({ skill: 'Testing Confirm', date: dateStr, time: '11:00', place: 'CIS Lab' });

    service.loginWithEmail('learner.t6@uohyd.ac.in', 'Learner T6');
    service.bookSlot(slot.slotId);

    const initialTutorCredits = service.getUser('tutor.t6@uohyd.ac.in')!.credits;
    const initialLearnerCredits = service.getUser('learner.t6@uohyd.ac.in')!.credits;
    const initialLedgerCount = service.getLedger().length;

    // Learner confirms
    const confirmRes = service.confirmSession(slot.slotId);
    expect(confirmRes.success).toBe(true);
    expect(confirmRes.transferred).toBe(false);
    expect(confirmRes.message).toContain('Waiting for the other participant');

    // Status is still booked, balances unchanged
    expect(service.getSlotById(slot.slotId)?.status).toBe('booked');
    expect(service.getUser('tutor.t6@uohyd.ac.in')!.credits).toBe(initialTutorCredits);
    expect(service.getUser('learner.t6@uohyd.ac.in')!.credits).toBe(initialLearnerCredits);
    expect(service.getLedger().length).toBe(initialLedgerCount);
  });

  // T7: Both confirm -> Learner -1, tutor +1, one Ledger row (FR-7)
  it('T7: When both participants confirm, exactly 1 credit transfers and exactly one ledger row is created', () => {
    const tomorrow = new Date(Date.now() + 24 * 36e5);
    const dateStr = tomorrow.toISOString().split('T')[0];

    service.loginWithEmail('tutor.t7@uohyd.ac.in', 'Tutor T7');
    const slot = service.createSlot({ skill: 'Complete Skill', date: dateStr, time: '14:00', place: 'Library' });

    service.loginWithEmail('learner.t7@uohyd.ac.in', 'Learner T7');
    service.bookSlot(slot.slotId);

    const initialTutorCredits = service.getUser('tutor.t7@uohyd.ac.in')!.credits;
    const initialLearnerCredits = service.getUser('learner.t7@uohyd.ac.in')!.credits;
    const initialLedgerCount = service.getLedger().length;

    // 1. Learner confirms
    service.confirmSession(slot.slotId);

    // 2. Tutor confirms
    service.loginWithEmail('tutor.t7@uohyd.ac.in', 'Tutor T7');
    const tutorConfirm = service.confirmSession(slot.slotId);

    expect(tutorConfirm.success).toBe(true);
    expect(tutorConfirm.transferred).toBe(true);

    // Slot is now marked done
    expect(service.getSlotById(slot.slotId)?.status).toBe('done');

    // Balances updated: learner -1, tutor +1
    expect(service.getUser('learner.t7@uohyd.ac.in')!.credits).toBe(initialLearnerCredits - 1);
    expect(service.getUser('tutor.t7@uohyd.ac.in')!.credits).toBe(initialTutorCredits + 1);

    // Exactly one ledger transaction recorded
    const ledger = service.getLedger();
    expect(ledger.length).toBe(initialLedgerCount + 1);
    const newTx = ledger[0];
    expect(newTx.slotId).toBe(slot.slotId);
    expect(newTx.from).toBe('learner.t7@uohyd.ac.in');
    expect(newTx.to).toBe('tutor.t7@uohyd.ac.in');
    expect(newTx.credits).toBe(1);
  });

  // T8: Confirm again -> not in booked state (no double transfer) (FR-7)
  it('T8: Subsequent confirmation attempts after completion are rejected and cannot double-transfer', () => {
    const tomorrow = new Date(Date.now() + 24 * 36e5);
    const dateStr = tomorrow.toISOString().split('T')[0];

    service.loginWithEmail('tutor.t8@uohyd.ac.in', 'Tutor T8');
    const slot = service.createSlot({ skill: 'Double Confirm Check', date: dateStr, time: '16:00', place: 'Library' });

    service.loginWithEmail('learner.t8@uohyd.ac.in', 'Learner T8');
    service.bookSlot(slot.slotId);
    service.confirmSession(slot.slotId);

    service.loginWithEmail('tutor.t8@uohyd.ac.in', 'Tutor T8');
    service.confirmSession(slot.slotId);

    // Balances after valid transfer
    const tutorCredits = service.getUser('tutor.t8@uohyd.ac.in')!.credits;
    const learnerCredits = service.getUser('learner.t8@uohyd.ac.in')!.credits;
    const ledgerCount = service.getLedger().length;

    // Attempt to confirm again as tutor
    const repeatConfirm = service.confirmSession(slot.slotId);
    expect(repeatConfirm.success).toBe(false);
    expect(repeatConfirm.transferred).toBe(false);
    expect(repeatConfirm.message).toContain('already completed');

    // Verify credits did not change again
    expect(service.getUser('tutor.t8@uohyd.ac.in')!.credits).toBe(tutorCredits);
    expect(service.getUser('learner.t8@uohyd.ac.in')!.credits).toBe(learnerCredits);
    expect(service.getLedger().length).toBe(ledgerCount);
  });

  // Profile Offers and Wants Editing (FR-2)
  it('FR-2: Profile updates sanitize and deduplicate comma-separated offers and wants', () => {
    service.loginWithEmail('profile.user@uohyd.ac.in', 'Initial Nick');
    const update = service.updateProfile({
      nick: 'Updated Nick',
      offers: ['Python', 'python', 'LaTeX', '  Git  '],
      wants: ['Figma', 'figma', 'Excel'],
    });

    expect(update.success).toBe(true);
    expect(update.user.nick).toBe('Updated Nick');
    // Case-insensitive deduplication
    expect(update.user.offers).toEqual(['Python', 'LaTeX', 'Git']);
    expect(update.user.wants).toEqual(['Figma', 'Excel']);
  });

  // Rating verification (FR-8)
  it('FR-8: Rating is allowed only after mutual confirmation and completion', () => {
    const tomorrow = new Date(Date.now() + 24 * 36e5);
    const dateStr = tomorrow.toISOString().split('T')[0];

    service.loginWithEmail('tutor.rate@uohyd.ac.in', 'Tutor Rate');
    const slot = service.createSlot({ skill: 'Rating Test', date: dateStr, time: '11:00', place: 'CIS Lab' });

    service.loginWithEmail('learner.rate@uohyd.ac.in', 'Learner Rate');
    service.bookSlot(slot.slotId);

    // Cannot rate while booked
    const prematureRating = service.addRating(slot.slotId, 5, 'Great session');
    expect(prematureRating.success).toBe(false);
    expect(prematureRating.error).toContain('Only completed sessions');

    // Both confirm
    service.confirmSession(slot.slotId);
    service.loginWithEmail('tutor.rate@uohyd.ac.in', 'Tutor Rate');
    service.confirmSession(slot.slotId);

    // Now learner can rate tutor
    service.loginWithEmail('learner.rate@uohyd.ac.in', 'Learner Rate');
    const validRating = service.addRating(slot.slotId, 5, 'Outstanding explanation of concepts!');
    expect(validRating.success).toBe(true);

    const reviews = service.getReviewsForUser('tutor.rate@uohyd.ac.in');
    expect(reviews.length).toBe(1);
    expect(reviews[0].stars).toBe(5);

    // Cannot submit duplicate rating
    const duplicateRating = service.addRating(slot.slotId, 4);
    expect(duplicateRating.success).toBe(false);
    expect(duplicateRating.error).toContain('already submitted a rating');
  });

  // Suggested Matches Algorithm (Day 12)
  it('Day 12: Calculates two-way mutual learning swaps and suggested matches', () => {
    const userA: UserProfile = {
      email: 'usera@uohyd.ac.in',
      nick: 'User A',
      offers: ['Python', 'Django'],
      wants: ['Figma', 'UI/UX'],
      credits: 2,
    };

    const userB: UserProfile = {
      email: 'userb@uohyd.ac.in',
      nick: 'User B',
      offers: ['Figma', 'Wireframing'],
      wants: ['Python', 'FastAPI'],
      credits: 2,
    };

    const userC: UserProfile = {
      email: 'userc@uohyd.ac.in',
      nick: 'User C',
      offers: ['French'],
      wants: ['Cooking'],
      credits: 2,
    };

    const matches = calculateSuggestedMatches(userA, [userA, userB, userC], []);
    expect(matches.length).toBe(1); // User B matches, User C does not
    expect(matches[0].peer.email).toBe('userb@uohyd.ac.in');
    expect(matches[0].isTwoWayMatch).toBe(true);
    expect(matches[0].peerOffersIWant).toContain('Figma');
    expect(matches[0].iOfferPeerWants).toContain('Python');
  });

  // Misconduct Reporting (Section 8)
  it('Section 8: Submitting a misconduct report logs an incident with a pending review status', () => {
    service.loginWithEmail('student.reporting@uohyd.ac.in', 'Reporter');
    const report = service.reportMisconduct({
      targetId: 'SL101',
      targetType: 'slot',
      reason: 'academic_integrity',
      details: 'Offered to write assignment solutions for credits',
    });

    expect(report.success).toBe(true);
    expect(report.reportId).toMatch(/^REP\d+/);
  });
});
