import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';

interface AuditLogEntry {
  id: string;
  user_id: string;
  workspace_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface AuditLogFilters {
  resource_type?: string;
  action?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();

  return useQuery({
    queryKey: ['audit-logs', currentWorkspace?.id, filters],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      if (!user) return [];

      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          workspace_id,
          action,
          resource_type,
          resource_id,
          old_values,
          new_values,
          ip_address,
          user_agent,
          created_at
        `)
        .order('created_at', { ascending: false });

      // Apply workspace filter for non-superadmin users
      if (user.role !== 'superadmin' && currentWorkspace) {
        query = query.eq('workspace_id', currentWorkspace.id);
      }

      // Apply additional filters
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      query = query.limit(filters.limit || 100);

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });
}

function useCreateAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logEntry: Omit<AuditLogEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([logEntry])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

// Hook for tracking user actions automatically
function useActionTracker() {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const createAuditLog = useCreateAuditLog();

  const trackAction = (
    action: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    if (!user) return;

    createAuditLog.mutate({
      user_id: user.id,
      workspace_id: currentWorkspace?.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: undefined, // Would be populated server-side
      user_agent: navigator.userAgent,
    });
  };

  return { trackAction, isLoading: createAuditLog.isPending };
}