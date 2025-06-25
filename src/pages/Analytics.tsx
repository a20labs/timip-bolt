import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Play, DollarSign, Calendar, Crown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeModal } from '../components/ui/UpgradeModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const streamData = [
  { name: 'Jan', streams: 4000, revenue: 240 },
  { name: 'Feb', streams: 3000, revenue: 180 },
  { name: 'Mar', streams: 5000, revenue: 300 },
  { name: 'Apr', streams: 7000, revenue: 420 },
  { name: 'May', streams: 6000, revenue: 360 },
  { name: 'Jun', streams: 8000, revenue: 480 },
];

const topTracks = [
  { name: 'Midnight Dreams', streams: 15420, revenue: 924 },
  { name: 'Electric Nights', streams: 12380, revenue: 743 },
  { name: 'Summer Vibes', streams: 9870, revenue: 592 },
  { name: 'City Lights', streams: 8910, revenue: 535 },
  { name: 'Ocean Waves', streams: 7650, revenue: 459 },
];

const audienceData = [
  { name: '18-24', value: 30, color: '#8b5cf6' },
  { name: '25-34', value: 45, color: '#10b981' },
  { name: '35-44', value: 20, color: '#f97316' },
  { name: '45+', value: 5, color: '#ef4444' },
];

const tabs = [
  { id: 'audience', name: 'Audience', icon: Users, requiresUpgrade: false },
  { id: 'revenue', name: 'Revenue', icon: DollarSign, requiresUpgrade: true },
  { id: 'campaigns', name: 'Campaigns', icon: TrendingUp, requiresUpgrade: true },
];

export function Analytics() {
  const [activeTab, setActiveTab] = useState('audience');
  const [timeRange, setTimeRange] = useState('6m');
  const { features, upgradeModal, closeUpgradeModal } = useSubscription();

  const handleTabClick = (tabId: string, requiresUpgrade: boolean) => {
    if (requiresUpgrade) {
      if (tabId === 'revenue') {
        features.revenueTracking().showUpgrade();
      } else if (tabId === 'campaigns') {
        features.campaignAnalytics().showUpgrade();
      }
    } else {
      setActiveTab(tabId);
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your music performance and audience insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Custom Range
            </Button>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Total Streams', value: '145.2K', change: '+12.5%', icon: Play, requiresUpgrade: false },
            { name: 'Total Revenue', value: '$2,847', change: '+8.3%', icon: DollarSign, requiresUpgrade: true },
            { name: 'Active Listeners', value: '12.4K', change: '+15.7%', icon: Users, requiresUpgrade: false },
            { name: 'Avg. Engagement', value: '68%', change: '+3.2%', icon: TrendingUp, requiresUpgrade: true },
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 relative" hover>
                {stat.requiresUpgrade && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className={`text-2xl font-bold ${
                      stat.requiresUpgrade 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {stat.requiresUpgrade ? '••••' : stat.value}
                    </p>
                    <p className={`text-sm ${
                      stat.requiresUpgrade 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {stat.requiresUpgrade ? '•••' : stat.change}
                    </p>
                  </div>
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <stat.icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                {stat.requiresUpgrade && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center">
                    <Button 
                      size="sm"
                      onClick={() => {
                        if (stat.name.includes('Revenue')) {
                          features.revenueTracking().showUpgrade();
                        } else {
                          features.advancedAnalytics().showUpgrade();
                        }
                      }}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Streams Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Streams & Revenue Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={streamData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="streams"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                strokeDasharray={features.revenueTracking().hasAccess ? "0" : "5 5"}
                opacity={features.revenueTracking().hasAccess ? 1 : 0.3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.requiresUpgrade)}
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
              {tab.requiresUpgrade && (
                <Crown className="w-3 h-3 text-amber-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === 'audience' && (
            <>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Age Demographics
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={audienceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {audienceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Locations
                </h3>
                <div className="space-y-3">
                  {['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia'].map((country, index) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">{country}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.floor(Math.random() * 30 + 10)}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Top Tracks */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Top Performing Tracks
          </h2>
          <div className="space-y-4">
            {topTracks.map((track, index) => (
              <div key={track.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{track.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {track.streams.toLocaleString()} streams
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {features.revenueTracking().hasAccess ? `$${track.revenue}` : '••••'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
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