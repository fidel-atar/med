import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import {
  Crown,
  MessageCircle,
  UserPlus,
  UserCheck,
  Trophy,
  Calendar,
  MapPin,
  ArrowLeft,
  Share,
  Users,
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '@/constants/colors'
import MauritanianPattern from '@/components/MauritanianPattern'
import PostCard from '@/components/PostCard'
import { usePosts } from '@/hooks/usePosts'
import { useFriends } from '@/hooks/useFriends'

interface UserProfile {
  id: string
  username: string
  fullName: string
  avatar?: string
  bio: string
  isSubscriber: boolean
  isFollowing: boolean
  followersCount: number
  followingCount: number
  postsCount: number
  gamesWon: number
  gamesPlayed: number
  joinedDate: string
  location?: string
  badges: string[]
  favoriteGames: string[]
}

// Mock user data - in real app this would come from your database
const mockUsers: { [key: string]: UserProfile } = {
  'user1': {
    id: 'user1',
    username: 'أحمد_المختار',
    fullName: 'أحمد المختار ولد محمد',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'محب للألعاب التراثية الموريتانية 🇲🇷\nلاعب بلوت محترف 🃏',
    isSubscriber: true,
    isFollowing: false,
    followersCount: 1250,
    followingCount: 340,
    postsCount: 89,
    gamesWon: 156,
    gamesPlayed: 203,
    joinedDate: '2023-05-15',
    location: 'نواكشوط، موريتانيا',
    badges: ['بطل البلوت', 'خبير الكرول', 'نجم الشهر'],
    favoriteGames: ['بلوت', 'كرول', 'زامات']
  },
  'user2': {
    id: 'user2',
    username: 'فاطمة_الزهراء',
    fullName: 'فاطمة الزهراء بنت أحمد',
    bio: 'أحب التواصل مع الأصدقاء والعائلة 💕\nمهتمة بالثقافة الموريتانية',
    isSubscriber: false,
    isFollowing: true,
    followersCount: 890,
    followingCount: 567,
    postsCount: 234,
    gamesWon: 78,
    gamesPlayed: 145,
    joinedDate: '2023-08-22',
    location: 'نواذيبو، موريتانيا',
    badges: ['صديقة مميزة'],
    favoriteGames: ['لودو', 'الشارة']
  }
}

export default function UserProfilePage() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const { posts, isLoading } = usePosts()
  const { friends, isLoading: isFriendsLoading } = useFriends()

  useEffect(() => {
    if (userId && mockUsers[userId]) {
      const userData = mockUsers[userId]
      setUser(userData)
      setIsFollowing(userData.isFollowing)
    }
  }, [userId])

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    Alert.alert(
      isFollowing ? 'إلغاء المتابعة' : 'متابعة',
      isFollowing 
        ? `تم إلغاء متابعة ${user?.username}` 
        : `تم متابعة ${user?.username} بنجاح`
    )
  }

  const handleMessage = () => {
    Alert.alert('رسالة', `سيتم فتح محادثة مع ${user?.username}`)
  }

  const handleShare = () => {
    Alert.alert('مشاركة', `مشاركة ملف ${user?.username} الشخصي`)
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const getWinRate = () => {
    if (!user || user.gamesPlayed === 0) return 0
    return Math.round((user.gamesWon / user.gamesPlayed) * 100)
  }

  const userIdSafe = user?.id ?? ''

  const userPosts = useMemo(() => {
    try {
      const list = Array.isArray(posts) ? posts : []
      return list.filter((p: any) => (p?.user_id ?? '') === userIdSafe)
    } catch (e) {
      console.log('userPosts filter error', e)
      return [] as any[]
    }
  }, [posts, userIdSafe])

  const onLike = useCallback(() => {
    console.log('like clicked')
  }, [])
  const onComment = useCallback(() => {
    console.log('comment clicked')
  }, [])
  const onShare = useCallback(() => {
    console.log('share clicked')
  }, [])

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>المستخدم غير موجود</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.mauritanian.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Share size={24} color={Colors.mauritanian.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header with Mauritanian Pattern */}
        <View style={styles.profileHeader}>
          <MauritanianPattern style={styles.patternBackground} />
          <LinearGradient
            colors={[
              'rgba(41, 128, 185, 0.9)',
              'rgba(52, 152, 219, 0.8)',
              'rgba(155, 89, 182, 0.7)'
            ]}
            style={styles.gradientOverlay}
          />
          
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{user.fullName}</Text>
              {user.isSubscriber && (
                <LinearGradient
                  colors={[Colors.mauritanian.gold, Colors.mauritanian.amber]}
                  style={styles.subscriberBadge}
                >
                  <Crown size={12} color={Colors.mauritanian.white} fill={Colors.mauritanian.white} />
                </LinearGradient>
              )}
            </View>
            <Text style={styles.username}>@{user.username}</Text>
            
            {user.location && (
              <View style={styles.locationContainer}>
                <MapPin size={16} color={Colors.mauritanian.white} />
                <Text style={styles.location}>{user.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.followButton, isFollowing && styles.followingButton]} 
            onPress={handleFollow}
          >
            {isFollowing ? (
              <UserCheck size={20} color={Colors.mauritanian.white} />
            ) : (
              <UserPlus size={20} color={Colors.mauritanian.white} />
            )}
            <Text style={styles.actionButtonText}>
              {isFollowing ? 'متابع' : 'متابعة'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
            <MessageCircle size={20} color={Colors.mauritanian.mauritanianBlue} />
            <Text style={[styles.actionButtonText, { color: Colors.mauritanian.mauritanianBlue }]}>
              رسالة
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.postsCount}</Text>
            <Text style={styles.statLabel}>منشور</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followersCount}</Text>
            <Text style={styles.statLabel}>متابع</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followingCount}</Text>
            <Text style={styles.statLabel}>يتابع</Text>
          </View>
        </View>

        {/* Bio */}
        {user.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        )}

        {/* Gaming Stats */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Trophy size={20} color={Colors.mauritanian.gold} />
            <Text style={styles.sectionTitle}>إحصائيات الألعاب</Text>
          </View>
          
          <View style={styles.gameStatsGrid}>
            <View style={styles.gameStatCard}>
              <Text style={styles.gameStatNumber}>{user.gamesWon}</Text>
              <Text style={styles.gameStatLabel}>فوز</Text>
            </View>
            <View style={styles.gameStatCard}>
              <Text style={styles.gameStatNumber}>{user.gamesPlayed}</Text>
              <Text style={styles.gameStatLabel}>لعبة</Text>
            </View>
            <View style={styles.gameStatCard}>
              <Text style={styles.gameStatNumber}>{getWinRate()}%</Text>
              <Text style={styles.gameStatLabel}>نسبة الفوز</Text>
            </View>
          </View>
        </View>

        {/* Friends Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={Colors.mauritanian.mauritanianBlue} />
            <Text style={styles.sectionTitle}>الأصدقاء</Text>
          </View>
          {isFriendsLoading ? (
            <Text style={styles.loadingText} testID="friends-loading">جارٍ تحميل الأصدقاء...</Text>
          ) : (friends?.length ?? 0) === 0 ? (
            <Text style={styles.emptyText} testID="friends-empty">لا يوجد أصدقاء بعد</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.friendsScroller}
              contentContainerStyle={styles.friendsRow}
              testID="friends-list"
            >
              {friends.slice(0, 12).map((f: any) => {
                const fr = f?.friend ?? {}
                const friendId: string = fr.id ?? ''
                const fullName: string = fr.full_name ?? fr.username ?? 'مستخدم'
                const avatar: string | undefined = fr.avatar_url ?? undefined
                const username: string = fr.username ?? 'user'
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.friendCard}
                    onPress={() => Alert.alert('الملف الشخصي', `قريبًا: فتح ملف ${username}`)}
                    testID={`friend-${friendId}`}
                  >
                    {avatar ? (
                      <Image source={{ uri: avatar }} style={styles.friendAvatar} />
                    ) : (
                      <View style={styles.friendAvatarFallback}>
                        <Text style={styles.friendInitial}>{username.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={styles.friendName} numberOfLines={1}>
                      {fullName}
                    </Text>
                    <Text style={styles.friendUsername} numberOfLines={1}>
                      @{username}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>منشورات</Text>
          </View>
          {isLoading ? (
            <Text style={styles.loadingText}>جارٍ التحميل...</Text>
          ) : userPosts.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد منشورات بعد</Text>
          ) : (
            <View style={styles.postsList}>
              {userPosts.map((post: any) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  username={post?.profiles?.username ?? user.username}
                  userId={post?.profiles?.id ?? user.id}
                  avatar={post?.profiles?.avatar_url}
                  content={post.content ?? ''}
                  imageUrl={post.image_url as string | undefined}
                  videoUrl={(post as any).video_url ?? (post as any).video}
                  likesCount={Number(post.likes_count ?? 0)}
                  commentsCount={Number(post.comments_count ?? 0)}
                  viewsCount={Number(post.views_count ?? 0)}
                  isPromoted={Boolean(post.is_sponsored)}
                  isSubscriber={Boolean(post?.profiles?.is_subscriber)}
                  createdAt={post.createdAt ?? post.created_at ?? new Date().toISOString()}
                  sponsorName={(post as any).sponsor_name}
                  onLike={onLike}
                  onComment={onComment}
                  onShare={onShare}
                />
              ))}
            </View>
          )}
        </View>

        {/* Join Date */}
        <View style={styles.joinDateContainer}>
          <Calendar size={16} color={Colors.mauritanian.mediumGray} />
          <Text style={styles.joinDate}>
            انضم في {formatJoinDate(user.joinedDate)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.mauritanian.mauritanianBlue,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.mauritanian.white,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  patternBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.mauritanian.white,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.mauritanian.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.mauritanian.gold,
  },
  avatarText: {
    color: Colors.mauritanian.mauritanianBlue,
    fontSize: 36,
    fontWeight: 'bold',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  subscriberBadge: {
    marginLeft: 8,
    borderRadius: 12,
    padding: 4,
    shadowColor: Colors.mauritanian.gold,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: Colors.mauritanian.white,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.mauritanian.white,
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  username: {
    fontSize: 16,
    color: Colors.mauritanian.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    color: Colors.mauritanian.white,
    marginLeft: 6,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: Colors.mauritanian.white,
    borderWidth: 2,
    borderColor: Colors.mauritanian.mauritanianBlue,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  followButton: {
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    borderColor: Colors.mauritanian.mauritanianBlue,
  },
  followingButton: {
    backgroundColor: Colors.mauritanian.islamicGreen,
    borderColor: Colors.mauritanian.islamicGreen,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.mauritanian.white,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.mauritanian.white,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.mauritanian.mauritanianBlue,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.mauritanian.mediumGray,
    fontWeight: '600',
  },
  bioContainer: {
    backgroundColor: Colors.mauritanian.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bio: {
    fontSize: 16,
    color: Colors.mauritanian.darkGray,
    lineHeight: 24,
    textAlign: 'right',
  },
  sectionContainer: {
    backgroundColor: Colors.mauritanian.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.mauritanian.darkGray,
    marginLeft: 8,
  },
  gameStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gameStatCard: {
    flex: 1,
    backgroundColor: Colors.mauritanian.lightSand,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  gameStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.mauritanian.mauritanianBlue,
    marginBottom: 4,
  },
  gameStatLabel: {
    fontSize: 12,
    color: Colors.mauritanian.mediumGray,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.mauritanian.mediumGray,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.mauritanian.mediumGray,
    textAlign: 'center',
  },
  postsList: {
    gap: 12,
  },
  friendsScroller: {
    marginHorizontal: -4,
  },
  friendsRow: {
    paddingHorizontal: 4,
    gap: 12,
  },
  friendCard: {
    width: 110,
    alignItems: 'center',
    backgroundColor: Colors.mauritanian.lightSand,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  friendAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  friendAvatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    backgroundColor: Colors.mauritanian.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  friendInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.mauritanian.mauritanianBlue,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mauritanian.darkGray,
    textAlign: 'center',
  },
  friendUsername: {
    fontSize: 12,
    color: Colors.mauritanian.mediumGray,
    textAlign: 'center',
  },
  joinDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  joinDate: {
    fontSize: 14,
    color: Colors.mauritanian.mediumGray,
    marginLeft: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.mauritanian.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.mauritanian.white,
  },
})