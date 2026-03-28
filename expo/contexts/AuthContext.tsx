import createContextHook from '@nkzw/create-context-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { useEffect, useState, useMemo } from 'react'

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
  })

  const signUpMutation = useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      username, 
      fullName 
    }: { 
      email: string
      password: string
      username: string
      fullName?: string
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      return data
    },
  })

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user?.id,
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: {
      username?: string
      full_name?: string
      avatar_url?: string
      bio?: string
    }) => {
      if (!user?.id) throw new Error('No user')
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  return useMemo(() => ({
    session,
    user,
    loading,
    profile: profileQuery.data,
    isAuthenticated: !!session,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  }), [
    session,
    user,
    loading,
    profileQuery.data,
    signInMutation.mutateAsync,
    signInMutation.isPending,
    signUpMutation.mutateAsync,
    signUpMutation.isPending,
    signOutMutation.mutateAsync,
    signOutMutation.isPending,
    updateProfileMutation.mutateAsync,
    updateProfileMutation.isPending,
  ])
})