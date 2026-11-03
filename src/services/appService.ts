import { apiClient } from './apiClient';
import { mockService } from './mockService';
import { UserProfile, SessionSlot, LedgerTransaction, RatingReview } from '../types';

const blankUser = (): UserProfile => ({ email: '', nick: '', offers: [], wants: [], credits: 0 });
const stored = (key: string) => { try { return localStorage.getItem(key) || ''; } catch { return ''; } };
const store = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* session can still run in memory */ } };
const split = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : String(value || '').split(',').map(s => s.trim()).filter(Boolean);

export class AppService {
  private user = blankUser();
  private slots: SessionSlot[] = [];
  private mine: SessionSlot[] = [];
  private listeners = new Set<() => void>();
  private inFlight = false;
  error = '';
  dashboard: ReturnType<typeof mockService.getCampusAnalytics> | null = null;
  isLive = () => stored('skillswap_mode') !== 'demo';
  isBusy = () => this.inFlight;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private notify = () => this.listeners.forEach(fn => fn());
  private clear() { this.user = blankUser(); this.slots = []; this.mine = []; this.dashboard = null; this.error = ''; }
  activateLive() { store('skillswap_mode', 'live'); store('skillswap_live_email', ''); this.clear(); this.notify(); }
  activateDemo() { store('skillswap_mode', 'demo'); this.clear(); this.notify(); }
  logout() { store('skillswap_live_email', ''); this.clear(); this.notify(); }
  getCurrentUser = () => this.isLive() ? this.user : mockService.getCurrentUser();
  getCreditBreakdown = (_email?: string) => {
    if (!this.isLive()) return mockService.getCreditBreakdown(_email);
    const reserved = this.mine.filter(s => s.learner === this.user.email && s.status === 'booked').length;
    return { total: this.user.credits, reserved, available: Math.max(0, this.user.credits - reserved) };
  };
  getMySlots = () => this.isLive() ? { teaching: this.mine.filter(s => s.tutor === this.user.email), learning: this.mine.filter(s => s.learner === this.user.email) } : mockService.getMySlots();
  searchOpenSlots = (query = '', category = 'all') => this.isLive() ? this.slots.filter(s => s.skill.toLowerCase().includes(query.toLowerCase()) && (category === 'all' || s.category === category)) : mockService.searchOpenSlots(query, category);
  getLedger = (): LedgerTransaction[] => this.isLive() ? [] : mockService.getLedger();
  getReviewsForUser = (email?: string): RatingReview[] => this.isLive() ? [] : mockService.getReviewsForUser(email);
  getUserRatingSummary = (email: string) => this.isLive() ? { count: 0, average: 0 } : mockService.getUserRatingSummary(email);
  getSuggestedMatches = () => this.isLive() ? [] : mockService.getSuggestedMatches();
  getCampusAnalytics = () => mockService.getCampusAnalytics(); // demo-only caller, live view uses dashboard response
  getSlotById = (id: string) => this.isLive() ? [...this.mine, ...this.slots].find(s => s.slotId === id) : mockService.getSlotById(id);
  private slot(raw: any): SessionSlot {
    if (!raw || !['slotId','tutor','skill','date','time','place','status'].every(k => typeof raw[k] === 'string') || !['open','booked','done','cancelled'].includes(raw.status)) throw Error('Invalid session data returned by server.');
    return { ...raw, tutor: raw.tutor.toLowerCase(), learner: raw.learner?.toLowerCase() || undefined, tutorNick: raw.tutor.split('@')[0], learnerNick: raw.learner?.split('@')[0], creditsCost: 1 };
  }
  private async request(action: string, params: Record<string, string | number> = {}) {
    const result = await apiClient.call(action, { email: this.user.email, ...params });
    if (!result.success) throw Error(result.error || 'Request failed.');
    return result.data;
  }
  private async load() {
    if (!this.user.email) return;
    const data = await this.request('mine');
    if (!data || !Array.isArray(data.slots) || !Number.isFinite(Number(data.credits))) throw Error('Invalid wallet or session response.');
    const mine = data.slots.map((s: any) => this.slot(s));
    const search = await this.request('search', { skill: '' });
    if (!Array.isArray(search)) throw Error('Invalid search response.');
    this.mine = mine; this.slots = search.map(s => this.slot(s));
    this.user = { ...this.user, credits: Number(data.credits), nick: data.nick || this.user.nick, bio: data.bio ?? this.user.bio };
    try {
      const dashboard = await this.request('dashboard');
      if (!dashboard || !['usersCount','completedCount','openCount','bookedCount'].every(k => Number.isFinite(dashboard[k]))) throw Error('Invalid analytics response.');
      const validList = (list: unknown, label: string) => Array.isArray(list) && list.every(
        row => row && typeof row[label] === 'string' && Number.isInteger(row.count) && row.count > 0
      );
      if (!validList(dashboard.topWantedSkills, 'skill') || !validList(dashboard.topOfferedSkills, 'skill') || !validList(dashboard.popularVenues, 'venue')) {
        throw Error('The backend did not return the campus analytics lists.');
      }
      this.dashboard = {
        totalUsers: dashboard.usersCount,
        totalHoursExchanged: dashboard.completedCount,
        activeOpenSlots: dashboard.openCount,
        completedSessions: dashboard.completedCount,
        bookedSessions: dashboard.bookedCount,
        topWantedSkills: dashboard.topWantedSkills,
        topOfferedSkills: dashboard.topOfferedSkills,
        popularVenues: dashboard.popularVenues,
      };
    } catch (error) {
      this.dashboard = null;
      this.error = 'Session data loaded, but campus analytics could not be refreshed. ' + (error instanceof Error ? error.message : 'Try refreshing again.');
    }
  }
  private async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.inFlight) throw Error('Please wait for the current request.');
    this.inFlight = true; this.error = ''; this.notify();
    try { return await task(); }
    catch (err) { this.error = err instanceof Error ? err.message : 'Request failed.'; throw err; }
    finally { this.inFlight = false; this.notify(); }
  }
  async restore() {
    // Explicit sign-in retrieves the complete profile. There is no read-only
    // profile endpoint, and login can create accounts, so never auto-call it.
    return;
  }
  async refresh() {
    if (!this.isLive()) { this.notify(); return; }
    await this.run(() => this.load());
  }
  async loginWithEmail(email: string, nick?: string) {
    if (!this.isLive()) { const result = mockService.loginWithEmail(email, nick); this.notify(); return result; }
    return this.run(async () => {
      const data = await this.request('login', { email: email.trim().toLowerCase(), nick: nick || '' });
      if (!data || typeof data.email !== 'string' || !Number.isFinite(Number(data.credits))) throw Error('Invalid login response.');
      this.clear();
      this.user = { email: data.email.toLowerCase(), nick: String(data.nick || nick || ''), credits: Number(data.credits), offers: split(data.offers), wants: split(data.wants), bio: data.bio || '' };
      store('skillswap_live_email', this.user.email);
      await this.load();
      return { user: this.user, isNew: Boolean(data.isNew) };
    });
  }
  private async mutate(action: string, params: Record<string, string | number>): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      return await this.run(async () => {
        if (!this.user.email) throw Error('Sign in before changing data.');
        const data = await this.request(action, params);
        if (!data || (action === 'publish' ? typeof data.slotId !== 'string' : data.ok !== true)) throw Error('Unexpected transaction response; refresh before retrying.');
        try { await this.load(); } catch { this.error = 'Action saved, but refresh failed. Refresh before making another change.'; }
        return { success: true, data };
      });
    } catch (err) { return { success: false, error: err instanceof Error ? err.message : 'Request failed.', data: undefined }; }
  }
  async updateProfile(params: Parameters<typeof mockService.updateProfile>[0]) {
    if (!this.isLive()) { const result = mockService.updateProfile(params); this.notify(); return result; }
    const result = await this.mutate('profile', { nick: params.nick || this.user.nick, offers: params.offers.join(', '), wants: params.wants.join(', '), ...(params.bio === undefined ? {} : { bio: params.bio }) });
    if (result.success) { this.user = { ...this.user, nick: result.data.nick, offers: split(result.data.offers), wants: split(result.data.wants), bio: result.data.bio || '' }; this.notify(); }
    return result;
  }
  async createSlot(params: Parameters<typeof mockService.createSlot>[0]) {
    if (!this.isLive()) { const result = mockService.createSlot(params); this.notify(); return result; }
    const result = await this.mutate('publish', { skill: params.skill, date: params.date, time: params.time, place: params.place, category: params.category || '', description: params.description || '' });
    if (!result.success) throw Error(result.error);
    return { ...params, slotId: result.data.slotId, tutor: this.user.email, tutorNick: this.user.nick, status: 'open' as const, creditsCost: 1 };
  }
  async bookSlot(slot: string) { if (!this.isLive()) { const r = mockService.bookSlot(slot); this.notify(); return r; } return this.mutate('book', { slot }); }
  async cancelSlot(slot: string) { if (!this.isLive()) { const r = mockService.cancelSlot(slot); this.notify(); return r; } return this.mutate('cancel', { slot }); }
  async confirmSession(slot: string) {
    if (!this.isLive()) { const r = mockService.confirmSession(slot); this.notify(); return r; }
    const r = await this.mutate('confirm', { slot });
    return { success: r.success, transferred: Boolean(r.data?.transferred), message: r.success ? r.data.transferred ? 'Both confirmed: one credit transferred.' : 'Waiting for the other participant to confirm.' : r.error || 'Confirmation failed.' };
  }
  async addRating(slot: string, stars: number, comment?: string) { if (!this.isLive()) { const r = mockService.addRating(slot, stars, comment); this.notify(); return r; } return this.mutate('rate', { slot, stars }); }
  async reportMisconduct(params: Parameters<typeof mockService.reportMisconduct>[0]) {
    if (!this.isLive()) return { ...mockService.reportMisconduct(params), error: undefined };
    const r = await this.mutate('report', { target: params.targetId, reason: [params.reason, params.details].filter(Boolean).join(': ') });
    return { success: r.success, reportId: r.data?.reportId || '', error: r.error };
  }
  resetToDefault() { if (this.isLive()) return; mockService.resetToDefault(); this.notify(); }
}
export const appService = new AppService();
