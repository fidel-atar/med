import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { X, Send, Search, Bell, Plus } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import StoryCircle from '@/components/StoryCircle'
import PostCard from '@/components/PostCard'
import MauritanianPattern from '@/components/MauritanianPattern'
import Colors from '@/constants/colors'
import { useAuth } from '@/contexts/AuthContext'
import { usePosts } from '@/hooks/usePosts'
import { useStories } from '@/hooks/useStories'
import { mockPosts } from '@/mocks/posts'


type StoryItem = {
  id: string
  username: string
  userId: string
  avatar?: string
  hasStory: boolean
  isViewed: boolean
  isSubscriber: boolean
}

export default function CommunityScreen() {
  const { isAuthenticated } = useAuth()
  const { createPost, likePost } = usePosts()
  const { stories } = useStories()
  
  const posts = mockPosts
  
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [commentModalVisible, setCommentModalVisible] = useState<boolean>(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<string>('')
  const [createPostVisible, setCreatePostVisible] = useState<boolean>(false)
  const [newPostContent, setNewPostContent] = useState<string>('')
  const [isSponsored, setIsSponsored] = useState<boolean>(false)
  const [sponsorName, setSponsorName] = useState<string>('')

  const scrollRef = useRef<FlatList<typeof posts[number]> | null>(null)

  const onRefresh = useCallback(async () => {
    console.log('[Home] onRefresh')
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }, [])

  const handleStoryPress = useCallback((storyId: string) => {
    console.log('[Home] handleStoryPress', storyId)
    router.push(`/story/${storyId}`)
  }, [])

  const handlePostLike = useCallback(async (postId: string) => {
    console.log('[Home] handlePostLike', postId)
    if (!isAuthenticated) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول أولاً لإعجاب بالمنشورات')
      return
    }
    try {
      await likePost(postId)
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الإعجاب بالمنشور')
    }
  }, [isAuthenticated, likePost])

  const handlePostComment = useCallback((postId: string) => {
    console.log('[Home] handlePostComment', postId)
    setSelectedPostId(postId)
    setCommentModalVisible(true)
  }, [])

  const handleCreatePost = useCallback(() => {
    console.log('[Home] handleCreatePost')
    if (!isAuthenticated) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول أولاً لإنشاء منشور')
      return
    }
    setCreatePostVisible(true)
  }, [isAuthenticated])
  
  const handleSubmitPost = useCallback(async () => {
    if (!newPostContent.trim()) return
    if (isSponsored && !sponsorName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الراعي للمنشور المدعوم')
      return
    }
    try {
      await createPost({ 
        content: newPostContent.trim(),
        isSponsored,
        sponsorName: isSponsored ? sponsorName.trim() : undefined,
      })
      setNewPostContent('')
      setIsSponsored(false)
      setSponsorName('')
      setCreatePostVisible(false)
      Alert.alert('تم', `تم إنشاء المنشور ${isSponsored ? 'المدعوم' : ''} بنجاح`)
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء المنشور')
    }
  }, [createPost, isSponsored, newPostContent, sponsorName])

  const handleCommentSubmit = useCallback(() => {
    if (commentText.trim() && selectedPostId) {
      setCommentText('')
      setCommentModalVisible(false)
      setSelectedPostId(null)
    }
  }, [commentText, selectedPostId])

  const handleCommentClose = useCallback(() => {
    setCommentModalVisible(false)
    setCommentText('')
    setSelectedPostId(null)
  }, [])

  const handlePostShare = useCallback((postId: string) => {
    console.log('[Home] Post shared:', postId)
  }, [])

  const renderStoryItem = useCallback(({ item }: { item: StoryItem }) => (
    <StoryCircle
      username={item.username}
      userId={item.userId}
      avatar={item.avatar}
      hasStory={item.hasStory}
      isViewed={item.isViewed}
      isSubscriber={item.isSubscriber}
      onPress={() => handleStoryPress(item.id)}
    />
  ), [handleStoryPress])

  const storyData = useMemo<StoryItem[]>(() => (stories.map(story => ({
    id: String(story.id),
    username: story.profiles?.username || 'مستخدم',
    userId: String(story.user_id ?? ''),
    avatar: story.profiles?.avatar_url,
    hasStory: true,
    isViewed: false,
    isSubscriber: false,
  }))), [stories])

  const renderPost = useCallback(({ item }: { item: typeof posts[number] }) => (
    <PostCard
      key={item.id}
      id={item.id}
      username={item.profiles?.full_name || item.profiles?.username || 'مستخدم'}
      userId={item.user_id}
      avatar={item.profiles?.avatar_url}
      content={item.content}
      imageUrl={item.image_url}
      videoUrl={item.video}
      likesCount={item.likes_count}
      commentsCount={item.comments_count}
      viewsCount={item.views_count}
      isPromoted={item.is_sponsored || false}
      isSubscriber={item.profiles?.is_subscriber || false}
      sponsorName={item.sponsor_name}
      createdAt={item.created_at}
      onLike={() => handlePostLike(item.id)}
      onComment={() => handlePostComment(item.id)}
      onShare={() => handlePostShare(item.id)}
    />
  ), [handlePostLike, handlePostComment, handlePostShare])

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.mauritanian.white, Colors.mauritanian.white]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MauritanianPattern size={24} />
            <Text style={styles.title}>جماعتك</Text>
            <MauritanianPattern size={24} />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              testID="search-button"
              style={styles.headerButton}
              onPress={() => {
                console.log('[Home] Search pressed')
                router.push('/search' as const)
              }}
              accessibilityLabel="فتح البحث"
            >
              <Search size={22} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="notifications-button"
              style={styles.headerButton}
              onPress={() => {
                console.log('[Home] Notifications pressed')
                router.push('/notifications' as const)
              }}
              accessibilityLabel="فتح الإشعارات"
            >
              <Bell size={22} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>
            <TouchableOpacity testID="create-post-fab" style={styles.headerPostButton} onPress={handleCreatePost}>
              <Plus testID="create-post-icon" size={22} color={Colors.mauritanian.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        ref={scrollRef}
        testID="feed-list"
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={stories.length > 0 ? (
          <View style={styles.storiesSection}>
            <FlatList
              data={storyData}
              renderItem={renderStoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesList}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={5}
              removeClippedSubviews={Platform.OS !== 'web'}
            />
          </View>
        ) : null}
        contentContainerStyle={styles.postsSection}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== 'web'}
        updateCellsBatchingPeriod={50}
        ListFooterComponent={<View style={{ height: 24 }} />}
        getItemLayout={(_, index) => ({ length: 360, offset: 360 * index, index })}
      />

      <Modal
        visible={commentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCommentClose} style={styles.closeButton}>
                <X size={24} color={Colors.mauritanian.mauritanianBlue} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>التعليقات</Text>
              <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendButton}>
                <Send size={20} color={Colors.mauritanian.mauritanianBlue} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={[]}
              renderItem={() => null}
              keyExtractor={(_, idx) => String(idx)}
              ListEmptyComponent={<Text style={styles.commentsPlaceholder}>لا توجد تعليقات بعد</Text>}
              contentContainerStyle={styles.commentsContainer}
            />
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="اكتب تعليقك هنا..."
                placeholderTextColor={Colors.mauritanian.mediumGray}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                textAlign="right"
                maxLength={500}
              />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
      
      <Modal
        visible={createPostVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setCreatePostVisible(false)} style={styles.closeButton}>
                <X size={24} color={Colors.mauritanian.mauritanianBlue} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>منشور جديد</Text>
              <TouchableOpacity onPress={handleSubmitPost} style={styles.sendButton}>
                <Send size={20} color={Colors.mauritanian.mauritanianBlue} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.createPostContainer}>
              <TextInput
                style={styles.createPostInput}
                placeholder="ماذا تريد أن تشارك؟"
                placeholderTextColor={Colors.mauritanian.mediumGray}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                textAlign="right"
                maxLength={1000}
                autoFocus
              />
              
              <View style={styles.createPostOptions}>
                <Text style={styles.optionsTitle}>نوع المنشور:</Text>
                <View style={styles.postTypeSelector}>
                  <TouchableOpacity 
                    style={[styles.postTypeButton, !isSponsored && styles.postTypeButtonActive]}
                    onPress={() => setIsSponsored(false)}
                  >
                    <Text style={[styles.postTypeText, !isSponsored && styles.postTypeTextActive]}>
                      عادي
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.postTypeButton, isSponsored && styles.postTypeButtonActive]}
                    onPress={() => setIsSponsored(true)}
                  >
                    <Text style={[styles.postTypeText, isSponsored && styles.postTypeTextActive]}>
                      مدعوم
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {isSponsored && (
                  <TextInput
                    style={styles.sponsorInputLarge}
                    placeholder="اسم الراعي أو الشركة المدعومة"
                    placeholderTextColor={Colors.mauritanian.mediumGray}
                    value={sponsorName}
                    onChangeText={setSponsorName}
                    textAlign="right"
                  />
                )}
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mauritanian.white,
  },
  headerGradient: {
    paddingBottom: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.mauritanian.mauritanianBlue,
    textShadowColor: Colors.mauritanian.gold,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: Platform.OS === 'ios' ? 10 : 12,
    borderRadius: Platform.OS === 'ios' ? 25 : 20,
    backgroundColor: Colors.mauritanian.white,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 2 : 3,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.2,
    shadowRadius: Platform.OS === 'ios' ? 4 : 6,
    elevation: Platform.OS === 'android' ? 6 : 0,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.sand,
  },
  headerPostButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 2 : 3 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.2,
    shadowRadius: Platform.OS === 'ios' ? 4 : 6,
    elevation: Platform.OS === 'android' ? 6 : 0,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.sand,
  },
  headerPostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.mauritanian.lightSand,
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  headerPostText: {
    fontSize: 14,
    color: Colors.mauritanian.mediumGray,
    fontWeight: '600',
  },
  plusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.mauritanian.mauritanianBlue,
  },
  headerPostIcon: {
    width: 18,
    height: 18,
  },
  content: {
    flex: 1,
  },
  storiesSection: {
    backgroundColor: 'transparent',
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    marginTop: 8,
    alignSelf: 'stretch',
    width: '100%',
  },
  storiesList: {
    paddingHorizontal: 8,
  },
  postsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.mauritanian.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mauritanian.sand,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.mauritanian.mauritanianBlue,
  },
  commentsContainer: {
    padding: 20,
    flexGrow: 1,
  },
  commentsPlaceholder: {
    fontSize: 16,
    color: Colors.mauritanian.mediumGray,
    textAlign: 'center',
    marginTop: 50,
  },
  commentInputContainer: {
    backgroundColor: Colors.mauritanian.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.mauritanian.sand,
  },
  commentInput: {
    backgroundColor: Colors.mauritanian.lightSand,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.mauritanian.mauritanianBlue,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.mauritanian.mediumGray,
  },
  createPostContainer: {
    flex: 1,
    padding: 20,
  },
  createPostInput: {
    backgroundColor: Colors.mauritanian.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 200,
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  createPostOptions: {
    marginTop: 20,
    gap: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.mauritanian.mauritanianBlue,
    textAlign: 'right',
  },
  postTypeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.mauritanian.lightSand,
    borderRadius: Platform.OS === 'ios' ? 20 : 16,
    padding: Platform.OS === 'ios' ? 2 : 1.5,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.sand,
  },
  postTypeButton: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 8 : 10,
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: Platform.OS === 'ios' ? 18 : 14,
    alignItems: 'center',
  },
  postTypeButtonActive: {
    backgroundColor: Colors.mauritanian.mauritanianBlue,
  },
  postTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mauritanian.mediumGray,
  },
  postTypeTextActive: {
    color: Colors.mauritanian.white,
  },
  sponsorInputLarge: {
    backgroundColor: Colors.mauritanian.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
})
