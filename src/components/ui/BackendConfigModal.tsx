import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { apiClient } from '../../services/apiClient';
import {
  Server,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
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

  const handleSave = () => {
    apiClient.saveConfig(url, key);
    setTestResult({
      success: true,
      message: 'Backend settings saved. The app will communicate with your Google Sheet API.',
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    apiClient.clearConfig();
    setUrl('');
    setTestResult({
      success: true,
      message: 'Reverted to built-in local state mode with verified seed data.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 bg-white shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Backend &amp; Database Settings</h3>
            <p className="text-xs text-slate-500">
              IE209 Architecture: Google Apps Script Web App + Google Sheets
            </p>
          </div>
        </div>

        {/* Current Mode Badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Active Mode:</span>
            {apiClient.isConfigured() ? (
              <Badge variant="success">Live Google Apps Script Web App</Badge>
            ) : (
              <Badge variant="brand">Local State Engine (Offline / Demo)</Badge>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            {apiClient.isConfigured() ? 'Cloud Synced' : 'Zero Network Latency'}
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
              helperText="Deploy Code.gs & InitSheet.gs as Web App (Execute as Me, Access: Anyone)"
            />
          </div>

          <div>
            <Input
              label="API Shared Secret Key"
              id="apiKey"
              type="password"
              placeholder="team-secret-123"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              helperText="Matches const KEY = 'team-secret-123' at the top of Code.gs"
            />
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-slate-500"
          >
            Use Local Demo Mode
          </Button>

          <div className="flex items-center gap-2">
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
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

