import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Camera, 
  Mic, 
  Image as ImageIcon,
  Smile,
  Crown
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import Colors from '@/constants/colors'

interface Message {
  id: string
  text?: string
  imageUrl?: string
  audioUrl?: string
  type: 'text' | 'image' | 'audio'
  isOwn: boolean
  timestamp: string
  reactions?: { emoji: string; count: number }[]
  isRead: boolean
}

interface ChatUser {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  isSubscriber: boolean
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'السلام عليكم ورحمة الله وبركاته',
    type: 'text',
    isOwn: false,
    timestamp: '10:00',
    isRead: true,
  },
  {
    id: '2',
    text: 'وعليكم السلام ورحمة الله وبركاته، كيف حالك؟',
    type: 'text',
    isOwn: true,
    timestamp: '10:02',
    isRead: true,
  },
  {
    id: '3',
    text: 'الحمد لله بخير، هل تريد لعب البلوت الليلة؟',
    type: 'text',
    isOwn: false,
    timestamp: '10:05',
    reactions: [{ emoji: '👍', count: 1 }],
    isRead: true,
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400',
    type: 'image',
    isOwn: false,
    timestamp: '10:10',
    isRead: true,
  },
  {
    id: '5',
    text: 'صورة جميلة! نعم أريد اللعب',
    type: 'text',
    isOwn: true,
    timestamp: '10:12',
    reactions: [{ emoji: '❤️', count: 1 }, { emoji: '😂', count: 1 }],
    isRead: false,
  },
]

