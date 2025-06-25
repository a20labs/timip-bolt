import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, Mail, Globe, Smartphone, Clock, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState({
    updates: true,
    releases: true,
    marketing: false,
    security: true,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    messages: true,
    comments: true,
    follows: true,
    releases: true,
    promotions: false,
  });
  
  const [notificationSchedule, setNotificationSchedule] = useState('anytime');
  
  const handleEmailToggle = (key: string) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };
  
  const handlePushToggle = (key: string) => {
    setPushNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Notification Settings
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Manage how and when you receive notifications from TruIndee
      </p>
      
      {/* Email Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Mail className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Email Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control which emails you receive from TruIndee
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries({
            updates: 'Platform updates and announcements',
            releases: 'New release notifications',
            marketing: 'Marketing and promotional emails',
            security: 'Security alerts and account notifications',
          }).map(([key, description]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emailNotifications[key as keyof typeof emailNotifications]}
                  onChange={() => handleEmailToggle(key)}
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Push Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure alerts on your device
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries({
            messages: 'Direct messages',
            comments: 'Comments on your posts',
            follows: 'New followers',
            releases: 'New releases from followed artists',
            promotions: 'Special offers and promotions',
          }).map(([key, description]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={pushNotifications[key as keyof typeof pushNotifications]}
                  onChange={() => handlePushToggle(key)}
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Notification Schedule */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Clock className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Notification Schedule
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control when you receive notifications
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                When should we notify you?
              </label>
              <select
                value={notificationSchedule}
                onChange={(e) => setNotificationSchedule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="anytime">Any time (24/7)</option>
                <option value="daytime">Daytime only (8am - 8pm)</option>
                <option value="business">Business hours (9am - 5pm)</option>
                <option value="custom">Custom schedule</option>
              </select>
            </div>
            
            {notificationSchedule === 'custom' && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Custom Schedule
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      defaultValue="09:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <Input
                      type="time"
                      defaultValue="17:00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <label key={day} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={day !== 'Sat' && day !== 'Sun'}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {day}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Notification Channels */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Globe className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Notification Channels
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage where you receive notifications
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { icon: Mail, name: 'Email', connected: true, primary: true },
            { icon: Smartphone, name: 'Mobile App', connected: true, primary: false },
            { icon: Bell, name: 'Web Browser', connected: true, primary: false },
          ].map((channel) => (
            <div key={channel.name} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <channel.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {channel.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {channel.connected ? 'Connected' : 'Not connected'}
                    {channel.primary && ' • Primary'}
                  </p>
                </div>
              </div>
              <Button
                variant={channel.connected ? 'outline' : 'primary'}
                size="sm"
              >
                {channel.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
      
      <div className="flex justify-end">
        <Button>
          Save Notification Preferences
        </Button>
      </div>
      
      {/* Information Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              About Notifications
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Some notifications, such as security alerts and account activity, cannot be disabled for your protection. Your notification preferences are synced across all your devices.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}