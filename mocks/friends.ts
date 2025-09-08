export interface MockFriend {
  id: string
  username: string
  fullName: string
  isOnline: boolean
  isSubscriber: boolean
  gamesPlayed: number
  winRate: number
  lastSeen?: string
  avatarUrl?: string
}

export const mockFriends: MockFriend[] = [
  {
    id: 'friend-1',
    username: 'ahmed_gamer',
    fullName: 'أحمد محمد',
    isOnline: true,
    isSubscriber: true,
    gamesPlayed: 245,
    winRate: 78,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-2',
    username: 'fatima_pro',
    fullName: 'فاطمة علي',
    isOnline: true,
    isSubscriber: false,
    gamesPlayed: 189,
    winRate: 65,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-3',
    username: 'omar_king',
    fullName: 'عمر حسن',
    isOnline: false,
    isSubscriber: true,
    gamesPlayed: 312,
    winRate: 82,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-4',
    username: 'sara_winner',
    fullName: 'سارة أحمد',
    isOnline: true,
    isSubscriber: false,
    gamesPlayed: 156,
    winRate: 71,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-5',
    username: 'youssef_master',
    fullName: 'يوسف محمود',
    isOnline: false,
    isSubscriber: true,
    gamesPlayed: 428,
    winRate: 85,
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-6',
    username: 'layla_champion',
    fullName: 'ليلى عبدالله',
    isOnline: true,
    isSubscriber: false,
    gamesPlayed: 203,
    winRate: 68,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-7',
    username: 'hassan_legend',
    fullName: 'حسن إبراهيم',
    isOnline: false,
    isSubscriber: true,
    gamesPlayed: 367,
    winRate: 79,
    lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    avatarUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-8',
    username: 'nour_star',
    fullName: 'نور الدين',
    isOnline: true,
    isSubscriber: false,
    gamesPlayed: 134,
    winRate: 62,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-9',
    username: 'khalid_expert',
    fullName: 'خالد سعد',
    isOnline: false,
    isSubscriber: true,
    gamesPlayed: 289,
    winRate: 76,
    lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-10',
    username: 'maryam_ace',
    fullName: 'مريم خالد',
    isOnline: true,
    isSubscriber: false,
    gamesPlayed: 178,
    winRate: 69,
    avatarUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-11',
    username: 'ali_warrior',
    fullName: 'علي حسام',
    isOnline: false,
    isSubscriber: true,
    gamesPlayed: 456,
    winRate: 88,
    lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'friend-12',
    username: 'zeinab_queen',
    fullName: 'زينب محمد',
    isOnline: true,
    isSubscriber: false,
    gamesPlayed: 167,
    winRate: 64,
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
  }
]

export const mockFriendRequests = [
  {
    id: 'request-1',
    user_id: 'user-pending-1',
    friend_id: 'current-user',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    requester: {
      id: 'user-pending-1',
      username: 'new_player',
      full_name: 'لاعب جديد',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: 'request-2',
    user_id: 'user-pending-2',
    friend_id: 'current-user',
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    requester: {
      id: 'user-pending-2',
      username: 'game_lover',
      full_name: 'محب الألعاب',
      avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face'
    }
  }
]

export const mockSearchUsers = [
  {
    id: 'search-user-1',
    username: 'random_user1',
    full_name: 'مستخدم عشوائي',
    avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'search-user-2',
    username: 'gamer_pro',
    full_name: 'لاعب محترف',
    avatar_url: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'search-user-3',
    username: 'casual_player',
    full_name: 'لاعب عادي',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face'
  }
]