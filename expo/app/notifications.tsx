import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Image, FlatList, Platform } from 'react-native'
import { Stack } from 'expo-router'
import Colors from '@/constants/colors'
import { mockNotifications, MockNotification } from '@/mocks/notifications'

function timeAgo(iso: string): string {
  const now = Date.now()
  const ts = new Date(iso).getTime()
  const diff = Math.max(0, Math.floor((now - ts) / 1000))
  const m = 60
  const h = 60 * m
  const d = 24 * h
  if (diff < m) return `${diff} ث`
  if (diff < h) return `${Math.floor(diff / m)} د`
  if (diff < d) return `${Math.floor(diff / h)} س`
  return `${Math.floor(diff / d)} ي`
}

export default function NotificationsScreen() {
  const items: MockNotification[] = useMemo(() => mockNotifications, [])

  const renderItem = ({ item }: { item: MockNotification }) => (
    <View style={[styles.card, !item.read && styles.unread]}>
      <Image
        source={{ uri: item.actor.avatar_url ?? 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.actor.full_name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {item.type === 'follow' && 'بدأ بمتابعتك'}
          {item.type === 'like' && `أعجب بمنشورك ${item.reaction ?? ''}`}
          {item.type === 'comment' && `علق على منشورك: ${item.comment_text ?? ''}`}
        </Text>
      </View>
      <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'الإشعارات' }} />
      <FlatList
        testID="notifications-list"
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mauritanian.white,
    borderRadius: Platform.OS === 'ios' ? 14 : 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.sand,
  },
  unread: {
    borderColor: Colors.mauritanian.gold,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.mauritanian.mauritanianBlue,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.mauritanian.darkGray,
  },
  time: {
    marginLeft: 8,
    color: Colors.mauritanian.mediumGray,
    fontSize: 12,
  },
})
