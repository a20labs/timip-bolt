import { create } from 'zustand';

interface DialerState {
  isDialerOpen: boolean;
  isInCall: boolean;
  selectedAgent: string;
  agentAvatar: string;
  openDialer: (agent?: string, avatar?: string) => void;
  closeDialer: () => void;
  startCall: () => void;
  endCall: () => void;
}

export const useDialerStore = create<DialerState>((set) => ({
  isDialerOpen: false,
  isInCall: false,
  selectedAgent: 'PAM',
  agentAvatar: 'https://images.pexels.com/photos/5704849/pexels-photo-5704849.jpeg?auto=compress&cs=tinysrgb&w=600',
  
  openDialer: (agent = 'PAM', avatar = 'https://images.pexels.com/photos/5704849/pexels-photo-5704849.jpeg?auto=compress&cs=tinysrgb&w=600') => 
    set({ 
      isDialerOpen: true, 
      selectedAgent: agent, 
      agentAvatar: avatar 
    }),
    
  closeDialer: () => 
    set({ isDialerOpen: false }),
    
  startCall: () => 
    set({ isInCall: true, isDialerOpen: false }),
    
  endCall: () => 
    set({ isInCall: false })
}));
