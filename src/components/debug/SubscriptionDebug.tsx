import { useSubscription } from '../../hooks/useSubscription';
import { Card } from '../ui/Card';

export function SubscriptionDebug() {
  const { currentTier, stripeSubscription, isLoading, features } = useSubscription();

  return (
    <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
      <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
        🔧 Subscription Debug Info
      </h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Current Tier:</strong> {currentTier}
        </div>
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Stripe Subscription:</strong> {stripeSubscription ? (
            <div className="ml-4 mt-1">
              <div>Status: {stripeSubscription.subscription_status}</div>
              <div>Price ID: {stripeSubscription.price_id}</div>
              <div>Customer ID: {stripeSubscription.customer_id}</div>
            </div>
          ) : 'None'}
        </div>
        <div>
          <strong>API Access:</strong> {features.apiAccess().hasAccess ? '✅ Granted' : '❌ Requires Pro'}
        </div>
        <div>
          <strong>Advanced Analytics:</strong> {features.advancedAnalytics().hasAccess ? '✅ Granted' : '❌ Requires Pro'}
        </div>
      </div>
    </Card>
  );
}
