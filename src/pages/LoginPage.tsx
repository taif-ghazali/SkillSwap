import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BackendConfigModal } from '../components/ui/BackendConfigModal';
import { appService } from '../services/appService';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import { ShieldCheck, Mail, User, ArrowRight, Settings2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [showConfig, setShowConfig] = useState(false);
  const [email, setEmail] = useState(user.email || '');
  const [nick, setNick] = useState(user.nick || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your university email address.');
      return;
    }

    if (!cleanEmail.endsWith('@uohyd.ac.in')) {
      setError('Only University of Hyderabad accounts (@uohyd.ac.in) are eligible.');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanEmail, nick.trim() || undefined);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoUser = async (demoEmail: string, demoNick: string) => {
    setEmail(demoEmail);
    setNick(demoNick);
    appService.activateDemo();
    await login(demoEmail, demoNick);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F6F7F3] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top Navigation Bar with Backend Config Pill */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/SkillSwapLogo.png" alt="SkillSwap" className="h-7 w-auto object-contain" />
        </div>
        <button
          type="button"
          onClick={() => setShowConfig(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#1F5240] border border-[#DDE3DE] shadow-2xs hover:bg-[#E4ECE5]/50 transition-all active:scale-95 cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                appService.isLive() ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                appService.isLive() ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
          </span>
          <span>{appService.isLive() ? 'Live Mode' : 'Demo Mode'}</span>
          <Settings2 className="w-3.5 h-3.5 text-[#6B7570] ml-0.5" />
        </button>
      </div>

      <BackendConfigModal isOpen={showConfig} onClose={() => setShowConfig(false)} />

      {/* Hero Header: Exact copy from Screen1.scm */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 pt-4 text-center">
        <img
          src="/SkillSwapLogo.png"
          alt="SkillSwap Logo"
          className="h-16 w-auto object-contain mx-auto mb-3"
        />
        <h1 className="text-3xl font-black text-[#1F5240] tracking-tight">
          SkillSwap
        </h1>
        <p className="mt-1 text-sm font-semibold text-[#6B7570]">
          Teach what you know, learn what you need
        </p>
        <h2 className="mt-3 text-xl font-bold text-[#1E2A24]">
          Share a skill. Learn something new.
        </h2>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="shadow-card border-[#DDE3DE] p-7 sm:p-8 bg-white rounded-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Input
                label="University Email"
                id="email"
                type="email"
                placeholder="Enter your university email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-[#6B7570]" />}
                helperText="Sign in with your university email to get started."
                error={error}
                required
              />
            </div>

            <div>
              <Input
                label="Nickname"
                id="nick"
                type="text"
                placeholder="Enter Nickname"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-[#6B7570]" />}
                helperText="Your nickname and skills are visible to campus peers."
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full shadow-sm bg-[#1F5240] hover:bg-[#174032] text-white font-bold py-3 text-base rounded-xl transition-all active:scale-98"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Login
              </Button>
            </div>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-[#DDE3DE]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7570] text-center mb-3">
              Fast Demo Accounts (IE209 Evaluation)
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoUser('ravi.23mcse01@uohyd.ac.in', 'Ravi Teja')}
                className="p-3 border border-[#DDE3DE] rounded-xl hover:border-[#1F5240] hover:bg-[#E4ECE5]/40 text-left transition-all active:scale-98 cursor-pointer group shadow-2xs bg-white"
              >
                <div className="font-bold text-[#1E2A24] group-hover:text-[#1F5240]">Ravi Teja</div>
                <div className="text-[10px] text-[#6B7570] truncate mt-0.5">M.Tech CS &bull; ⏱ 2 credits</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoUser('sneha.des@uohyd.ac.in', 'Sneha Rao')}
                className="p-3 border border-[#DDE3DE] rounded-xl hover:border-[#1F5240] hover:bg-[#E4ECE5]/40 text-left transition-all active:scale-98 cursor-pointer group shadow-2xs bg-white"
              >
                <div className="font-bold text-[#1E2A24] group-hover:text-[#1F5240]">Sneha Rao</div>
                <div className="text-[10px] text-[#6B7570] truncate mt-0.5">Design &bull; ⏱ 3 credits</div>
              </button>
            </div>
          </div>
        </Card>

        {/* Academic Integrity Rule Footer */}
        <div className="mt-4">
          <AcademicIntegrityBanner />
        </div>
      </div>
    </div>
  );
};