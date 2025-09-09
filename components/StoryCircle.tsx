import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import Colors from '@/constants/colors'
import { Crown } from 'lucide-react-native'

interface StoryCircleProps {
  username: string
  userId?: string
  avatar?: string
  hasStory: boolean
  isViewed: boolean
  isSubscriber?: boolean
  onPress: () => void
  onUserPress?: () => void
}

function StoryCircle({ 
  username, 
  userId,
  avatar, 
  hasStory, 
  isViewed,
  isSubscriber = false,
  onPress,
  onUserPress 
}: StoryCircleProps) {
  const handlePress = () => {
    if (hasStory) {
      onPress()
    } else if (userId) {
      router.push(`/user/${userId}` as const)
    } else if (onUserPress) {
      onUserPress()
    }
  }

  const ringColors = useMemo(() => {
    if (!hasStory) return [Colors.mauritanian.lightGray, Colors.mauritanian.lightGray] as [string, string]
    if (isViewed) return [Colors.mauritanian.mediumGray, Colors.mauritanian.mediumGray] as [string, string]
    const g = Colors.mauritanian.sunsetGradient as [string, string, ...string[]]
    return [g[0], g[g.length - 1]] as [string, string]
  }, [hasStory, isViewed])

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} testID="story-circle">
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={ringColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ringOuter}
        >
          <View style={styles.ringInner}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isSubscriber && (
              <View style={styles.subscriberOverlay} testID="story-subscriber-badge">
                <Crown size={12} color={Colors.mauritanian.gold} />
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
      <View style={styles.usernameContainer}>
        <Text style={styles.username} numberOfLines={1}>
          {username}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(StoryCircle, (prev, next) => {
  return (
    prev.username === next.username &&
    prev.userId === next.userId &&
    prev.avatar === next.avatar &&
    prev.hasStory === next.hasStory &&
    prev.isViewed === next.isViewed &&
    (prev.isSubscriber ?? false) === (next.isSubscriber ?? false)
  )
})

const AVATAR_SIZE = 60 as const
const RING_WIDTH = 3 as const
const WHITE_BORDER = 0 as const
const OUTER_SIZE: number = AVATAR_SIZE + 2 * (RING_WIDTH + WHITE_BORDER)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  avatarContainer: {
    marginBottom: 4,
  },
  ringOuter: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    padding: RING_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: OUTER_SIZE - RING_WIDTH * 2,
    height: OUTER_SIZE - RING_WIDTH * 2,
    borderRadius: (OUTER_SIZE - RING_WIDTH * 2) / 2,
    backgroundColor: 'transparent',
    padding: WHITE_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 2 : 3,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  defaultAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.mauritanian.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 80,
  },
  username: {
    fontSize: 12,
    color: Colors.mauritanian.darkGray,
    textAlign: 'center',
    fontWeight: '600',
    flexShrink: 1,
  },
  subscriberBadge: {
    marginLeft: Platform.OS === 'ios' ? 3 : 2,
    borderRadius: Platform.OS === 'ios' ? 8 : 6,
    padding: Platform.OS === 'ios' ? 2 : 1.5,
    shadowColor: Colors.mauritanian.gold,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 1 : 2,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.4 : 0.5,
    shadowRadius: Platform.OS === 'ios' ? 3 : 4,
    elevation: Platform.OS === 'android' ? 6 : 0,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.white,
  },
  subscriberOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? -2 : -1,
    right: Platform.OS === 'ios' ? -2 : -1,
    backgroundColor: Colors.mauritanian.white,
    borderRadius: 10,
    padding: Platform.OS === 'ios' ? 3 : 2.5,
    shadowColor: Colors.mauritanian.gold,
    shadowOffset: { width: 0, height: Platform.OS === 'ios' ? 1 : 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.4 : 0.5,
    shadowRadius: Platform.OS === 'ios' ? 3 : 4,
    elevation: Platform.OS === 'android' ? 6 : 0,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.white,
  },
})