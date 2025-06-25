import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Plus, 
  Disc3,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { TaskCard } from '../components/ui/TaskCard';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

const tabs = [
  { id: 'planner', name: 'Planner', icon: Calendar },
  { id: 'compliance', name: 'Compliance', icon: CheckCircle },
  { id: 'milestones', name: 'Milestones', icon: Target },
];

const complianceSteps = [
  { id: 'isrc', name: 'ISRC Registration', status: 'completed', description: 'International Standard Recording Codes assigned' },
  { id: 'upc', name: 'UPC Barcodes', status: 'completed', description: 'Universal Product Codes obtained' },
  { id: 'ein', name: 'LLC/EIN Setup', status: 'completed', description: 'Business registration complete' },
];

const milestones = [
  { name: 'Pre-saves Campaign', status: 'pending', date: 'Dec 15, 2024', description: 'Launch pre-save campaign on streaming platforms' },
  { name: 'Cover Art Reveal', status: 'pending', date: 'Dec 20, 2024', description: 'Share album artwork on social media' },
  { name: 'Video Premiere', status: 'pending', date: 'Jan 5, 2025', description: 'Release music video on YouTube' },
];

export function Releases() {
  const [activeTab, setActiveTab] = useState('planner');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const hasReleases = false; // In real app, check if user has any releases

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Releases' }]} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Releases</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan, schedule, and manage your music releases
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Release
        </Button>
      </motion.div>

      {!hasReleases ? (
        <Card className="p-8">
          <EmptyState
            icon={Disc3}
            title="Start by picking a release date"
            description="We'll build the timeline for you with all the important milestones and compliance requirements."
            actionLabel="Create Your First Release"
            onAction={() => setShowCreateModal(true)}
          />
        </Card>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'planner' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Release Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Summer Vibes EP</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Release Date: January 15, 2025</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      In Progress
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'compliance' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compliance Checklist
              </h3>
              <div className="space-y-4">
                {complianceSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{step.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                      Complete
                    </span>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✅ All green! You're compliant and ready to publish.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'milestones' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Release Milestones
              </h3>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <TaskCard
                    key={index}
                    title={milestone.name}
                    description={milestone.description}
                    status={milestone.status as any}
                    dueDate={milestone.date}
                    actionLabel="Set Up"
                  />
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Milestones help keep fans engaged along the way to your release.
                </p>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Create Release Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Release
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Release Title
                </label>
                <input
                  type="text"
                  placeholder="Enter release title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Release Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option>Single</option>
                  <option>EP</option>
                  <option>Album</option>
                  <option>Compilation</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button>Create Release</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}