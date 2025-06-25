import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Plug, Phone, Bot, CreditCard, Globe, CheckCircle, AlertTriangle, RefreshCw, Key, Lock, Eye, EyeOff, Instagram, Twitter, Youtube, AlignJustify as Spotify, Facebook, Mail, Info, Calendar, FileText, Database } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSubscription } from '../../hooks/useSubscription';

interface Integration {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  category: 'communications' | 'ai' | 'payment' | 'social' | 'analytics' | 'google';
  isConnected: boolean;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  isConfigured?: boolean;
  isPro?: boolean;
  credentials?: {
    key?: string;
    secret?: string;
    token?: string;
    accountId?: string;
  };
}

export function IntegrationSettings() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { features, currentTier } = useSubscription();
  const isPro = currentTier === 'pro' || currentTier === 'enterprise';
  
  const toggleShowSecret = (id: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Mock integrations data - in a real app, this would come from an API
  const integrations: Integration[] = [
    // Communications
    {
      id: 'twilio',
      name: 'Twilio',
      icon: Phone,
      category: 'communications',
      isConnected: true,
      status: 'active',
      lastSync: '2025-06-08T15:30:00Z',
      credentials: {
        accountId: 'AC1234567890',
        key: 'SK1234567890abcdef',
        secret: '••••••••••••••••'
      }
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      icon: Mail,
      category: 'communications',
      isConnected: false,
      status: 'inactive',
      isConfigured: false
    },
    
    // AI Services
    {
      id: 'openai',
      name: 'OpenAI',
      icon: Bot,
      category: 'ai',
      isConnected: true,
      status: 'active',
      lastSync: '2025-06-07T12:15:00Z',
      credentials: {
        key: 'sk-•••••••••••••••••••••••••••••',
      }
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      icon: Bot,
      category: 'ai',
      isConnected: true,
      status: 'active',
      lastSync: '2025-06-08T09:45:00Z',
      credentials: {
        key: '•••••••••••••••••••••••••',
      }
    },
    
    // Payment Providers
    {
      id: 'stripe',
      name: 'Stripe',
      icon: CreditCard,
      category: 'payment',
      isConnected: true,
      status: 'active',
      lastSync: '2025-06-08T10:20:00Z',
      credentials: {
        key: 'pk_test_•••••••••••••••••',
        secret: 'sk_test_•••••••••••••••••'
      }
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: CreditCard,
      category: 'payment',
      isConnected: false,
      status: 'inactive',
      isPro: true,
      isConfigured: false
    },
    
    // Social Media
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      category: 'social',
      isConnected: true,
      status: 'error',
      lastSync: '2025-06-05T16:45:00Z',
      credentials: {
        token: '•••••••••••••••••••••'
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      category: 'social',
      isConnected: false,
      status: 'inactive',
      isConfigured: false
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      category: 'social',
      isConnected: false,
      status: 'inactive',
      isConfigured: false
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      category: 'social',
      isConnected: false,
      status: 'inactive',
      isPro: true,
      isConfigured: false
    },
    
    // Analytics & Music Services
    {
      id: 'spotify',
      name: 'Spotify for Artists',
      icon: Spotify,
      category: 'analytics',
      isConnected: true,
      status: 'active',
      lastSync: '2025-06-08T14:10:00Z',
      credentials: {
        token: '•••••••••••••••••••••••••'
      }
    },
    {
      id: 'google',
      name: 'Google Analytics',
      icon: Globe,
      category: 'analytics',
      isConnected: false,
      status: 'inactive',
      isPro: true,
      isConfigured: false
    },
    
    // Google Workspace Integrations
    {
      id: 'google-mail',
      name: 'Google Mail',
      icon: Mail,
      category: 'google',
      isConnected: false,
      status: 'inactive',
      isPro: true,
      isConfigured: false
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: Calendar,
      category: 'google',
      isConnected: false,
      status: 'inactive',
      isPro: true,
      isConfigured: false
    },
    {
      id: 'google-docs',
      name: 'Google Docs',
      icon: FileText,
      category: 'google',
      isConnected: false,
      status: 'inactive',
      isPro: true,
      isConfigured: false
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: Database,
      category: 'google',
      isConnected: false,
      status: 'inactive',
      isPro: true,
      isConfigured: false
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: Database,
      category: 'google',
      isConnected: false,
      status: 'inactive',
      isPro: true,
      isConfigured: false
    }
  ];

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="w-2 h-2 bg-green-500 rounded-full"></span>;
      case 'error':
        return <span className="w-2 h-2 bg-red-500 rounded-full"></span>;
      default:
        return <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></span>;
    }
  };

  const handleConnectIntegration = (integration: Integration) => {
    // For pro-only integrations, show upgrade prompt if not on pro plan
    if (integration.isPro && !isPro) {
      features.apiAccess().showUpgrade();
      return;
    }
    
    setEditingIntegration(integration);
    setFormData(integration.credentials || {});
  };

  const handleDisconnectIntegration = (integrationId: string) => {
    // In a real app, this would call an API to remove credentials
    console.log(`Disconnecting integration ${integrationId}`);
  };

  const handleSaveIntegration = () => {
    if (!editingIntegration) return;
    
    // In a real app, this would validate and save the credentials
    console.log(`Saving credentials for ${editingIntegration.name}:`, formData);
    setEditingIntegration(null);
  };

  const handleCancelEdit = () => {
    setEditingIntegration(null);
    setFormData({});
  };

  const renderIntegrationsByCategory = (category: Integration['category'], title: string) => {
    const categoryIntegrations = integrations.filter(integration => integration.category === category);
    
    if (categoryIntegrations.length === 0) return null;
    
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        
        <div className="space-y-4">
          {categoryIntegrations.map(integration => (
            <Card key={integration.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <integration.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {integration.name}
                      </h4>
                      {integration.isPro && !isPro && (
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs rounded-full">
                          Pro
                        </span>
                      )}
                      <div className="flex items-center gap-1 ml-2">
                        {getStatusIndicator(integration.status)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {integration.isConnected ? (
                            integration.status === 'error' ? 'Connection Error' : 'Connected'
                          ) : (
                            'Not Connected'
                          )}
                        </span>
                      </div>
                    </div>
                    {integration.lastSync && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last synced: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  {integration.isConnected ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConnectIntegration(integration)}
                      >
                        Configure
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectIntegration(integration.id)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleConnectIntegration(integration)}
                    >
                      <Plug className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Integrations
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your account to third-party services
          </p>
        </div>
      </div>
      
      {/* Introduction Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-medium text-blue-800 dark:text-blue-200">
              About Integrations
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Connect TruIndee with your favorite services to streamline your workflow. Integrations allow you to automate tasks, synchronize data, and enhance your music business operations.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Integrations by Category */}
      <div className="space-y-8">
        {renderIntegrationsByCategory('communications', 'Communications')}
        {renderIntegrationsByCategory('ai', 'AI Services')}
        {renderIntegrationsByCategory('payment', 'Payment Providers')}
        {renderIntegrationsByCategory('google', 'Google Workspace')}
        {renderIntegrationsByCategory('social', 'Social Media')}
        {renderIntegrationsByCategory('analytics', 'Analytics & Music Services')}
      </div>
      
      {/* Integration Configuration Modal */}
      {editingIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <editingIntegration.icon className="w-5 h-5" />
              Configure {editingIntegration.name}
            </h3>
            
            <div className="space-y-4">
              {/* Twilio-specific fields */}
              {editingIntegration.id === 'twilio' && (
                <>
                  <Input 
                    label="Account SID" 
                    value={formData.accountId || ''} 
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})} 
                    required
                  />
                  <div className="relative">
                    <Input 
                      label="API Key" 
                      value={formData.key || ''} 
                      onChange={(e) => setFormData({...formData, key: e.target.value})} 
                      type={showSecrets[editingIntegration.id] ? "text" : "password"}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => toggleShowSecret(editingIntegration.id)}
                      className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[editingIntegration.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input 
                      label="API Secret" 
                      value={formData.secret || ''} 
                      onChange={(e) => setFormData({...formData, secret: e.target.value})} 
                      type={showSecrets[`${editingIntegration.id}_secret`] ? "text" : "password"}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => toggleShowSecret(`${editingIntegration.id}_secret`)}
                      className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[`${editingIntegration.id}_secret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}
              
              {/* OpenAI-specific fields */}
              {editingIntegration.id === 'openai' && (
                <div className="relative">
                  <Input 
                    label="API Key" 
                    value={formData.key || ''} 
                    onChange={(e) => setFormData({...formData, key: e.target.value})} 
                    type={showSecrets[editingIntegration.id] ? "text" : "password"}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => toggleShowSecret(editingIntegration.id)}
                    className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets[editingIntegration.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
              
              {/* ElevenLabs-specific fields */}
              {editingIntegration.id === 'elevenlabs' && (
                <div className="relative">
                  <Input 
                    label="API Key" 
                    value={formData.key || ''} 
                    onChange={(e) => setFormData({...formData, key: e.target.value})} 
                    type={showSecrets[editingIntegration.id] ? "text" : "password"}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => toggleShowSecret(editingIntegration.id)}
                    className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets[editingIntegration.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
              
              {/* Stripe-specific fields */}
              {editingIntegration.id === 'stripe' && (
                <>
                  <div className="relative">
                    <Input 
                      label="Publishable Key" 
                      value={formData.key || ''} 
                      onChange={(e) => setFormData({...formData, key: e.target.value})} 
                      type={showSecrets[editingIntegration.id] ? "text" : "password"}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => toggleShowSecret(editingIntegration.id)}
                      className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[editingIntegration.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input 
                      label="Secret Key" 
                      value={formData.secret || ''} 
                      onChange={(e) => setFormData({...formData, secret: e.target.value})} 
                      type={showSecrets[`${editingIntegration.id}_secret`] ? "text" : "password"}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => toggleShowSecret(`${editingIntegration.id}_secret`)}
                      className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[`${editingIntegration.id}_secret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}
              
              {/* Social media tokens */}
              {['instagram', 'twitter', 'facebook', 'youtube', 'spotify'].includes(editingIntegration.id) && (
                <>
                  <div className="relative">
                    <Input 
                      label="Access Token" 
                      value={formData.token || ''} 
                      onChange={(e) => setFormData({...formData, token: e.target.value})} 
                      type={showSecrets[editingIntegration.id] ? "text" : "password"}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => toggleShowSecret(editingIntegration.id)}
                      className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[editingIntegration.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <button className="text-primary-600 hover:underline">
                      Click here to authorize via OAuth
                    </button>
                  </p>
                </>
              )}
              
              {/* Google Workspace OAuth */}
              {['google-mail', 'google-calendar', 'google-docs', 'google-sheets', 'google-drive'].includes(editingIntegration.id) && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Connect your Google Workspace account to enable integration with {editingIntegration.name}.
                  </p>
                  <Button className="w-full">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Connect with Google
                  </Button>
                </>
              )}

              {/* Security notice */}
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your API keys are encrypted and stored securely. We never share your credentials with third parties.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveIntegration}>
                Save Configuration
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}