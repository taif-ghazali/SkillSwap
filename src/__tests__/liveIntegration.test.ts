import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient, AppsScriptApiClient } from '../services/apiClient';
import { AppService } from '../services/appService';

const memory: Record<string, string> = {};
const storage = { getItem: (k: string) => memory[k] || null, setItem: (k: string, v: string) => { memory[k] = v; }, removeItem: (k: string) => { delete memory[k]; }, clear: () => { Object.keys(memory).forEach(k => delete memory[k]); }, length: 0, key: () => null };
const user = { email: 'existing@uohyd.ac.in', nick: 'Existing', offers: ['Python'], wants: ['Excel'], credits: 2 };
const slot = { slotId: 'test-slot', tutor: 'tutor@uohyd.ac.in', learner: '', skill: 'Excel', date: '2030-01-01', time: '10:00', place: 'Library', status: 'open' };

beforeEach(() => { vi.stubGlobal('localStorage', storage); storage.clear(); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('live service contract using isolated responses (no live calls)', () => {
  function backend() {
    let booked = false;
    return vi.spyOn(apiClient, 'call').mockImplementation(async (action, params) => {
      const data: any = action === 'login' ? user : action === 'mine' ? { credits: 2, nick: user.nick, slots: booked ? [{ ...slot, learner: user.email, status: 'booked' }] : [] } : action === 'search' ? booked ? [] : [slot] : action === 'dashboard' ? { usersCount: 2, completedCount: 0, openCount: 1, bookedCount: 0, popularSkills: [], topWantedSkills: [], topOfferedSkills: [], popularVenues: [] } : action === 'publish' ? { ok: true, slotId: 'published-slot' } : action === 'profile' ? { ok: true, nick: 'Updated', offers: 'Python, Excel', wants: 'Figma' } : { ok: true, transferred: action === 'confirm' };
      if (action === 'book') booked = true;
      return { success: true, data };
    });
  }
  it('keeps sessions and wallet when dashboard fails', async () => {
    const calls = backend();
    const respond = calls.getMockImplementation()!;
    calls.mockImplementation((action, params) => action === 'dashboard'
      ? Promise.resolve({ success: false, error: 'Server returned HTTP 503.' })
      : respond(action, params));
    const service = new AppService();
    await service.loginWithEmail(user.email);
    expect(service.searchOpenSlots()).toHaveLength(1);
    expect(service.getCreditBreakdown().total).toBe(2);
    expect(service.dashboard).toBeNull();
    expect(service.error).toContain('HTTP 503');
  });
  it('defaults to live mode with no fabricated user or slots', () => {
    const service = new AppService(); expect(service.isLive()).toBe(true); expect(service.getCurrentUser().email).toBe(''); expect(service.searchOpenSlots()).toEqual([]);
  });
  it('login loads profile, slots and authoritative wallet; booking refreshes reservation', async () => {
    const calls = backend(), service = new AppService(); await service.loginWithEmail(user.email);
    expect(service.getCurrentUser().offers).toEqual(['Python']); expect(service.searchOpenSlots()).toHaveLength(1);
    expect((await service.bookSlot(slot.slotId)).success).toBe(true);
    expect(service.getCreditBreakdown()).toEqual({ total: 2, reserved: 1, available: 1 });
    expect(calls).toHaveBeenCalledWith('book', { email: user.email, slot: slot.slotId });
  });
  it('profile and publishing send editable details', async () => {
    const calls = backend(), service = new AppService(); await service.loginWithEmail(user.email);
    await service.updateProfile({ nick: 'Updated', offers: ['Python', 'Excel'], wants: ['Figma'], bio: 'Peer tutor' });
    expect(calls).toHaveBeenCalledWith('profile', { email: user.email, nick: 'Updated', offers: 'Python, Excel', wants: 'Figma', bio: 'Peer tutor' });
    expect(service.getCurrentUser().wants).toEqual(['Figma']);
    await service.createSlot({ skill: 'Excel', date: slot.date, time: slot.time, place: slot.place, category: 'Math & Science', description: 'Bring a calculator.' });
    expect(calls).toHaveBeenCalledWith('publish', { email: user.email, skill: 'Excel', date: slot.date, time: slot.time, place: slot.place, category: 'Math & Science', description: 'Bring a calculator.' });
  });
  it('cancel, confirm and rating use slot/stars and never change credits locally', async () => {
    const calls = backend(), service = new AppService(); await service.loginWithEmail(user.email);
    await service.cancelSlot(slot.slotId); const result = await service.confirmSession(slot.slotId); await service.addRating(slot.slotId, 4, 'unsupported comment');
    expect(result.transferred).toBe(true); expect(service.getCreditBreakdown().total).toBe(2);
    expect(calls).toHaveBeenCalledWith('cancel', { email: user.email, slot: slot.slotId });
    expect(calls).toHaveBeenCalledWith('rate', { email: user.email, slot: slot.slotId, stars: 4 });
    expect(service.getLedger()).toEqual([]); expect(service.getSuggestedMatches()).toEqual([]);
  });
  it('backend errors remain errors with no demo fallback', async () => {
    vi.spyOn(apiClient, 'call').mockResolvedValue({ success: false, error: 'bad key' });
    const service = new AppService(); await expect(service.loginWithEmail(user.email)).rejects.toThrow('bad key');
    expect(service.error).toBe('bad key'); expect(service.getCurrentUser().email).toBe(''); expect(service.searchOpenSlots()).toEqual([]);
  });
  it('does not auto-create accounts or call login on reload', async () => {
    const calls = backend(); storage.setItem('skillswap_live_email', user.email); await new AppService().restore(); expect(calls).not.toHaveBeenCalled();
  });
  it('blocks duplicate transactions while a request is pending', async () => {
    const calls = backend(), service = new AppService(); await service.loginWithEmail(user.email);
    let release!: (r: any) => void;
    calls.mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
    const pending = service.bookSlot(slot.slotId);
    expect((await service.bookSlot(slot.slotId)).success).toBe(false);
    release({ success: true, data: { ok: true } }); await pending;
  });
});

describe('HTTP adapter validation (fetch is stubbed)', () => {
  const endpoint = 'https://script.google.com/macros/s/test-deployment/exec';
  it.each(['02:45','09:05','12:30','18:45'])('sends publish time %s unchanged as an encoded string', async time => {
    const client = new AppsScriptApiClient(); client.saveConfig(endpoint);
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ action: 'publish', data: { ok: true, slotId: 'time-test' } }) });
    vi.stubGlobal('fetch', fetch);
    expect((await client.call('publish', { email: user.email, skill: 'Time test', date: '2030-01-02', time, place: 'Library' })).success).toBe(true);
    const request = new URL(fetch.mock.calls[0][0]);
    expect(request.searchParams.get('time')).toBe(time);
    expect(request.search).toContain('time=' + encodeURIComponent(time));
  });
  it('encodes parameters and authenticates ping without exposing a URL in errors', async () => {
    const client = new AppsScriptApiClient(); client.saveConfig(endpoint);
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ action: 'ping', data: { status: 'healthy' } }) }); vi.stubGlobal('fetch', fetch);
    expect((await client.testConnection(endpoint)).success).toBe(true);
    const url = new URL(fetch.mock.calls[0][0]); expect(url.searchParams.get('key')).toBe(client.getStoredKey()); expect(url.searchParams.get('action')).toBe('ping');
  });
  it('rejects malformed envelopes, bad keys, and wrong health status', async () => {
    const client = new AppsScriptApiClient();
    for (const body of [{ action: 'other', data: {} }, { action: 'ping' }, { action: 'ping', data: { error: 'bad key' } }, { action: 'ping', data: { status: 'unhealthy' } }]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => body })); expect((await client.testConnection(endpoint)).success).toBe(false);
    }
  });
  it('accepts the university-domain deployment URL format', async () => {
    const client = new AppsScriptApiClient();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ action: 'ping', data: { status: 'healthy' } }) }));
    expect((await client.testConnection('https://script.google.com/a/macros/uohyd.ac.in/s/test-deployment/exec')).success).toBe(true);
  });
  it('refuses lookalike endpoints, queries with credentials and non-HTTPS URLs', async () => {
    const client = new AppsScriptApiClient(), fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    for (const url of [endpoint.replace('script.google.com', 'script.google.com.attacker.example'), endpoint + '?key=private', endpoint.replace('https:', 'http:')]) expect((await client.testConnection(url)).success).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('does not return fetch error text containing the authenticated URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(Error('private URL must not appear')));
    const result = await new AppsScriptApiClient().testConnection(endpoint); expect(result.success).toBe(false); expect(result.message).not.toContain('private URL');
  });
});
