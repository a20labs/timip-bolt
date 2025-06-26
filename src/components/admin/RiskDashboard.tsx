import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Monitor, 
  Clock, 
  Activity,
  RefreshCw,
  Filter,
  Eye
} from 'lucide-react';
import { RiskAssessment } from '../../types/pam';

interface RiskDashboardProps {
  className?: string;
}

interface RiskMetrics {
  totalAssessments: number;
  highRiskSessions: number;
  averageRiskScore: number;
  riskTrend: 'up' | 'down' | 'stable';
  topRiskFactors: { type: string; count: number }[];
}

export function RiskDashboard({ className = '' }: RiskDashboardProps) {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);

  useEffect(() => {
    loadRiskData();
  }, [selectedTimeframe]);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      
      // Generate mock risk assessments
      const mockAssessments: RiskAssessment[] = [
        {
          id: 'risk_1',
          user_id: 'user_admin',
          session_id: 'session_1',
          overall_score: 85,
          factors: [
            {
              type: 'LOCATION',
              score: 70,
              description: 'Access from new geographic location',
              severity: 'HIGH'
            },
            {
              type: 'DEVICE',
              score: 60,
              description: 'Unrecognized device fingerprint',
              severity: 'MEDIUM'
            },
            {
              type: 'TIME',
              score: 40,
              description: 'Access during unusual hours',
              severity: 'MEDIUM'
            }
          ],
          recommendations: [
            'Require additional authentication',
            'Limit session duration',
            'Monitor closely for suspicious activity'
          ],
          requires_additional_auth: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
        },
        {
          id: 'risk_2',
          user_id: 'user_artist',
          session_id: 'session_2',
          overall_score: 45,
          factors: [
            {
              type: 'BEHAVIOR',
              score: 50,
              description: 'Unusual access pattern detected',
              severity: 'MEDIUM'
            },
            {
              type: 'VELOCITY',
              score: 30,
              description: 'Multiple rapid requests',
              severity: 'LOW'
            }
          ],
          recommendations: [
            'Monitor session activity',
            'Set up activity alerts'
          ],
          requires_additional_auth: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: 'risk_3',
          user_id: 'user_fan',
          session_id: 'session_3',
          overall_score: 95,
          factors: [
            {
              type: 'LOCATION',
              score: 90,
              description: 'Access from high-risk country',
              severity: 'CRITICAL'
            },
            {
              type: 'DEVICE',
              score: 85,
              description: 'Device associated with previous security incidents',
              severity: 'CRITICAL'
            },
            {
              type: 'BEHAVIOR',
              score: 80,
              description: 'Attempting to access restricted resources',
              severity: 'HIGH'
            }
          ],
          recommendations: [
            'Block access immediately',
            'Require manual approval for future access',
            'Investigate potential security breach'
          ],
          requires_additional_auth: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
        }
      ];

      setRiskAssessments(mockAssessments);

      // Calculate metrics
      const totalAssessments = mockAssessments.length;
      const highRiskSessions = mockAssessments.filter(a => a.overall_score >= 70).length;
      const averageRiskScore = Math.round(
        mockAssessments.reduce((sum, a) => sum + a.overall_score, 0) / totalAssessments
      );

      // Count risk factors
      const factorCounts: Record<string, number> = {};
      mockAssessments.forEach(assessment => {
        assessment.factors.forEach(factor => {
          factorCounts[factor.type] = (factorCounts[factor.type] || 0) + 1;
        });
      });

      const topRiskFactors = Object.entries(factorCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setMetrics({
        totalAssessments,
        highRiskSessions,
        averageRiskScore,
        riskTrend: averageRiskScore > 60 ? 'up' : averageRiskScore < 40 ? 'down' : 'stable',
        topRiskFactors
      });

    } catch (error) {
      console.error('🔐 RiskDashboard: Failed to load risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskFactorIcon = (type: string) => {
    switch (type) {
      case 'LOCATION': return <MapPin className="h-4 w-4" />;
      case 'DEVICE': return <Monitor className="h-4 w-4" />;
      case 'TIME': return <Clock className="h-4 w-4" />;
      case 'BEHAVIOR': return <Activity className="h-4 w-4" />;
      case 'VELOCITY': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredAssessments = riskAssessments.filter(assessment => {
    if (filterSeverity) {
      const hasMatchingSeverity = assessment.factors.some(
        factor => factor.severity === filterSeverity
      );
      return hasMatchingSeverity;
    }
    return true;
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Risk Assessment Dashboard</h2>
          <p className="text-gray-600">Real-time security risk monitoring and analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={loadRiskData}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalAssessments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.highRiskSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Risk Score</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{metrics.averageRiskScore}</p>
                  {metrics.riskTrend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                  {metrics.riskTrend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Risk Factor</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.topRiskFactors[0]?.type || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Factor Summary */}
      {metrics && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factor Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {metrics.topRiskFactors.map(factor => (
              <div key={factor.type} className="text-center">
                <div className="flex justify-center mb-2">
                  {getRiskFactorIcon(factor.type)}
                </div>
                <p className="text-sm font-medium text-gray-700">{factor.type}</p>
                <p className="text-lg font-bold text-gray-900">{factor.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredAssessments.length} of {riskAssessments.length} assessments
          </span>
        </div>
      </div>

      {/* Risk Assessments List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Risk Assessments</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAssessments.map(assessment => (
            <div key={assessment.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(assessment.overall_score)}`}>
                    Risk Score: {assessment.overall_score}
                  </div>
                  <span className="text-sm text-gray-600">
                    User: {assessment.user_id}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTimeAgo(assessment.timestamp)}
                  </span>
                </div>
                <button
                  onClick={() => setExpandedAssessment(
                    expandedAssessment === assessment.id ? null : assessment.id
                  )}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              {/* Risk Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {assessment.factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    {getRiskFactorIcon(factor.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">{factor.type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(factor.severity)}`}>
                          {factor.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{factor.description}</p>
                      <p className="text-xs text-gray-500">Score: {factor.score}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expanded Details */}
              {expandedAssessment === assessment.id && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {assessment.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Session Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Session ID: {assessment.session_id}</p>
                        <p>Additional Auth Required: {assessment.requires_additional_auth ? 'Yes' : 'No'}</p>
                        <p>Assessment Time: {new Date(assessment.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
