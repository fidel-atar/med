import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { mockStories } from '@/mocks/stories'

export function useStories() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const storiesQuery = useQuery({
    queryKey: ['stories', user?.id ?? 'guest'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      } catch (e) {
        console.log('[useStories] Falling back to mock stories due to error or no backend', e)
        return mockStories
      }
    },
  })

  const createStoryMutation = useMutation({
    mutationFn: async ({ imageUrl }: { imageUrl: string }) => {
      if (!user?.id) throw new Error('Not authenticated')
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          expires_at: expiresAt.toISOString(),
        })
        .select(`
          *,
          profiles:user_id (
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
      queryClient.invalidateQueries({ queryKey: ['stories'] })
    },
  })

  return {
    stories: storiesQuery.data || [],
    isLoading: storiesQuery.isLoading,
    error: storiesQuery.error,
    createStory: createStoryMutation.mutateAsync,
    isCreatingStory: createStoryMutation.isPending,
  }
}