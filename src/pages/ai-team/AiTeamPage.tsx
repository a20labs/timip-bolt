import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Users, 
  Briefcase, 
  Mic, 
  Settings,
  Info,
  Crown,
  Lock,
  Plus,
  Edit
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AgentChat } from '../../components/agents/AgentChat';
import { useSubscription } from '../../hooks/useSubscription';
import { UpgradeModal } from '../../components/ui/UpgradeModal';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Link } from 'react-router-dom';
import { CreateAgentModal } from '../../components/agents/CreateAgentModal';
import { EditAgentModal } from '../../components/agents/EditAgentModal';
import { useAuthStore } from '../../stores/authStore';

interface CustomAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: { name: string; value: number }[];
  avatarUrl: string;
  headerUrl?: string;
  isCustom: boolean;
}

interface AgentCardProps {
  name: string;
  role: string;
  description: string;
  skills: { name: string; value: number }[];
  onChat: () => void;
  onInfo: () => void;
  onEdit: () => void;
  locked?: boolean;
  avatarUrl: string;
  isCustom?: boolean;
}

function AgentCard({ 
  name, 
  role, 
  description, 
  skills, 
  onChat, 
  onInfo, 
  onEdit,
  locked = false, 
  avatarUrl,
  isCustom = false
}: AgentCardProps) {
  return (
    <Card className="p-6 relative" hover>
      {locked && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 p-4">
          <Lock className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-center text-gray-600 dark:text-gray-400 mb-3">
            Upgrade to Pro to unlock this AI team member
          </p>
          <Button size="sm">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade
          </Button>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <img 
            src={avatarUrl} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex gap-1">
          {isCustom && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onInfo}>
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {role}
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
        {description}
      </p>
      
      {skills.length > 0 && (
        <div className="space-y-2 mb-4">
          {skills.map((skill) => (
            <div key={skill.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{skill.name}</span>
                <span className="text-gray-900 dark:text-white font-medium">{skill.value}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${skill.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Button onClick={onChat} className="w-full">
        <Mic className="w-4 h-4 mr-2" />
        Chat with {name}
      </Button>
    </Card>
  );
}

export function AiTeamPage() {
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('PAM');
  const [showAgentInfo, setShowAgentInfo] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const { features, upgradeModal, closeUpgradeModal, currentTier } = useSubscription();
  const { user } = useAuthStore();
  
  // Check if user has access to agent chat (Pro or Indee Label tier)
  const agentAccess = features.apiAccess();
  const isPro = currentTier === 'pro' || currentTier === 'enterprise'; // No change in the logic

  // Custom agents (stored in local state for this demo)
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);

  const handleChatWithAgent = (agentName: string) => {
    // PAM and Remy are available to all users
    if (agentName === 'PAM' || agentName === 'Remy') {
      setSelectedAgent(agentName);
      setShowAgentChat(true);
      return;
    }
    
    // Other agents require Pro subscription
    if (!isPro) {
      agentAccess.showUpgrade();
      return;
    }
    
    setSelectedAgent(agentName);
    setShowAgentChat(true);
  };

  const handleShowAgentInfo = (agentName: string) => {
    setShowAgentInfo(agentName);
  };

  const handleEditAgent = (agent: CustomAgent) => {
    setEditingAgent(agent);
    setShowEditModal(true);
  };

  const handleCreateAgent = (newAgent: CustomAgent) => {
    setCustomAgents([...customAgents, newAgent]);
    setShowCreateModal(false);
  };

  const handleUpdateAgent = (updatedAgent: CustomAgent) => {
    setCustomAgents(customAgents.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ));
    setShowEditModal(false);
    setEditingAgent(null);
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      setCustomAgents(customAgents.filter(agent => agent.id !== agentId));
      setShowEditModal(false);
      setEditingAgent(null);
    }
  };

  // Professional team agents
  const professionalTeam = [
    {
      name: 'Remy',
      role: 'Fan Relations & Customer Service Manager',
      description: 'Your warm, enthusiastic community-centric support specialist. Combines superfan energy with VIP concierge service.',
      skills: [
        { name: 'Fan Engagement', value: 98 },
        { name: 'Customer Support', value: 95 },
        { name: 'Community Building', value: 92 }
      ],
      locked: false, // Remy is available to all users
      avatarUrl: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'PAM',
      role: 'Personal Artist Manager',
      description: 'Your dedicated AI manager for career guidance and development.',
      skills: [
        { name: 'Career Strategy', value: 95 },
        { name: 'Artist Development', value: 92 },
        { name: 'Industry Knowledge', value: 88 }
      ],
      locked: false, // PAM is available to all users
      avatarUrl: 'https://images.pexels.com/photos/5704849/pexels-photo-5704849.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'Business Manager',
      role: 'Financial Advisor',
      description: 'Handles financial planning, budgeting, and business strategy.',
      skills: [
        { name: 'Financial Planning', value: 95 },
        { name: 'Revenue Optimization', value: 90 },
        { name: 'Business Strategy', value: 92 }
      ],
      locked: !isPro,
      avatarUrl: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'Rights Manager',
      role: 'Legal Specialist',
      description: 'Manages copyright, licensing, and intellectual property.',
      skills: [
        { name: 'Copyright Management', value: 94 },
        { name: 'Licensing', value: 90 },
        { name: 'Contract Analysis', value: 88 }
      ],
      locked: !isPro,
      avatarUrl: 'https://images.pexels.com/photos/5668770/pexels-photo-5668770.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'LegalBot',
      role: 'Legal Assistant',
      description: 'Simplifies music contracts and legal matters for artists.',
      skills: [
        { name: 'Contract Analysis', value: 93 },
        { name: 'Legal Guidance', value: 89 },
        { name: 'Rights Management', value: 91 }
      ],
      locked: !isPro,
      avatarUrl: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  // Creative team agents
  const creativeTeam = [
    {
      name: 'CreativeMuse',
      role: 'Creative Director',
      description: 'Brainstorms marketing ideas and creative concepts.',
      skills: [
        { name: 'Creative Ideation', value: 96 },
        { name: 'Marketing Strategy', value: 88 },
        { name: 'Trend Analysis', value: 90 }
      ],
      locked: !isPro,
      avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'Content Manager',
      role: 'Content Strategist',
      description: 'Oversees content creation and strategy.',
      skills: [
        { name: 'Content Planning', value: 93 },
        { name: 'Editorial Calendar', value: 89 },
        { name: 'Content Analytics', value: 87 }
      ],
      locked: !isPro,
      avatarUrl: 'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/3059748/pexels-photo-3059748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'Social Media Manager',
      role: 'Social Media Expert',
      description: 'Manages social media presence and campaigns.',
      skills: [
        { name: 'Platform Strategy', value: 94 },
        { name: 'Engagement', value: 92 },
        { name: 'Analytics', value: 89 }
      ],
      locked: !isPro,
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'Graphic Designer',
      role: 'Visual Artist',
      description: 'Creates visual content and designs.',
      skills: [
        { name: 'Visual Design', value: 95 },
        { name: 'Brand Identity', value: 91 },
        { name: 'Typography', value: 88 }
      ],
      locked: !isPro,
      avatarUrl: 'https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  // Find the current agent for the info modal
  const currentAgent = [...professionalTeam, ...creativeTeam, ...customAgents].find(a => a.name === showAgentInfo);

  return (
    <>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'AI Team' }]} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Team</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your AI-powered professional and creative team
            </p>
          </div>
          <div className="flex gap-3">
            {!isPro && (
              <Button 
                variant="outline" 
                onClick={() => features.apiAccess().showUpgrade()}
              >
                <Crown className="w-4 h-4 mr-2" />
                {user?.email === 'artistdemo@truindee.com' ? 'Sign Up Now' : 'Upgrade to Pro'}
              </Button>
            )}
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Agent
            </Button>
            <Button variant="outline" onClick={() => handleChatWithAgent('Remy')}>
              <Bot className="w-4 h-4 mr-2" />
              Chat with Remy
            </Button>
            <Button onClick={() => handleChatWithAgent('PAM')}>
              <Bot className="w-4 h-4 mr-2" />
              Chat with PAM
            </Button>
          </div>
        </motion.div>

        {/* Subscription Banner (if not Pro) */}
        {!isPro && (
          <Card className="p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-200 dark:border-primary-900">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Crown className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Upgrade to Pro Artist to Unlock All AI Team Members
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Upgrade to Pro to access all AI team members. Remy (Fan Relations) and PAM (Artist Manager) are available on all plans, but the full team is exclusive to Pro subscribers.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => features.apiAccess().showUpgrade()}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {user?.email === 'artistdemo@truindee.com' ? 'Sign Up Now' : 'Upgrade Now'}
                  </Button>
                  <Button 
                    variant="outline"
                    as={Link}
                    to="/settings"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Settings
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Custom Agents (if any) */}
        {customAgents.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Bot className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Custom Agents
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {customAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  name={agent.name}
                  role={agent.role}
                  description={agent.description}
                  skills={agent.skills || []}
                  onChat={() => handleChatWithAgent(agent.name)}
                  onInfo={() => handleShowAgentInfo(agent.name)}
                  onEdit={() => handleEditAgent(agent)}
                  locked={!isPro}
                  avatarUrl={agent.avatarUrl}
                  isCustom={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Professional Team */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Professional Team
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionalTeam.map((agent) => (
              <AgentCard
                key={agent.name}
                name={agent.name}
                role={agent.role}
                description={agent.description}
                skills={agent.skills}
                onChat={() => handleChatWithAgent(agent.name)}
                onInfo={() => handleShowAgentInfo(agent.name)}
                onEdit={() => {}}
                locked={agent.locked}
                avatarUrl={agent.avatarUrl}
              />
            ))}
          </div>
        </div>

        {/* Creative Team */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Creative Team
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creativeTeam.map((agent) => (
              <AgentCard
                key={agent.name}
                name={agent.name}
                role={agent.role}
                description={agent.description}
                skills={agent.skills}
                onChat={() => handleChatWithAgent(agent.name)}
                onInfo={() => handleShowAgentInfo(agent.name)}
                onEdit={() => {}}
                locked={agent.locked}
                avatarUrl={agent.avatarUrl}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Agent Chat Modal */}
      {showAgentChat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAgentChat(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[80vh]"
          >
            <AgentChat 
              agentName={selectedAgent}
              onClose={() => setShowAgentChat(false)}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Agent Info Modal */}
      {showAgentInfo && currentAgent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAgentInfo(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden w-full max-w-md"
          >
            {/* Header Image */}
            <div className="h-32 relative">
              <img 
                src={currentAgent.headerUrl || currentAgent.avatarUrl} 
                alt={`${currentAgent.name} header`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            
            <div className="p-6 relative">
              {/* Avatar (positioned to overlap the header) */}
              <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
                <img 
                  src={currentAgent.avatarUrl} 
                  alt={currentAgent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content (with margin to account for the avatar) */}
              <div className="mt-14">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentAgent.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {currentAgent.role}
                </p>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {currentAgent.description}
                </p>

                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white">Skills</h4>
                  {currentAgent.skills.map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{skill.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${skill.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowAgentInfo(null)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setShowAgentInfo(null);
                      handleChatWithAgent(currentAgent.name);
                    }}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Chat Now
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateAgent}
        isPro={isPro}
        onUpgrade={() => features.apiAccess().showUpgrade()}
      />

      {/* Edit Agent Modal */}
      {editingAgent && (
        <EditAgentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingAgent(null);
          }}
          agent={editingAgent}
          onSave={handleUpdateAgent}
          onDelete={handleDeleteAgent}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={closeUpgradeModal}
        feature={upgradeModal.feature}
        requiredTier={upgradeModal.requiredTier === 'free' ? 'pro' : upgradeModal.requiredTier === 'trial' ? 'pro' : upgradeModal.requiredTier}
      />
    </>
  );
}

export default AiTeamPage;