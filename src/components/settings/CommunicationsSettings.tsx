import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MessageSquare, 
  Plus, 
  Zap, 
  Clock, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  CreditCard,
  Settings,
  Check,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { PhoneDialer } from '../dialer/PhoneDialer';
import { SMSMessaging } from '../messaging/SMSMessaging';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

export function CommunicationsSettings() {
  const [showPhoneDialer, setShowPhoneDialer] = useState(false);
  const [showSMSMessaging, setShowSMSMessaging] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [showUsageHistory, setShowUsageHistory] = useState(false);
  const [showRateSheet, setShowRateSheet] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(2000); // Default $20
  const { currentWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { isFeatureEnabled } = useFeatureFlags();
  
  // Check if features are enabled
  const phoneEnabled = isFeatureEnabled('PHONE_DIALER');
  const smsEnabled = isFeatureEnabled('SMS_MESSAGING');
  
  // Fetch workspace's credit wallet
  const { data: wallet, isLoading: walletLoading } = useQuery({
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
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch communication rates
  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ['comm-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comm_rates')
        .select('*')
        .order('code');
      
      if (error) throw error;
      
      // Calculate artist prices
      const ratesWithPrices = await Promise.all(
        data.map(async (rate) => {
          const { data: price } = await supabase.rpc('calculate_artist_price', {
            base_cost_cents: rate.cost_cents,
            buffer_pct: rate.buffer_pct,
            margin_pct: rate.margin_pct
          });
          
          return {
            ...rate,
            artist_price_cents: price
          };
        })
      );
      
      return ratesWithPrices;
    }
  });

  // Fetch credit transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['credit-transactions', currentWorkspace?.id, showUsageHistory],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id && showUsageHistory,
  });

  // Fetch phone calls history
  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ['phone-calls', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('phone_calls')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id && phoneEnabled,
  });
  
  // Fetch SMS messages history
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['sms-messages', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentWorkspace?.id && smsEnabled,
  });

  // Mutation for adding credits
  const addCreditsMutation = useMutation({
    mutationFn: async (amountCents: number) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      
      // In a real app, this would create a Stripe checkout session
      // For demo, we'll simulate a successful payment
      const mockPaymentId = `payment_${Date.now()}`;
      
      const { data, error } = await supabase.rpc('add_credits', {
        workspace_id_param: currentWorkspace.id,
        amount_cents_param: amountCents,
        payment_id_param: mockPaymentId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    }
  });

  // Mutation for updating auto-recharge settings
  const updateAutoRechargeMutation = useMutation({
    mutationFn: async (settings: { 
      autoRecharge: boolean; 
      threshold?: number;
      amount?: number;
    }) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      
      const updateData: Record<string, any> = {
        auto_recharge: settings.autoRecharge
      };
      
      if (settings.threshold) {
        updateData.recharge_threshold_cents = settings.threshold;
      }
      
      if (settings.amount) {
        updateData.recharge_amount_cents = settings.amount;
      }
      
      const { data, error } = await supabase
        .from('credit_wallets')
        .update(updateData)
        .eq('workspace_id', currentWorkspace.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-wallet'] });
    }
  });

  const handleStartCall = (phoneNumber: string) => {
    setShowPhoneDialer(false);
    // In a real implementation, this would initiate a call via Twilio
    console.log(`Call initiated to: ${phoneNumber}`);
  };

  const handleAddCredits = (amount: number) => {
    addCreditsMutation.mutate(amount);
  };

  const handleToggleAutoRecharge = () => {
    updateAutoRechargeMutation.mutate({ 
      autoRecharge: !(wallet?.auto_recharge) 
    });
  };

  const handleUpdateRechargeAmount = () => {
    updateAutoRechargeMutation.mutate({
      autoRecharge: wallet?.auto_recharge || false,
      amount: rechargeAmount
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

  const calculateTransactionTotals = () => {
    if (!transactions) return { topup: 0, usage: 0, total: 0 };
    
    const topup = transactions
      .filter(t => t.type === 'TOPUP')
      .reduce((sum, t) => sum + t.amount_cents, 0);
    
    const usage = transactions
      .filter(t => t.type === 'USAGE')
      .reduce((sum, t) => sum + t.amount_cents, 0);
    
    return {
      topup,
      usage: Math.abs(usage), // Usage is stored as negative
      total: topup + usage
    };
  };

  const totals = calculateTransactionTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Communications & Credits
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your communication tools and credit balance
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowRateSheet(!showRateSheet)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Rate Sheet
          </Button>
          <Button
            onClick={() => setShowUsageHistory(!showUsageHistory)}
          >
            <Clock className="w-4 h-4 mr-2" />
            Usage History
          </Button>
        </div>
      </div>

      {/* Credit Balance Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
          Credit Balance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Current Balance</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['credit-wallet'] })}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            
            {walletLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : wallet ? (
              <>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatCost(wallet.balance_cents)}
                </div>
                
                {wallet.balance_cents < 500 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Your credit balance is running low.
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Add credits to ensure uninterrupted communications.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {[1000, 2000, 5000, 10000].map(amount => (
                    <Button 
                      key={amount}
                      variant={amount === 2000 ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleAddCredits(amount)}
                      disabled={addCreditsMutation.isPending}
                    >
                      Add {formatCost(amount)}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Error loading credit balance
              </p>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Auto-Recharge</h4>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={wallet?.auto_recharge || false}
                  onChange={handleToggleAutoRecharge}
                  disabled={updateAutoRechargeMutation.isPending}
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Auto-recharge amount</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="500"
                  max="50000"
                  step="500"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(parseInt(e.target.value) || 2000)}
                  disabled={updateAutoRechargeMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpdateRechargeAmount}
                  disabled={updateAutoRechargeMutation.isPending || rechargeAmount === wallet?.recharge_amount_cents}
                >
                  Update
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                We'll automatically add {formatCost(rechargeAmount)} to your account when your balance drops below {formatCost(wallet?.recharge_threshold_cents || 500)}
              </p>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center mb-1">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                <span>Prevents service interruption</span>
              </div>
              <div className="flex items-center mb-1">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                <span>No fees or minimum commitments</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Communication Tools Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-primary-600" />
          Communication Tools
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Calls */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                Phone Calls
              </h4>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedPhoneNumber('');
                  setShowPhoneDialer(true);
                }}
                disabled={!phoneEnabled || wallet?.balance_cents <= 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Make Call
              </Button>
            </div>
            
            {phoneEnabled ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Call customers, team members, or partners directly from the platform.
                </p>
                
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Calls</h5>
                {callsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : calls && calls.length > 0 ? (
                  <div className="space-y-2">
                    {calls.slice(0, 3).map((call) => (
                      <div 
                        key={call.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {formatPhoneNumber(call.to_number)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(call.created_at).toLocaleString()} • {call.duration > 0 ? `${call.duration}s` : 'Missed'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPhoneNumber(call.to_number);
                            setShowPhoneDialer(true);
                          }}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                    No recent calls
                  </p>
                )}
              </>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Phone calling feature is currently disabled.
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Contact support to enable this feature.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SMS Messaging */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                SMS Messaging
              </h4>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedPhoneNumber('');
                  setShowSMSMessaging(true);
                }}
                disabled={!smsEnabled || wallet?.balance_cents <= 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Send SMS
              </Button>
            </div>
            
            {smsEnabled ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Send text messages to customers, team members, or partners.
                </p>
                
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Messages</h5>
                {messagesLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-2">
                    {messages.slice(0, 3).map((message) => (
                      <div 
                        key={message.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {formatPhoneNumber(message.to_number)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                            {message.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPhoneNumber(message.to_number);
                            setShowSMSMessaging(true);
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                    No recent messages
                  </p>
                )}
              </>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      SMS messaging feature is currently disabled.
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Contact support to enable this feature.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Rate Sheet */}
      {showRateSheet && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
              Communications Rate Sheet
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRateSheet(false)}
            >
              <ChevronUp className="w-4 h-4" />
              Hide
            </Button>
          </div>
          
          {ratesLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rates && rates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Service</th>
                    <th className="py-2 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Cost</th>
                    <th className="py-2 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => {
                    // Format the code for display
                    let serviceDisplay = '';
                    switch (rate.code) {
                      case 'SMS_US_OUT':
                        serviceDisplay = 'Outgoing SMS (US)';
                        break;
                      case 'SMS_US_IN':
                        serviceDisplay = 'Incoming SMS (US)';
                        break;
                      case 'SMS_INTL_OUT':
                        serviceDisplay = 'Outgoing SMS (International)';
                        break;
                      case 'VOICE_US_OUT':
                        serviceDisplay = 'Outgoing Call (US)';
                        break;
                      case 'VOICE_US_IN':
                        serviceDisplay = 'Incoming Call (US)';
                        break;
                      case 'VOICE_INTL_OUT':
                        serviceDisplay = 'Outgoing Call (International)';
                        break;
                      case 'MMS_US_OUT':
                        serviceDisplay = 'Outgoing MMS (US)';
                        break;
                      case 'MMS_US_IN':
                        serviceDisplay = 'Incoming MMS (US)';
                        break;
                      case 'PHONE_NUMBER':
                        serviceDisplay = 'Phone Number (Monthly)';
                        break;
                      default:
                        serviceDisplay = rate.code;
                    }
                    
                    // Get description based on service type
                    let description = '';
                    if (rate.code.includes('SMS')) {
                      description = 'Per message';
                    } else if (rate.code.includes('VOICE')) {
                      description = 'Per minute';
                    } else if (rate.code.includes('MMS')) {
                      description = 'Per message';
                    } else if (rate.code.includes('PHONE_NUMBER')) {
                      description = 'Monthly fee';
                    }
                    
                    return (
                      <tr key={rate.code} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{serviceDisplay}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">{formatCost(rate.artist_price_cents)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 italic text-center py-4">
              No rate information available
            </p>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Rates include a buffer and margin to account for service fluctuations. 
              International rates may vary by country. All charges are in USD.
            </p>
          </div>
        </Card>
      )}
      
      {/* Usage History */}
      {showUsageHistory && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-600" />
              Usage History
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUsageHistory(false)}
            >
              <ChevronUp className="w-4 h-4" />
              Hide
            </Button>
          </div>
          
          {/* Usage Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Added</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCost(totals.topup)}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Used</h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCost(totals.usage)}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Balance</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCost(wallet?.balance_cents || 0)}</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Date</th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Type</th>
                  <th className="py-2 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Amount</th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactionsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'TOPUP' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                            : transaction.type === 'USAGE'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        transaction.type === 'TOPUP' 
                          ? 'text-green-600 dark:text-green-400'
                          : transaction.type === 'USAGE'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {transaction.type === 'USAGE' ? '-' : '+'}{formatCost(Math.abs(transaction.amount_cents))}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {transaction.twilio_sid ? (
                          <span className="font-mono text-xs">{transaction.twilio_sid.substring(0, 8)}...</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-600 dark:text-gray-400 italic">
                      No transaction history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-right">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </Card>
      )}

      {/* Phone Dialer Modal */}
      {showPhoneDialer && (
        <PhoneDialer
          isOpen={showPhoneDialer}
          onClose={() => setShowPhoneDialer(false)}
          onCall={handleStartCall}
          agentName="TruIndee"
          agentAvatar="https://images.pexels.com/photos/5704849/pexels-photo-5704849.jpeg?auto=compress&cs=tinysrgb&w=600"
        />
      )}

      {/* SMS Messaging Modal */}
      {showSMSMessaging && (
        <SMSMessaging
          isOpen={showSMSMessaging}
          onClose={() => setShowSMSMessaging(false)}
          phoneNumber="+15551234567" // Your Twilio phone number
        />
      )}
    </div>
  );
}