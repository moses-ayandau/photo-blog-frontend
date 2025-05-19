/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<CognitoUserSession | void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const poolData = {

  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);
userPool.getCurrentUser();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = userPool.getCurrentUser();
        if (currentUser) {
          const session = await new Promise<CognitoUserSession>((resolve, reject) => {
            currentUser.getSession((err: Error | null, session?: CognitoUserSession) => {
              if (err || !session) reject(err);
              else resolve(session);
            });
          });

          if (session && session.isValid()) {
            console.log("Session is valid, refreshing session...");
            await new Promise<void>((resolve, reject) => {
              currentUser.refreshSession(session.getRefreshToken(), (err, newSession) => {
                if (err) {
                  console.error("Error refreshing session:", err);
                  reject(err);
                } else {
                  console.log("Session refreshed successfully");
                  resolve();
                }
              });
            });
          }

          const attributes = await new Promise<CognitoUserAttribute[]>((resolve,reject) => {
            currentUser.getUserAttributes((err, attrs) => {
              if (err || !attrs) reject(err);
              else resolve(attrs);
            });
          });

          const userData = attributes.reduce<Record<string, string>>((acc, attr) => {
            acc[attr.getName()] = attr.getValue();
            return acc;
          }, {});

          setUser({
            id: userData.sub,
            username: userData.name || userData.email.split('@')[0], // Fallback for existing users
            email: userData.email,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<CognitoUserSession | void> => {
    setIsLoading(true);

    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      const session = await new Promise<CognitoUserSession>((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (session) => resolve(session),
          onFailure: (err) => reject(err),
        });
      });

      console.log("ID Token:", session.getIdToken().getJwtToken());
      console.log("Access Token:", session.getAccessToken().getJwtToken());
      console.log("Refresh Token:", session.getRefreshToken().getToken());

      const attributes = await new Promise<CognitoUserAttribute[]>((resolve, reject) => {
        cognitoUser.getUserAttributes((err, attrs) => {
          if (err || !attrs) reject(err);
          else resolve(attrs);
        });
      });

      const userData = attributes.reduce<Record<string, string>>((acc, attr) => {
        acc[attr.getName()] = attr.getValue();
        return acc;
      }, {});

      setUser({
        id: userData.sub,
        username: userData.name || userData.email.split('@')[0], // Fallback for existing users
        email: userData.email,
      });

      toast.success('Welcome back!');

      // Optional: return session if needed
      return session;

    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === 'UserNotConfirmedException') {
        toast.error('Please confirm your email before logging in.');
      } else {
        toast.error(err.message || 'Failed to log in');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: 'name',
          Value: fullName,
        }),
      ];

      await new Promise<unknown>((resolve, reject) => {
        userPool.signUp(email, password, attributeList, [], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      toast.success('Account created! Please check your email for verification.');
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === 'UsernameExistsException') {
        toast.error('An account with this email already exists.');
      } else {
        toast.error(err.message || 'Failed to sign up');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignup = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      await new Promise<string>((resolve, reject) => {
        cognitoUser.confirmRegistration(code, true, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      toast.success('Email verified! You can now log in.');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to verify email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      console.log('Initiating forgot password for', email);
      await new Promise<void>((resolve, reject) => {
        cognitoUser.forgotPassword({
          onSuccess: () => {
            console.log('Forgot password success');
            resolve();
          },
          onFailure: (err) => {
            console.log('Forgot password failure', err);
            reject(err);
          },
        });
      });
      toast.success('Reset code sent! Check your email.');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to send reset code');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      await new Promise<void>((resolve, reject) => {
        cognitoUser.confirmPassword(code, newPassword, {
          onSuccess: () => resolve(),
          onFailure: (err) => reject(err),
        });
      });
      toast.success('Password reset successfully! You can now log in.');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        currentUser.signOut();
      }
      setUser(null);
      toast.success("You've been logged out");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to log out');
      throw error;
    }
  };

  return (
      <AuthContext.Provider value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        confirmSignup,
        forgotPassword,
        confirmPassword,
        logout,
      }}>
        {children}
      </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};