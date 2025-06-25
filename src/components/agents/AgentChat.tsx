import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  X, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Download,
  Share2,
  Copy,
  Check,
  Crown,
  Edit,
  Phone,
  PhoneOff,
  PhoneCall
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAgentChat } from '../../hooks/useAgentChat';
import { useSubscription } from '../../hooks/useSubscription';
import { EditAgentModal } from './EditAgentModal';
import { PhoneDialer } from '../dialer/PhoneDialer';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

interface AgentChatProps {
  agentName: string;
  initialMessage?: string;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export function AgentChat({ agentName, initialMessage, onClose }: AgentChatProps) {
  const [input, setInput] = useState(initialMessage || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhoneDialer, setShowPhoneDialer] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    agents,
    clearMessages,
    updateAgent,
    generateVoiceResponse
  } = useAgentChat();
  
  const { features, currentTier } = useSubscription();
  const { isFeatureEnabled } = useFeatureFlags();
  const isPro = currentTier === 'pro' || currentTier === 'enterprise';
  const phoneFeatureEnabled = isFeatureEnabled('PHONE_DIALER');

  // Find the current agent
  const currentAgent = agents.find(agent => agent.name === agentName) || agents[0];
  
  // Check if this agent is available (PAM is always available, others require Pro)
  const isAgentAvailable = agentName === 'PAM' || isPro;

  // Check if this is a custom agent
  const isCustomAgent = currentAgent?.id && parseInt(currentAgent.id) > 8;

