'use client'

import { createClient } from '@/utils/supabase/client'

export type UserRole = 'user' | 'client' | 'admin' | null

/**
 * Get the current user's role from the database
 * Returns the role or null if not found/error
 */
export async function getUserRole(): Promise<UserRole> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }
    
    // Get user profile with role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (error || !profile) {
      console.error('Error fetching user role:', error)
      return null
    }
    
    return profile.role as UserRole
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

/**
 * Get the appropriate dashboard path based on user role
 */
export function getDashboardPathByRole(role: UserRole): string {
  switch (role) {
    case 'client':
      return '/client'
    case 'admin':
      return '/admin'
    case 'user':
      return '/Dashboard'
    default:
      return '/Dashboard'
  }
}
