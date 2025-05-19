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
  login: (email: string, password: string) => Promise<CognitoUserSession>;
  signup: (email: string, password: string, username: string) => Promise<void>;
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
          await new Promise((resolve, reject) => {
            currentUser.getSession((err, session) => {
              if (err) reject(err);
              else resolve(session);
            });
          });
          const attributes = await new Promise((resolve, reject) => {
            currentUser.getUserAttributes((err, attrs) => {
              if (err) reject(err);
              else resolve(attrs);
            });
          });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          const userData = attributes.reduce((acc: { [key: string]: string }, attr) => {
            acc[attr.Name] = attr.Value;
            return acc;
          }, {});
          setUser({
            id: userData.sub,
            username: userData.email.split('@')[0],
            email: userData.email,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
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

      // Authenticate user and get session
      const session = await new Promise<CognitoUserSession>((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (session) => resolve(session),
          onFailure: (err) => reject(err),
        });
      });


      console.log("ID Token:", session.getIdToken().getJwtToken());
      console.log("Access Token:", session.getAccessToken().getJwtToken());
      console.log("Refresh Token:", session.getRefreshToken().getToken());

      // Get user attributes
      const attributes = await new Promise<CognitoUserAttribute[]>((resolve, reject) => {
        cognitoUser.getUserAttributes((err, attrs) => {
          if (err || !attrs) reject(err);
          else resolve(attrs);
        });
      });

      const userData = attributes.reduce((acc: { [key: string]: string }, attr) => {
        acc[attr.getName()] = attr.getValue();
        return acc;
      }, {});

      setUser({
        id: userData.sub,
        username: userData.email.split('@')[0],
        email: userData.email,
      });

      toast.success('Welcome back!');

      // Optional: return session if needed
      return session;

    } catch (error: any) {
      if (error.code === 'UserNotConfirmedException') {
        toast.error('Please confirm your email before logging in.');
      } else {
        toast.error(error.message || 'Failed to log in');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const attributeList = [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: username,
        },
      ];
      await new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        userPool.signUp(email, password, attributeList, null, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      toast.success('Account created! Please check your email for verification.');
    } catch (error: any) {
      if (error.code === 'UsernameExistsException') {
        toast.error('An account with this email already exists.');
      } else {
        toast.error(error.message || 'Failed to sign up');
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
      await new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration(code, true, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      toast.success('Email verified! You can now log in.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify email');
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
      await new Promise((resolve, reject) => {
        cognitoUser.forgotPassword({
          onSuccess: () => resolve(null),
          onFailure: (err) => reject(err),
          inputVerificationCode: () => {}, // Placeholder for code input
        });
      });
      toast.success('Reset code sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset code');
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
      await new Promise((resolve, reject) => {
        cognitoUser.confirmPassword(code, newPassword, {
          onSuccess: () => resolve(null),
          onFailure: (err) => reject(err),
        });
      });
      toast.success('Password reset successfully! You can now log in.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out');
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
