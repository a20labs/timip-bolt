import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Bot,
  Key,
  Globe,
  Crown,
  Plug,
  Phone,
  Lock,
  Trash2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AccountOwnerTest } from '../components/auth/AccountOwnerTest';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeModal } from '../components/ui/UpgradeModal';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { BillingSettings } from '../components/settings/BillingSettings';
import { CommunicationsSettings } from '../components/settings/CommunicationsSettings';
import { ApiKeySettings } from '../components/settings/ApiKeySettings';
import { IntegrationSettings } from '../components/settings/IntegrationSettings';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import { useStripe } from '../hooks/useStripe';

interface Agent {
  id: string;
  name: string;
  persona: string;
  voice_id: string;
  logic_level: string;
  active?: boolean;
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();
  const { features, upgradeModal, closeUpgradeModal, currentTier } = useSubscription();
  const { user, signOut } = useAuthStore();
  const { createCheckoutSession } = useStripe();
  
  // Enterprise tier is now called "Indie Label" in the UI, but the internal key remains "enterprise"
  const isPro = currentTier === 'pro' || currentTier === 'enterprise'; // No change in the logic

  // Determine if user has access to advanced settings
  const getUserRole = () => {
    if (user?.email === 'artistdemo@truindee.com') return 'artist';
    if (user?.email === 'fandemo@truindee.com') return 'fan';
    return user?.role || 'artist';
  };
  
  const isFan = getUserRole() === 'fan';
  const isAccountOwner = user?.user_metadata?.is_account_owner || false;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  // Add Data Deletion Option
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Add subscription management
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  
  // Check if user has access to advanced settings
  const hasAdvancedAccess = !isFan && (isAccountOwner || isAdmin || user?.role === 'superadmin');

