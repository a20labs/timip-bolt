import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useSubscription } from './useSubscription';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  persona: string;
  voice_id: string;
  logic_level: string;
  active?: boolean;
  avatarUrl?: string;
  headerUrl?: string;
  role?: string;
  description?: string;
  skills?: { name: string; value: number }[];
}

export function useAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { currentTier } = useSubscription();
  
  const isPro = currentTier === 'pro' || currentTier === 'enterprise';

  // Mock agents data - in a real app, this would come from Supabase
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'PAM',
      persona: 'Personal Artist Manager',
      voice_id: 'eleven-labs-rachel',
      logic_level: 'MEDIUM',
      active: true, // PAM is always active
      avatarUrl: 'https://images.pexels.com/photos/5704849/pexels-photo-5704849.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      role: 'Personal Artist Manager',
      description: 'Your dedicated AI manager for career guidance and development.',
      skills: [
        { name: 'Career Strategy', value: 95 },
        { name: 'Artist Development', value: 92 },
        { name: 'Industry Knowledge', value: 88 }
      ]
    },
    {
      id: '2',
      name: 'LegalBot',
      persona: 'Music Legal Assistant',
      voice_id: 'eleven-labs-antoni',
      logic_level: 'MAX',
      active: isPro, // Only active for Pro users
      avatarUrl: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      role: 'Legal Assistant',
      description: 'Simplifies music contracts and legal matters for artists.',
      skills: [
        { name: 'Contract Analysis', value: 93 },
        { name: 'Legal Guidance', value: 89 },
        { name: 'Rights Management', value: 91 }
      ]
    },
    {
      id: '3',
      name: 'CreativeMuse',
      persona: 'Creative Inspiration',
      voice_id: 'eleven-labs-bella',
      logic_level: 'MIN',
      active: isPro, // Only active for Pro users
      avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      role: 'Creative Director',
      description: 'Brainstorms marketing ideas and creative concepts.',
      skills: [
        { name: 'Creative Ideation', value: 96 },
        { name: 'Marketing Strategy', value: 88 },
        { name: 'Trend Analysis', value: 90 }
      ]
    },
    {
      id: '4',
      name: 'Business Manager',
      persona: 'Financial Advisor',
      voice_id: 'eleven-labs-antoni',
      logic_level: 'MAX',
      active: false, // Inactive by default, can be activated in settings
      avatarUrl: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      role: 'Financial Advisor',
      description: 'Handles financial planning, budgeting, and business strategy.',
      skills: [
        { name: 'Financial Planning', value: 95 },
        { name: 'Revenue Optimization', value: 90 },
        { name: 'Business Strategy', value: 92 }
      ]
    },
    {
      id: '5',
      name: 'Rights Manager',
      persona: 'Legal Specialist',
      voice_id: 'eleven-labs-josh',
      logic_level: 'MAX',
      active: false, // Inactive by default, can be activated in settings
      avatarUrl: 'https://images.pexels.com/photos/5668770/pexels-photo-5668770.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      role: 'Legal Specialist',
      description: 'Manages copyright, licensing, and intellectual property.',
      skills: [
        { name: 'Copyright Management', value: 94 },
        { name: 'Licensing', value: 90 },
        { name: 'Contract Analysis', value: 88 }
      ]
    },
    {
      id: '6',
      name: 'Content Manager',
      persona: 'Content Strategist',
      voice_id: 'eleven-labs-bella',
      logic_level: 'MEDIUM',
      active: false, // Inactive by default, can be activated in settings
      avatarUrl: 'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/3059748/pexels-photo-3059748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      role: 'Content Strategist',
      description: 'Oversees content creation and strategy.',
      skills: [
        { name: 'Content Planning', value: 93 },
        { name: 'Editorial Calendar', value: 89 },
        { name: 'Content Analytics', value: 87 }
      ]
    },
    {
      id: '7',
      name: 'Social Media Manager',
      persona: 'Social Media Expert',
      voice_id: 'eleven-labs-rachel',
      logic_level: 'MEDIUM',
      active: false, // Inactive by default, can be activated in settings
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      role: 'Social Media Expert',
      description: 'Manages social media presence and campaigns.',
      skills: [
        { name: 'Platform Strategy', value: 94 },
        { name: 'Engagement', value: 92 },
        { name: 'Analytics', value: 89 }
      ]
    },
    {
      id: '8',
      name: 'Graphic Designer',
      persona: 'Visual Artist',
      voice_id: 'eleven-labs-josh',
      logic_level: 'MIN',
      active: false, // Inactive by default, can be activated in settings
      avatarUrl: 'https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg?auto=compress&cs=tinysrgb&w=600',
      headerUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      role: 'Visual Artist',
      description: 'Creates visual content and designs.',
      skills: [
        { name: 'Visual Design', value: 95 },
        { name: 'Brand Identity', value: 91 },
        { name: 'Typography', value: 88 }
      ]
    }
  ]);

  // Create a custom agent
  const createCustomAgent = useCallback((agent: Agent) => {
    setAgents(prev => [...prev, { ...agent, id: uuidv4() }]);
    return agent;
  }, []);

  // Update an agent
  const updateAgent = useCallback((updatedAgent: Agent) => {
    setAgents(prev => prev.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ));
    return updatedAgent;
  }, []);

  // Delete an agent
  const deleteAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
  }, []);

  // Mock responses based on agent and query
  const getMockResponse = (query: string, agentName: string): string => {
    const lowercaseQuery = query.toLowerCase();
    
    if (agentName === 'PAM') {
      if (lowercaseQuery.includes('promote') || lowercaseQuery.includes('marketing')) {
        return "For promoting your new release, I recommend a three-phase strategy: 1) Pre-release: Build anticipation with teasers on social media, secure playlist placements, and reach out to blogs for premiere opportunities. 2) Release day: Coordinate a push across all platforms, engage with fans, and consider a release party or livestream. 3) Post-release: Keep momentum with content around the music, such as behind-the-scenes videos or acoustic versions. Would you like me to elaborate on any of these phases?";
      } else if (lowercaseQuery.includes('release') || lowercaseQuery.includes('publish')) {
        return "Looking at the current music landscape, I'd recommend scheduling your release for a Thursday night/Friday morning. This gives you maximum visibility for playlist consideration and a full week of streaming data. For your genre, consider avoiding major release dates from established artists. Would you like me to help you plan a specific release timeline with key milestones?";
      } else {
        return "As your Personal Artist Manager, I'm here to help with your career planning, release strategies, and day-to-day management tasks. What specific aspect of your music career would you like assistance with today?";
      }
    } else if (agentName === 'LegalBot') {
      if (lowercaseQuery.includes('contract') || lowercaseQuery.includes('agreement')) {
        return "When reviewing a music contract, pay special attention to these key areas: 1) Rights granted (exclusive vs. non-exclusive), 2) Term length and territory, 3) Payment terms (advances, royalty rates, accounting periods), 4) Reversion clauses, and 5) Creative control provisions. Would you like me to explain any of these areas in more detail? Remember, while I can help you understand general concepts, you should have a qualified entertainment attorney review any contract before signing.";
      } else if (lowercaseQuery.includes('copyright') || lowercaseQuery.includes('rights')) {
        return "Copyright in music typically involves two separate works: the composition (melody, lyrics) and the sound recording (the specific recorded version). As a creator, you automatically own the copyright to your work upon creation, but registration provides important legal benefits. For maximum protection, register your works with the U.S. Copyright Office within 3 months of publication. Would you like information about the registration process?";
      } else {
        return "I'm LegalBot, your guide to understanding music industry legal matters. I can help explain contracts, copyright, licensing, and other legal concepts in simple terms. What legal question can I help you with today? Remember, I provide educational information, not legal advice.";
      }
    } else if (agentName === 'CreativeMuse') {
      if (lowercaseQuery.includes('stuck') || lowercaseQuery.includes('block')) {
        return "Creative blocks happen to everyone! Try these techniques to spark new ideas: 1) Reverse-engineer a song you love in a completely different genre, 2) Set unusual constraints like using only three chords or writing about a random object in the room, 3) Create a sonic mood board with diverse influences, or 4) Take a complete break and seek inspiration in nature, art, or film. Which approach resonates with you most?";
      } else if (lowercaseQuery.includes('lyrics') || lowercaseQuery.includes('writing')) {
        return "For fresh lyrical inspiration, try starting with a vivid sensory image rather than a concept. Describe something you can see, hear, taste, touch, or smell in detailed, specific language. Then explore what emotions or memories this image evokes. This approach often leads to more authentic and evocative lyrics than beginning with an abstract theme. Would you like to try this exercise together?";
      } else {
        return "I'm your CreativeMuse, here to help spark your imagination and overcome creative blocks. I can assist with brainstorming ideas for music, lyrics, visual content, or marketing campaigns. What creative challenge are you facing today?";
      }
    } else if (agentName === 'Business Manager') {
      return "As your Business Manager, I'm here to help with financial planning, budgeting, and business strategy. I can assist with revenue optimization, expense management, and financial growth strategies. What specific financial aspect of your music career would you like assistance with today?";
    } else if (agentName === 'Rights Manager') {
      return "As your Rights Manager, I'm here to help with copyright, licensing, and intellectual property matters. I can assist with protecting your rights, navigating licensing opportunities, and maximizing the value of your intellectual property. What specific rights management issue would you like assistance with today?";
    } else if (agentName === 'Content Manager') {
      return "As your Content Manager, I'm here to help with content strategy and creation. I can assist with planning, creating, and optimizing content across various platforms to engage fans and promote your music. What specific content challenge would you like assistance with today?";
    } else if (agentName === 'Social Media Manager') {
      return "As your Social Media Manager, I'm here to help with social media strategy and engagement. I can assist with planning, creating, and optimizing social media content to build and engage with your fan community. What specific social media challenge would you like assistance with today?";
    } else if (agentName === 'Graphic Designer') {
      return "As your Graphic Designer, I'm here to help with visual content creation. I can assist with conceptualizing and describing visual designs for album covers, social media, merchandise, and other promotional materials. What specific visual design challenge would you like assistance with today?";
    } else {
      // For custom agents, generate a generic response
      return `As your ${agentName}, I'm here to assist you with your specific needs. How can I help you today?`;
    }
  };

  // Send message to agent
  const sendMessage = useCallback((content: string, agentName: string = 'PAM') => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Get mock response
      const responseContent = getMockResponse(content, agentName);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Generate voice response using Eleven Labs
  const generateVoiceResponse = useCallback(async (text: string, voiceId: string): Promise<string | null> => {
    try {
      // In a real implementation, this would call the Eleven Labs API via an Edge Function
      // For demo purposes, we'll simulate a response
      console.log(`Generating voice response with voice ID: ${voiceId}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would return an audio URL
      // For demo, we'll use the browser's built-in speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
      
      // Return null since we're using the browser's speech synthesis
      return null;
    } catch (error) {
      console.error("Error generating voice response:", error);
      return null;
    }
  }, []);

  // Make a phone call using Twilio
  const makePhoneCall = useCallback(async (phoneNumber: string, agentName: string): Promise<boolean> => {
    try {
      // In a real implementation, this would call the Twilio API via an Edge Function
      console.log(`Making phone call to ${phoneNumber} with agent ${agentName}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the call to the database
      const { error } = await supabase
        .from('phone_calls')
        .insert({
          workspace_id: currentWorkspace?.id,
          to_number: phoneNumber,
          from_number: '+15551234567', // This would be your Twilio number
          status: 'initiated'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error making phone call:", error);
      return false;
    }
  }, [currentWorkspace?.id]);

  // Clear chat history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    agents,
    clearMessages,
    createCustomAgent,
    updateAgent,
    deleteAgent,
    generateVoiceResponse,
    makePhoneCall
  };
}