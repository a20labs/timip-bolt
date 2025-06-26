import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Copy, 
  EyeOff, 
  Eye, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Check,
  Trash2,
  RefreshCw,
  Calendar,
  AlertTriangle,
  BarChart3,
  Shield,
  Clock,
  Code,
  Webhook,
  Terminal,
  Globe,
  BookOpen,
  PanelRight,
  HelpCircle,
  Crown,
  Download
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionDebug } from '../debug/SubscriptionDebug';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string;
  createdAt: string;
  expiresAt?: string;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
  metrics?: {
    requestsToday: number;
    requestsThisMonth: number;
    successRate: number;
    averageResponseTime: number;
  };
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export function ApiKeySettings() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<string[]>(['read_catalog']);
  const [newApiKeyExpiration, setNewApiKeyExpiration] = useState<string>('never');
  const [customExpirationDate, setCustomExpirationDate] = useState('');
  const [newKey, setNewKey] = useState<{key: string, name: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'logs' | 'docs'>('keys');
  const [newWebhookData, setNewWebhookData] = useState({
    name: '',
    url: '',
    events: ['track.created', 'release.published']
  });
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [showKeyMetrics, setShowKeyMetrics] = useState<string | null>(null);
  const [showTestTool, setShowTestTool] = useState(false);
  const [testRequest, setTestRequest] = useState({
    endpoint: '/v1/catalog/tracks',
    method: 'GET',
    headers: '{\n  "Authorization": "Bearer {API_KEY}"\n}',
    body: '{}'
  });
  const testResponseRef = useRef<HTMLDivElement>(null);
  const { features, currentTier } = useSubscription();
  
  const isPro = currentTier === 'pro' || currentTier === 'enterprise';
  
  // Mock API keys for demonstration purposes only - NOT REAL CREDENTIALS
  const mockApiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'Web Dashboard',
      key: 'sk_test_EXAMPLE1234567890abcdef',
      lastUsed: '2 hours ago',
      createdAt: '2024-03-15T12:00:00Z',
      status: 'active',
      permissions: ['read_catalog', 'read_analytics'],
      metrics: {
        requestsToday: 158,
        requestsThisMonth: 4253,
        successRate: 99.7,
        averageResponseTime: 124
      }
    },
    {
      id: '2',
      name: 'Mobile App',
      key: 'sk_test_EXAMPLE0987654321fedcba',
      lastUsed: '1 day ago',
      createdAt: '2024-02-20T09:30:00Z',
      status: 'active',
      permissions: ['read_catalog', 'write_catalog', 'read_analytics'],
      metrics: {
        requestsToday: 347,
        requestsThisMonth: 8721,
        successRate: 98.2,
        averageResponseTime: 156
      }
    },
    {
      id: '3',
      name: 'External Integration',
      key: 'sk_test_EXAMPLE5555666677778888',
      lastUsed: '1 week ago',
      createdAt: '2024-01-10T14:20:00Z',
      expiresAt: '2024-07-10T14:20:00Z',
      status: 'active',
      permissions: ['read_catalog'],
      metrics: {
        requestsToday: 0,
        requestsThisMonth: 312,
        successRate: 100,
        averageResponseTime: 110
      }
    },
    {
      id: '4',
      name: 'Temporary Access',
      key: 'sk_test_EXAMPLE9999000011112222',
      lastUsed: '1 month ago',
      createdAt: '2024-01-05T10:15:00Z',
      expiresAt: '2024-05-01T10:15:00Z',
      status: 'expired',
      permissions: ['read_catalog', 'read_analytics']
    },
  ];
  
  // Mock webhooks for demonstration
  const mockWebhooks: Webhook[] = [
    {
      id: '1',
      name: 'New Release Notifications',
      url: 'https://example.com/webhooks/releases',
      events: ['release.created', 'release.published', 'release.updated'],
      active: true,
      createdAt: '2024-03-10T08:45:00Z',
      lastTriggered: '2024-06-05T14:20:00Z'
    },
    {
      id: '2',
      name: 'Track Upload Processor',
      url: 'https://api.myapp.com/process-track',
      events: ['track.created', 'track.updated'],
      active: true,
      createdAt: '2024-04-05T11:30:00Z',
      lastTriggered: '2024-06-06T09:15:00Z'
    },
    {
      id: '3',
      name: 'Analytics Connector',
      url: 'https://analytics.example.org/ingest',
      events: ['stream.created', 'download.completed'],
      active: false,
      createdAt: '2024-02-20T15:10:00Z'
    }
  ];
  
  // Mock request logs
  const mockRequestLogs = [
    { id: '1', timestamp: '2024-06-07T14:30:45Z', endpoint: '/v1/catalog/tracks', method: 'GET', status: 200, responseTime: 120, apiKey: '1', userAgent: 'Mozilla/5.0...' },
    { id: '2', timestamp: '2024-06-07T14:29:12Z', endpoint: '/v1/analytics/streams', method: 'GET', status: 200, responseTime: 235, apiKey: '1', userAgent: 'Mozilla/5.0...' },
    { id: '3', timestamp: '2024-06-07T14:28:30Z', endpoint: '/v1/catalog/tracks/12345', method: 'GET', status: 404, responseTime: 87, apiKey: '2', userAgent: 'TruIndeeApp/1.0...' },
    { id: '4', timestamp: '2024-06-07T14:27:15Z', endpoint: '/v1/catalog/tracks', method: 'POST', status: 201, responseTime: 350, apiKey: '2', userAgent: 'TruIndeeApp/1.0...' },
    { id: '5', timestamp: '2024-06-07T14:25:42Z', endpoint: '/v1/catalog/releases', method: 'GET', status: 200, responseTime: 98, apiKey: '1', userAgent: 'Mozilla/5.0...' },
  ];
  
  // Permission options for API keys
  const permissionOptions = [
    { value: 'read_catalog', label: 'Read Catalog', description: 'View tracks, releases, and playlists', category: 'Content' },
    { value: 'write_catalog', label: 'Write Catalog', description: 'Create and modify catalog items', category: 'Content' },
    { value: 'delete_catalog', label: 'Delete Catalog', description: 'Remove catalog items', category: 'Content' },
    { value: 'read_analytics', label: 'Read Analytics', description: 'View analytics and reports', category: 'Analytics' },
    { value: 'read_users', label: 'Read Users', description: 'View user profiles and data', category: 'Users' },
    { value: 'write_users', label: 'Write Users', description: 'Modify user data', category: 'Users' },
    { value: 'read_finances', label: 'Read Finances', description: 'View financial information', category: 'Finances' },
    { value: 'admin', label: 'Admin Access', description: 'Full administrative access', category: 'Admin' },
  ];
  
  // Webhook event options
  const webhookEventOptions = [
    { value: 'track.created', label: 'Track Created', description: 'Triggered when a new track is uploaded' },
    { value: 'track.updated', label: 'Track Updated', description: 'Triggered when a track is modified' },
    { value: 'track.deleted', label: 'Track Deleted', description: 'Triggered when a track is removed' },
    { value: 'release.created', label: 'Release Created', description: 'Triggered when a new release is created' },
    { value: 'release.updated', label: 'Release Updated', description: 'Triggered when a release is modified' },
    { value: 'release.published', label: 'Release Published', description: 'Triggered when a release is published' },
    { value: 'stream.created', label: 'Stream Recorded', description: 'Triggered when a track is streamed' },
    { value: 'download.completed', label: 'Download Completed', description: 'Triggered when a track is downloaded' },
    { value: 'user.created', label: 'User Created', description: 'Triggered when a new user signs up' },
    { value: 'payment.succeeded', label: 'Payment Succeeded', description: 'Triggered when a payment is successful' },
  ];
  
  // API endpoints for documentation and testing
  const apiEndpoints = [
    { path: '/v1/catalog/tracks', methods: ['GET', 'POST'], description: 'List or create tracks' },
    { path: '/v1/catalog/tracks/{id}', methods: ['GET', 'PUT', 'DELETE'], description: 'Get, update or delete a track' },
    { path: '/v1/catalog/releases', methods: ['GET', 'POST'], description: 'List or create releases' },
    { path: '/v1/catalog/releases/{id}', methods: ['GET', 'PUT', 'DELETE'], description: 'Get, update or delete a release' },
    { path: '/v1/analytics/streams', methods: ['GET'], description: 'Get streaming analytics' },
    { path: '/v1/analytics/audience', methods: ['GET'], description: 'Get audience analytics' },
    { path: '/v1/users/{id}/profile', methods: ['GET'], description: 'Get a user profile' },
  ];
  
  // Mock test response
  const mockTestResponse = `{
  "data": [
    {
      "id": "track_01H9XYZ123456789",
      "title": "Midnight Dreams",
      "artist": "Luna Rodriguez",
      "duration": 215,
      "created_at": "2024-05-15T00:00:00Z",
      "updated_at": "2024-05-15T00:00:00Z"
    },
    {
      "id": "track_01H9XYZ987654321",
      "title": "Electric Nights",
      "artist": "Luna Rodriguez",
      "duration": 182,
      "created_at": "2024-05-10T00:00:00Z",
      "updated_at": "2024-05-10T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}`;
  
  // Handle toggle show/hide key
  const toggleShowKey = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };
  
  // Handle copy key to clipboard
  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };
  
  // Handle delete key
  const handleDeleteKey = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      // Check if it's a stored key (not a mock key)
      const storedKeyIndex = storedApiKeys.findIndex(key => key.id === keyId);
      if (storedKeyIndex !== -1) {
        // Remove from stored keys
        const updatedKeys = storedApiKeys.filter(key => key.id !== keyId);
        saveApiKeysToStorage(updatedKeys);
      } else {
        // For mock keys, just show a message
        console.log(`Cannot delete demo key: ${keyId}`);
        alert('Demo keys cannot be deleted. This would work with real API keys.');
      }
    }
  };
  
  // Handle regenerate key
  const handleRegenerateKey = (keyId: string) => {
    if (confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      // In a real app, this would call the API to regenerate the key
      console.log(`Regenerating key: ${keyId}`);
    }
  };
  
  // Handle create new key
  const handleCreateKey = () => {
    if (!isPro) {
      features.apiAccess().showUpgrade();
      return;
    }
    
    if (!newApiKeyName.trim()) {
      alert('Please provide a name for your API key');
      return;
    }
    
    // Generate demo API key (for demonstration purposes only)
    const generatedKey = `sk_demo_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Create new API key object
    const newApiKey: ApiKey = {
      id: String(Date.now()),
      name: newApiKeyName,
      key: generatedKey,
      lastUsed: 'Never',
      createdAt: new Date().toISOString(),
      expiresAt: newApiKeyExpiration !== 'never' ? 
        (newApiKeyExpiration === 'custom' ? 
          new Date(customExpirationDate).toISOString() : 
          new Date(Date.now() + (parseInt(newApiKeyExpiration) * 24 * 60 * 60 * 1000)).toISOString()
        ) : undefined,
      permissions: newApiKeyPermissions,
      status: 'active',
      metrics: {
        requestsToday: 0,
        requestsThisMonth: 0,
        successRate: 100,
        averageResponseTime: 0
      }
    };
    
    // Save to storage
    const updatedKeys = [...storedApiKeys, newApiKey];
    saveApiKeysToStorage(updatedKeys);
    
    // Show the newly created key
    setNewKey({ key: generatedKey, name: newApiKeyName });
    
    // Reset form
    setNewApiKeyName('');
    setNewApiKeyPermissions(['read_catalog']);
    setNewApiKeyExpiration('never');
    setCustomExpirationDate('');
    
    // Close modal
    setShowCreateModal(false);
  };
  
  // Handle create new webhook
  const handleCreateWebhook = () => {
    if (!isPro) {
      features.apiAccess().showUpgrade();
      return;
    }
    
    if (!newWebhookData.name.trim() || !newWebhookData.url.trim() || newWebhookData.events.length === 0) {
      alert('Please provide all required webhook information');
      return;
    }
    
    // In a real app, this would call the API to create a new webhook
    console.log('Creating webhook:', newWebhookData);
    
    // Reset form
    setNewWebhookData({
      name: '',
      url: '',
      events: ['track.created', 'release.published']
    });
    
    // Close modal
    setShowWebhookModal(false);
  };
  
  // Check if permission is selected
  const isPermissionSelected = (permission: string) => {
    return newApiKeyPermissions.includes(permission);
  };
  
  // Check if webhook event is selected
  const isEventSelected = (event: string) => {
    return newWebhookData.events.includes(event);
  };
  
  // Toggle permission selection
  const togglePermission = (permission: string) => {
    if (isPermissionSelected(permission)) {
      setNewApiKeyPermissions(prev => prev.filter(p => p !== permission));
    } else {
      setNewApiKeyPermissions(prev => [...prev, permission]);
    }
  };
  
  // Toggle webhook event selection
  const toggleEvent = (event: string) => {
    if (isEventSelected(event)) {
      setNewWebhookData({
        ...newWebhookData,
        events: newWebhookData.events.filter(e => e !== event)
      });
    } else {
      setNewWebhookData({
        ...newWebhookData,
        events: [...newWebhookData.events, event]
      });
    }
  };
  
  // Handle view key details
  const handleViewKeyDetails = (keyId: string) => {
    if (selectedKeyId === keyId) {
      setSelectedKeyId(null);
    } else {
      setSelectedKeyId(keyId);
    }
  };
  
  // Handle run test
  const handleRunTest = () => {
    // In a real app, this would make an actual API request
    // For demo purposes, we'll just simulate a response
    
    if (testResponseRef.current) {
      testResponseRef.current.innerHTML = '<div class="animate-pulse mb-4"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2.5"></div></div>';
      
      setTimeout(() => {
        if (testResponseRef.current) {
          testResponseRef.current.innerHTML = `<pre class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto">${mockTestResponse}</pre>`;
        }
      }, 1000);
    }
  };
  
  // Group permissions by category
  const groupedPermissions = permissionOptions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissionOptions>);
  
  // Add storage functionality for API keys
  const [storedApiKeys, setStoredApiKeys] = useState<ApiKey[]>([]);

  // Load stored API keys from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('truindee_api_keys');
      if (stored) {
        const parsedKeys = JSON.parse(stored);
        setStoredApiKeys(parsedKeys);
      }
    } catch (error) {
      console.error('Error loading stored API keys:', error);
    }
  }, []);

  // Save API keys to localStorage whenever they change
  const saveApiKeysToStorage = (keys: ApiKey[]) => {
    try {
      localStorage.setItem('truindee_api_keys', JSON.stringify(keys));
      setStoredApiKeys(keys);
    } catch (error) {
      console.error('Error saving API keys to storage:', error);
    }
  };

  // Combine mock keys with stored keys for display
  const allApiKeys = [...mockApiKeys, ...storedApiKeys];
  
  return (
    <div className="space-y-6">
      {/* Debug Component - Remove in production */}
      <SubscriptionDebug />
      
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        API & Developer Tools
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Create and manage API keys, webhooks and access developer resources
      </p>
      
      {/* API Access Banner */}
      {!isPro && (
        <Card className="p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-200 dark:border-primary-900">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Key className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                API Access Requires Pro Plan
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Upgrade to Pro or Enterprise to create API keys, set up webhooks, and access our developer platform.
              </p>
              <Button 
                onClick={() => features.apiAccess().showUpgrade()}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'keys', label: 'API Keys', icon: Key },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook },
          { id: 'logs', label: 'Request Logs', icon: Terminal },
          { id: 'docs', label: 'Documentation', icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'keys' | 'webhooks' | 'logs' | 'docs')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Test API Tool */}
      {showTestTool && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Code className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  API Test Tool
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Test your API calls and see responses
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowTestTool(false)}
            >
              <PanelRight className="w-4 h-4" />
              Hide
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoint
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    https://api.truindee.com
                  </span>
                  <input
                    type="text"
                    value={testRequest.endpoint}
                    onChange={(e) => setTestRequest({...testRequest, endpoint: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Method
                </label>
                <select 
                  value={testRequest.method}
                  onChange={(e) => setTestRequest({...testRequest, method: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                  <option>PATCH</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Headers
                </label>
                <textarea
                  value={testRequest.headers}
                  onChange={(e) => setTestRequest({...testRequest, headers: e.target.value})}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Body {testRequest.method === 'GET' && <span className="text-gray-400">(not used for GET)</span>}
                </label>
                <textarea
                  value={testRequest.body}
                  onChange={(e) => setTestRequest({...testRequest, body: e.target.value})}
                  rows={5}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm ${
                    testRequest.method === 'GET' ? 'opacity-50' : ''
                  }`}
                  disabled={testRequest.method === 'GET'}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleRunTest}>
                <Terminal className="w-4 h-4 mr-2" />
                Run Test
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response
              </label>
              <div 
                ref={testResponseRef}
                className="min-h-32 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <div className="p-4 text-gray-500 dark:text-gray-400 text-sm text-center">
                  Response will appear here after running the test
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Key className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  API Keys
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keys for accessing the TruIndee API
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!showTestTool && (
                <Button
                  variant="outline"
                  onClick={() => setShowTestTool(true)}
                  disabled={!isPro}
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  Test API
                </Button>
              )}
              <Button 
                onClick={() => setShowCreateModal(true)}
                disabled={!isPro}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </div>
          
          {/* Newly Created Key */}
          {newKey && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  API Key Created: {newKey.name}
                </h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
              <div className="flex gap-2">
                <code className="flex-1 p-2 bg-white dark:bg-gray-800 text-sm font-mono border border-green-300 dark:border-green-700 rounded overflow-x-auto">
                  {newKey.key}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(newKey.key, 'new')}
                >
                  {copiedKey === 'new' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {allApiKeys.length > 0 ? (
            <div className="space-y-4">
              {allApiKeys.map((apiKey) => (
                <div key={apiKey.id} className={`p-4 border ${
                  apiKey.status === 'expired' 
                    ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
                    : apiKey.status === 'revoked'
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                } rounded-lg`}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {apiKey.name}
                        {apiKey.status === 'expired' && (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                            Expired
                          </span>
                        )}
                        {apiKey.status === 'revoked' && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs rounded-full">
                            Revoked
                          </span>
                        )}
                        {apiKey.expiresAt && new Date(apiKey.expiresAt) > new Date() && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires {new Date(apiKey.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Created on {new Date(apiKey.createdAt).toLocaleDateString()}
                        </p>
                        <span className="text-gray-400 dark:text-gray-600">•</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last used {apiKey.lastUsed}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apiKey.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateKey(apiKey.id)}
                          disabled={!isPro}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.id)}
                        disabled={!isPro}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedKeyId === apiKey.id ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleViewKeyDetails(apiKey.id)}
                      >
                        {selectedKeyId === apiKey.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 relative">
                      <Input
                        value={showKeys[apiKey.id] ? apiKey.key : '•'.repeat(24)}
                        readOnly
                        className="pr-16 font-mono text-sm"
                      />
                      <div className="absolute right-2 top-2">
                        <button
                          type="button"
                          onClick={() => toggleShowKey(apiKey.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showKeys[apiKey.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          disabled={!showKeys[apiKey.id]}
                        >
                          {copiedKey === apiKey.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Permissions */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Permissions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {apiKey.permissions.map((permission) => {
                        // Find the permission label
                        const permOption = permissionOptions.find(opt => opt.value === permission);
                        return (
                          <span 
                            key={permission} 
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded"
                            title={permOption?.description}
                          >
                            {permOption?.label || permission}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Extended Key Details */}
                  {selectedKeyId === apiKey.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      {/* Usage Metrics */}
                      {apiKey.metrics && (
                        <div className="mb-4">
                          <button 
                            onClick={() => setShowKeyMetrics(showKeyMetrics === apiKey.id ? null : apiKey.id)}
                            className="flex items-center justify-between w-full py-2 text-left"
                          >
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-primary-500" />
                              Key Metrics
                            </h5>
                            {showKeyMetrics === apiKey.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          
                          {showKeyMetrics === apiKey.id && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">REQUESTS TODAY</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{apiKey.metrics.requestsToday.toLocaleString()}</p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MONTHLY REQUESTS</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{apiKey.metrics.requestsThisMonth.toLocaleString()}</p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SUCCESS RATE</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{apiKey.metrics.successRate}%</p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">AVG RESPONSE TIME</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{apiKey.metrics.averageResponseTime}ms</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Recent Logs for this Key */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-primary-500" />
                          Recent Requests with this Key
                        </h5>
                        <div className="text-xs overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-700">
                              <tr>
                                <th className="px-2 py-1 text-left text-gray-500 dark:text-gray-400">Time</th>
                                <th className="px-2 py-1 text-left text-gray-500 dark:text-gray-400">Endpoint</th>
                                <th className="px-2 py-1 text-left text-gray-500 dark:text-gray-400">Method</th>
                                <th className="px-2 py-1 text-left text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-2 py-1 text-left text-gray-500 dark:text-gray-400">Response Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockRequestLogs
                                .filter(log => log.apiKey === apiKey.id)
                                .slice(0, 3)
                                .map((log) => (
                                  <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                                    <td className="px-2 py-2 text-gray-900 dark:text-white whitespace-nowrap">
                                      {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-2 py-2 text-gray-900 dark:text-white">
                                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                        {log.endpoint}
                                      </code>
                                    </td>
                                    <td className="px-2 py-2">
                                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                        log.method === 'GET' 
                                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                                          : log.method === 'POST'
                                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                                          : log.method === 'DELETE'
                                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                                      }`}>
                                        {log.method}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2">
                                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                        log.status >= 200 && log.status < 300
                                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                          : log.status >= 400 && log.status < 500
                                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                          : log.status >= 500
                                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                      }`}>
                                        {log.status}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-gray-900 dark:text-white">
                                      {log.responseTime}ms
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2 text-right">
                          <button 
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                            onClick={() => setActiveTab('logs')}
                          >
                            View all requests
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => setShowTestTool(true)}
                          disabled={!isPro || apiKey.status !== 'active'}
                        >
                          <Terminal className="w-4 h-4 mr-1.5" />
                          Test with this Key
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No API Keys Yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Create your first API key to integrate TruIndee with external services and applications.
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                disabled={!isPro}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>
          )}
        </Card>
      )}
      
      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Webhook className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Webhooks
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive real-time notifications for events
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowWebhookModal(true)}
              disabled={!isPro}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </div>
          
          {mockWebhooks.length > 0 ? (
            <div className="space-y-4">
              {mockWebhooks.map((webhook) => (
                <div key={webhook.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {webhook.name}
                        {webhook.active ? (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </h4>
                      <div className="mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 font-mono break-all">
                          <Globe className="w-3 h-3 flex-shrink-0" />
                          {webhook.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Created on {new Date(webhook.createdAt).toLocaleDateString()}
                        </p>
                        {webhook.lastTriggered && (
                          <>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Last triggered {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log(`Toggling webhook ${webhook.id} active state`)}
                        disabled={!isPro}
                      >
                        {webhook.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log(`Deleting webhook ${webhook.id}`)}
                        disabled={!isPro}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Events:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => {
                        // Find the event label
                        const eventOption = webhookEventOptions.find(opt => opt.value === event);
                        return (
                          <span 
                            key={event} 
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded"
                            title={eventOption?.description}
                          >
                            {eventOption?.label || event}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Webhooks Yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Create your first webhook to receive real-time notifications when events happen in your TruIndee account.
              </p>
              <Button 
                onClick={() => setShowWebhookModal(true)}
                disabled={!isPro}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </div>
          )}
          
          {/* Webhooks Information */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              About Webhooks
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Webhooks allow your application to receive real-time notifications when events happen in your TruIndee account. When an event occurs, we'll send an HTTP POST request to the URL you specify.
            </p>
            <details className="text-sm text-gray-700 dark:text-gray-300">
              <summary className="font-medium cursor-pointer">Webhook payload example</summary>
              <pre className="mt-2 p-3 bg-white dark:bg-gray-900 rounded text-xs overflow-x-auto">
{`{
  "event": "track.created",
  "created_at": "2024-06-07T12:34:56Z",
  "data": {
    "id": "track_01H9XYZ123456789",
    "title": "Midnight Dreams",
    "artist": "Luna Rodriguez",
    "created_at": "2024-06-07T12:34:56Z"
  }
}`}
              </pre>
            </details>
          </div>
        </Card>
      )}
      
      {/* Request Logs Tab */}
      {activeTab === 'logs' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Terminal className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                API Request Logs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor API activity and troubleshoot issues
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr className="text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Endpoint</th>
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Response Time</th>
                  <th className="px-4 py-2 text-left">API Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockRequestLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono">
                        {log.endpoint}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        log.method === 'GET' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                          : log.method === 'POST'
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                          : log.method === 'DELETE'
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        log.status >= 200 && log.status < 300
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : log.status >= 400 && log.status < 500
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                          : log.status >= 500
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {log.responseTime}ms
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {(() => {
                        const key = mockApiKeys.find(k => k.id === log.apiKey);
                        return key ? key.name : 'Unknown';
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Filtering and pagination controls would go here */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing 5 of 1,245 requests
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
          
          {/* Export Options */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Documentation Tab */}
      {activeTab === 'docs' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                API Documentation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn how to use the TruIndee API
              </p>
            </div>
          </div>
          
          {/* Getting Started */}
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Getting Started
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              The TruIndee API allows you to programmatically access your music catalog, analytics, and other resources. All API requests must include your API key in the Authorization header.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Base URL</p>
              <code className="text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded block font-mono">
                https://api.truindee.com
              </code>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Authentication</p>
              <code className="text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded block font-mono mb-2">
                Authorization: Bearer {'{YOUR_API_KEY}'}
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Replace {'{YOUR_API_KEY}'} with one of your API keys.
              </p>
            </div>
          </div>
          
          {/* API Reference */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              API Reference
            </h4>
            <div className="space-y-3">
              {apiEndpoints.map((endpoint, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1">
                        {endpoint.methods.map(method => (
                          <span key={method} className={`px-2 py-0.5 text-xs font-medium rounded ${
                            method === 'GET' 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                              : method === 'POST'
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                              : method === 'DELETE'
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                              : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                          }`}>
                            {method}
                          </span>
                        ))}
                      </div>
                      <code className="font-mono text-sm text-gray-900 dark:text-white">
                        {endpoint.path}
                      </code>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {endpoint.description}
                    </span>
                  </summary>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700 mt-0.5 text-sm">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Example request:
                    </p>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg mb-3 overflow-x-auto text-xs">
{`curl -X ${endpoint.methods[0]} "https://api.truindee.com${endpoint.path.replace(/{id}/, 'track_123')}"\\
  -H "Authorization: Bearer YOUR_API_KEY"\\
  -H "Content-Type: application/json"`}
                    </pre>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Example response:
                    </p>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg overflow-x-auto text-xs">
{endpoint.methods[0] === 'GET' ? 
`{
  "data": {
    "id": "track_123",
    "title": "Midnight Dreams",
    "artist": "Luna Rodriguez",
    "duration": 215,
    "created_at": "2024-05-15T00:00:00Z",
    "updated_at": "2024-05-15T00:00:00Z"
  }
}` : 
endpoint.methods[0] === 'POST' ?
`{
  "data": {
    "id": "track_new",
    "title": "New Track",
    "artist": "Luna Rodriguez",
    "duration": 180,
    "created_at": "2024-06-07T12:34:56Z",
    "updated_at": "2024-06-07T12:34:56Z"
  }
}` :
`{
  "success": true
}`}
                    </pre>
                  </div>
                </details>
              ))}
            </div>
          </div>
          
          {/* SDK Links */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-primary-500" />
              Client Libraries
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              We provide official client libraries for popular programming languages to make integrating with our API easier.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'JavaScript/TypeScript', url: '#', icon: 'JS' },
                { name: 'Python', url: '#', icon: 'PY' },
                { name: 'Ruby', url: '#', icon: 'RB' },
                { name: 'PHP', url: '#', icon: 'PHP' },
              ].map((sdk, index) => (
                <a 
                  key={index} 
                  href={sdk.url}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded font-mono text-sm">
                    {sdk.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {sdk.name} SDK
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Full API Reference
            </Button>
            <Button 
              onClick={() => setShowTestTool(true)}
              disabled={!isPro}
            >
              <Terminal className="w-4 h-4 mr-2" />
              Open API Test Tool
            </Button>
          </div>
        </Card>
      )}
      
      {/* Security Advisory */}
      <Card className="p-4 border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              API Security Best Practices
            </h3>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
              <li>Keep API keys secure and never expose them in client-side code</li>
              <li>Regenerate API keys regularly and after team member changes</li>
              <li>Use environment variables to store API keys in your applications</li>
              <li>Monitor API key usage for unusual patterns</li>
              <li>Assign the minimum required permissions to each API key</li>
              <li>Set expiration dates on API keys used for temporary access</li>
              <li>Use IP restrictions when possible to limit where your API can be accessed from</li>
            </ul>
          </div>
        </div>
      </Card>
      
      {/* Create API Key Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create API Key
            </h3>
            {!isPro ? (
              <div className="text-center py-6">
                <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pro Feature
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  API access requires a Pro or Enterprise subscription.
                </p>
                <Button onClick={() => features.apiAccess().showUpgrade()}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            ) : (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key Name
                  </label>
                  <Input
                    placeholder="e.g., Production Backend"
                    value={newApiKeyName}
                    onChange={(e) => setNewApiKeyName(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Give your API key a descriptive name to identify its use
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Key Permissions
                  </label>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                      <div key={category}>
                        <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase mb-2">{category}</h5>
                        <div className="space-y-1">
                          {permissions.map((permission) => (
                            <label key={permission.value} className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isPermissionSelected(permission.value)}
                                onChange={() => togglePermission(permission.value)}
                                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {permission.label}
                                </span>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  {permission.description}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiration
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={newApiKeyExpiration}
                    onChange={(e) => setNewApiKeyExpiration(e.target.value)}
                  >
                    <option value="never">Never expires</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                    <option value="180d">180 days</option>
                    <option value="365d">1 year</option>
                    <option value="custom">Custom date</option>
                  </select>
                </div>
                
                {newApiKeyExpiration === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Expiration Date
                    </label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={customExpirationDate}
                      onChange={(e) => setCustomExpirationDate(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                {/* IP Restrictions (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    IP Restrictions (Optional)
                    <HelpCircle className="w-3 h-3 text-gray-400" />
                  </label>
                  <Input
                    placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Comma-separated IP addresses or CIDR blocks. Leave empty to allow all IPs.
                  </p>
                </div>
                
                {/* Warning */}
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      API keys grant access to your account. Never share your API keys in public areas such as GitHub, client-side code, or in your frontend application.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateKey}
                    disabled={!newApiKeyName}
                    type="button"
                  >
                    Create API Key
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
      
      {/* Create Webhook Modal */}
      {showWebhookModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowWebhookModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Webhook
            </h3>
            {!isPro ? (
              <div className="text-center py-6">
                <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pro Feature
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Webhook functionality requires a Pro or Enterprise subscription.
                </p>
                <Button onClick={() => features.apiAccess().showUpgrade()}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            ) : (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Webhook Name
                  </label>
                  <Input
                    placeholder="e.g., New Track Notifications"
                    value={newWebhookData.name}
                    onChange={(e) => setNewWebhookData({...newWebhookData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination URL
                  </label>
                  <Input
                    placeholder="https://example.com/webhooks/truindee"
                    value={newWebhookData.url}
                    onChange={(e) => setNewWebhookData({...newWebhookData, url: e.target.value})}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This URL will receive HTTP POST requests when events occur
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Events to Subscribe To
                  </label>
                  <div className="space-y-1 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                    {webhookEventOptions.map((event) => (
                      <label key={event.value} className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEventSelected(event.value)}
                          onChange={() => toggleEvent(event.value)}
                          className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {event.label}
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {event.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret Key (Optional)
                  </label>
                  <Input
                    placeholder="Enter a secret key to verify webhook requests"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We'll sign each request with this secret key, allowing you to verify that requests are coming from TruIndee
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowWebhookModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateWebhook}
                    disabled={!newWebhookData.name || !newWebhookData.url || newWebhookData.events.length === 0}
                    type="button"
                  >
                    Create Webhook
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}