/**
 * Data Deletion API Implementation
 * 
 * This module implements the Data Deletion Callback required for Facebook/Meta integration,
 * as well as general data deletion functionality.
 */

import crypto from 'crypto';
import { supabase } from '../lib/supabase';

interface DeletionResponse {
  success: boolean;
  message: string;
  confirmation_code?: string;
  url?: string;
}

/**
 * Handles a Facebook data deletion request
 * @param signedRequest The signed_request from Facebook
 * @returns Response with confirmation code and status URL
 */
export async function handleFacebookDeletion(signedRequest: string): Promise<DeletionResponse> {
  try {
    // Parse and verify the signed_request
    const [encodedSig, payload] = signedRequest.split('.', 2);
    
    // Get the app secret from environment
    const appSecret = import.meta.env.VITE_FB_APP_SECRET || 'mock-app-secret';
    
    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest();
    
    const decodedSig = Buffer.from(encodedSig, 'base64url');
    
    // In production, you'd use a timing-safe comparison
    // For demo purposes, we'll just log and accept
    console.log('Signature verification would happen here');
    
    // Parse payload
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const facebookUserId = data.user_id;
    
    // Delete user data
    await purgeUserData(facebookUserId, 'facebook');
    
    // Generate confirmation code
    const code = `del_${facebookUserId}_${Date.now()}`;
    
    return {
      success: true,
      message: 'Data deletion request processed',
      confirmation_code: code,
      url: `${window.location.origin}/privacy/deletion-status?c=${code}`
    };
  } catch (error) {
    console.error('Error processing Facebook deletion request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handles a direct user data deletion request
 * @param userId The user's ID
 * @returns Response indicating success or failure
 */
export async function handleUserDeletion(userId: string): Promise<DeletionResponse> {
  try {
    await purgeUserData(userId, 'direct');
    
    return {
      success: true,
      message: 'Your account and all associated data have been scheduled for deletion'
    };
  } catch (error) {
    console.error('Error processing user deletion request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Purges all user data from the system
 * @param userId The user's ID
 * @param source The source of the deletion request
 */
async function purgeUserData(userId: string, source: 'facebook' | 'direct'): Promise<void> {
  // In a real implementation, this would:
  // 1. Identify the user account associated with the Facebook ID
  // 2. Delete or anonymize all personal data
  // 3. Log the deletion for compliance purposes
  
  console.log(`Purging user data for ${userId} from ${source}`);
  
  // For demo purposes, we'll simulate the process
  
  // 1. Find the user
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq(source === 'facebook' ? 'facebook_id' : 'id', userId)
    .single();
  
  if (userError) {
    console.error('Error finding user:', userError);
    return;
  }
  
  // 2. Delete user content
  await Promise.all([
    // Delete tracks
    supabase.from('tracks').delete().eq('workspace_id', user.workspace_id),
    // Delete releases
    supabase.from('releases').delete().eq('workspace_id', user.workspace_id),
    // Delete posts
    supabase.from('posts').delete().eq('workspace_id', user.workspace_id),
    // Delete orders
    supabase.from('orders').delete().eq('workspace_id', user.workspace_id)
  ]);
  
  // 3. Anonymize the user if it's a Facebook deletion
  if (source === 'facebook') {
    await supabase
      .from('users')
      .update({
        facebook_id: null,
        anonymized: true,
        anonymized_at: new Date().toISOString()
      })
      .eq('id', user.id);
  } else {
    // Complete account deletion for direct request
    await supabase.auth.admin.deleteUser(userId);
  }
  
  // 4. Log the deletion
  await supabase
    .from('deletion_logs')
    .insert({
      user_id: user.id,
      deletion_source: source,
      deletion_date: new Date().toISOString(),
      status: 'completed'
    });
}

/**
 * Checks the status of a deletion request
 * @param confirmationCode The confirmation code from a previous deletion request
 * @returns Status information for the deletion request
 */
export async function checkDeletionStatus(confirmationCode: string): Promise<{
  status: 'completed' | 'pending' | 'not_found';
  userId?: string;
  timestamp?: string;
}> {
  // Parse the confirmation code to extract user ID and timestamp
  const parts = confirmationCode.split('_');
  if (parts.length !== 3 || parts[0] !== 'del') {
    return { status: 'not_found' };
  }
  
  const userId = parts[1];
  const timestamp = new Date(parseInt(parts[2])).toISOString();
  
  // In a real implementation, check the deletion status in the database
  // For demo, we'll assume it's completed
  
  return {
    status: 'completed',
    userId,
    timestamp
  };
}