  // Add function to handle user deletion
  const handleUserDeletion = async (userId: string) => {
    try {
      // In a real app, this would call the API to delete user data
      console.log(`Deleting user: ${userId}`);
      
      // Mock successful deletion
      setTimeout(() => {
        signOut();
      }, 2000);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Fetch agents
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async (): Promise<Agent[]> => {
      // In a real app, this would call Supabase to get agents
      // For demo, return mock data
      return [
        {
          id: '1',
          name: 'PAM',
          persona: 'You are PAM (Personal Artist Manager), an AI assistant for musicians and artists. You help with career planning, release strategies, and day-to-day management tasks. You are professional, supportive, and knowledgeable about the music industry. Always provide actionable advice tailored to the artist\'s specific situation and goals.',
          voice_id: 'eleven-labs-rachel',
          logic_level: 'MEDIUM',
          active: true
        },
        {
          id: '2',
          name: 'LegalBot',
          persona: 'You are LegalBot, an AI assistant specializing in music industry legal matters. You help artists understand contracts, copyright, and licensing. You simplify complex legal concepts but always remind users to consult with a qualified attorney for specific legal advice. You are precise, clear, and educational in your responses.',
          voice_id: 'eleven-labs-antoni',
          logic_level: 'MAX',
          active: isPro
        },
        {
          id: '3',
          name: 'CreativeMuse',
          persona: 'You are CreativeMuse, an AI assistant for creative inspiration. You help artists brainstorm ideas for music, lyrics, visual content, and marketing campaigns. You are imaginative, encouraging, and think outside the box. You ask thought-provoking questions and suggest unexpected connections to spark creativity.',
          voice_id: 'eleven-labs-bella',
          logic_level: 'MIN',
          active: isPro
        },
        {
          id: '4',
          name: 'Business Manager',
          persona: 'You are a Business Manager AI assistant specializing in financial planning, budgeting, and business strategy for musicians and artists. You provide clear, actionable advice on revenue optimization, expense management, and financial growth strategies. You are detail-oriented, practical, and focused on helping artists build sustainable careers.',
          voice_id: 'eleven-labs-antoni',
          logic_level: 'MAX',
          active: false
        },
        {
          id: '5',
          name: 'Rights Manager',
          persona: 'You are a Rights Manager AI assistant specializing in copyright, licensing, and intellectual property for musicians and artists. You help artists understand and protect their rights, navigate licensing opportunities, and maximize the value of their intellectual property. You are knowledgeable, precise, and focused on empowering artists to maintain control of their work.',
          voice_id: 'eleven-labs-josh',
          logic_level: 'MAX',
          active: false
        },
        {
          id: '6',
          name: 'Content Manager',
          persona: 'You are a Content Manager AI assistant specializing in content strategy and creation for musicians and artists. You help plan, create, and optimize content across various platforms to engage fans and promote music. You are organized, creative, and focused on helping artists build a consistent and compelling online presence.',
          voice_id: 'eleven-labs-bella',
          logic_level: 'MEDIUM',
          active: false
        },
        {
          id: '7',
          name: 'Social Media Manager',
          persona: 'You are a Social Media Manager AI assistant specializing in social media strategy and engagement for musicians and artists. You help plan, create, and optimize social media content to build and engage with fan communities. You are trend-aware, strategic, and focused on helping artists build authentic connections with their audience.',
          voice_id: 'eleven-labs-rachel',
          logic_level: 'MEDIUM',
          active: false
        },
        {
          id: '8',
          name: 'Graphic Designer',
          persona: 'You are a Graphic Designer AI assistant specializing in visual content creation for musicians and artists. You help conceptualize and describe visual designs for album covers, social media, merchandise, and other promotional materials. You are visually-oriented, creative, and focused on helping artists develop a cohesive visual identity.',
          voice_id: 'eleven-labs-josh',
          logic_level: 'MIN',
          active: false
        }
      ];
    },
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (agent: Agent) => {
      // In a real app, this would call Supabase to update the agent
      console.log('Updating agent:', agent);
      return agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  // Activate agent mutation
  const activateAgentMutation = useMutation({
    mutationFn: async ({ agentId, active }: { agentId: string; active: boolean }) => {
      // In a real app, this would call Supabase to activate/deactivate the agent
      console.log(`${active ? 'Activating' : 'Deactivating'} agent:`, agentId);
      return { agentId, active };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const handleSaveAgent = (agent: Agent) => {
    updateAgentMutation.mutate(agent);
  };

  const handleActivateAgent = (agentId: string, active: boolean) => {
    if (!isPro && active) {
      features.apiAccess().showUpgrade();
      return;
    }
    activateAgentMutation.mutate({ agentId, active });
  };

  const handleAddAgent = () => {
    if (!isPro) {
      features.apiAccess().showUpgrade();
      return;
    }
    // Add agent functionality would go here
  };

  // Filter active agents for display
  const activeAgents = agents?.filter(agent => agent.active) || [];
  const inactiveAgents = agents?.filter(agent => !agent.active) || [];

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile information and preferences
            </p>
            {/* Profile settings content would go here */}
          </div>
        );
      
      case 'agents':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Agents
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your AI team members
                </p>
              </div>
              <Button onClick={handleAddAgent}>
                <Bot className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </div>

            {!isPro && (
              <Card className="p-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-200 dark:border-primary-900">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <Crown className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      Upgrade to Pro to Unlock All AI Team Members
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      PAM is available on all plans, but additional AI team members require a Pro subscription.
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => features.apiAccess().showUpgrade()}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Active Agents */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Active Agents
              </h3>
              <div className="space-y-4">
                {activeAgents.map((agent) => (
                  <Card key={agent.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                          <Bot className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {agent.name === 'PAM' && 'Personal Artist Manager'}
                            {agent.name === 'LegalBot' && 'Music Legal Assistant'}
                            {agent.name === 'CreativeMuse' && 'Creative Inspiration'}
                            {agent.name === 'Business Manager' && 'Financial Advisor'}
                            {agent.name === 'Rights Manager' && 'Legal Specialist'}
                            {agent.name === 'Content Manager' && 'Content Strategist'}
                            {agent.name === 'Social Media Manager' && 'Social Media Expert'}
                            {agent.name === 'Graphic Designer' && 'Visual Artist'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.logic_level === 'MAX' 
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                            : agent.logic_level === 'MEDIUM'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                        }`}>
                          {agent.logic_level}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleActivateAgent(agent.id, false)}
                          disabled={agent.name === 'PAM'} // PAM cannot be deactivated
                        >
                          Deactivate
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSaveAgent(agent)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Inactive Agents */}
            {inactiveAgents.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Available Agents
                </h3>
                <div className="space-y-4">
                  {inactiveAgents.map((agent) => (
                    <Card key={agent.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Bot className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {agent.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {agent.name === 'PAM' && 'Personal Artist Manager'}
                              {agent.name === 'LegalBot' && 'Music Legal Assistant'}
                              {agent.name === 'CreativeMuse' && 'Creative Inspiration'}
                              {agent.name === 'Business Manager' && 'Financial Advisor'}
                              {agent.name === 'Rights Manager' && 'Legal Specialist'}
                              {agent.name === 'Content Manager' && 'Content Strategist'}
                              {agent.name === 'Social Media Manager' && 'Social Media Expert'}
                              {agent.name === 'Graphic Designer' && 'Visual Artist'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleActivateAgent(agent.id, true)}
                          >
                            {isPro ? 'Activate' : (
                              <>
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSaveAgent(agent)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'account':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Account Owner System
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Test and manage account ownership functionality
            </p>
            <AccountOwnerTest />
          </div>
        );
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Privacy Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your data and privacy preferences
                </p>
              </div>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Your Data
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Download Your Data
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Get a copy of all the data associated with your account
                  </p>
                  <Button variant="outline">
                    Download Data
                  </Button>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-900 dark:text-red-300">
                    Delete Account and Data
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    This action permanently deletes your account and all associated data
                  </p>
                  <Button 
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete my account and data
                  </Button>
                </div>
              </div>
              
              {showDeleteConfirm && (
                <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-900">
                  <h4 className="font-medium text-red-900 dark:text-red-300 mb-2">
                    Confirm Account Deletion
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                    This will permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleUserDeletion(user?.id || '')}
                    >
                      Permanently Delete
                    </Button>
                  </div>
                </div>
              )}
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Privacy Resources
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Privacy Policy
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Read our Privacy Policy to understand how we handle your data
                  </p>
                  <Link to="/privacy-policy">
                    <Button variant="outline">
                      View Privacy Policy
                    </Button>
                  </Link>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Data Deletion Instructions
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Learn how to delete your data from our platform
                  </p>
                  <Link to="/privacy/data-deletion">
                    <Button variant="outline">
                      View Instructions
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        );
      
      case 'subscription':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Subscription Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your subscription plan and payment details
                </p>
              </div>
              <Button 
                onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                variant={showUpgradeOptions ? "outline" : "primary"}
              >
                {showUpgradeOptions ? "Hide Options" : "Change Plan"}
              </Button>
            </div>
            
            {/* Current Plan */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Current Plan
              </h3>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {currentTier === 'free' ? 'Starter' : 
                       currentTier === 'pro' ? 'Pro Artist' : 
                       currentTier === 'enterprise' ? 'Indie Label' : 
                       'Unknown Plan'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentTier === 'free' ? 
                        '5 track uploads/month, Basic analytics, Community access' : 
                       currentTier === 'pro' ? 
                        'Unlimited tracks, Advanced analytics, API access, Priority support' : 
                       currentTier === 'enterprise' ? 
                        'Everything in Pro, White-labeling, Custom integrations, Dedicated support' : 
                        'Plan details unavailable'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentTier === 'free' ? 
                        '$0' : 
                       currentTier === 'pro' ? 
                        '$59.99' : 
                       currentTier === 'enterprise' ? 
                        '$249.99' : 
                        'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      per month
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Upgrade Options */}
              {showUpgradeOptions && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Available Plans
                  </h4>
                  
                  {currentTier === 'free' && (
                    <div className="p-4 border border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            Pro Artist
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Unlimited tracks, Advanced analytics, API access, Priority support
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            $59.99
                          </p>
                          <Button 
                            size="sm"
                            onClick={() => createCheckoutSession('price_1Rdyc84fVYS0vpWMPcMIkqbP')}
                          >
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(currentTier === 'free' || currentTier === 'pro') && (
                    <div className="p-4 border border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            Indie Label
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Everything in Pro, White-labeling, Custom integrations, Dedicated support
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            $249.99
                          </p>
                          <Button 
                            size="sm"
                            onClick={() => createCheckoutSession('price_1RdyfT4fVYS0vpWMgeGm7yJQ')}
                          >
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentTier !== 'free' && (
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            Cancel Subscription
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            You'll have access until the end of your current billing period
                          </p>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20"
                        >
                          Cancel Plan
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
            
            {/* Payment Methods */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Payment Methods
              </h3>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Payment methods are managed through Stripe.
                </p>
                <div className="flex justify-center mt-4">
                  <Button>
                    Manage Payment Methods
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Billing History */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Billing History
              </h3>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  View and download your invoices.
                </p>
                <div className="flex justify-center mt-4">
                  <Button>
                    View Invoices
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );
      
      case 'notifications':
        return <NotificationSettings />;
      
      case 'security':
        return <SecuritySettings />;
      
      case 'billing':
        return <BillingSettings />;
      
      case 'communications':
        return <CommunicationsSettings />;
      
      case 'api':
        return <ApiKeySettings />;
      
      case 'integrations':
        return <IntegrationSettings />;
      
      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Language Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your language preferences
            </p>
            {/* Language settings content would go here */}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account and preferences
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="p-4 lg:col-span-1">
            <nav className="space-y-1">
              {[
                { id: 'profile', name: 'Profile', icon: User, restricted: false },
                { id: 'privacy', name: 'Privacy', icon: Lock, restricted: false },
                { id: 'subscription', name: 'Subscription', icon: Crown, restricted: false },
                { id: 'agents', name: 'AI Agents', icon: Bot, restricted: !hasAdvancedAccess },
                { id: 'account', name: 'Account Owner', icon: Crown, restricted: !hasAdvancedAccess },
                { id: 'notifications', name: 'Notifications', icon: Bell, restricted: false },
                { id: 'security', name: 'Security', icon: Shield, restricted: false },
                { id: 'billing', name: 'Billing', icon: CreditCard, restricted: false },
                { id: 'communications', name: 'Communications & Credits', icon: Phone, restricted: !hasAdvancedAccess },
                { id: 'api', name: 'API Keys', icon: Key, restricted: !hasAdvancedAccess },
                { id: 'integrations', name: 'Integrations', icon: Plug, restricted: !hasAdvancedAccess },
                { id: 'language', name: 'Language', icon: Globe, restricted: false },
              ].filter(item => !item.restricted).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}
            </nav>
          </Card>

          {/* Content */}
          <Card className="p-6 lg:col-span-3">
            {renderContent()}
          </Card>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={closeUpgradeModal}
        feature={upgradeModal.feature}
        requiredTier={upgradeModal.requiredTier === 'free' ? 'pro' : upgradeModal.requiredTier as 'pro' | 'enterprise'}
      />
    </>
  );
}

export default Settings;