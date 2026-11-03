/**
 * ============================================================================
 * SKILLSWAP UoH - LIVE GOOGLE APPS SCRIPT WEB APP CLIENT
 * ============================================================================
 * Handles communication with the Google Apps Script Web App API.
 * Uses JSONP / standard fetch depending on environment, and handles CORS safely.
 */

const STORAGE_KEY_API_URL = 'skillswap_apps_script_url';
const STORAGE_KEY_API_KEY = 'skillswap_apps_script_key';
const DEFAULT_KEY = 'team-secret-123';

export interface ApiResponse<T = any> {
  action: string;
  data: T;
  error?: string;
}

export class AppsScriptApiClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = this.getStoredUrl();
    this.apiKey = this.getStoredKey();
  }

  public getStoredUrl(): string {
    try {
      return localStorage.getItem(STORAGE_KEY_API_URL) || import.meta.env.VITE_APPS_SCRIPT_URL || '';
    } catch {
      return import.meta.env.VITE_APPS_SCRIPT_URL || '';
    }
  }

  public getStoredKey(): string {
    try {
      return localStorage.getItem(STORAGE_KEY_API_KEY) || DEFAULT_KEY;
    } catch {
      return DEFAULT_KEY;
    }
  }

  public saveConfig(url: string, key?: string): void {
    this.apiUrl = url.trim();
    this.apiKey = (key || DEFAULT_KEY).trim();
    try {
      if (this.apiUrl) {
        localStorage.setItem(STORAGE_KEY_API_URL, this.apiUrl);
      } else {
        localStorage.removeItem(STORAGE_KEY_API_URL);
      }
      localStorage.setItem(STORAGE_KEY_API_KEY, this.apiKey);
    } catch {
      // ignore
    }
  }

  public clearConfig(): void {
    this.apiUrl = '';
    this.apiKey = DEFAULT_KEY;
    try {
      localStorage.removeItem(STORAGE_KEY_API_URL);
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    } catch {
      // ignore
    }
  }

  public isConfigured(): boolean {
    return this.validEndpoint(this.apiUrl);
  }

  private validEndpoint(value: string): boolean {
    try {
      const url = new URL(value);
      return url.origin === 'https://script.google.com' && /^\/(?:macros|a\/macros\/[A-Za-z0-9.-]+)\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) && !url.search && !url.hash && !url.username && !url.password;
    } catch { return false; }
  }

  private async request<T>(endpoint: string, key: string, action: string, params: Record<string, string | number> = {}): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!this.validEndpoint(endpoint)) return { success: false, error: 'Enter a Google Apps Script /exec URL without query parameters.' };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const url = new URL(endpoint);
      Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, String(value)));
      url.searchParams.set('key', key);
      url.searchParams.set('action', action);
      const response = await fetch(url.toString(), { signal: controller.signal, redirect: 'follow', headers: { Accept: 'application/json' } });
      if (!response.ok) return { success: false, error: `Server returned HTTP ${response.status}.` };
      const json = await response.json();
      if (!json || json.action !== action || !Object.prototype.hasOwnProperty.call(json, 'data') || json.data == null) return { success: false, error: 'Unexpected server response.' };
      if (json.data.error) return { success: false, error: String(json.data.error) };
      return { success: true, data: json.data };
    } catch {
      return { success: false, error: controller.signal.aborted ? 'Request timed out. Refresh session data before retrying an action.' : 'Unable to read the server response. Check your connection and deployment access, then refresh before retrying.' };
    } finally { clearTimeout(timer); }
  }

  /**
   * Performs an API call to the Google Apps Script Web App
   */
  public async call<T = any>(
    action: string,
    params: Record<string, string | number> = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Live backend URL is not configured' };
    }

    return this.request<T>(this.apiUrl, this.apiKey, action, params);

  }

  /**
   * Tests connection to a given URL
   */
  public async testConnection(
    testUrl: string,
    testKey: string = DEFAULT_KEY
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const result = await this.request<{ status: string }>(testUrl.trim(), testKey.trim(), 'ping');
    const success = result.success && result.data?.status === 'healthy';
    return { success, message: success ? 'Authenticated connection verified.' : result.error || 'Server health check failed.' };
  }
}

export const apiClient = new AppsScriptApiClient();
