import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Mic, 
  Send, 
  Settings, 
  Volume2, 
  VolumeX,
  Pause,
  Play,
  Loader,
  Crown,
  Plus,
  Phone
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAgentChat } from '../../hooks/useAgentChat';
import { useSubscription } from '../../hooks/useSubscription';
import { UpgradeModal } from '../ui/UpgradeModal';
import { Link } from 'react-router-dom';
import { CreateAgentModal } from './CreateAgentModal';
import { PhoneDialer } from '../dialer/PhoneDialer';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export function AgentLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('PAM');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPhoneDialer, setShowPhoneDialer] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const { features, upgradeModal, closeUpgradeModal, currentTier } = useSubscription();
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    agents,
    clearMessages,
    createCustomAgent,
    makePhoneCall,
    generateVoiceResponse
  } = useAgentChat();

  // Check if user has access to agent chat
  const agentAccess = features.apiAccess();
  const isPro = currentTier === 'pro' || currentTier === 'enterprise';

  // Filter agents based on subscription
  const availableAgents = agents.filter(agent => {
    // PAM is available to all users
    if (agent.name === 'PAM') return true;
    // Other agents require Pro subscription
    return isPro;
  });

  // Get agent avatar
  const getAgentAvatar = (agentName: string) => {
    // Find the agent
    const agent = agents.find(a => a.name === agentName);
    
    // If agent has a custom avatar, use it
    if (agent && agent.avatarUrl) {
      return agent.avatarUrl;
    }
    
    // Otherwise use default avatars
    switch(agentName) {
      case 'PAM':
        return 'https://images.pexels.com/photos/5704849/pexels-photo-5704849.jpeg?auto=compress&cs=tinysrgb&w=600';
      case 'Business Manager':
        return 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=600';
      case 'Rights Manager':
        return 'https://images.pexels.com/photos/5668770/pexels-photo-5668770.jpeg?auto=compress&cs=tinysrgb&w=600';
      case 'LegalBot':
        return 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=600';
      case 'CreativeMuse':
        return 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600';
      case 'Content Manager':
        return 'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=600';
      case 'Social Media Manager':
        return 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600';
      case 'Graphic Designer':
        return 'https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg?auto=compress&cs=tinysrgb&w=600';
      default:
        return 'https://images.pexels.com/photos/5704849/pexels-photo-5704849.jpeg?auto=compress&cs=tinysrgb&w=600';
    }
  };

  // Handle keyboard shortcut to open/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input, selectedAgent);
      setInput('');
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startVoiceRecording();
    } else {
      stopVoiceRecording();
    }
  };

  const startVoiceRecording = () => {
    if (!navigator.mediaDevices) {
      console.error("Media devices not supported");
      return;
    }

    setIsRecording(true);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });
        
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // In a real implementation, we would send this to a speech-to-text service
          // For demo purposes, we'll simulate a response after a delay
          setTimeout(() => {
            setIsRecording(false);
            setInput("How can I promote my new release?");
          }, 2000);
        });
        
        mediaRecorder.start();
        
        // Stop recording after 5 seconds for demo
        setTimeout(() => {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }, 5000);
      })
      .catch(error => {
        console.error("Error accessing microphone:", error);
        setIsRecording(false);
      });
  };

  const stopVoiceRecording = () => {
    // This would be called to manually stop recording
    setIsRecording(false);
  };

  const handleLaunch = () => {
    setIsOpen(true);
  };

  const handleCreateAgent = (newAgent: any) => {
    createCustomAgent(newAgent);
    setShowCreateModal(false);
  };

  const handlePhoneCall = () => {
    if (!isPro) {
      features.apiAccess().showUpgrade();
      return;
    }
    
    setShowPhoneDialer(true);
  };

  const handleStartCall = (phoneNumber: string) => {
    setIsInCall(true);
    setShowPhoneDialer(false);
    makePhoneCall(phoneNumber, selectedAgent);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLaunch}
          className="w-14 h-14 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center shadow-lg"
        >
          <Bot className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Chat dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src={getAgentAvatar(selectedAgent)} 
                      alt={selectedAgent}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 pr-8"
                    >
                      {availableAgents.map((agent) => (
                        <option key={agent.id} value={agent.name}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedAgent === 'PAM' && 'Personal Artist Manager'}
                      {selectedAgent === 'LegalBot' && 'Music Legal Assistant'}
                      {selectedAgent === 'CreativeMuse' && 'Creative Inspiration'}
                      {selectedAgent === 'Business Manager' && 'Financial Advisor'}
                      {selectedAgent === 'Rights Manager' && 'Legal Specialist'}
                      {selectedAgent === 'Content Manager' && 'Content Strategist'}
                      {selectedAgent === 'Social Media Manager' && 'Social Media Expert'}
                      {selectedAgent === 'Graphic Designer' && 'Visual Artist'}
                      {!['PAM', 'LegalBot', 'CreativeMuse', 'Business Manager', 'Rights Manager', 'Content Manager', 'Social Media Manager', 'Graphic Designer'].includes(selectedAgent) && 'Custom Agent'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handlePhoneCall}
                    disabled={isInCall}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  {!isPro && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => features.apiAccess().showUpgrade()}
                    >
                      <Crown className="w-4 h-4 text-amber-500" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => clearMessages()}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Active Call Indicator */}
              {isInCall && (
                <div className="bg-green-600 text-white px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Active Call</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsInCall(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                      <img 
                        src={getAgentAvatar(selectedAgent)} 
                        alt={selectedAgent}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      How can I help you today?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      {selectedAgent === 'PAM' && 'Ask me about career planning, release strategies, or day-to-day management tasks.'}
                      {selectedAgent === 'LegalBot' && 'Ask me about contracts, copyright, licensing, or other legal matters.'}
                      {selectedAgent === 'CreativeMuse' && 'Ask me for creative inspiration for your music, lyrics, visuals, or marketing.'}
                      {selectedAgent === 'Business Manager' && 'Ask me about financial planning, budgeting, or business strategy.'}
                      {selectedAgent === 'Rights Manager' && 'Ask me about copyright, licensing, or intellectual property.'}
                      {selectedAgent === 'Content Manager' && 'Ask me about content strategy, planning, or creation.'}
                      {selectedAgent === 'Social Media Manager' && 'Ask me about social media strategy, engagement, or analytics.'}
                      {selectedAgent === 'Graphic Designer' && 'Ask me about visual design, branding, or typography.'}
                      {!['PAM', 'LegalBot', 'CreativeMuse', 'Business Manager', 'Rights Manager', 'Content Manager', 'Social Media Manager', 'Graphic Designer'].includes(selectedAgent) && 'Ask me anything related to my expertise and I\'ll do my best to assist you.'}
                    </p>
                    
                    {!isPro && selectedAgent === 'PAM' && (
                      <div className="mt-4">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => features.apiAccess().showUpgrade()}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {user?.email === 'artistdemo@truindee.com' ? 'Sign up to unlock more AI team members' : 'Upgrade to unlock more AI team members'}
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        as={Link}
                        to="/ai-team"
                        onClick={() => setIsOpen(false)}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        View All AI Team Members
                      </Button>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 self-end mb-1">
                          <img 
                            src={getAgentAvatar(selectedAgent)} 
                            alt={selectedAgent}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user'
                            ? 'text-primary-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 ml-2 flex-shrink-0 self-end mb-1">
                          <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold">
                            YOU
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 self-end mb-1">
                      <img 
                        src={getAgentAvatar(selectedAgent)} 
                        alt={selectedAgent}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 dark:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleRecording}
                    className={`rounded-full p-2 ${isRecording ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}`}
                  >
                    {isRecording ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </Button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask ${selectedAgent} something...`}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading || isRecording}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading || isRecording}
                    className="rounded-full p-2"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">⌘/</kbd> to open
                  </div>
                  <div>
                    {selectedAgent === 'PAM' && 'Logic Level: MEDIUM'}
                    {selectedAgent === 'LegalBot' && 'Logic Level: MAX'}
                    {selectedAgent === 'CreativeMuse' && 'Logic Level: MIN'}
                    {selectedAgent === 'Business Manager' && 'Logic Level: MAX'}
                    {selectedAgent === 'Rights Manager' && 'Logic Level: MAX'}
                    {selectedAgent === 'Content Manager' && 'Logic Level: MEDIUM'}
                    {selectedAgent === 'Social Media Manager' && 'Logic Level: MEDIUM'}
                    {selectedAgent === 'Graphic Designer' && 'Logic Level: MIN'}
                    {!['PAM', 'LegalBot', 'CreativeMuse', 'Business Manager', 'Rights Manager', 'Content Manager', 'Social Media Manager', 'Graphic Designer'].includes(selectedAgent) && 'Custom Agent'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateAgent}
        isPro={isPro}
        onUpgrade={() => features.apiAccess().showUpgrade()}
      />

      {/* Phone Dialer Modal */}
      <PhoneDialer
        isOpen={showPhoneDialer}
        onClose={() => setShowPhoneDialer(false)}
        onCall={handleStartCall}
        agentName={selectedAgent}
        agentAvatar={getAgentAvatar(selectedAgent)}
      />

      {/* Audio player (hidden) */}
      <audio id="agent-speech" className="hidden" />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={closeUpgradeModal}
        feature={upgradeModal.feature}
        requiredTier={upgradeModal.requiredTier}
      />
    </>
  );
}