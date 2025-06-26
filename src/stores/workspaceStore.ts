import { create } from 'zustand';
import { Workspace } from '../types/database';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaces: [],
  loading: false,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setLoading: (loading) => set({ loading }),
}));

// Mock workspace for demo (will fallback to free if no Stripe subscription exists)
const mockWorkspace: Workspace = {
  id: 'demo-workspace-id',
  name: 'Demo Workspace',
  slug: 'demo-workspace',
  owner_id: 'demo-user-id',
  workspace_type: 'artist',
  compliance_status: {},
  settings: {},
  subscription_tier: 'free', // Changed from 'pro' to 'free' so real Stripe data takes precedence
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Set mock workspace for demo
useWorkspaceStore.getState().setCurrentWorkspace(mockWorkspace);