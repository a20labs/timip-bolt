import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Save, Volume2, Sliders, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Agent {
  id: string;
  name: string;
  persona: string;
  voice_id: string;
  logic_level: string;
}

interface AgentSettingsProps {
  agents: Agent[];
  onSave: (agent: Agent) => void;
  onDelete: (agentId: string) => void;
}

export function AgentSettings({ agents, onSave, onDelete }: AgentSettingsProps) {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (agent: Agent) => {
    setEditingAgent({ ...agent });
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (editingAgent) {
      onSave(editingAgent);
      setShowEditModal(false);
      setEditingAgent(null);
    }
  };

  const handleDelete = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      onDelete(agentId);
    }
  };

  const getLogicLevelColor = (level: string) => {
    switch (level) {
      case 'MAX':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'MEDIUM':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'MIN':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Agents
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your AI assistants
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-6" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Bot className="w-6 h-6 text-primary-600" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogicLevelColor(agent.logic_level)}`}>
                {agent.logic_level}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {agent.persona.substring(0, 100)}...
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Volume2 className="w-4 h-4" />
                <span>Voice: {agent.voice_id.split('-').pop()}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(agent)}
              >
                <Sliders className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingAgent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Edit {editingAgent.name}
            </h3>
            <div className="space-y-4">
              <Input
                label="Name"
                value={editingAgent.name}
                onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                placeholder="Agent name"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Persona
                </label>
                <textarea
                  value={editingAgent.persona}
                  onChange={(e) => setEditingAgent({ ...editingAgent, persona: e.target.value })}
                  placeholder="Agent persona/system prompt"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice
                </label>
                <select
                  value={editingAgent.voice_id}
                  onChange={(e) => setEditingAgent({ ...editingAgent, voice_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="eleven-labs-rachel">Rachel (Female)</option>
                  <option value="eleven-labs-antoni">Antoni (Male)</option>
                  <option value="eleven-labs-bella">Bella (Female)</option>
                  <option value="eleven-labs-josh">Josh (Male)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logic Level
                </label>
                <select
                  value={editingAgent.logic_level}
                  onChange={(e) => setEditingAgent({ ...editingAgent, logic_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="MAX">MAX - Highly analytical</option>
                  <option value="MEDIUM">MEDIUM - Balanced</option>
                  <option value="MIN">MIN - Creative, less constrained</option>
                </select>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDelete(editingAgent.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}