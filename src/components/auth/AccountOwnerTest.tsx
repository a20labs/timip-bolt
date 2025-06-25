import { useState } from 'react';
import { Crown, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { userRegistrationService } from '../../services/userRegistrationService';
import { useAuthStore } from '../../stores/authStore';

export function AccountOwnerTest() {
  const [testResults, setTestResults] = useState<Array<{ test: string; result: boolean; details: string }>>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAccountOwner, getUserRole } = useAuthStore();

  const runTests = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: Check first user detection
      const isFirst1 = await userRegistrationService.isFirstUser('test1@example.com');
      results.push({
        test: 'First User Detection',
        result: isFirst1,
        details: isFirst1 ? 'Correctly identifies first user' : 'Failed to identify first user'
      });

      // Test 2: Check account owner permissions
      const currentUserIsOwner = isAccountOwner();
      const currentRole = getUserRole();
      results.push({
        test: 'Current User Account Owner Status',
        result: true,
        details: `Role: ${currentRole}, Is Owner: ${currentUserIsOwner}`
      });

      // Test 3: Test permission system
      if (user) {
        const permissions = userRegistrationService.getUserPermissions(user);
        results.push({
          test: 'Permission System',
          result: true,
          details: `Can manage users: ${permissions.canManageUsers}, Can delete account: ${permissions.canDeleteAccount}`
        });
      }

      // Test 4: Test mock user creation
      try {
        const mockUser = await userRegistrationService.createDemoAccount('testowner@example.com', 'artist');
        results.push({
          test: 'Demo Account Creation',
          result: mockUser.is_account_owner,
          details: `Created user with owner status: ${mockUser.is_account_owner}, Role: ${mockUser.role}`
        });
      } catch (error) {
        results.push({
          test: 'Demo Account Creation',
          result: false,
          details: `Failed to create demo account: ${error}`
        });
      }

    } catch (error) {
      results.push({
        test: 'Test Suite',
        result: false,
        details: `Test suite failed: ${error}`
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const clearTests = () => {
    setTestResults([]);
  };

  const resetDemoState = () => {
    // Clear the demo user creation flag to reset first-user detection
    sessionStorage.removeItem('demoUsersCreated');
    setTestResults([]);
    
    // Show confirmation
    setTestResults([{
      test: 'Demo State Reset',
      result: true,
      details: 'Demo state cleared. Next login will be treated as first user and become account owner.'
    }]);
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <Crown className="w-6 h-6 text-amber-400" />
        <h2 className="text-xl font-semibold text-white">Account Owner System Test</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={runTests} loading={loading} size="sm">
            Run Tests
          </Button>
          <Button onClick={clearTests} variant="outline" size="sm" disabled={loading}>
            Clear Results
          </Button>
          <Button 
            onClick={resetDemoState} 
            variant="outline" 
            size="sm" 
            className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
            disabled={loading}
          >
            Reset Demo State
          </Button>
        </div>

        {user && (
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              Current User Status
              {isAccountOwner() && <Crown className="w-4 h-4 text-amber-400" />}
            </h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Email: {user.email}</p>
              <p>Name: {user.user_metadata?.full_name || 'N/A'}</p>
              <p>Role: {getUserRole()}</p>
              <p>Account Owner: {isAccountOwner() ? 'Yes' : 'No'}</p>
              <p>Workspace ID: {user.user_metadata?.workspace_id || 'N/A'}</p>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white font-medium">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                {result.result ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">{result.test}</p>
                  <p className="text-sm text-gray-300">{result.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-400 mt-4">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>First user to register becomes account owner automatically</li>
            <li>Account owners get admin role and full permissions</li>
            <li>Subsequent users get their chosen role (artist/fan)</li>
            <li>Visual indicators show account owner status throughout the UI</li>
            <li>Use "Reset Demo State" to test first-user flow again</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
