import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useGames() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const gameSessionsQuery = useQuery({
    queryKey: ['game-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          *,
          host:host_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .contains('players', [user.id])
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })

  const createGameSessionMutation = useMutation({
    mutationFn: async ({ gameType, gameData }: {
      gameType: string
      gameData?: any
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          game_type: gameType,
          host_id: user.id,
          players: [user.id],
          status: 'waiting',
          game_data: gameData || {},
        })
        .select(`
          *,
          host:host_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-sessions'] })
    },
  })

  const joinGameSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      
      const { data: session, error: fetchError } = await supabase
        .from('game_sessions')
        .select('players')
        .eq('id', sessionId)
        .single()
      
      if (fetchError) throw fetchError
      
      const updatedPlayers = [...(session.players || []), user.id]
      
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ 
          players: updatedPlayers,
          status: updatedPlayers.length >= 2 ? 'playing' : 'waiting'
        })
        .eq('id', sessionId)
        .select(`
          *,
          host:host_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-sessions'] })
    },
  })

  const updateGameDataMutation = useMutation({
    mutationFn: async ({ sessionId, gameData }: {
      sessionId: string
      gameData: any
    }) => {
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ 
          game_data: gameData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-sessions'] })
    },
  })

  const finishGameSessionMutation = useMutation({
    mutationFn: async ({ sessionId, finalGameData }: {
      sessionId: string
      finalGameData: any
    }) => {
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ 
          status: 'finished',
          game_data: finalGameData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-sessions'] })
    },
  })

  return {
    gameSessions: gameSessionsQuery.data || [],
    isLoading: gameSessionsQuery.isLoading,
    error: gameSessionsQuery.error,
    createGameSession: createGameSessionMutation.mutateAsync,
    joinGameSession: joinGameSessionMutation.mutateAsync,
    updateGameData: updateGameDataMutation.mutateAsync,
    finishGameSession: finishGameSessionMutation.mutateAsync,
    isCreatingSession: createGameSessionMutation.isPending,
    isJoiningSession: joinGameSessionMutation.isPending,
    isUpdatingGame: updateGameDataMutation.isPending,
    isFinishingGame: finishGameSessionMutation.isPending,
  }
}

export function useGameSession(sessionId: string) {
  const gameSessionQuery = useQuery({
    queryKey: ['game-session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          *,
          host:host_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', sessionId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!sessionId,
  })

  return {
    gameSession: gameSessionQuery.data,
    isLoading: gameSessionQuery.isLoading,
    error: gameSessionQuery.error,
  }
}