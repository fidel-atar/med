export type NotificationType = 'follow' | 'like' | 'comment'

export interface MockActor {
  id: string
  username: string
  full_name: string
  avatar_url?: string
}

export interface MockNotification {
  id: string
  type: NotificationType
  actor: MockActor
  created_at: string
  read: boolean
  post_id?: string
  reaction?: string
  comment_text?: string
}

export const mockNotifications: MockNotification[] = [
  {
    id: 'n-1',
    type: 'follow',
    actor: {
      id: 'friend-2',
      username: 'fatima_pro',
      full_name: 'فاطمة علي',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'n-2',
    type: 'like',
    actor: {
      id: 'friend-3',
      username: 'omar_king',
      full_name: 'عمر حسن',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    post_id: 'post-102',
    reaction: '❤️',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'n-3',
    type: 'comment',
    actor: {
      id: 'friend-7',
      username: 'hassan_legend',
      full_name: 'حسن إبراهيم',
      avatar_url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face'
    },
    post_id: 'post-099',
    comment_text: 'تصميم رائع جدًا 👏',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'n-4',
    type: 'like',
    actor: {
      id: 'friend-5',
      username: 'youssef_master',
      full_name: 'يوسف محمود',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    post_id: 'post-120',
    reaction: '🔥',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
]