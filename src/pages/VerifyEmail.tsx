import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmail() {
  const { confirmSignup, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Get email from location state or redirect to auth page if not available
  const email = location.state?.email || '';

  if (!email) {
    // If no email provided in state, redirect to auth page
    navigate('/auth');
    return null;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      await confirmSignup(email, code);
      // Successfully verified, redirect to auth page
      navigate('/auth');
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message || 'Failed to verify email. Please check the code and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">PixPath</CardTitle>
          <CardDescription className="text-center">Your personal photo journey</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Verify Your Email</h2>
              <p className="text-sm text-gray-600 mt-1">
                Enter the code sent to {email}
              </p>
            </div>

            <div>
              <Input
                id="verification-code"
                type="text"
                placeholder="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Didn't receive a code? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="text-primary hover:underline"
              >
                return to sign up
              </button>
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Success message */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Account created! Please check your email for verification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}