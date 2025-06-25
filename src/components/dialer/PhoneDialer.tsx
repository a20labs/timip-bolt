import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff,
  Plus,
  Delete,
  Clock,
  User
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface PhoneDialerProps {
  isOpen: boolean;
  onClose: () => void;
  onCall: (phoneNumber: string) => void;
  agentName: string;
  agentAvatar: string;
}

interface PhoneCall {
  id: number;
  to_number: string;
  from_number: string;
  duration: number;
  status: string;
  created_at: string;
}

export function PhoneDialer({ isOpen, onClose, onCall, agentName, agentAvatar }: PhoneDialerProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'keypad' | 'history'>('keypad');
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();

  // Fetch call history
  const { data: callHistory, isLoading } = useQuery({
    queryKey: ['call-history', currentWorkspace?.id],
    queryFn: async (): Promise<PhoneCall[]> => {
      if (!currentWorkspace?.id) return [];

      // In a real app, this would call Supabase to get call history
      // For demo, return mock data
      return [
        {
          id: 1,
          to_number: '+15551234567',
          from_number: '+15559876543',
          duration: 120,
          status: 'completed',
          created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          id: 2,
          to_number: '+15557654321',
          from_number: '+15559876543',
          duration: 45,
          status: 'completed',
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 3,
          to_number: '+15551112222',
          from_number: '+15559876543',
          duration: 0,
          status: 'missed',
          created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
    },
    enabled: isOpen && !!currentWorkspace?.id,
  });

  // Make call mutation
  const makeCallMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      // In a real app, this would call the Twilio API via an Edge Function
      console.log(`Making call to ${phoneNumber}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the call to the database
      const { data, error } = await supabase
        .from('phone_calls')
        .insert({
          workspace_id: currentWorkspace?.id,
          to_number: phoneNumber,
          from_number: '+15559876543', // This would be your Twilio number
          status: 'initiated'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-history'] });
      onCall(phoneNumber);
    },
  });

  const handleKeypadPress = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber.length >= 10) {
      makeCallMutation.mutate(phoneNumber);
    }
  };

  const formatPhoneNumber = (number: string) => {
    if (number.length <= 3) {
      return number;
    } else if (number.length <= 6) {
      return `(${number.slice(0, 3)}) ${number.slice(3)}`;
    } else {
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6, 10)}${number.length > 10 ? ` ext.${number.slice(10)}` : ''}`;
    }
  };

  const formatCallTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Missed';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={agentAvatar || "https://images.pexels.com/photos/5704849/pexels-photo-5704849.jpeg?auto=compress&cs=tinysrgb&w=600"} 
                alt={agentName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {agentName} Phone
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Make calls to customers and team members
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'keypad'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('keypad')}
          >
            Keypad
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'history'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Call History
          </button>
        </div>

        {/* Keypad */}
        {activeTab === 'keypad' && (
          <div className="p-4">
            {/* Phone Number Display */}
            <div className="mb-4 text-center">
              <input
                type="text"
                value={formatPhoneNumber(phoneNumber)}
                onChange={(e) => {
                  // Only allow digits
                  const digits = e.target.value.replace(/\D/g, '');
                  setPhoneNumber(digits);
                }}
                className="text-2xl font-semibold text-center w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                placeholder="Enter phone number"
              />
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeypadPress(digit.toString())}
                  className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mx-auto"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleDelete}
                className="rounded-full p-4"
                disabled={phoneNumber.length === 0}
              >
                <Delete className="w-6 h-6 text-gray-500" />
              </Button>
              <Button
                size="lg"
                onClick={handleCall}
                className="rounded-full p-4 bg-green-500 hover:bg-green-600"
                disabled={phoneNumber.length < 10 || makeCallMutation.isPending}
              >
                <Phone className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setPhoneNumber(prev => prev + '+')}
                className="rounded-full p-4"
              >
                <Plus className="w-6 h-6 text-gray-500" />
              </Button>
            </div>
          </div>
        )}

        {/* Call History */}
        {activeTab === 'history' && (
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : callHistory && callHistory.length > 0 ? (
              <div className="space-y-3">
                {callHistory.map((call) => (
                  <div 
                    key={call.id} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        call.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/20' 
                          : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        <Phone className={`w-4 h-4 ${
                          call.status === 'completed' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPhoneNumber(call.to_number)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatCallTime(call.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(call.duration)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setPhoneNumber(call.to_number);
                          setActiveTab('keypad');
                        }}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Call History
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your call history will appear here
                  <span className="block text-xs mt-1">
                    SMS messaging is now available in Communications settings
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default PhoneDialer;