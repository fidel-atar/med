import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Modal,
} from 'react-native'
import { Heart, MessageCircle, Share, MoreHorizontal, Eye, X, Play, Crown } from 'lucide-react-native'
import { router } from 'expo-router'
import Colors from '@/constants/colors'
import { VideoView, useVideoPlayer } from 'expo-video'

interface PostCardProps {
  id: string
  username: string
  userId?: string
  avatar?: string
  content: string
  imageUrl?: string
  videoUrl?: string
  likesCount: number
  commentsCount: number
  viewsCount: number
  isPromoted: boolean
  isSubscriber: boolean
  createdAt: string
  sponsorName?: string
  onLike: () => void
  onComment: () => void
  onShare: () => void
}

type VideoPreviewProps = { uri: string }
const VideoPreview = React.memo(function VideoPreview({ uri }: VideoPreviewProps) {
  const player = useVideoPlayer(uri, (p) => {
    try {
      p.muted = true
      p.loop = false
      p.pause()
    } catch (e) {
      console.log('VideoPreview init error', e)
    }
  })
  return (
    <VideoView
      testID="video-preview"
      player={player}
      style={styles.postImage}
      contentFit="cover"
    />
  )
})

const VideoFullscreen = React.memo(function VideoFullscreen({ uri }: VideoPreviewProps) {
  const player = useVideoPlayer(uri, (p) => {
    try {
      p.muted = false
      p.loop = true
      p.play()
    } catch (e) {
      console.log('VideoFullscreen init error', e)
    }
  })
  return (
    <VideoView
      testID="video-fullscreen"
      player={player}
      style={styles.fullscreenImage}
      contentFit="contain"
      nativeControls
    />
  )
})

