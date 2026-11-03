import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { apiClient } from '../../services/apiClient';
import { appService } from '../../services/appService';
import {
  Server,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  ShieldCheck
} from 'lucide-react';

export interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(apiClient.getStoredUrl());
  const [key, setKey] = useState(apiClient.getStoredKey());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide a valid Google Apps Script Web App URL ending with /exec',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await apiClient.testConnection(url, key);
    setIsTesting(false);
    setTestResult({
      success: res.success,
      message: res.message,
    });
  };

  const handleSave = async () => {
    setIsTesting(true);
    const result = await apiClient.testConnection(url, key);
    setIsTesting(false);
    if (!result.success) { setTestResult(result); return; }
    apiClient.saveConfig(url, key);
    appService.activateLive();
    setTestResult({
      success: true,
      message: 'Authenticated backend saved. Sign in to use live data.',
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    apiClient.clearConfig();
    appService.activateDemo();
    setUrl('');
    setTestResult({
      success: true,
      message: 'Reverted to built-in local state mode with verified seed data.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 sm:p-7 bg-white shadow-elevated relative animate-fade-in border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-200/80 text-brand-600 flex items-center justify-center shadow-2xs">
            <Database className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Backend &amp; Database Settings</h3>
            <p className="text-xs text-slate-500">
              IE209 Architecture: Google Apps Script Web App API + Google Sheets
            </p>
          </div>
        </div>

        {/* Current Mode Badge */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 mb-5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Active Mode:</span>
            {appService.isLive() && apiClient.isConfigured() ? (
              <Badge variant="success">Live Google Apps Script API</Badge>
            ) : (
              <Badge variant="brand">{appService.isLive() ? 'Live mode: configure endpoint' : 'Local demo mode'}</Badge>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {appService.isLive() ? 'Sign in after configuration' : 'Local data only'}
          </span>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <Input
              label="Google Apps Script Web App URL"
              id="appsScriptUrl"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              helperText="Enter the deployed /exec URL without query parameters."
            />
          </div>

          <div>
            <Input
              label="API Shared Secret Key"
              id="apiKey"
              type="password"
              placeholder="Existing backend key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              helperText="Use the key configured in the deployed backend."
            />
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-[#DDF7EB] border-[#bdf1d9] text-[#0A6B5B]'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="font-semibold">{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-slate-500 w-full sm:w-auto"
          >
            Reset to Demo Mode
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />}
              onClick={handleTest}
              isLoading={isTesting}
            >
              Test Connection
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isTesting}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
