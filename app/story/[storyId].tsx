import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  PanResponder,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { X, Heart, MessageCircle, Send } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '@/constants/colors'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface Story {
  id: string
  userId: string
  username: string
  avatar?: string
  content: string
  imageUrl?: string
  videoUrl?: string
  createdAt: string
  viewsCount: number
  isViewed: boolean
}

const MOCK_STORIES: Story[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'أحمد_المختار',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'مساء الخير من نواكشوط! 🌅',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    viewsCount: 45,
    isViewed: false,
  },
  {
    id: '2',
    userId: 'user2',
    username: 'فاطمة_الزهراء',
    content: 'تراثنا الموريتاني جميل! 🇲🇷',
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=600&fit=crop',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    viewsCount: 32,
    isViewed: true,
  },
  {
    id: '3',
    userId: 'user3',
    username: 'محمد_الأمين',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'لعبة البلوت الليلة! 🃏',
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=600&fit=crop',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    viewsCount: 28,
    isViewed: false,
  },
]

export default function StoryViewerScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>()
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [stories] = useState<Story[]>(MOCK_STORIES)
  const [isLiked, setIsLiked] = useState(false)
  const [isPaused, setPaused] = useState(false)
  
  const progressAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentStory = stories[currentStoryIndex]
  const STORY_DURATION = 5000 // 5 seconds per story

  useEffect(() => {
    const initialIndex = stories.findIndex(story => story.id === storyId)
    if (initialIndex !== -1) {
      setCurrentStoryIndex(initialIndex)
    }
  }, [storyId, stories])

  useEffect(() => {
    const startProgressInternal = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      progressAnim.setValue(0)
      
      if (!isPaused) {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: STORY_DURATION,
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) {
            nextStory()
          }
        })
      }
    }
    
    startProgressInternal()
    return () => {
      const currentInterval = intervalRef.current
      if (currentInterval) {
        clearInterval(currentInterval)
      }
    }
  }, [currentStoryIndex, isPaused, progressAnim])



  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
    } else {
      router.back()
    }
  }

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    // Animate heart
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleReply = () => {
    Alert.alert('رد على القصة', 'سيتم إضافة هذه الميزة قريباً')
  }

  const handleShare = () => {
    Alert.alert('مشاركة القصة', 'سيتم إضافة هذه الميزة قريباً')
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setPaused(true)
    },
    onPanResponderRelease: (evt, gestureState) => {
      setPaused(false)
      const { dx, dy } = gestureState
      
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
        // Vertical swipe - close story
        router.back()
      } else if (dx > 50) {
        // Swipe right - previous story
        previousStory()
      } else if (dx < -50) {
        // Swipe left - next story
        nextStory()
      }
    },
  })

  const handleTapNavigation = (event: any) => {
    const { locationX } = event.nativeEvent
    const screenMiddle = SCREEN_WIDTH / 2
    
    if (locationX < screenMiddle) {
      previousStory()
    } else {
      nextStory()
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const storyDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'الآن'
    if (diffInHours === 1) return 'منذ ساعة'
    if (diffInHours < 24) return `منذ ${diffInHours} ساعات`
    return `منذ ${Math.floor(diffInHours / 24)} أيام`
  }

  if (!currentStory) {
    return null
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Background Image */}
      {currentStory.imageUrl && (
        <Image 
          source={{ uri: currentStory.imageUrl }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      
      {/* Dark Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
        style={styles.overlay}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View key={index} style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: index === currentStoryIndex 
                      ? progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : index < currentStoryIndex ? '100%' : '0%'
                  }
                ]}
              />
            </View>
          ))}
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {currentStory.avatar ? (
                <Image source={{ uri: currentStory.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {currentStory.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>{currentStory.username}</Text>
              <Text style={styles.timeAgo}>{formatTimeAgo(currentStory.createdAt)}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={Colors.mauritanian.white} />
          </TouchableOpacity>
        </View>
        
        {/* Tap Areas for Navigation */}
        <View style={styles.tapAreas}>
          <TouchableOpacity 
            style={styles.tapArea} 
            onPress={handleTapNavigation}
            activeOpacity={1}
          />
        </View>
        
        {/* Content */}
        <View style={styles.contentContainer}>
          {currentStory.content && (
            <View style={styles.textContainer}>
              <Text style={styles.storyText}>{currentStory.content}</Text>
            </View>
          )}
        </View>
        
        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <View style={styles.actionButtons}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity 
                style={[styles.actionButton, isLiked && styles.likedButton]} 
                onPress={handleLike}
              >
                <Heart 
                  size={24} 
                  color={isLiked ? Colors.mauritanian.traditionalRed : Colors.mauritanian.white}
                  fill={isLiked ? Colors.mauritanian.traditionalRed : 'transparent'}
                />
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
              <MessageCircle size={24} color={Colors.mauritanian.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Send size={24} color={Colors.mauritanian.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.viewsContainer}>
            <Text style={styles.viewsText}>{currentStory.viewsCount} مشاهدة</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mauritanian.black,
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 4,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.mauritanian.white,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.mauritanian.white,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.mauritanian.white,
  },
  avatarText: {
    color: Colors.mauritanian.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: Colors.mauritanian.white,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tapAreas: {
    flex: 1,
    flexDirection: 'row',
  },
  tapArea: {
    flex: 1,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  storyText: {
    color: Colors.mauritanian.white,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  likedButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  viewsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewsText: {
    color: Colors.mauritanian.white,
    fontSize: 12,
    fontWeight: '500',
  },
})