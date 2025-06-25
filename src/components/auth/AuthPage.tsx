import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Shield, Crown, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { userRegistrationService } from '../../services/userRegistrationService';
import type { User } from '@supabase/supabase-js';

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'magic' | 'password'>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { setUser } = useAuthStore();

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      setMessage('Check your email for the magic link!');        
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
            phone: phoneNumber
          }
        }
      });

      if (error) throw error;
      
      if (data?.user) {
        // Create user account with artist role
        await userRegistrationService.createUserAccount({
          email,
          fullName: `${firstName} ${lastName}`.trim(),
          accountType: 'artist',
        });
        
        setUser(data.user);
      } else {
        setMessage('Please check your email to confirm your account');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, accountType: 'artist' | 'fan' | 'admin' = 'artist') => {
    setLoading(true);
    setMessage('');

    try {
      if (accountType === 'admin') {
        // Handle super admin login separately
        const mockUser = {
          id: 'super-admin-id',
          email: demoEmail,
          role: 'superadmin',
          user_metadata: {
            full_name: 'Super Admin',
            is_account_owner: true,
          },
          app_metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
        };
        setUser(mockUser as unknown as User);
        setMessage('Super Admin login successful!');
        return;
      }

      // Use the registration service to create/login with proper first-user logic
      const userProfile = await userRegistrationService.createDemoAccount(demoEmail, accountType);
      
      // Create mock user object for auth store
      const mockUser = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        user_metadata: {
          full_name: userProfile.full_name,
          is_account_owner: userProfile.is_account_owner,
          workspace_id: userProfile.workspace_id,
        },
        app_metadata: {},
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
        aud: 'authenticated',
      };

      setUser(mockUser as unknown as User);
      
      // Show success message with account owner status
      const ownerStatus = userProfile.is_account_owner ? ' (Account Owner)' : '';
      setMessage(`Demo login successful!${ownerStatus}`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Demo login failed';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderSignInForm = () => (
    <>
      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'magic' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('magic')}
        >
          Magic Link
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'password' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
      </div>

      <form onSubmit={activeTab === 'magic' ? handleMagicLinkSignIn : handlePasswordSignIn} className="space-y-6">
        <Input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-gray-800 border-gray-700 text-white"
        />

        {activeTab === 'password' && (
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Eye className="w-4 h-4 cursor-pointer" onClick={() => setShowPassword(!showPassword)} />}
              required
              className="bg-gray-800 border-gray-700 text-white pr-10"
            />
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {activeTab === 'magic' ? 'Send Magic Link' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-800 space-y-4">
        <p className="text-center text-sm text-gray-400">Or continue with</p>
        
        <div className="flex justify-center space-x-4">
          {/* Social login buttons */}
          <button className="p-2 bg-gray-800 rounded-full">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button className="p-2 bg-gray-800 rounded-full">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.9 2H3.1A1.1 1.1 0 0 0 2 3.1v17.8A1.1 1.1 0 0 0 3.1 22h9.58v-7.75h-2.6v-3h2.6V9a3.64 3.64 0 0 1 3.88-4 20.26 20.26 0 0 1 2.33.12v2.7H17.3c-1.26 0-1.5.6-1.5 1.47v1.93h3l-.39 3H15.8V22h5.1a1.1 1.1 0 0 0 1.1-1.1V3.1A1.1 1.1 0 0 0 20.9 2z" />
            </svg>
          </button>
          <button className="p-2 bg-gray-800 rounded-full">
            <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
            </svg>
          </button>
          <button className="p-2 bg-gray-800 rounded-full">
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.36.12-.78-.12-.9-.48-.12-.359.12-.779.48-.899 4.561-1.021 8.52-.6 11.64 1.32.42.18.48.659.36 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-center text-gray-400 text-sm">
          Don't have an account? <button 
            className="text-purple-400 hover:underline" 
            onClick={() => setIsSignUp(true)}
          >
            Create Account
          </button>
        </p>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
        <p className="text-center text-sm text-gray-400">
          Try demo accounts:
        </p>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('artistdemo@truindee.com', 'artist')}
            className="w-full border-gray-700 text-white hover:bg-gray-800 flex items-center justify-center"
            disabled={loading}
          >
            Artist Demo
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('fandemo@truindee.com', 'fan')}
            className="w-full border-gray-700 text-white hover:bg-gray-800 flex items-center justify-center"
            disabled={loading}
          >
            Fan Demo
          </Button>
        </div>
      </div>
    </>
  );

  const renderSignUpForm = () => (
    <>
      <h2 className="text-2xl font-bold text-white text-center mb-2">Create Account</h2>
      <p className="text-center text-gray-400 text-sm mb-6">Join TruIndee today</p>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Input
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-gray-800 border-gray-700 text-white"
        />

        <Input
          type="tel"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white"
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white"
            icon={<Eye className="w-4 h-4 cursor-pointer" onClick={() => setShowPassword(!showPassword)} />}
          />
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-400">Or sign up with</p>
        <div className="flex justify-center space-x-4 mt-4">
          <button className="p-2 bg-gray-800 rounded-full">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button className="p-2 bg-gray-800 rounded-full">
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.9 2H3.1A1.1 1.1 0 0 0 2 3.1v17.8A1.1 1.1 0 0 0 3.1 22h9.58v-7.75h-2.6v-3h2.6V9a3.64 3.64 0 0 1 3.88-4 20.26 20.26 0 0 1 2.33.12v2.7H17.3c-1.26 0-1.5.6-1.5 1.47v1.93h3l-.39 3H15.8V22h5.1a1.1 1.1 0 0 0 1.1-1.1V3.1A1.1 1.1 0 0 0 20.9 2z" />
            </svg>
          </button>
          <button className="p-2 bg-gray-800 rounded-full">
            <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
            </svg>
          </button>
          <button className="p-2 bg-gray-800 rounded-full">
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.36.12-.78-.12-.9-.48-.12-.359.12-.779.48-.899 4.561-1.021 8.52-.6 11.64 1.32.42.18.48.659.36 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-center text-gray-400 text-sm">
          Already have an account? <button 
            className="text-purple-400 hover:underline" 
            onClick={() => setIsSignUp(false)}
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {!isSignUp && (
          <div className="text-center mb-8">
            <img 
              src="/truindee-icon-7.svg" 
              alt="TruIndee Logo" 
              className="mx-auto h-20 mb-2"
            />
            <h1 className="text-2xl font-bold text-purple-400">TRUINDEE</h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider">THE UNIFIED ARTIST BUSINESS ECOSYSTEM</p>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
          {isSignUp ? renderSignUpForm() : renderSignInForm()}
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-primary-500/20 border border-primary-500/30 rounded-lg text-primary-200 text-sm text-center"
          >
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}