const MOCK_USERS: { [key: string]: ChatUser } = {
  'user1': {
    id: 'user1',
    name: 'أحمد محمد الشيخ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    isSubscriber: true,
  },
  'user2': {
    id: 'user2',
    name: 'فاطمة ولد أحمد',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    isSubscriber: true,
  },
  'user3': {
    id: 'user3',
    name: 'عمر ولد سيدي',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    isSubscriber: false,
  },
  'user4': {
    id: 'user4',
    name: 'مريم منت محمد',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    isSubscriber: true,
  },
  'user5': {
    id: 'user5',
    name: 'يوسف ولد علي',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    isSubscriber: false,
  },
  'user6': {
    id: 'user6',
    name: 'عائشة منت سيدي',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    isSubscriber: true,
  },
  'user7': {
    id: 'user7',
    name: 'محمد ولد الشيخ',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    isSubscriber: false,
  },
  'user8': {
    id: 'user8',
    name: 'خديجة منت أحمد',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    isSubscriber: true,
  },
}

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '😡']

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>()
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  const user = MOCK_USERS[chatId || 'user1'] || MOCK_USERS['user1']

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        type: 'text',
        isOwn: true,
        timestamp: new Date().toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isRead: false,
      }
      setMessages(prev => [...prev, newMessage])
      setInputText('')
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReactions = msg.reactions || []
        const existingReaction = existingReactions.find(r => r.emoji === emoji)
        
        if (existingReaction) {
          return {
            ...msg,
            reactions: existingReactions.map(r => 
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            )
          }
        } else {
          return {
            ...msg,
            reactions: [...existingReactions, { emoji, count: 1 }]
          }
        }
      }
      return msg
    }))
    setShowReactions(null)
  }

  const handleImagePicker = () => {
    Alert.alert('إرسال صورة', 'اختر مصدر الصورة', [
      { text: 'الكاميرا', onPress: () => console.log('Camera') },
      { text: 'المعرض', onPress: () => console.log('Gallery') },
      { text: 'إلغاء', style: 'cancel' },
    ])
  }

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      console.log('Stop recording')
    } else {
      setIsRecording(true)
      console.log('Start recording')
    }
  }

  const renderMessage = (message: Message) => {
    const isOwn = message.isOwn
    const avatarSource = !isOwn && user.avatar 
      ? { uri: user.avatar }
      : require('@/assets/images/adaptive-icon.png')

    return (
      <View key={message.id} style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}>
        {!isOwn && (
          <Image source={avatarSource} style={styles.messageAvatar} />
        )}
        
        <TouchableOpacity
          style={[styles.messageBubble, isOwn ? styles.ownMessageBubble : styles.otherMessageBubble]}
          onLongPress={() => setShowReactions(message.id)}
          activeOpacity={0.8}
        >
          {message.type === 'text' && (
            <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
              {message.text}
            </Text>
          )}
          
          {message.type === 'image' && message.imageUrl && (
            <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
          )}
          
          {message.type === 'audio' && (
            <View style={styles.audioMessage}>
              <Mic size={20} color={isOwn ? Colors.mauritanian.white : Colors.mauritanian.mauritanianBlue} />
              <Text style={[styles.audioText, isOwn && styles.ownMessageText]}>
                رسالة صوتية
              </Text>
            </View>
          )}
          
          <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
            {message.timestamp}
          </Text>
        </TouchableOpacity>

        {message.reactions && message.reactions.length > 0 && (
          <View style={[styles.reactionsContainer, isOwn && styles.ownReactionsContainer]}>
            {message.reactions.map((reaction, index) => (
              <View key={index} style={styles.reactionBubble}>
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              </View>
            ))}
          </View>
        )}

        {showReactions === message.id && (
          <View style={[styles.reactionPicker, isOwn && styles.ownReactionPicker]}>
            {REACTION_EMOJIS.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionButton}
                onPress={() => handleReaction(message.id, emoji)}
              >
                <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.mauritanian.white, Colors.mauritanian.lightSand]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.mauritanian.mauritanianBlue} />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={user.avatar ? { uri: user.avatar } : require('@/assets/images/adaptive-icon.png')} 
                style={styles.headerAvatar} 
              />
              {user.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.userDetails}>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{user.name}</Text>
                {user.isSubscriber && (
                  <LinearGradient
                    colors={[Colors.mauritanian.gold, Colors.mauritanian.amber]}
                    style={styles.subscriberBadge}
                  >
                    <Crown size={10} color={Colors.mauritanian.white} fill={Colors.mauritanian.white} />
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.userStatus}>
                {user.isOnline ? 'متصل الآن' : 'آخر ظهور منذ ساعة'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Phone size={20} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Video size={20} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <MoreVertical size={20} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.messagesContent}>
            {messages.map(renderMessage)}
          </View>
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.inputButton} onPress={handleImagePicker}>
              <Camera size={24} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inputButton}>
              <ImageIcon size={24} color={Colors.mauritanian.mauritanianBlue} />
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="اكتب رسالة..."
                placeholderTextColor={Colors.mauritanian.mediumGray}
                value={inputText}
                onChangeText={setInputText}
                multiline
                textAlign="right"
              />
              <TouchableOpacity style={styles.emojiButton}>
                <Smile size={20} color={Colors.mauritanian.mediumGray} />
              </TouchableOpacity>
            </View>

            {inputText.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Send size={20} color={Colors.mauritanian.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]} 
                onPress={handleVoiceRecord}
              >
                <Mic size={20} color={Colors.mauritanian.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  headerGradient: {
    paddingBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.mauritanian.white,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.mauritanian.islamicGreen,
    borderWidth: 2,
    borderColor: Colors.mauritanian.white,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.mauritanian.darkGray,
    textAlign: 'right',
  },
  userStatus: {
    fontSize: 13,
    color: Colors.mauritanian.mediumGray,
    textAlign: 'right',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.mauritanian.white,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  otherMessageBubble: {
    backgroundColor: Colors.mauritanian.white,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageBubble: {
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 16,
    color: Colors.mauritanian.darkGray,
    textAlign: 'right',
    lineHeight: 22,
  },
  ownMessageText: {
    color: Colors.mauritanian.white,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  audioText: {
    fontSize: 14,
    color: Colors.mauritanian.darkGray,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.mauritanian.mediumGray,
    marginTop: 4,
    textAlign: 'right',
  },
  ownMessageTime: {
    color: Colors.mauritanian.lightSand,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 40,
  },
  ownReactionsContainer: {
    marginLeft: 0,
    marginRight: 40,
    justifyContent: 'flex-end',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mauritanian.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    color: Colors.mauritanian.darkGray,
    marginLeft: 2,
  },
  reactionPicker: {
    position: 'absolute',
    top: -50,
    left: 0,
    flexDirection: 'row',
    backgroundColor: Colors.mauritanian.white,
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  ownReactionPicker: {
    right: 0,
    left: 'auto' as any,
  },
  reactionButton: {
    padding: 4,
  },
  reactionPickerEmoji: {
    fontSize: 20,
  },
  inputContainer: {
    backgroundColor: Colors.mauritanian.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.mauritanian.sand,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.mauritanian.lightSand,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.mauritanian.darkGray,
    maxHeight: 100,
    textAlign: 'right',
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: Colors.mauritanian.islamicGreen,
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonRecording: {
    backgroundColor: Colors.mauritanian.traditionalRed,
  },
})