import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center bg-white border-slate-200">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The requested page route does not exist in the SkillSwap platform.
        </p>
        <Button
          variant="primary"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
          className="w-full"
        >
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};
