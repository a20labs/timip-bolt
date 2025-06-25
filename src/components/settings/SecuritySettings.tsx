import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  LogOut, 
  Eye, 
  EyeOff, 
  Trash2,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const mockSessions = [
    { id: '1', device: 'MacBook Pro', location: 'San Francisco, USA', browser: 'Chrome', lastActive: 'Current session', isCurrent: true },
    { id: '2', device: 'iPhone 15', location: 'San Francisco, USA', browser: 'Mobile Safari', lastActive: '2 hours ago' },
    { id: '3', device: 'Windows PC', location: 'Los Angeles, USA', browser: 'Firefox', lastActive: '3 days ago' },
  ];

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would validate and update the password
    console.log('Password update submitted');
  };
  
  const handle2FAToggle = () => {
    if (!is2FAEnabled) {
      setShowQRCode(true);
    } else {
      setIs2FAEnabled(false);
      setShowQRCode(false);
    }
  };
  
  const handleVerify2FA = () => {
    // In a real app, this would verify the 2FA code
    if (verificationCode.length === 6) {
      setIs2FAEnabled(true);
      setShowQRCode(false);
    }
  };
  
  const handleLogoutSession = (sessionId: string) => {
    // In a real app, this would log out the specified session
    console.log(`Logging out session: ${sessionId}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Security Settings
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your account security and authentication settings
      </p>
      
      {/* Password Update */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Lock className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Change Password
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update your account password
            </p>
          </div>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Current Password"
              value={passwordFormData.currentPassword}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
              label="Current Password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={passwordFormData.newPassword}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
              label="New Password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={passwordFormData.confirmPassword}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
              label="Confirm New Password"
              required
            />
          </div>
          
          {/* Password strength indicator */}
          {passwordFormData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Password strength</span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Strong</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          )}
          
          <Button type="submit" className="mt-2">
            Update Password
          </Button>
        </form>
      </Card>
      
      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Smartphone className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-2 mb-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Enable two-factor authentication</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Secure your account with an authenticator app
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={is2FAEnabled}
              onChange={handle2FAToggle}
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
        
        {/* 2FA Setup */}
        {showQRCode && !is2FAEnabled && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Set up two-factor authentication
            </h4>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
                  {/* Mock QR code */}
                  <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/TruIndee:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TruIndee')] bg-no-repeat bg-center bg-contain"></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Scan this QR code with your authenticator app
                </p>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs text-center">
                  JBSWY3DPEHPK3PXP
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter verification code
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleVerify2FA} disabled={verificationCode.length !== 6}>
                    Verify
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p><strong>Tip:</strong> Download an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator if you haven't already.</p>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowQRCode(false)}>
                  Cancel Setup
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {is2FAEnabled && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Two-factor authentication is enabled
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Your account is protected with an additional layer of security.
              </p>
            </div>
          </div>
        )}
      </Card>
      
      {/* Active Sessions */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Globe className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Active Sessions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage devices currently logged into your account
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {mockSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  {session.device.toLowerCase().includes('iphone') ? (
                    <Smartphone className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.device}
                    </p>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {session.lastActive}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={session.isCurrent}
                onClick={() => handleLogoutSession(session.id)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            Logout of All Devices
          </Button>
        </div>
      </Card>
      
      {/* Account Recovery */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Key className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Account Recovery
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage recovery options for your account
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recovery Email
            </label>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="backup@example.com"
                defaultValue="backup@example.com"
                className="flex-1"
              />
              <Button>
                Update
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recovery Phone Number
            </label>
            <div className="flex gap-2">
              <Input 
                type="tel" 
                placeholder="+1 (555) 123-4567"
                defaultValue="+1 (555) 123-4567" 
                className="flex-1"
              />
              <Button>
                Update
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Recovery Keys
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Recovery keys can be used to regain access to your account if you lose access to your other recovery methods.
              </p>
              <Button variant="outline">
                Generate Recovery Keys
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Danger Zone */}
      <Card className="p-6 border-red-200 dark:border-red-900/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Danger Zone
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Permanent actions for your account
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
              Delete Account
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Once you delete your account, there is no going back. This is a permanent action and cannot be undone.
            </p>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}