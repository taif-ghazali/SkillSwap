import { UserProfile, SessionSlot } from '../types';

export interface SuggestedMatch {
  peer: UserProfile;
  peerOffersIWant: string[];
  iOfferPeerWants: string[];
  isTwoWayMatch: boolean;
  score: number; // 1 to 100
  matchingSlots: SessionSlot[];
}

/**
 * Calculates suggested peer matches based on "my wants <-> others' offers"
 * and identifies two-way mutual learning swaps ("Two-Way Street")
 */
export function calculateSuggestedMatches(
  currentUser: UserProfile,
  allUsers: UserProfile[],
  allOpenSlots: SessionSlot[]
): SuggestedMatch[] {
  const myWants = (currentUser.wants || []).map(w => w.toLowerCase().trim()).filter(Boolean);
  const myOffers = (currentUser.offers || []).map(o => o.toLowerCase().trim()).filter(Boolean);
  const currentEmail = currentUser.email.toLowerCase().trim();

  const matches: SuggestedMatch[] = [];

  for (const peer of allUsers) {
    if (peer.email.toLowerCase().trim() === currentEmail) continue;

    const peerOffers = (peer.offers || []).map(o => o.toLowerCase().trim()).filter(Boolean);
    const peerWants = (peer.wants || []).map(w => w.toLowerCase().trim()).filter(Boolean);

    // 1. What does peer offer that I want?
    const peerOffersIWant = (peer.offers || []).filter(rawOffer => {
      const o = rawOffer.toLowerCase().trim();
      return myWants.some(want => o.includes(want) || want.includes(o));
    });

    // 2. What do I offer that peer wants?
    const iOfferPeerWants = (currentUser.offers || []).filter(rawOffer => {
      const o = rawOffer.toLowerCase().trim();
      return peerWants.some(want => o.includes(want) || want.includes(o));
    });

    // Only include if there is at least one match
    if (peerOffersIWant.length > 0 || iOfferPeerWants.length > 0) {
      const isTwoWayMatch = peerOffersIWant.length > 0 && iOfferPeerWants.length > 0;

      // Calculate matching open future slots published by this peer
      const matchingSlots = allOpenSlots.filter(
        slot => slot.tutor.toLowerCase() === peer.email.toLowerCase() && slot.status === 'open'
      );

      // Scoring formula:
      // Base score: 40 points for 1-way match, 80 points for 2-way match
      // Bonus: +10 points per matching skill, +10 points if they have active open slots
      let score = isTwoWayMatch ? 80 : 40;
      score += Math.min(20, (peerOffersIWant.length + iOfferPeerWants.length) * 5);
      if (matchingSlots.length > 0) score += 10;
      score = Math.min(99, score);

      matches.push({
        peer,
        peerOffersIWant,
        iOfferPeerWants,
        isTwoWayMatch,
        score,
        matchingSlots
      });
    }
  }

  // Sort descending by match score, prioritizing two-way swaps
  return matches.sort((a, b) => {
    if (a.isTwoWayMatch && !b.isTwoWayMatch) return -1;
    if (!a.isTwoWayMatch && b.isTwoWayMatch) return 1;
    return b.score - a.score;
  });
}

