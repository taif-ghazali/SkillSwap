import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-md w-full p-8 sm:p-10 text-center bg-white border-slate-200 shadow-elevated">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-brand-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6 font-medium">
          The requested page route does not exist in the SkillSwap platform.
        </p>
        <Button
          variant="primary"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
          className="w-full shadow-md"
        >
          Return to Campus Dashboard
        </Button>
      </Card>
    </div>
  );
};
