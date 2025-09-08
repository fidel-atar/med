import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Platform, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Users, UserPlus, ArrowRight, ArrowLeft, Search } from 'lucide-react-native'
import Colors from '@/constants/colors'
import { getGameById } from '@/constants/games'
import { useFriends } from '@/hooks/useFriends'

interface FriendItem {
  id: string
  friend: {
    id: string
    username: string
    full_name: string
    avatar_url?: string | null
  }
}

export default function InviteFriendsScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  const game = useMemo(() => getGameById(String(gameId)), [gameId])
  const { friends, isLoading, error } = useFriends()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState<string>('')
  const maxInvites = useMemo(() => (game?.id === 'zamat' || game?.id === 'xo' ? 1 : 3), [game?.id])

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const exists = prev.includes(id)
      if (exists) return prev.filter(x => x !== id)
      if (prev.length >= maxInvites) {
        Alert.alert('الحد الأقصى', `يمكنك دعوة حتى ${maxInvites} ${maxInvites === 1 ? 'صديق' : 'أصدقاء'} فقط`)
        return prev
      }
      return [...prev, id]
    })
  }, [maxInvites])

  const onStart = useCallback(() => {
    console.log('[Invite] starting game', { gameId, selected })
    if (maxInvites === 1 && selected.length !== 1) {
      Alert.alert('دع صديقاً', 'يرجى اختيار صديق واحد للعب ضدك')
      return
    }
    let opponentId: string | undefined
    let opponentName: string | undefined
    if (maxInvites === 1 && selected.length === 1) {
      opponentId = selected[0]
      const f = (friends as FriendItem[]).find((it) => (it.friend?.id ?? it.id) === opponentId)
      const name = f?.friend?.full_name ?? f?.friend?.username ?? 'صديقك'
      opponentName = String(name)
    }
    router.replace({ pathname: '/games/[gameId]', params: { gameId: String(gameId), opponentId: opponentId ?? '', opponentName: opponentName ?? '' } })
  }, [gameId, selected, maxInvites, friends])

  const renderFriend = useCallback(({ item }: { item: FriendItem }) => {
    const friendId = item.friend?.id ?? item.id
    const isSelected = selected.includes(friendId)
    const avatar = item.friend?.avatar_url ?? undefined

    return (
      <TouchableOpacity
        testID={`friend-${friendId}`}
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleSelect(friendId)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: avatar ?? 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&auto=format&fit=crop' }}
          style={styles.avatar}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.friend?.full_name ?? 'مستخدم'}</Text>
          <Text style={styles.friendHandle}>@{item.friend?.username ?? 'username'}</Text>
        </View>
        <View style={[styles.invitePill, isSelected ? styles.invitePillSelected : styles.invitePillIdle]}>
          <UserPlus size={16} color={isSelected ? '#0f5132' : '#0d6efd'} />
          <Text style={[styles.invitePillText, isSelected ? styles.invitePillTextSelected : styles.invitePillTextIdle]}>
            {isSelected ? 'مدعو' : 'دعوة'}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }, [selected, toggleSelect])

  if (!game) {
    return (
      <SafeAreaView style={styles.fallback}> 
        <Text style={styles.fallbackTitle}>اللعبة غير موجودة</Text>
        <Text style={styles.fallbackSub}>Game not found: {String(gameId)}</Text>
      </SafeAreaView>
    )
  }

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return (friends as FriendItem[])
    return (friends as FriendItem[]).filter((f) => {
      const name = f.friend?.full_name?.toLowerCase() ?? ''
      const uname = f.friend?.username?.toLowerCase() ?? ''
      return name.includes(q) || uname.includes(q)
    })
  }, [friends, query])

  const onBackPress = useCallback(() => {
    try {
      if (typeof (router as unknown as { canGoBack?: () => boolean }).canGoBack === 'function' && (router as unknown as { canGoBack?: () => boolean }).canGoBack!()) {
        router.back()
      } else {
        router.replace('/(tabs)/games')
      }
    } catch {
      router.replace('/(tabs)/games')
    }
  }, [])

  return (
    <View style={styles.root} testID="invite-screen">
      <View style={styles.headerBg}>
        <SafeAreaView style={styles.headerSafe}>
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-button"
              accessibilityRole="button"
              onPress={onBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={Colors.mauritanian.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>ادعُ أصدقاءك</Text>
              <Text style={styles.headerSub}>يمكنك دعوة حتى {maxInvites} {maxInvites === 1 ? 'صديق' : 'أصدقاء'} للعب {game.nameAr}</Text>
            </View>
            <Text style={styles.gameIcon}>{game.icon}</Text>
          </View>

          <View style={styles.searchBar}>
            <Search size={18} color={Colors.mauritanian.white} />
            <TextInput
              testID="search-input"
              placeholder="ابحث عن صديق بالاسم أو اسم المستخدم"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>

          <View style={styles.counterCard}>
            <Users size={18} color={Colors.mauritanian.white} />
            <Text style={styles.counterText}>{selected.length} / {maxInvites}</Text>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.content}>
        {error && (
          <Text style={styles.friendHandle}>تعذر تحميل الأصدقاء. سيتم عرض بيانات تجريبية.</Text>
        )}
        {isLoading ? (
          <Text style={styles.friendHandle}>جار التحميل...</Text>
        ) : (
          <FlatList
            testID="friends-list"
            data={filteredFriends}
            keyExtractor={(item) => (item.friend?.id ?? item.id)}
            renderItem={renderFriend}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      <TouchableOpacity
        testID="start-game"
        style={[styles.startButton, (maxInvites === 1 ? selected.length !== 1 : selected.length === 0) && styles.startButtonDisabled]}
        onPress={onStart}
        activeOpacity={0.9}
      >
        <Text style={styles.startText}>
          {maxInvites === 1 ? (selected.length === 1 ? 'ابدأ اللعبة ضد صديقك' : 'اختر صديقاً واحداً للبدء') : (selected.length > 0 ? 'ابدأ اللعبة مع الأصدقاء' : 'ابدأ اللعبة وحدك')}
        </Text>
        <ArrowRight size={18} color={Colors.mauritanian.white} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  headerBg: {
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    paddingBottom: 16,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 24 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 24 : 20,
  },
  headerSafe: {
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.mauritanian.white,
    textAlign: 'right',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    textAlign: 'right',
  },
  gameIcon: {
    fontSize: 36,
  },
  counterCard: {
    marginTop: 14,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 as unknown as number,
  },
  counterText: {
    color: Colors.mauritanian.white,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  searchBar: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 as unknown as number,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.mauritanian.white,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 96,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  friendItemSelected: {
    borderWidth: 2,
    borderColor: Colors.mauritanian.islamicGreen,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
  },
  friendInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    textAlign: 'right',
  },
  friendHandle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  invitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  invitePillIdle: {
    borderColor: '#cfe2ff',
    backgroundColor: '#edf5ff',
  },
  invitePillSelected: {
    borderColor: '#badbcc',
    backgroundColor: '#d1e7dd',
  },
  invitePillText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '800',
  },
  invitePillTextIdle: {
    color: '#0d6efd',
  },
  invitePillTextSelected: {
    color: '#0f5132',
  },
  startButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: Colors.mauritanian.darkGold,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8 as unknown as number,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  startButtonDisabled: {
    opacity: 0.95,
  },
  startText: {
    color: Colors.mauritanian.white,
    fontWeight: '900',
    fontSize: 16,
    marginRight: 8,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
  },
  fallbackSub: {
    fontSize: 14,
    color: '#666',
  },
})