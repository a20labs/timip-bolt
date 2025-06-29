import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, Zap, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { products } from '../stripe-config';
import { useStripe } from '../hooks/useStripe';
import { useSubscription } from '../hooks/useSubscription';

export function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutStatus, setCheckoutStatus] = useState<{
    type: 'success' | 'canceled' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const { createCheckoutSession, isLoading, error } = useStripe();
  const { currentTier } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for checkout status in URL and handle plan parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutParam = params.get('checkout');
    const planParam = params.get('plan');
    
    if (checkoutParam === 'success') {
      setCheckoutStatus({
        type: 'success',
        message: '🎉 Payment successful! Your subscription is being activated. This may take a few moments.'
      });
      // Remove the checkout parameter from URL
      const newParams = new URLSearchParams(location.search);
      newParams.delete('checkout');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    } else if (checkoutParam === 'canceled') {
      setCheckoutStatus({
        type: 'canceled',
        message: 'Checkout was canceled. You can select a plan and try again.'
      });
      // Remove the checkout parameter from URL
      const newParams = new URLSearchParams(location.search);
      newParams.delete('checkout');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    }

    // Handle automatic plan selection and checkout from URL parameter
    if (planParam) {
      const product = products.find(p => p.name === planParam);
      if (product && product.price > 0 && product.name !== 'Indee Label') {
        // Automatically trigger checkout for paid plans (except Indee Label which is contact sales)
        setTimeout(() => {
          createCheckoutSession(
            product.priceId,
            product.mode,
            '/settings?checkout=success'
          );
        }, 500); // Small delay to ensure the page is loaded
      }
      // Remove the plan parameter from URL after processing
      const newParams = new URLSearchParams(location.search);
      newParams.delete('plan');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    }
  }, [location, navigate, createCheckoutSession]);
  
  // Clear status messages after 10 seconds
  useEffect(() => {
    if (checkoutStatus.type) {
      const timer = setTimeout(() => {
        setCheckoutStatus({ type: null, message: '' });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [checkoutStatus.type]);
  
  const handleSelectPlan = (priceId: string) => {
    setSelectedPlan(priceId);
  };
  
  const handleCheckout = () => {
    if (selectedPlan) {
      createCheckoutSession(selectedPlan);
    }
  };
  
  const getYearlyPrice = (monthlyPrice: number) => {
    // 20% discount for yearly billing
    return (monthlyPrice * 12 * 0.8).toFixed(2);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Checkout Status Banner */}
      {checkoutStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-6 p-4 rounded-lg border ${
            checkoutStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium">{checkoutStatus.message}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCheckoutStatus({ type: null, message: '' })}
              className="text-current"
            >
              ×
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stripe Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Payment Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Select the plan that best fits your needs
        </p>
      </div>
      
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Yearly
            <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>
      
      {/* Checkout Status Message */}
      {checkoutStatus.message && (
        <div className={`mb-8 p-4 border rounded-lg text-sm ${checkoutStatus.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {checkoutStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {checkoutStatus.type === 'success' ? 'Success' : 'Notice'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {checkoutStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => {
          const isCurrentPlan = 
            (product.name === 'Starter' && currentTier === 'free') ||
            (product.name === 'Pro Artist' && currentTier === 'pro') ||
            (product.name === 'Indee Label' && currentTier === 'enterprise');
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: products.indexOf(product) * 0.1 }}
              className={`
                bg-white dark:bg-dark-800 p-8 rounded-xl shadow-sm 
                ${product.highlighted ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}
                ${selectedPlan === product.priceId ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}
                relative
              `}
            >
              {product.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${billingCycle === 'monthly' ? product.price : getYearlyPrice(product.price)}
                </span>
                {product.price > 0 && (
                  <span className="text-gray-600 dark:text-gray-400">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
                {billingCycle === 'yearly' && product.price > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Save 20% with annual billing
                  </p>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {product.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={product.highlighted ? 'primary' : 'outline'}
                onClick={() => handleSelectPlan(product.priceId)}
                disabled={isCurrentPlan || isLoading}
              >
                {isCurrentPlan ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Current Plan
                  </>
                ) : (
                  <>
                    {product.name === 'Pro Artist' && <Crown className="w-4 h-4 mr-2" />}
                    {product.name === 'Starter' ? 'Start Free Trial' : `Choose ${product.name}`}
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
      
      {/* Checkout Button */}
      {selectedPlan && (
        <div className="mt-12 text-center">
          <Button 
            size="lg"
            onClick={handleCheckout}
            loading={isLoading}
          >
            <Zap className="w-5 h-5 mr-2" />
            Proceed to Checkout
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            You'll be redirected to Stripe's secure checkout page.
          </p>
        </div>
      )}
      
      {/* Trust Indicators */}
      <div className="mt-16 text-center">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Secure Payment
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Cancel Anytime
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            30-Day Trial
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            No Hidden Fees
          </span>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;