import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, router } from 'expo-router'
import {
  Search,
  UserPlus,
  Users,
  MessageCircle,
  Trophy,
  Crown,
  ArrowLeft,
  X,
  UserCheck,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react-native'
import { useAuth } from '@/contexts/AuthContext'
import { useFriends } from '@/hooks/useFriends'

interface Friend {
  id: string
  username: string
  fullName: string
  isOnline: boolean
  isSubscriber: boolean
  gamesPlayed: number
  winRate: number
  lastSeen?: string
}

export default function FriendsScreen() {
  const { isAuthenticated } = useAuth()
  const {
    friends,
    friendRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    isSearching,
    isAcceptingRequest,
    isRejectingRequest,
    searchResults,
  } = useFriends()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'requests'>('all')
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [addFriendQuery, setAddFriendQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  
  console.log('FriendsScreen rendered with', friends.length, 'friends')
  console.log('Active tab:', activeTab, 'Search query:', searchQuery)

  const mappedFriends: Friend[] = friends.map(friendship => ({
    id: friendship.friend?.id || '',
    username: friendship.friend?.username || '',
    fullName: friendship.friend?.full_name || friendship.friend?.username || 'مستخدم',
    isOnline: Math.random() > 0.5, // Mock online status
    isSubscriber: Math.random() > 0.7, // Mock subscriber status
    gamesPlayed: Math.floor(Math.random() * 300) + 50,
    winRate: Math.floor(Math.random() * 40) + 40,
    lastSeen: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 86400000 * 7).toISOString() : undefined,
  }))

  const filteredFriends = mappedFriends.filter(friend => {
    const matchesSearch = friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' || (activeTab === 'online' && friend.isOnline)
    return matchesSearch && matchesTab
  })

  const handleAddFriend = () => {
    if (!isAuthenticated) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول أولاً لإضافة أصدقاء')
      return
    }
    setShowAddFriendModal(true)
    setAddFriendQuery('')
    setSearchError('')
  }

  const searchForUsers = async () => {
    if (!addFriendQuery.trim()) {
      setSearchError('يرجى إدخال ID المستخدم')
      return
    }

    setSearchError('')
    
    try {
      await searchUsers(addFriendQuery.trim())
      
      if (searchResults.length === 0) {
        setSearchError('لم يتم العثور على مستخدم بهذا ID')
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('حدث خطأ أثناء البحث عن المستخدم')
    }
  }

  const handleSendFriendRequest = async (userId: string, userName: string) => {
    try {
      await sendFriendRequest(userId)
      
      Alert.alert(
        'تم إرسال الطلب ✅',
        `تم إرسال طلب صداقة إلى ${userName}\nسيتم إشعاره بطلبك وسيتمكن من قبوله أو رفضه`,
        [
          { 
            text: 'موافق', 
            onPress: () => {
              setShowAddFriendModal(false)
              setAddFriendQuery('')
            }
          }
        ]
      )
    } catch (error) {
      console.error('Friend request error:', error)
      Alert.alert('خطأ ❌', 'فشل في إرسال طلب الصداقة. تأكد من صحة ID المستخدم')
    }
  }

  const handleChatWithFriend = (friend: Friend) => {
    router.push(`/chat/friend-${friend.id}`)
  }

  const handleViewProfile = (friend: Friend) => {
    router.push(`/user/${friend.id}`)
  }

  const formatLastSeen = (lastSeenString: string) => {
    const lastSeen = new Date(lastSeenString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `آخر ظهور منذ ${diffInHours} ساعة`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `آخر ظهور منذ ${diffInDays} يوم`
    }
  }

  const onlineFriendsCount = mappedFriends.filter(f => f.isOnline).length
  const pendingRequestsCount = friendRequests.length

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'أصدقائي',
          headerStyle: { backgroundColor: '#4ECDC4' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleAddFriend}>
              <UserPlus size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن الأصدقاء..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Users size={18} color={activeTab === 'all' ? '#4ECDC4' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              الكل ({mappedFriends.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'online' && styles.activeTab]}
            onPress={() => setActiveTab('online')}
          >
            <View style={styles.onlineIndicator} />
            <Text style={[styles.tabText, activeTab === 'online' && styles.activeTabText]}>
              متصل ({onlineFriendsCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Clock size={18} color={activeTab === 'requests' ? '#4ECDC4' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              طلبات ({pendingRequestsCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.friendsList} showsVerticalScrollIndicator={false}>
        {activeTab === 'requests' ? (
          // Friend Requests Tab
          friendRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>لا توجد طلبات صداقة</Text>
              <Text style={styles.emptySubtitle}>
                ستظهر هنا طلبات الصداقة الجديدة
              </Text>
            </View>
          ) : (
            friendRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <View style={styles.requestAvatarContainer}>
                    <View style={styles.requestAvatar}>
                      <Text style={styles.requestAvatarText}>
                        {(request.requester?.full_name || request.requester?.username || 'U').charAt(0)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.requestDetails}>
                    <Text style={styles.requestName}>
                      {request.requester?.full_name || request.requester?.username}
                    </Text>
                    <Text style={styles.requestUsername}>@{request.requester?.username}</Text>
                    <Text style={styles.requestTime}>
                      طلب الصداقة منذ {formatLastSeen(request.created_at)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptFriendRequest(request.id)}
                    disabled={isAcceptingRequest}
                  >
                    <Check size={18} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => rejectFriendRequest(request.id)}
                    disabled={isRejectingRequest}
                  >
                    <X size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : (
          // Friends Tab (All/Online)
          filteredFriends.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'لا توجد نتائج' : 'لا يوجد أصدقاء'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'ابدأ بإضافة أصدقاء للعب معهم'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
                  <UserPlus size={20} color="#fff" />
                  <Text style={styles.addFriendText}>إضافة أصدقاء</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredFriends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendCard}
                onPress={() => handleViewProfile(friend)}
              >
                <View style={styles.friendInfo}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {friend.fullName.charAt(0)}
                      </Text>
                    </View>
                    {friend.isOnline && <View style={styles.onlineBadge} />}
                  </View>
                  
                  <View style={styles.friendDetails}>
                    <View style={styles.friendNameContainer}>
                      <Text style={styles.friendName}>{friend.fullName}</Text>
                      {friend.isSubscriber && (
                        <View style={styles.subscriberBadge}>
                          <Crown size={10} color="#FFD700" fill="#FFD700" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.friendUsername}>@{friend.username}</Text>
                    
                    <View style={styles.friendStats}>
                      <View style={styles.statItem}>
                        <Trophy size={14} color="#4ECDC4" />
                        <Text style={styles.statText}>{friend.gamesPlayed} لعبة</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.winRateText}>{friend.winRate}% فوز</Text>
                      </View>
                    </View>
                    
                    {!friend.isOnline && friend.lastSeen && (
                      <Text style={styles.lastSeenText}>
                        {formatLastSeen(friend.lastSeen)}
                      </Text>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => handleChatWithFriend(friend)}
                >
                  <MessageCircle size={20} color="#4ECDC4" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )
        )}
      </ScrollView>

      <Modal
        visible={showAddFriendModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddFriendModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddFriendModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إضافة صديق</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              أدخل ID المستخدم لإرسال طلب صداقة
            </Text>

            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="أدخل ID المستخدم (مثال: user123)..."
                value={addFriendQuery}
                onChangeText={setAddFriendQuery}
                placeholderTextColor="#999"
                onSubmitEditing={searchForUsers}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchForUsers}
                disabled={isSearching || !addFriendQuery.trim()}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Search size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                💡 يمكنك العثور على ID المستخدم في ملفه الشخصي
              </Text>
            </View>

            {searchError ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color="#FF6B6B" />
                <Text style={styles.errorText}>{searchError}</Text>
              </View>
            ) : null}

            <ScrollView style={styles.searchResultsList} showsVerticalScrollIndicator={false}>
              {searchResults.map((user) => {
                const alreadyFriend = friends.some(f => f.friend_id === user.id)
                return (
                  <View key={user.id} style={styles.searchResultCard}>
                    <View style={styles.searchResultInfo}>
                      <View style={styles.searchResultAvatarContainer}>
                        <View style={styles.searchResultAvatar}>
                          <Text style={styles.searchResultAvatarText}>
                            {(user.full_name || user.username || 'U').charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.searchResultOnlineBadge} />
                      </View>
                      
                      <View style={styles.searchResultDetails}>
                        <Text style={styles.searchResultName}>{user.full_name || user.username}</Text>
                        <Text style={styles.searchResultUsername}>@{user.username}</Text>
                        <Text style={styles.searchResultId}>ID: {user.id}</Text>
                        
                        <View style={styles.searchResultStats}>
                          <View style={styles.searchResultStatItem}>
                            <Trophy size={12} color="#4ECDC4" />
                            <Text style={styles.searchResultStatText}>0 لعبة</Text>
                          </View>
                          <View style={styles.searchResultStatItem}>
                            <Text style={styles.searchResultWinRateText}>0% فوز</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.addFriendActionButton,
                        alreadyFriend && styles.addFriendActionButtonSent
                      ]}
                      onPress={() => handleSendFriendRequest(user.id, user.full_name || user.username)}
                      disabled={alreadyFriend}
                    >
                      {alreadyFriend ? (
                        <UserCheck size={18} color="#4CAF50" />
                      ) : (
                        <UserPlus size={18} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  addFriendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  friendNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriberBadge: {
    marginLeft: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 3,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    justifyContent: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  winRateText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  lastSeenText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  chatButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalSearchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchResultInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  searchResultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchResultOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchResultSubscriberBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  searchResultDetails: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  searchResultUsername: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  searchResultId: {
    fontSize: 11,
    color: '#999',
    marginTop: 1,
    textAlign: 'right',
  },
  searchResultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  searchResultStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchResultStatText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  searchResultWinRateText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  addFriendActionButton: {
    backgroundColor: '#4ECDC4',
    padding: 8,
    borderRadius: 8,
  },
  addFriendActionButtonSent: {
    backgroundColor: '#E8F5E8',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  requestInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestAvatarContainer: {
    marginRight: 16,
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  requestUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
    padding: 8,
    borderRadius: 8,
  },
  instructionContainer: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    fontWeight: '500',
  },
})