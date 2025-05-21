import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import AuthLoader from '@/components/auth/AuthLoader';

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className='flex items-center justify-center h-screen'><AuthLoader /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </main>
    </div>
  );
}