  // Get agent avatar
  const getAgentAvatar = () => {
    // First check if the agent has a custom avatar
    if (currentAgent && currentAgent.avatarUrl) {
      return currentAgent.avatarUrl;
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

  // Get agent header image
  const getAgentHeader = () => {
    // First check if the agent has a custom header
    if (currentAgent && currentAgent.headerUrl) {
      return currentAgent.headerUrl;
    }
    
    // Otherwise use default headers
    switch(agentName) {
      case 'PAM':
        return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
      case 'Business Manager':
        return 'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
      case 'Rights Manager':
        return 'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
      case 'LegalBot':
        return 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
      case 'CreativeMuse':
        return 'https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
      case 'Content Manager':
        return 'https://images.pexels.com/photos/3059748/pexels-photo-3059748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
      case 'Social Media Manager':
        return 'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
      case 'Graphic Designer':
        return 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
      default:
        return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && isAgentAvailable) {
      sendMessage(initialMessage, agentName);
      setInput('');
    }
  }, [initialMessage, agentName, sendMessage, isAgentAvailable]);

  // Play audio when a new assistant message is received
  useEffect(() => {
    if (messages.length > 0 && !isMuted && !isInCall) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        playVoiceResponse(lastMessage.content);
      }
    }
  }, [messages, isMuted, isInCall]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && isAgentAvailable) {
      sendMessage(input, agentName);
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

  const playVoiceResponse = async (text: string) => {
    if (isMuted || !audioRef.current) return;
    
    try {
      // Get the voice ID from the current agent
      const voiceId = currentAgent?.voice_id || 'eleven-labs-rachel';
      
      // Generate voice response using Eleven Labs
      const audioUrl = await generateVoiceResponse(text, voiceId);
      
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Error playing voice response:", error);
    }
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSaveAgent = (updatedAgent: any) => {
    updateAgent(updatedAgent);
    setShowEditModal(false);
  };

  const handlePhoneCall = () => {
    if (!isPro || !phoneFeatureEnabled) {
      features.apiAccess().showUpgrade();
      return;
    }
    
    setShowPhoneDialer(true);
  };

  const handleStartCall = (phoneNumber: string) => {
    setIsInCall(true);
    setShowPhoneDialer(false);
    // In a real implementation, this would initiate a call via Twilio
  };

  const handleEndCall = () => {
    setIsInCall(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`
          bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col
          ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px] w-full'}
        `}
      >
        {/* Header with background image */}
        <div className="relative">
          {/* Background header image */}
          <div className="h-24 relative">
            <img 
              src={getAgentHeader()} 
              alt={`${agentName} header`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          
          {/* Header content */}
          <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                <img 
                  src={getAgentAvatar()} 
                  alt={agentName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-white text-shadow">
                  {currentAgent?.name || agentName}
                </h3>
                <p className="text-xs text-white/90 text-shadow">
                  {currentAgent?.role || 'AI Assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isAgentAvailable && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => features.apiAccess().showUpgrade()}
                  className="text-white hover:bg-white/20"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                </Button>
              )}
              {isCustomAgent && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="text-white hover:bg-white/20"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {phoneFeatureEnabled && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handlePhoneCall}
                  className="text-white hover:bg-white/20"
                  disabled={isInCall}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/20"
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
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
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
              onClick={handleEndCall}
              className="text-white hover:bg-white/20"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isAgentAvailable ? (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upgrade to Pro to Chat with {agentName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                PAM is available on all plans, but additional AI team members like {agentName} require a Pro subscription.
              </p>
              <Button onClick={() => features.apiAccess().showUpgrade()}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How can I help you today?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {currentAgent?.name === 'PAM' && 'Ask me about career planning, release strategies, or day-to-day management tasks.'}
                {currentAgent?.name === 'LegalBot' && 'Ask me about contracts, copyright, licensing, or other legal matters.'}
                {currentAgent?.name === 'CreativeMuse' && 'Ask me for creative inspiration for your music, lyrics, visuals, or marketing.'}
                {currentAgent?.name === 'Business Manager' && 'Ask me about financial planning, budgeting, or business strategy.'}
                {currentAgent?.name === 'Rights Manager' && 'Ask me about copyright, licensing, or intellectual property.'}
                {currentAgent?.name === 'Content Manager' && 'Ask me about content strategy, planning, or creation.'}
                {currentAgent?.name === 'Social Media Manager' && 'Ask me about social media strategy, engagement, or analytics.'}
                {currentAgent?.name === 'Graphic Designer' && 'Ask me about visual design, branding, or typography.'}
                {!['PAM', 'LegalBot', 'CreativeMuse', 'Business Manager', 'Rights Manager', 'Content Manager', 'Social Media Manager', 'Graphic Designer'].includes(currentAgent?.name || '') && 'Ask me anything related to my expertise and I\'ll do my best to assist you.'}
              </p>
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
                      src={getAgentAvatar()} 
                      alt={agentName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`relative max-w-[80%] rounded-lg p-4 group ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user'
                      ? 'text-primary-200'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {/* Message actions */}
                  {message.role === 'assistant' && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => playVoiceResponse(message.content)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Volume2 className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
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
                  src={getAgentAvatar()} 
                  alt={agentName}
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
          <div ref={messagesEndRef} />
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
              disabled={!isAgentAvailable}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAgentAvailable ? `Ask ${currentAgent?.name || agentName} something...` : 'Upgrade to Pro to chat with this agent'}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading || isRecording || !isAgentAvailable}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || isRecording || !isAgentAvailable}
              className="rounded-full p-2"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div>
              Logic Level: {currentAgent?.logic_level || 'MEDIUM'}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => clearMessages()}
                className="hover:text-gray-700 dark:hover:text-gray-300"
                disabled={!isAgentAvailable}
              >
                Clear Chat
              </button>
              <button 
                className="hover:text-gray-700 dark:hover:text-gray-300"
                disabled={!isAgentAvailable}
              >
                <Download className="w-3 h-3" />
              </button>
              <button 
                className="hover:text-gray-700 dark:hover:text-gray-300"
                disabled={!isAgentAvailable}
              >
                <Share2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Agent Modal */}
      {showEditModal && currentAgent && (
        <EditAgentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          agent={currentAgent}
          onSave={handleSaveAgent}
          onDelete={() => {
            // In a real app, this would delete the agent
            // For demo, we'll just close the modal and chat
            setShowEditModal(false);
            onClose();
          }}
        />
      )}

      {/* Phone Dialer Modal */}
      {showPhoneDialer && (
        <PhoneDialer
          isOpen={showPhoneDialer}
          onClose={() => setShowPhoneDialer(false)}
          onCall={handleStartCall}
          agentName={agentName}
          agentAvatar={getAgentAvatar()}
        />
      )}

      {/* Audio player for voice responses */}
      <audio ref={audioRef} className="hidden" />
    </>
  );
}