import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, Plus, Camera, Crown } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import MauritanianPattern from '@/components/MauritanianPattern'
import Colors from '@/constants/colors'

interface Chat {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  isSubscriber: boolean
}

const MOCK_CHATS: Chat[] = [
  {
    id: 'user1',
    name: 'أحمد محمد الشيخ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'هل تريد لعب البلوت الليلة؟',
    lastMessageTime: '10:30',
    unreadCount: 2,
    isOnline: true,
    isSubscriber: true,
  },
  {
    id: 'user2',
    name: 'فاطمة ولد أحمد',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'شكراً لك على المساعدة',
    lastMessageTime: '09:15',
    unreadCount: 0,
    isOnline: false,
    isSubscriber: true,
  },
  {
    id: 'user3',
    name: 'عمر ولد سيدي',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'تم إرسال صورة',
    lastMessageTime: 'أمس',
    unreadCount: 1,
    isOnline: true,
    isSubscriber: false,
  },
  {
    id: 'user4',
    name: 'مريم منت محمد',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'رسالة صوتية',
    lastMessageTime: 'أمس',
    unreadCount: 0,
    isOnline: false,
    isSubscriber: true,
  },
  {
    id: 'user5',
    name: 'يوسف ولد علي',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'متى سنلتقي؟',
    lastMessageTime: 'الأحد',
    unreadCount: 3,
    isOnline: false,
    isSubscriber: false,
  },
  {
    id: 'user6',
    name: 'عائشة منت سيدي',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'كيف كانت ليلة الألعاب؟',
    lastMessageTime: 'الأحد',
    unreadCount: 0,
    isOnline: true,
    isSubscriber: true,
  },
  {
    id: 'user7',
    name: 'محمد ولد الشيخ',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'أتدرب على الكرول',
    lastMessageTime: 'الاثنين',
    unreadCount: 1,
    isOnline: false,
    isSubscriber: false,
  },
  {
    id: 'user8',
    name: 'خديجة منت أحمد',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'رحلة الصحراء كانت رائعة!',
    lastMessageTime: 'الاثنين',
    unreadCount: 0,
    isOnline: true,
    isSubscriber: true,
  },
]

export default function ChatsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filteredChats, setFilteredChats] = useState<Chat[]>(MOCK_CHATS)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredChats(MOCK_CHATS)
    } else {
      const filtered = MOCK_CHATS.filter(chat =>
        chat.name.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredChats(filtered)
    }
  }

  const handleChatPress = (chatId: string) => {
    console.log('Chat pressed:', chatId)
    router.push(`/chat/${chatId}`)
  }

  const renderChatItem = (chat: Chat) => {
    const avatarSource = chat.avatar
      ? { uri: chat.avatar }
      : require('@/assets/images/adaptive-icon.png')

    return (
      <TouchableOpacity
        key={chat.id}
        style={styles.chatItem}
        onPress={() => handleChatPress(chat.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image source={avatarSource} style={styles.avatar} />
          {chat.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.chatName} numberOfLines={1}>
                {chat.name}
              </Text>
              {chat.isSubscriber && (
                <LinearGradient
                  colors={[Colors.mauritanian.gold, Colors.mauritanian.amber]}
                  style={styles.subscriberBadge}
                >
                  <Crown size={10} color={Colors.mauritanian.white} fill={Colors.mauritanian.white} />
                </LinearGradient>
              )}
            </View>
            <Text style={styles.chatTime}>{chat.lastMessageTime}</Text>
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chat.lastMessage}
            </Text>
            {chat.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }


  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.mauritanian.white, Colors.mauritanian.lightSand]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MauritanianPattern size={24} />
            <Text style={styles.title}>رسائلك</Text>
            <MauritanianPattern size={24} />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} testID="chats-header-camera">
              <Camera size={24} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} testID="chats-header-new">
              <Plus size={24} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.mauritanian.mediumGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث في المحادثات..."
              placeholderTextColor={Colors.mauritanian.mediumGray}
              value={searchQuery}
              onChangeText={handleSearch}
              testID="chats-search-input"
            />
          </View>
        </View>

      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.chatsSection}>
          {filteredChats.map(renderChatItem)}
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
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    padding: 10,
    borderRadius: 25,
    backgroundColor: Colors.mauritanian.white,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mauritanian.white,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.mauritanian.darkGray,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  chatsSection: {
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.mauritanian.white,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.mauritanian.sand,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.mauritanian.islamicGreen,
    borderWidth: 2,
    borderColor: Colors.mauritanian.white,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscriberBadge: {
    marginLeft: 6,
    borderRadius: 10,
    padding: 3,
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
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.mauritanian.darkGray,
    textAlign: 'right',
  },
  chatTime: {
    fontSize: 13,
    color: Colors.mauritanian.mediumGray,
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    color: Colors.mauritanian.mediumGray,
    flex: 1,
    textAlign: 'right',
  },
  unreadBadge: {
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.mauritanian.white,
  },
})