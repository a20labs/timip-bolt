import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { checkDeletionStatus } from '../api/dataDeletion';

export function DeletionStatus() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'completed' | 'pending' | 'not_found'>('loading');
  const [userId, setUserId] = useState<string | undefined>();
  const [timestamp, setTimestamp] = useState<string | undefined>();
  
  const confirmationCode = searchParams.get('c');
  
  useEffect(() => {
    if (!confirmationCode) {
      setStatus('not_found');
      return;
    }
    
    async function checkStatus() {
      const result = await checkDeletionStatus(confirmationCode);
      setStatus(result.status);
      setUserId(result.userId);
      setTimestamp(result.timestamp);
    }
    
    checkStatus();
  }, [confirmationCode]);
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>
      
      <Card className="p-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Data Deletion Status
        </h1>
        
        {status === 'loading' && (
          <div className="flex items-center justify-center p-6">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {status === 'not_found' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <X className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-300">
                Invalid Request
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                We couldn't find the deletion request you're looking for. Please check the URL or contact support.
              </p>
            </div>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Check className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-300">
                Deletion Complete
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                We received your request on {timestamp && new Date(timestamp).toLocaleString()} and have completed the deletion of your data.
              </p>
              {userId && (
                <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                  Reference ID: {userId}
                </p>
              )}
            </div>
          </div>
        )}
        
        {status === 'pending' && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">
                Deletion In Progress
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                We received your request on {timestamp && new Date(timestamp).toLocaleString()} and are processing the deletion of your data.
                This process may take up to 24 hours to complete.
              </p>
              {userId && (
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                  Reference ID: {userId}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Questions?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you have any questions about your data deletion request, please contact our privacy team:
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            <a href="mailto:privacy@truindee.com" className="text-primary-600 dark:text-primary-400">
              privacy@truindee.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default DeletionStatus;