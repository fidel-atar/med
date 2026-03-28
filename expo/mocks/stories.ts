export interface MockStoryProfile {
  id: string
  username: string
  full_name: string
  avatar_url?: string
}

export interface MockStory {
  id: string
  user_id: string
  image_url: string
  created_at: string
  expires_at: string
  profiles: MockStoryProfile
}

const now = new Date()

function plusHours(h: number) {
  const d = new Date(now)
  d.setHours(d.getHours() + h)
  return d.toISOString()
}

export const mockStories: MockStory[] = [
  {
    id: 'story-1',
    user_id: 'friend-1',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=1200&fit=crop',
    created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: plusHours(22),
    profiles: {
      id: 'friend-1',
      username: 'ahmed_gamer',
      full_name: 'أحمد محمد',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: 'story-2',
    user_id: 'friend-2',
    image_url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=1200&fit=crop',
    created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    expires_at: plusHours(20),
    profiles: {
      id: 'friend-2',
      username: 'fatima_pro',
      full_name: 'فاطمة علي',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: 'story-3',
    user_id: 'friend-3',
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=1200&fit=crop',
    created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    expires_at: plusHours(18),
    profiles: {
      id: 'friend-3',
      username: 'omar_king',
      full_name: 'عمر حسن',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: 'story-4',
    user_id: 'friend-4',
    image_url: 'https://images.unsplash.com/photo-1533236897111-3e94666b2edf?w=800&h=1200&fit=crop',
    created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    expires_at: plusHours(23),
    profiles: {
      id: 'friend-4',
      username: 'sara_winner',
      full_name: 'سارة أحمد',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: 'story-5',
    user_id: 'friend-6',
    image_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=1200&fit=crop',
    created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    expires_at: plusHours(23),
    profiles: {
      id: 'friend-6',
      username: 'layla_champion',
      full_name: 'ليلى عبدالله',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    },
  },
]
