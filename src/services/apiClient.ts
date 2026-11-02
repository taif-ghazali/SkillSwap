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
      return localStorage.getItem(STORAGE_KEY_API_URL) || '';
    } catch {
      return '';
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
    return Boolean(this.apiUrl && this.apiUrl.startsWith('https://script.google.com'));
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

    try {
      const url = new URL(this.apiUrl);
      url.searchParams.set('key', this.apiKey);
      url.searchParams.set('action', action);

      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          url.searchParams.set(k, String(v));
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const json = await response.json();
      if (json.data && json.data.error) {
        return { success: false, error: json.data.error };
      }
      return { success: true, data: json.data };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network request failed. Ensure Apps Script Web App has access set to "Anyone".',
      };
    }
  }

  /**
   * Tests connection to a given URL
   */
  public async testConnection(
    testUrl: string,
    testKey: string = DEFAULT_KEY
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const url = new URL(testUrl.trim());
      url.searchParams.set('key', testKey.trim());
      url.searchParams.set('action', 'ping');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return { success: false, message: `Server returned status ${response.status}` };
      }

      const json = await response.json();
      if (json.data && json.data.error) {
        return { success: false, message: json.data.error };
      }

      return {
        success: true,
        message: 'Successfully connected to Google Apps Script Web App API!',
        data: json.data,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Connection failed. Verify Web App deployment settings.',
      };
    }
  }
}

export const apiClient = new AppsScriptApiClient();

