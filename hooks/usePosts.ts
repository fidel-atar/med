import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { mockPosts } from '@/mocks/posts'

export function usePosts() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      // For testing, return mock data
      // TODO: Replace with real Supabase query when ready
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockPosts), 500)
      })
      
      // Real Supabase query (commented out for testing)
      // const { data, error } = await supabase
      //   .from('posts')
      //   .select(`
      //     *,
      //     profiles:user_id (
      //       id,
      //       username,
      //       full_name,
      //       avatar_url
      //     )
      //   `)
      //   .order('created_at', { ascending: false })
      // 
      // if (error) throw error
      // return data
    },
  })

  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageUrl, isSponsored, sponsorName }: { 
      content: string; 
      imageUrl?: string;
      isSponsored?: boolean;
      sponsorName?: string;
    }) => {
      // For testing, simulate post creation
      const newPost = {
        id: Date.now().toString(),
        user_id: user?.id || 'current_user',
        content,
        image_url: imageUrl,
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
        is_sponsored: isSponsored || false,
        sponsor_name: sponsorName,
        created_at: new Date().toISOString(),
        profiles: {
          id: user?.id || 'current_user',
          username: 'current_user',
          full_name: 'Current User',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          is_subscriber: false
        }
      }
      
      return new Promise((resolve) => {
        setTimeout(() => resolve(newPost), 1000)
      })
      
      // Real Supabase mutation (commented out for testing)
      // if (!user?.id) throw new Error('Not authenticated')
      // 
      // const { data, error } = await supabase
      //   .from('posts')
      //   .insert({
      //     user_id: user.id,
      //     content,
      //     image_url: imageUrl,
      //   })
      //   .select(`
      //     *,
      //     profiles:user_id (
      //       id,
      //       username,
      //       full_name,
      //       avatar_url
      //     )
      //   `)
      //   .single()
      // 
      // if (error) throw error
      // return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // For testing, simulate like action
      return new Promise((resolve) => {
        setTimeout(() => resolve({ id: postId, likes_count: Math.floor(Math.random() * 100) }), 500)
      })
      
      // Real Supabase mutation (commented out for testing)
      // const { data: post, error: fetchError } = await supabase
      //   .from('posts')
      //   .select('likes_count')
      //   .eq('id', postId)
      //   .single()
      // 
      // if (fetchError) throw fetchError
      // 
      // const { data, error } = await supabase
      //   .from('posts')
      //   .update({ likes_count: (post.likes_count || 0) + 1 })
      //   .eq('id', postId)
      //   .select()
      //   .single()
      // 
      // if (error) throw error
      // return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  return {
    posts: postsQuery.data || [],
    isLoading: postsQuery.isLoading,
    error: postsQuery.error,
    createPost: createPostMutation.mutateAsync,
    likePost: likePostMutation.mutateAsync,
    isCreatingPost: createPostMutation.isPending,
    isLikingPost: likePostMutation.isPending,
  }
}