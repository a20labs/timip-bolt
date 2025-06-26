import { useState, useEffect } from 'react';
import { 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Timer, 
  User, 
  Key,
  Plus,
  Search,
  RefreshCw
} from 'lucide-react';
import { AccessRequest } from '../../types/pam';
import { useAuthStore } from '../../stores/authStore';

interface JITAccessProps {
  className?: string;
}

interface JITRequest extends AccessRequest {
  user_name?: string;
  role_name?: string;
  time_remaining?: number;
}

export function JITAccess({ className = '' }: JITAccessProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'requests' | 'my-access' | 'create'>('requests');
  const [requests, setRequests] = useState<JITRequest[]>([]);
  const [myActiveAccess, setMyActiveAccess] = useState<JITRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [newRequest, setNewRequest] = useState({
    role: '',
    resource: '',
    justification: '',
    duration: 4, // hours
    urgent: false
  });

  const availableRoles = [
    { id: 'admin', name: 'Administrator', description: 'Full system access' },
    { id: 'moderator', name: 'Moderator', description: 'Content moderation access' },
    { id: 'support', name: 'Support Agent', description: 'Customer support access' },
    { id: 'analyst', name: 'Data Analyst', description: 'Analytics and reporting access' }
  ];

  const availableResources = [
    'user-management',
    'content-moderation',
    'financial-data',
    'system-configuration',
    'audit-logs',
    'customer-support',
    'analytics-dashboard'
  ];

  useEffect(() => {
    loadJITData();
  }, []);

  const loadJITData = async () => {
    try {
      setLoading(true);
      
      // Mock JIT access requests
      const mockRequests: JITRequest[] = [
        {
          id: 'jit_1',
          user_id: 'user_support_1',
          user_name: 'Sarah Johnson',
          requested_role_id: 'admin',
          role_name: 'Administrator',
          requested_permissions: ['user-management', 'system-configuration'],
          resource: 'user-management',
          justification: 'Need to resolve critical user account lockout issue affecting multiple customers',
          status: 'PENDING',
          requested_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString() // 4 hours from now
        },
        {
          id: 'jit_2',
          user_id: 'user_analyst_1',
          user_name: 'Mike Chen',
          requested_role_id: 'moderator',
          role_name: 'Moderator',
          requested_permissions: ['content-moderation'],
          resource: 'content-moderation',
          justification: 'Emergency content review needed for reported inappropriate content',
          status: 'APPROVED',
          requested_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
          approved_by: 'admin_user',
          approved_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          time_remaining: 2 * 60 - 5 // 1h 55m remaining
        },
        {
          id: 'jit_3',
          user_id: 'user_finance_1',
          user_name: 'Lisa Wong',
          requested_role_id: 'analyst',
          role_name: 'Data Analyst',
          requested_permissions: ['financial-data', 'analytics-dashboard'],
          resource: 'financial-data',
          justification: 'Quarterly report preparation - need access to financial analytics',
          status: 'DENIED',
          requested_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          denied_reason: 'Insufficient business justification. Please coordinate with finance team lead.'
        }
      ];

      setRequests(mockRequests);

      // Mock user's active JIT access
      if (user) {
        const myAccess: JITRequest[] = [
          {
            id: 'my_jit_1',
            user_id: user.id,
            user_name: user.email,
            requested_role_id: 'support',
            role_name: 'Support Agent',
            requested_permissions: ['customer-support'],
            resource: 'customer-support',
            justification: 'Handling escalated customer issues',
            status: 'APPROVED',
            requested_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
            approved_by: 'admin_user',
            approved_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
            time_remaining: 3 * 60 - 5 // 2h 55m remaining
          }
        ];
        setMyActiveAccess(myAccess);
      }

    } catch (error) {
      console.error('🔐 JITAccess: Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'APPROVED' as const, 
              approved_by: user?.id,
              approved_at: new Date().toISOString(),
              time_remaining: 4 * 60 // 4 hours
            }
          : req
      );
      setRequests(updatedRequests);
      console.log('🔐 JITAccess: Approved request:', requestId);
    } catch (error) {
      console.error('🔐 JITAccess: Failed to approve request:', error);
    }
  };

  const handleDenyRequest = async (requestId: string, reason: string) => {
    try {
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'DENIED' as const, 
              denied_reason: reason
            }
          : req
      );
      setRequests(updatedRequests);
      console.log('🔐 JITAccess: Denied request:', requestId, 'Reason:', reason);
    } catch (error) {
      console.error('🔐 JITAccess: Failed to deny request:', error);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const request: JITRequest = {
        id: `jit_${Date.now()}`,
        user_id: user?.id || '',
        user_name: user?.email || '',
        requested_role_id: newRequest.role,
        role_name: availableRoles.find(r => r.id === newRequest.role)?.name || '',
        requested_permissions: [newRequest.resource],
        resource: newRequest.resource,
        justification: newRequest.justification,
        status: 'PENDING',
        requested_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + newRequest.duration * 60 * 60 * 1000).toISOString()
      };

      setRequests([request, ...requests]);
      setNewRequest({
        role: '',
        resource: '',
        justification: '',
        duration: 4,
        urgent: false
      });
      setActiveTab('requests');
      
      console.log('🔐 JITAccess: Created new request:', request);
    } catch (error) {
      console.error('🔐 JITAccess: Failed to create request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
      case 'DENIED': return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'EXPIRED': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'DENIED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'EXPIRED': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.justification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={`${className} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Just-in-Time Access</h2>
          <p className="text-gray-600">Manage temporary elevated permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Request Access</span>
          </button>
          <button
            onClick={loadJITData}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'requests', label: 'All Requests', count: requests.length },
            { id: 'my-access', label: 'My Active Access', count: myActiveAccess.length },
            { id: 'create', label: 'Create Request', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'requests' | 'my-access' | 'create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Create Request Form */}
      {activeTab === 'create' && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Temporary Access</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={newRequest.role}
                  onChange={(e) => setNewRequest({ ...newRequest, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource *
                </label>
                <select
                  value={newRequest.resource}
                  onChange={(e) => setNewRequest({ ...newRequest, resource: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a resource</option>
                  {availableResources.map(resource => (
                    <option key={resource} value={resource}>
                      {resource.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours) *
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={newRequest.duration}
                onChange={(e) => setNewRequest({ ...newRequest, duration: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Justification *
              </label>
              <textarea
                value={newRequest.justification}
                onChange={(e) => setNewRequest({ ...newRequest, justification: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why you need this access and how it will be used..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newRequest.urgent}
                onChange={(e) => setNewRequest({ ...newRequest, urgent: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mark as urgent</span>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setActiveTab('requests')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                disabled={!newRequest.role || !newRequest.resource || !newRequest.justification}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Active Access */}
      {activeTab === 'my-access' && (
        <div className="space-y-4">
          {myActiveAccess.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow border text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Access</h3>
              <p className="text-gray-600">You currently have no active JIT access grants.</p>
            </div>
          ) : (
            myActiveAccess.map(access => (
              <div key={access.id} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor('APPROVED')}`}>
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{access.role_name}</h3>
                      <p className="text-sm text-gray-600">Resource: {access.resource}</p>
                    </div>
                  </div>
                  {access.time_remaining && (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <Timer className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {formatTimeRemaining(access.time_remaining)} remaining
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">{access.justification}</p>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Granted: {formatTimeAgo(access.approved_at || access.requested_at)}</span>
                  <span>Expires: {new Date(access.expires_at || '').toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search requests..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="DENIED">Denied</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <div key={request.id} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{request.user_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{request.role_name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {request.time_remaining && request.status === 'APPROVED' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Timer className="h-4 w-4" />
                        <span className="text-sm">{formatTimeRemaining(request.time_remaining)}</span>
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span>{request.status}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Resource: <span className="font-medium">{request.resource}</span></p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">{request.justification}</p>
                  </div>
                </div>

                {request.denied_reason && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                      <strong>Denied:</strong> {request.denied_reason}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Requested: {formatTimeAgo(request.requested_at)}</span>
                  {request.expires_at && (
                    <span>Expires: {new Date(request.expires_at).toLocaleString()}</span>
                  )}
                </div>

                {request.status === 'PENDING' && (
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleDenyRequest(request.id, 'Access denied by administrator')}
                      className="px-3 py-1 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors text-sm"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
