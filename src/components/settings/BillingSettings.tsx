import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Crown, 
  CheckCircle, 
  Plus,
  RefreshCw,
  Zap,
  ArrowRight,
  Clock,
  ShieldCheck,
  Receipt,
  Link,
  FileText,
  BarChart3,
  AlertTriangle,
  Users,
  Database,
  HardDrive,
  Trash2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSubscription } from '../../hooks/useSubscription';

export function BillingSettings() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
    saveCard: true,
    makeDefault: true
  });
  const { currentTier, features } = useSubscription();
  
  const mockBillingHistory = [
    { id: 'INV-001', date: '2024-06-01', amount: 29.99, status: 'Paid', period: 'Jun 1 - Jul 1, 2024' },
    { id: 'INV-002', date: '2024-05-01', amount: 29.99, status: 'Paid', period: 'May 1 - Jun 1, 2024' },
    { id: 'INV-003', date: '2024-04-01', amount: 29.99, status: 'Paid', period: 'Apr 1 - May 1, 2024' },
  ];
  
  const plans = [
    {
      name: 'Starter',
      price: 0,
      features: [
        '5 track uploads/month', 
        'Basic analytics', 
        'Community access',
        'Standard support'
      ],
      limits: {
        storage: '500 MB',
        bandwidth: '10 GB/month',
        collaborators: '1'
      },
      cta: 'Current Plan',
      popular: false,
      current: currentTier === 'free'
    },
    {
      name: 'Pro Artist',
      price: 59.99,
      yearlyPrice: 575.90, // Save ~$144 (20%)
      features: [
        'Unlimited tracks',
        'Advanced analytics', 
        'API access', 
        'Priority support',
        'Custom branding',
        'Royalty splits',
        'Release scheduling'
      ],
      limits: {
        storage: '50 GB',
        bandwidth: '100 GB/month',
        collaborators: '5'
      },
      cta: currentTier === 'free' ? 'Upgrade' : currentTier === 'pro' ? 'Current Plan' : 'Downgrade',
      popular: true,
      current: currentTier === 'pro'
    },
    {
      name: 'Indie Label',
      price: 249.99,
      yearlyPrice: 2399.90, // Save ~$600 (20%)
      features: [
        'Everything in Pro',
        'White-labeling',
        'Custom integrations', 
        'Dedicated account manager', 
        'SLA guarantees',
        'Advanced compliance tools',
        'Multi-workspace management'
      ],
      limits: {
        storage: 'Unlimited',
        bandwidth: 'Unlimited',
        collaborators: 'Unlimited'
      },
      cta: currentTier === 'enterprise' ? 'Current Plan' : 'Contact Sales',
      popular: false,
      current: currentTier === 'enterprise'
    }
  ];
  
  const mockPaymentMethods = [
    { id: '1', last4: '4242', brand: 'Visa', expMonth: 12, expYear: 2025, isDefault: true },
    { id: '2', last4: '5555', brand: 'Mastercard', expMonth: 8, expYear: 2026, isDefault: false },
  ];
  
  const [currentPlan] = plans.filter(plan => plan.current);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showUsageDetails, setShowUsageDetails] = useState(false);
  
  const usageMetrics = {
    storage: {
      used: 28.5,
      total: 50,
      unit: 'GB',
      percentage: 57
    },
    bandwidth: {
      used: 42.3,
      total: 100,
      unit: 'GB',
      percentage: 42.3
    },
    collaborators: {
      used: 3,
      total: 5,
      unit: '',
      percentage: 60
    },
    apiCalls: {
      used: 42500,
      total: 100000,
      unit: '',
      percentage: 42.5
    }
  };
  
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would process the new card with Stripe or another provider
    console.log('Processing new card:', paymentForm);
    setShowAddCard(false);
  };
  
  const setDefaultPaymentMethod = (id: string) => {
    // In a real app, this would update the default payment method
    console.log(`Setting payment method ${id} as default`);
  };
  
  const removePaymentMethod = (id: string) => {
    // In a real app, this would remove the payment method
    console.log(`Removing payment method ${id}`);
  };
  
  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would download the invoice PDF
    console.log(`Downloading invoice ${invoiceId}`);
  };
  
  const handleChangePlan = (planName: string) => {
    // Don't do anything if clicking on current plan
    if (planName.toLowerCase() === currentTier) return;
    
    // For enterprise, show a contact form or redirect
    if (planName === 'Enterprise' && currentTier !== 'enterprise') {
      window.alert('Our sales team will contact you about Enterprise plans. Thank you for your interest!');
      return;
    }
    
    setSelectedPlan(planName);
    setShowUpgradeConfirm(true);
  };
  
  const confirmPlanChange = () => {
    // In a real app, this would change the subscription plan
    console.log(`Changing plan to ${selectedPlan}`);
    setShowUpgradeConfirm(false);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Billing & Subscription
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your subscription, payment methods, and billing history
      </p>
      
      {/* Current Subscription */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Crown className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Current Subscription
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your plan and subscription details
            </p>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentPlan.name} Plan
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Billed {billingCycle}
                </p>
                {currentTier !== 'free' && (
                  <div className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full">
                    <CalendarClock className="w-3 h-3" />
                    <span>Renews Jul 1, 2024</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${currentTier === 'free' 
                  ? '0' 
                  : billingCycle === 'monthly' 
                    ? (currentTier === 'pro' ? '59.99' : '249.99')
                    : (currentTier === 'pro' ? '575.90' : '2399.90')
                }
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </p>
              {currentTier !== 'free' && billingCycle === 'yearly' && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  You save 20% with annual billing
                </p>
              )}
            </div>
          </div>
          
          {currentTier !== 'free' && (
            <>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your subscription is active and in good standing
                </p>
              </div>
              
              {/* Billing cycle toggle */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                      billingCycle === 'monthly'
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full flex items-center gap-1 ${
                      billingCycle === 'yearly'
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    Yearly
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full">
                      -20%
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Usage meters */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                Plan Limits & Usage
              </h5>
              <button
                onClick={() => setShowUsageDetails(!showUsageDetails)}
                className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-0.5"
              >
                {showUsageDetails ? 'Hide details' : 'Show details'}
                {showUsageDetails ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Storage</span>
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {usageMetrics.storage.used} {usageMetrics.storage.unit} / {usageMetrics.storage.total} {usageMetrics.storage.unit}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${usageMetrics.storage.percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Bandwidth</span>
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {usageMetrics.bandwidth.used} {usageMetrics.bandwidth.unit} / {usageMetrics.bandwidth.total} {usageMetrics.bandwidth.unit}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${usageMetrics.bandwidth.percentage}%` }}
                  ></div>
                </div>
              </div>

              {showUsageDetails && (
                <>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">Collaborators</span>
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {usageMetrics.collaborators.used} / {usageMetrics.collaborators.total}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${usageMetrics.collaborators.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">API Calls</span>
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {usageMetrics.apiCalls.used.toLocaleString()} / {usageMetrics.apiCalls.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${usageMetrics.apiCalls.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            {currentTier === 'free' ? (
              <Button className="flex-1" onClick={() => handleChangePlan('Pro')}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro Artist
              </Button>
            ) : (
              <>
                <Button 
                  className="flex-1"
                  onClick={() => window.alert('Subscription management section would open')}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Billing
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.alert('Cancellation process would begin')}
                >
                  Cancel Plan
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
      
      {/* Available Plans */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Zap className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Available Plans
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare plans and choose what's right for you
            </p>
          </div>
        </div>
        
        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Yearly
              <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`border rounded-lg overflow-hidden relative ${
                plan.popular 
                  ? 'border-primary-500 dark:border-primary-600' 
                  : 'border-gray-200 dark:border-gray-700'
              } ${plan.current ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}`}
            >
              {plan.popular && (
                <div className="bg-primary-500 text-white text-xs font-medium py-1 px-2 absolute top-0 right-0 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              <div className="p-5">
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {plan.name}
                </h4>
                <div className="mt-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${billingCycle === 'monthly' ? plan.price : plan.yearlyPrice ? plan.yearlyPrice / 12 : plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    /month
                  </span>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      ${plan.yearlyPrice} billed annually
                    </p>
                  )}
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">Plan includes:</h5>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Resource Limits */}
                <div className="mt-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium text-xs text-gray-800 dark:text-gray-200 mb-2 uppercase">Resource Limits</h5>
                  <ul className="space-y-1">
                    <li className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
                      <span>Storage</span>
                      <span className="font-medium">{plan.limits.storage}</span>
                    </li>
                    <li className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
                      <span>Bandwidth</span>
                      <span className="font-medium">{plan.limits.bandwidth}</span>
                    </li>
                    <li className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
                      <span>Collaborators</span>
                      <span className="font-medium">{plan.limits.collaborators}</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className={`w-full ${
                    plan.current 
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default hover:bg-gray-200 dark:hover:bg-gray-800'
                      : ''
                  }`}
                  disabled={plan.current}
                  onClick={() => !plan.current && handleChangePlan(plan.name)}
                >
                  {plan.current && (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {plan.cta}
                  {(!plan.current && plan.cta !== 'Contact Sales') && (
                    <ArrowRight className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Payment Methods */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Payment Methods
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your payment methods
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCard(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
        
        {mockPaymentMethods.length > 0 ? (
          <div className="space-y-4">
            {mockPaymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                    {method.brand === 'Visa' ? (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" />
                        <path d="M5 14L7.5 10L10 14" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 14V10" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 10V14L19 10V14" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" />
                        <circle cx="7" cy="12" r="2" fill="#EB001B" />
                        <circle cx="17" cy="12" r="2" fill="#F79E1B" />
                        <path d="M12 9V15" stroke="#FF5F00" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {method.brand} •••• {method.last4}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                      {method.isDefault && (
                        <span className="ml-2 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">
                          Default
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultPaymentMethod(method.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePaymentMethod(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No payment methods have been added yet
            </p>
            <Button onClick={() => setShowAddCard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        )}
        
        {/* Add Card Form */}
        {showAddCard && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Add New Payment Method
            </h4>
            <form className="space-y-4" onSubmit={handleAddCard}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                  required
                />
                <Input
                  label="Cardholder Name"
                  placeholder="John Doe"
                  value={paymentForm.cardName}
                  onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={paymentForm.expiry}
                  onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                  required
                />
                <Input
                  label="CVC"
                  placeholder="123"
                  type="password"
                  value={paymentForm.cvc}
                  onChange={(e) => setPaymentForm({...paymentForm, cvc: e.target.value})}
                  required
                />
              </div>
              
              {/* Save card options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.saveCard}
                    onChange={(e) => setPaymentForm({...paymentForm, saveCard: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Save card for future payments
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.makeDefault}
                    onChange={(e) => setPaymentForm({...paymentForm, makeDefault: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Make this my default payment method
                  </span>
                </label>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddCard(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Card
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </Card>
      
      {/* Billing History */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Receipt className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Billing History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and download your invoices
            </p>
          </div>
        </div>
        
        {mockBillingHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  <th className="pb-3 pl-4">Invoice</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockBillingHistory.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-4 pl-4 font-medium text-gray-900 dark:text-white">
                      {invoice.id}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 font-medium text-gray-900 dark:text-white">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">
                      {invoice.period}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.alert(`Viewing invoice ${invoice.id}`)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No billing history available
            </p>
          </div>
        )}
      </Card>
      
      {/* Tax Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Tax Information
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your tax settings and information
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Name
              </label>
              <Input defaultValue="TruIndee Demo Account" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax ID / VAT Number
              </label>
              <Input placeholder="Enter your tax ID or VAT number" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country / Region
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Germany</option>
                <option>Australia</option>
                <option>Japan</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State / Province
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option>California</option>
                <option>New York</option>
                <option>Texas</option>
                <option>Florida</option>
                <option>Illinois</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          
          {/* Tax Documents */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Tax Documents
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      W-9 Form
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Required for U.S. taxpayers
                    </p>
                  </div>
                </div>
                <Button size="sm">
                  Upload
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      1099-K (2023)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Payment card transactions
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button>
              Save Tax Information
            </Button>
          </div>
        </div>
      </Card>
      
      {/* FAQ */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Link className="w-4 h-4" />
          Billing FAQ
        </h3>
        
        <div className="space-y-3">
          <details className="group">
            <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
              How do refunds work?
            </summary>
            <div className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Refunds can be requested within 14 days of purchase. For subscription plans, you can cancel anytime but refunds are prorated based on usage. To request a refund, please contact our support team.
            </div>
          </details>
          
          <details className="group">
            <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
              Can I change plans mid-subscription?
            </summary>
            <div className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Yes, you can upgrade your plan at any time and the new charges will be prorated. Downgrading will take effect at the end of your current billing cycle. Changes can be made directly from your account settings.
            </div>
          </details>
          
          <details className="group">
            <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
              Do you offer annual billing?
            </summary>
            <div className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Yes, annual billing is available with a 20% discount compared to monthly billing. You can switch between monthly and annual billing at any time from your subscription settings.
            </div>
          </details>
          
          <details className="group">
            <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
              How do I update my payment information?
            </summary>
            <div className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              You can update your payment information at any time from the Payment Methods section. Your subscription will automatically use your default payment method for future charges.
            </div>
          </details>
          
          <details className="group">
            <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
              What happens if my payment fails?
            </summary>
            <div className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              If a payment fails, we'll automatically retry several times over the next week. You'll receive email notifications about failed payments, and your account will remain active during this grace period. If payment continues to fail, your account may be downgraded to the Free plan.
            </div>
          </details>
        </div>
      </Card>
      
      {/* Plan Change Confirmation Modal */}
      {showUpgradeConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpgradeConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Plan Change
            </h3>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {selectedPlan === 'Free' && currentTier !== 'free'
                ? 'Are you sure you want to downgrade to the Free plan? You will lose access to premium features at the end of your current billing period.'
                : `Are you sure you want to upgrade to the ${selectedPlan} plan? You will be charged immediately for the new plan.`
              }
            </p>
            
            {selectedPlan !== 'Free' && currentTier === 'free' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-start gap-2">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      You will be charged ${selectedPlan === 'Pro' ? '59.99' : '249.99'}{billingCycle === 'yearly' ? ' × 12 months with 20% discount' : ''}
                    </p>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Total: ${selectedPlan === 'Pro' ? '575.90' : '2399.90'} (Saving ${selectedPlan === 'Pro' ? '144' : '600'})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmPlanChange}
              >
                {selectedPlan === 'Free' ? 'Downgrade' : 'Upgrade'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}