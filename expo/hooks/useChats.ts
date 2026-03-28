import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useChats() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const chatsQuery = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          chats (
            id,
            name,
            is_group,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
      
      if (error) throw error
      return data.map(item => item.chats).filter(Boolean)
    },
    enabled: !!user?.id,
  })

  const createChatMutation = useMutation({
    mutationFn: async ({ name, isGroup = false, participantIds }: {
      name?: string
      isGroup?: boolean
      participantIds: string[]
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          is_group: isGroup,
        })
        .select()
        .single()
      
      if (chatError) throw chatError
      
      const participants = [user.id, ...participantIds].map(userId => ({
        chat_id: chat.id,
        user_id: userId,
      }))
      
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants)
      
      if (participantsError) throw participantsError
      
      return chat
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  return {
    chats: chatsQuery.data || [],
    isLoading: chatsQuery.isLoading,
    error: chatsQuery.error,
    createChat: createChatMutation.mutateAsync,
    isCreatingChat: createChatMutation.isPending,
  }
}

export function useMessages(chatId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const messagesQuery = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!chatId,
  })

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, messageType = 'text' }: {
      content: string
      messageType?: 'text' | 'image' | 'file'
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          content,
          message_type: messageType,
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
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
    },
  })

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage: sendMessageMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
  }
}