function PostCard({
  id,
  username,
  userId,
  avatar,
  content,
  imageUrl,
  videoUrl,
  likesCount,
  commentsCount,
  viewsCount,
  isPromoted,
  isSubscriber,
  createdAt,
  sponsorName,
  onLike,
  onComment,
  onShare,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [isMediaOpen, setIsMediaOpen] = useState<boolean>(false)
  const isVideo = Boolean(videoUrl)

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev)
    onLike()
  }, [onLike])

  const formattedTime = useMemo(() => {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffInHours < 1) return 'الآن'
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInMonths = Math.max(1, Math.floor(diffInDays / 30))
    if (diffInMonths < 12) return `${diffInMonths} شهر`
    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears} سنة`
  }, [createdAt])

  const handleUserPress = useCallback(() => {
    if (userId) {
      router.push(`/user/${userId}` as const)
    }
  }, [userId])

  return (
    <View style={styles.container} testID={`post-${id}`}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{username}</Text>
              {isSubscriber && (
                <View style={styles.subscriberBadge} testID="subscriber-badge">
                  <Crown size={14} color={Colors.mauritanian.gold} />
                </View>
              )}
            </View>
            <View style={styles.timestampContainer}>
              <Text style={styles.timestamp}>{formattedTime}</Text>
              {isPromoted && (
                <Text style={styles.sponsoredText}>• مُموَّل</Text>
              )}
            </View>
            {isPromoted && sponsorName && (
              <Text style={styles.sponsorName}>برعاية: {sponsorName}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color={Colors.mauritanian.mediumGray} />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{content}</Text>

      {(imageUrl || videoUrl) && (
        <TouchableOpacity
          testID={isVideo ? 'post-video-open' : 'post-image-open'}
          activeOpacity={0.9}
          onPress={() => setIsMediaOpen(true)}
        >
          {isVideo && videoUrl ? (
            <View style={styles.videoPreviewWrapper}>
              <VideoPreview uri={videoUrl} />
              <View style={styles.playOverlay}>
                <Play size={36} color={Colors.mauritanian.white} />
              </View>
            </View>
          ) : imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.postImage} />
          ) : null}
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike} testID="like-button">
          <Heart 
            size={24} 
            color={isLiked ? Colors.mauritanian.traditionalRed : Colors.mauritanian.mediumGray} 
            fill={isLiked ? Colors.mauritanian.traditionalRed : 'none'}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment} testID="comment-button">
          <MessageCircle size={24} color={Colors.mauritanian.mauritanianBlue} />
          <Text style={styles.actionText}>{commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare} testID="share-button">
          <Share size={24} color={Colors.mauritanian.islamicGreen} />
        </TouchableOpacity>

        <View style={styles.viewsContainer}>
          <Eye size={20} color={Colors.mauritanian.mediumGray} />
          <Text style={styles.viewsText}>{viewsCount.toLocaleString()}</Text>
        </View>
      </View>
      {(imageUrl || videoUrl) && (
        <Modal
          visible={isMediaOpen}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setIsMediaOpen(false)}
        >
          <View style={styles.fullscreenContainer}>
            <TouchableOpacity
              testID="close-media-viewer"
              style={styles.closeOverlay}
              onPress={() => setIsMediaOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close media viewer"
            >
              <X size={24} color={Colors.mauritanian.white} />
            </TouchableOpacity>
            {isVideo && videoUrl ? (
              <VideoFullscreen uri={videoUrl} />
            ) : imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.fullscreenImage}
              />
            ) : null}
          </View>
        </Modal>
      )}
    </View>
  )
}

export default React.memo(PostCard, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.username === next.username &&
    prev.userId === next.userId &&
    prev.avatar === next.avatar &&
    prev.content === next.content &&
    prev.imageUrl === next.imageUrl &&
    prev.videoUrl === next.videoUrl &&
    prev.likesCount === next.likesCount &&
    prev.commentsCount === next.commentsCount &&
    prev.viewsCount === next.viewsCount &&
    prev.isPromoted === next.isPromoted &&
    prev.isSubscriber === next.isSubscriber &&
    prev.createdAt === next.createdAt &&
    prev.sponsorName === next.sponsorName &&
    prev.onLike === next.onLike &&
    prev.onComment === next.onComment &&
    prev.onShare === next.onShare
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.mauritanian.white,
    marginBottom: 12,
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 4 : 6,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.2,
    shadowRadius: Platform.OS === 'ios' ? 8 : 10,
    elevation: Platform.OS === 'android' ? 8 : 0,
    borderWidth: Platform.OS === 'android' ? 0.5 : 1,
    borderColor: Colors.mauritanian.sand,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  avatarText: {
    color: Colors.mauritanian.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriberBadge: {
    marginLeft: 6,
    borderRadius: Platform.OS === 'ios' ? 10 : 8,
    padding: Platform.OS === 'ios' ? 3 : 2.5,
    backgroundColor: Colors.mauritanian.white,
    shadowColor: Colors.mauritanian.gold,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 2 : 3,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.4 : 0.5,
    shadowRadius: Platform.OS === 'ios' ? 4 : 5,
    elevation: Platform.OS === 'android' ? 8 : 0,
    borderWidth: Platform.OS === 'ios' ? 1.5 : 1,
    borderColor: Colors.mauritanian.white,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  username: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    fontWeight: Platform.OS === 'ios' ? 'bold' : '700',
    color: Colors.mauritanian.darkGray,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.mauritanian.mediumGray,
  },
  sponsoredText: {
    fontSize: 12,
    color: Colors.mauritanian.gold,
    fontWeight: '600',
    marginLeft: 4,
  },
  sponsorName: {
    fontSize: 11,
    color: Colors.mauritanian.mediumGray,
    fontStyle: 'italic',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: Colors.mauritanian.darkGray,
    lineHeight: Platform.OS === 'ios' ? 26 : 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
    textAlign: 'right',
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  postImage: {
    width: '95%',
    height: Platform.OS === 'ios' ? 300 : 280,
    resizeMode: 'cover',
    borderRadius: Platform.OS === 'ios' ? 8 : 6,
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  videoPreviewWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 24,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 16,
    borderTopWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderTopColor: Colors.mauritanian.sand,
    backgroundColor: Colors.mauritanian.lightSand,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 16 : 12,
    borderBottomRightRadius: Platform.OS === 'ios' ? 16 : 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.mauritanian.mediumGray,
    fontWeight: '600',
  },
  likedText: {
    color: Colors.mauritanian.traditionalRed,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  viewsText: {
    marginLeft: 6,
    fontSize: 13,
    color: Colors.mauritanian.mediumGray,
    fontWeight: '500',
  },
  sponsoredContainer: {
    borderColor: Colors.mauritanian.gold,
    borderWidth: Platform.OS === 'ios' ? 2 : 1.5,
    shadowColor: Colors.mauritanian.gold,
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.25,
  },
})
