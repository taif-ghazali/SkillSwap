import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AcademicIntegrityBanner } from '../components/shared/AcademicIntegrityBanner';
import { ShieldCheck, Mail, User, ArrowRight, Sparkles, Clock, CheckCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user.email || '');
  const [nick, setNick] = useState(user.nick || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      login(cleanEmail, nick.trim() || undefined);
      setIsLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  const handleQuickDemoUser = (demoEmail: string, demoNick: string) => {
    setEmail(demoEmail);
    setNick(demoNick);
    login(demoEmail, demoNick);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-brand-500/30">
            S
          </div>
        </div>
        <h2 className="text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          SkillSwap UoH
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          School of Computer & Information Sciences &bull; University of Hyderabad
        </p>
        <p className="mt-2 text-center text-xs font-medium text-slate-600 bg-amber-50 border border-amber-200/60 rounded-full py-1 px-3 max-w-xs mx-auto">
          ✨ Teach what you know &bull; Learn what you need
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200/90 p-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Input
                label="University Email"
                id="email"
                type="email"
                placeholder="name.rollno@uohyd.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Must end with @uohyd.ac.in (New accounts receive 2 time credits)"
                error={error}
                required
              />
            </div>

            <div>
              <Input
                label="Campus Nickname (Public)"
                id="nick"
                type="text"
                placeholder="e.g. Ravi, Sneha, Dev"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                helperText="Profiles show your nickname, never personal phone numbers"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Enter Campus Marketplace
              </Button>
            </div>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick Test Profiles (Phase 1)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoUser('ravi.23mcse01@uohyd.ac.in', 'Ravi Teja')}
                className="p-2 border border-slate-200 rounded-lg hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all"
              >
                <div className="font-semibold text-slate-800">Ravi Teja</div>
                <div className="text-[10px] text-slate-500 truncate">M.Tech CS &bull; 2 credits</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoUser('sneha.des@uohyd.ac.in', 'Sneha Rao')}
                className="p-2 border border-slate-200 rounded-lg hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all"
              >
                <div className="font-semibold text-slate-800">Sneha Rao</div>
                <div className="text-[10px] text-slate-500 truncate">Figma / Design &bull; 3 credits</div>
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
