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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#263778] via-[#2f4396] to-[#4969F5] text-white flex items-center justify-center font-black text-2xl shadow-elevated">
            S
          </div>
        </div>
        <h1 className="text-center text-3xl font-black text-slate-900 tracking-tight">
          SkillSwap <span className="text-brand-500">UoH</span>
        </h1>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 tracking-wide uppercase">
          School of Computer &amp; Information Sciences &bull; University of Hyderabad
        </p>
        <div className="mt-2.5 flex justify-center">
          <span className="text-center text-xs font-bold text-slate-700 bg-gradient-to-r from-[#fef5e0] to-white border border-[#fde7be] rounded-full py-1 px-4 shadow-2xs">
            ✨ Learn Together. Grow Together. &bull; Time Credits, Not Money
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="shadow-elevated border-slate-200/90 p-7 sm:p-8 bg-white">
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
                helperText="Must end with @uohyd.ac.in (New students receive 2 time credits)"
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
                helperText="Only your nickname and skills are shown to peers (no phone numbers)"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full shadow-md"
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
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center mb-3">
              Fast Demo Accounts (IE209 Evaluation)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoUser('ravi.23mcse01@uohyd.ac.in', 'Ravi Teja')}
                className="p-3 border border-slate-200 rounded-xl hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div className="font-bold text-slate-900 group-hover:text-brand-600">Ravi Teja</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">M.Tech CS &bull; ⏱ 2 credits</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoUser('sneha.des@uohyd.ac.in', 'Sneha Rao')}
                className="p-3 border border-slate-200 rounded-xl hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div className="font-bold text-slate-900 group-hover:text-brand-600">Sneha Rao</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">Design &bull; ⏱ 3 credits</div>
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
