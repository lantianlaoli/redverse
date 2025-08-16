'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { createBasicSubscription, getUserSubscription } from '@/lib/subscription';
import { checkAndMigrateUser } from '@/lib/user-migration-client';

export function UserInitializer() {
  const { user, isLoaded } = useUser();
  const initializationRef = useRef(new Set<string>());

  useEffect(() => {
    const initializeUser = async (userId: string, email: string) => {
      // Prevent multiple initializations for the same user
      if (initializationRef.current.has(userId)) {
        return;
      }
      
      try {
        initializationRef.current.add(userId);
        
        // First, handle potential data migration from old user ID
        const migrationResult = await checkAndMigrateUser(userId, email);
        
        if (migrationResult.migrationPerformed) {
          console.log('✅ User data migration completed for:', email);
          if (migrationResult.errors?.length) {
            console.warn('⚠️ Migration had some errors:', migrationResult.errors);
          }
        }
        
        // Check if user already has a subscription
        const subResult = await getUserSubscription(userId);
        
        if (subResult.success && !subResult.subscription) {
          // User exists but has no subscription, create one
          console.log('Initializing subscription for new user:', userId);
          const createResult = await createBasicSubscription(userId);
          
          if (createResult.success) {
            console.log('✅ Basic subscription created successfully for user:', userId);
          } else {
            console.error('❌ Failed to create subscription for user:', userId, createResult.error);
          }
        }
      } catch (error) {
        console.error('❌ Error during user initialization:', error);
      }
    };

    // Only proceed if Clerk has loaded and user exists
    if (isLoaded && user?.id && user?.emailAddresses?.[0]?.emailAddress) {
      initializeUser(user.id, user.emailAddresses[0].emailAddress);
    }
  }, [isLoaded, user?.id, user?.emailAddresses]);

  // This component renders nothing
  return null;
}