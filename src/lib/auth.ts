import type { SupabaseClient } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

export type UserRole = 'user' | 'admin'

export type PostLoginPath = '/admin' | '/dashboard'

const AUTH_CALLBACK_PATH = '/auth/callback'

function getAuthRedirectUrl() {
  if (typeof window === 'undefined') {
    return AUTH_CALLBACK_PATH
  }
  return `${window.location.origin}${AUTH_CALLBACK_PATH}`
}

/** Resolve role-based destination after a successful login. */
export async function getPostLoginRedirect(
  client: SupabaseClient,
  userId: string
): Promise<PostLoginPath> {
  const { data } = await client
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role === 'admin' ? '/admin' : '/dashboard'
}

/** Google OAuth — configure Google provider in Supabase Dashboard → Authentication → Providers. */
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  })
}

/** Email/password sign-in — enable Email provider in Supabase Dashboard. */
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

/** Email/password sign-up; profile row created via DB trigger on auth.users insert. */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { full_name?: string }
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: getAuthRedirectUrl(),
    },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}
