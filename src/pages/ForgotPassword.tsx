import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, confirmPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState<'requestCode' | 'confirmCode'>('requestCode');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRequestCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email format';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await forgotPassword(email);
        setStep('confirmCode');
      } catch (error) {
        console.error('Error requesting code:', error);
        newErrors.email = error.message || 'Failed to send reset code';
        setErrors(newErrors);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleConfirmPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!code) newErrors.code = 'Verification code is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmNewPassword) newErrors.confirmNewPassword = 'Passwords do not match';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await confirmPassword(email, code, newPassword);
        navigate('/auth'); // Return to login page after successful reset
      } catch (error: any) {
        console.error('Error resetting password:', error);
        newErrors.code = error.message || 'Failed to reset password';
        setErrors(newErrors);
      } finally {
        setIsSubmitting(false);
      }
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
          {step === 'requestCode' ? (
            <form onSubmit={handleRequestCodeSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Forgot Password</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enter your email to receive a reset code
                </p>
              </div>

              <div>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirmPasswordSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Reset Password</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enter the code sent to {email}
                </p>
              </div>

              <div>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              </div>

              <div>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={errors.newPassword ? "border-red-500" : ""}
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={errors.confirmNewPassword ? "border-red-500" : ""}
                />
                {errors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {step === 'requestCode' ? (
                <>
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="text-primary hover:underline"
                  >
                    Back to login
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep('requestCode')}
                    className="text-primary hover:underline"
                  >
                    Resend code
                  </button>
                  {" | "}
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="text-primary hover:underline"
                  >
                    Back to login
                  </button>
                </>
              )}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}