import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  CreditCard, 
  FileText, 
  Users, 
  Download,
  ExternalLink,
  Plus,
  Crown
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeModal } from '../components/ui/UpgradeModal';

const tabs = [
  { id: 'payouts', name: 'Payouts', icon: DollarSign },
  { id: 'splits', name: 'Royalty Splits', icon: Users },
  { id: 'taxes', name: 'Taxes', icon: FileText },
];

const payoutHistory = [
  { date: '2024-11-01', amount: 247.50, status: 'completed', platform: 'Spotify' },
  { date: '2024-10-01', amount: 189.23, status: 'completed', platform: 'Apple Music' },
  { date: '2024-09-01', amount: 156.78, status: 'completed', platform: 'YouTube Music' },
];

const royaltySplits = [
  { track: 'Midnight Dreams', collaborator: 'Producer Mike', percentage: 25, status: 'active' },
  { track: 'Electric Nights', collaborator: 'Songwriter Jane', percentage: 15, status: 'pending' },
  { track: 'Summer Vibes', collaborator: 'Mixer Alex', percentage: 10, status: 'active' },
];

export function Finances() {
  const [activeTab, setActiveTab] = useState('payouts');
  const { features, upgradeModal, closeUpgradeModal } = useSubscription();

  const handleTabClick = (tabId: string) => {
    if (tabId === 'splits') {
      const access = features.payoutSplits();
      if (!access.hasAccess) {
        access.showUpgrade();
        return;
      }
    }
    if (tabId === 'taxes') {
      const access = features.taxManagement();
      if (!access.hasAccess) {
        access.showUpgrade();
        return;
      }
    }
    setActiveTab(tabId);
  };

  return (
    <>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Finances' }]} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finances</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage payouts, royalty splits, and tax documents
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </motion.div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Next Payout
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $324.67
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dec 1, 2024
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Earned (YTD)
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $3,247.89
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  +15.3% vs last year
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bank Account
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ****4567
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chase Bank
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all relative
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              {((tab.id === 'splits' && !features.payoutSplits().hasAccess) ||
                (tab.id === 'taxes' && !features.taxManagement().hasAccess)) && (
                <Crown className="w-3 h-3 text-amber-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'payouts' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payout History
              </h3>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Stripe Dashboard
              </Button>
            </div>
            
            {payoutHistory.length > 0 ? (
              <div className="space-y-4">
                {payoutHistory.map((payout, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${payout.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payout.platform} • {payout.date}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
                      {payout.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="Connect Stripe to automate payouts"
                description="Link your Stripe account to receive automatic monthly payouts from your streaming revenue."
                actionLabel="Connect Stripe"
              />
            )}
          </Card>
        )}

        {activeTab === 'splits' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Royalty Splits
              </h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Split
              </Button>
            </div>
            
            {royaltySplits.length > 0 ? (
              <div className="space-y-4">
                {royaltySplits.map((split, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {split.track}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {split.collaborator} • {split.percentage}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        split.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {split.status}
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Add collaborators to keep everybody paid on time"
                description="Set up automatic royalty splits for producers, songwriters, and other collaborators."
                actionLabel="Add First Collaborator"
              />
            )}
          </Card>
        )}

        {activeTab === 'taxes' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Tax Documents
            </h3>
            
            <EmptyState
              icon={FileText}
              title="We generate tax docs every January for you"
              description="Your 1099-K and other tax documents will be automatically generated and available for download each tax season."
              actionLabel="Download 2023 Documents"
            />
          </Card>
        )}
      </div>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={closeUpgradeModal}
        feature={upgradeModal.feature}
        requiredTier={upgradeModal.requiredTier}
      />
    </>
  );
}