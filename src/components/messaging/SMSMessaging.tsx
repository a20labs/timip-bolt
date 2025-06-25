import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  X,
  MessageSquare,
  Clock,
  Check,
  AlertTriangle,
  Phone,
  User,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { supabase } from '../../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SMSMessagingProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

interface Message {
  id: number;
  to_number: string;
  from_number: string;
  message: string;
  status: string;
  created_at: string;
  cost_cents: number;
}

export function SMSMessaging({ isOpen, onClose, phoneNumber }: SMSMessagingProps) {
  const [message, setMessage] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { currentWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();

  // Initialize contact number from prop
  useEffect(() => {
    if (phoneNumber) {
      setContactNumber(phoneNumber);
    }
  }, [phoneNumber]);

  // Fetch workspace's credit wallet
  const { data: wallet } = useQuery({
    queryKey: ['credit-wallet', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;
      
      const { data, error } = await supabase.rpc('get_credit_wallet', {
        workspace_id_param: currentWorkspace.id
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch SMS rates
  const { data: smsRate } = useQuery({
    queryKey: ['sms-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comm_rates')
        .select('*')
        .eq('code', 'SMS_US_OUT')
        .single();
      
      if (error) throw error;
      
      // Calculate the artist price
      const { data: price } = await supabase.rpc('calculate_artist_price', {
        base_cost_cents: data.cost_cents,
        buffer_pct: data.buffer_pct,
        margin_pct: data.margin_pct
      });
      
      return {
        ...data,
        artist_price_cents: price
      };
    }
  });

  // Fetch message history
  const { data: messageHistory, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['message-history', currentWorkspace?.id, contactNumber],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase.rpc('get_message_history', {
        workspace_id_param: currentWorkspace.id,
        number_filter: contactNumber || null,
        limit_param: 50,
        offset_param: 0
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id && showHistory,
  });

  // Send SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: async ({ to, message }: { to: string, message: string }) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          workspace_id: currentWorkspace.id,
          to,
          from: phoneNumber, // Your Twilio number
          message
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Clear the message input
      setMessage('');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['message-history'] });
      queryClient.invalidateQueries({ queryKey: ['credit-wallet'] });
      
      // Refetch history immediately if it's shown
      if (showHistory) {
        refetchHistory();
      }
    }
  });

  const handleSendMessage = () => {
    if (!contactNumber || !message.trim() || !phoneNumber) return;
    
    sendSMSMutation.mutate({ 
      to: contactNumber,
      message: message.trim()
    });
  };

  const formatPhoneNumber = (number: string) => {
    if (!number) return '';
    
    // Strip any non-digit characters
    const digits = number.replace(/\D/g, '');
    
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
    } else {
      return number; // Return as is if it doesn't match expected formats
    }
  };
  
  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
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
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden w-full max-w-lg"
      >
        {/* Header */}
        <div className="p-4 bg-primary-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">Send SMS Message</h2>
              <p className="text-sm opacity-90">From {formatPhoneNumber(phoneNumber)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-primary-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Recipient */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To
            </label>
            <Input
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter phone number"
              icon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[120px] resize-none"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
                <span>{message.length} characters</span>
                <span>{Math.ceil(message.length / 160)} SMS {message.length > 160 ? 'segments' : 'segment'}</span>
              </div>
            </div>
          </div>

          {/* Credit Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Credits:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {wallet ? formatCost(wallet.balance_cents) : 'Loading...'}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Cost per message:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {smsRate ? formatCost(smsRate.artist_price_cents) : 'Loading...'}
                </span>
              </div>
            </div>
            {message.length > 160 && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 inline-block mr-1" />
                Your message exceeds 160 characters and will be sent as multiple segments.
              </div>
            )}
          </div>

          {/* Send Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!contactNumber || !message.trim() || sendSMSMutation.isPending}
              loading={sendSMSMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>

          {/* Error Message */}
          {sendSMSMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-800 dark:text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 inline-block mr-1" />
              {sendSMSMutation.error instanceof Error ? sendSMSMutation.error.message : 'Failed to send message'}
            </div>
          )}

          {/* Success Message */}
          {sendSMSMutation.isSuccess && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg text-green-800 dark:text-green-300 text-sm">
              <Check className="w-4 h-4 inline-block mr-1" />
              Message sent successfully!
            </div>
          )}

          {/* Message History Toggle */}
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-primary-600 dark:text-primary-400"
            >
              {showHistory ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Message History
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Message History
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Message History */}
        {showHistory && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Message History
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchHistory()}
                className="text-primary-600 dark:text-primary-400"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messageHistory && messageHistory.length > 0 ? (
              <div className="space-y-3">
                {messageHistory.map((msg: Message) => (
                  <div 
                    key={msg.id} 
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {msg.from_number === phoneNumber ? (
                          <Smartphone className="w-4 h-4 text-primary-600" />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {msg.from_number === phoneNumber ? 'Outgoing' : 'Incoming'}: {msg.from_number === phoneNumber ? msg.to_number : msg.from_number}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 ml-6">
                      {msg.message}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                        {msg.status === 'sent' ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="w-3 h-3" />
                            Sent
                          </span>
                        ) : msg.status === 'delivered' ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="w-3 h-3" />
                            Delivered
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Clock className="w-3 h-3" />
                            {msg.status}
                          </span>
                        )}
                      </span>
                      {msg.cost_cents && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Cost: {formatCost(msg.cost_cents)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No messages found</p>
                {contactNumber && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Send a message to start the conversation
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default SMSMessaging;