import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-8 h-8 border-2 border-brand-400/20 border-t-brand-400 rounded-full animate-spin" />
    </div>
  );
};
