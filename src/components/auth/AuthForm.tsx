import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthForm() {
  const navigate = useNavigate();
  const { login, signup, forgotPassword, confirmPassword, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'requestCode' | 'confirmCode'>('requestCode');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(loginData.email)) newErrors.email = 'Invalid email format';

    if (!loginData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await login(loginData.email, loginData.password);
        console.log("response" , response);
        navigate('/dashboard');
      } catch (error) {
        // Error is handled in AuthContext via sonner toasts
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!signupData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(signupData.email)) newErrors.email = 'Invalid email format';

    if (!signupData.username) newErrors.username = 'Username is required';

    if (!signupData.password) newErrors.password = 'Password is required';
    else if (signupData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await signup(signupData.email, signupData.password, signupData.username);
        navigate('/verify-email', { state: { email: signupData.email } });
      } catch (error) {
        // Error is handled in AuthContext via sonner toasts
      }
    }
  };

  const handleRequestCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!forgotEmail) newErrors.email = 'Email is required';
    else if (!validateEmail(forgotEmail)) newErrors.email = 'Invalid email format';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await forgotPassword(forgotEmail);
        setForgotPasswordStep('confirmCode');
      } catch (error) {
        // Error is handled in AuthContext via sonner toasts
      }
    }
  };

  const handleConfirmPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!resetCode) newErrors.code = 'Verification code is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmNewPassword) newErrors.confirmNewPassword = 'Passwords do not match';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await confirmPassword(forgotEmail, resetCode, newPassword);
        setShowForgotPassword(false);
        setForgotPasswordStep('requestCode');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        navigate('/auth'); // Return to login page after successful reset
      } catch (error) {
        // Error is handled in AuthContext via sonner toasts
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader>
          <CardTitle className="text-2xl text-center">PixPath</CardTitle>
          <CardDescription className="text-center">Your personal photo journey</CardDescription>
          <TabsList className="grid w-full grid-cols-2 mt-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent>
          <TabsContent value="login">
            {showForgotPassword ? (
              forgotPasswordStep === 'requestCode' ? (
                <form onSubmit={handleRequestCodeSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send Reset Code"}
                    </Button>
                  </div>
                  <p className="text-center text-sm mt-4">
                    <button className="text-primary hover:underline" onClick={() => setShowForgotPassword(false)}>
                      Back to Login
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleConfirmPasswordSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="Verification Code"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                  <p className="text-center text-sm mt-4">
                    <button className="text-primary hover:underline" onClick={() => setForgotPasswordStep('requestCode')}>
                      Resend Code
                    </button>
                  </p>
                </form>
              )
            ) : (
              <form onSubmit={handleLoginSubmit}>
                <div className="space-y-4">
                  <div>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <p className="text-center text-sm mt-4">
                  <button
                    className="text-primary hover:underline"
                    onClick={() => {
                      setForgotEmail(loginData.email);
                      setShowForgotPassword(true);
                      setForgotPasswordStep('requestCode');
                    }}
                  >
                    Forgot Password?
                  </button>
                </p>
              </form>
            )}
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignupSubmit}>
              <div className="space-y-4">
                <div>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Username"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
                <div>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm Password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-500">
          {activeTab === 'login' ? (
            <p>Don't have an account? <button className="text-primary hover:underline" onClick={() => setActiveTab('signup')}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button className="text-primary hover:underline" onClick={() => setActiveTab('login')}>Login</button></p>
          )}
        </CardFooter>
      </Tabs>
    </Card>
  );
}