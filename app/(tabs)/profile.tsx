import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import {
  Crown,
  Settings,
  Trophy,
  Target,
  Calendar,
  Star,
  CreditCard,
  LogOut,
  QrCode,
  Users,
  FileText,
  Edit3,
} from 'lucide-react-native'


const MOCK_USER = {
  id: 'user123',
  username: 'أحمد_الموريتاني',
  fullName: 'أحمد ولد محمد',
  bio: 'لاعب محترف في البلوت والكرول 🎮',
  isSubscriber: false,
  joinDate: '2024-01-15',
  stats: {
    gamesPlayed: 156,
    gamesWon: 89,
    winRate: 57,
    totalScore: 2450,
    rank: 12,
  },
  achievements: [
    { id: '1', name: 'أول انتصار', icon: '🏆', earned: true },
    { id: '2', name: 'لاعب نشط', icon: '⚡', earned: true },
    { id: '3', name: 'خبير البلوت', icon: '🃏', earned: false },
    { id: '4', name: 'أسطورة الكرول', icon: '🪨', earned: false },
  ],
}

export default function ProfileScreen() {

  const [user] = useState(MOCK_USER)

  const handleSubscribe = () => {
    Alert.alert(
      'الاشتراك المميز',
      'اشترك الآن واستمتع بجميع الألعاب بدون إعلانات!',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'اشترك الآن', onPress: () => console.log('Navigate to subscription') },
      ]
    )
  }

  const handleSignOut = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'خروج', style: 'destructive', onPress: () => console.log('Sign out') },
      ]
    )
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={user.isSubscriber ? ['#FFD700', '#FFA500'] : ['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.fullName.charAt(0)}
                </Text>
              </View>
              {user.isSubscriber && (
                <View style={styles.subscriberBadge}>
                  <Crown size={20} color="#FFD700" />
                </View>
              )}
            </View>
            
            <Text style={styles.fullName}>{user.fullName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.userId}>ID: {user.id}</Text>
            
            {user.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}

            <View style={styles.joinInfo}>
              <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.joinText}>
                انضم في {formatJoinDate(user.joinDate)}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <QrCode size={20} color="#fff" />
              <Text style={styles.actionText}>QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/my-posts')}
            >
              <FileText size={20} color="#fff" />
              <Text style={styles.actionText}>منشوراتي</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/friends')}
            >
              <Users size={20} color="#fff" />
              <Text style={styles.actionText}>الأصدقاء</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {!user.isSubscriber && (
            <TouchableOpacity style={styles.subscriptionCard} onPress={handleSubscribe}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.subscriptionGradient}
              >
                <Crown size={24} color="#fff" />
                <View style={styles.subscriptionText}>
                  <Text style={styles.subscriptionTitle}>اشترك الآن</Text>
                  <Text style={styles.subscriptionSubtitle}>
                    استمتع بجميع الألعاب بدون إعلانات
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>الإحصائيات</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Trophy size={24} color="#4ECDC4" />
                <Text style={styles.statValue}>{user.stats.gamesWon}</Text>
                <Text style={styles.statLabel}>انتصار</Text>
              </View>
              <View style={styles.statCard}>
                <Target size={24} color="#FF6B6B" />
                <Text style={styles.statValue}>{user.stats.winRate}%</Text>
                <Text style={styles.statLabel}>نسبة الفوز</Text>
              </View>
              <View style={styles.statCard}>
                <Star size={24} color="#FFD700" />
                <Text style={styles.statValue}>{user.stats.totalScore.toLocaleString()}</Text>
                <Text style={styles.statLabel}>النقاط</Text>
              </View>
              <View style={styles.statCard}>
                <Crown size={24} color="#9B59B6" />
                <Text style={styles.statValue}>#{user.stats.rank}</Text>
                <Text style={styles.statLabel}>الترتيب</Text>
              </View>
            </View>
          </View>


          <View style={styles.menuSection}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit3 size={24} color="#4ECDC4" />
              <Text style={styles.menuText}>تعديل الحساب</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/my-posts')}
            >
              <FileText size={24} color="#4ECDC4" />
              <Text style={styles.menuText}>منشوراتي</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/friends')}
            >
              <Users size={24} color="#4ECDC4" />
              <Text style={styles.menuText}>أصدقائي</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              testID="subscription-menu-button"
              style={styles.menuItem}
              onPress={() => router.push('/subscribe')}
            >
              <Crown size={24} color="#666" />
              <Text style={styles.menuText}>الإشتراك</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/payments')}
            >
              <CreditCard size={24} color="#666" />
              <Text style={styles.menuText}>المدفوعات</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings')}
            >
              <Settings size={24} color="#666" />
              <Text style={styles.menuText}>الإعدادات</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <LogOut size={24} color="#e74c3c" />
              <Text style={[styles.menuText, styles.signOutText]}>تسجيل الخروج</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 18,
    paddingVertical: Platform.OS === 'ios' ? 24 : 20,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 24 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 24 : 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: Platform.OS === 'ios' ? 80 : 85,
    height: Platform.OS === 'ios' ? 80 : 85,
    borderRadius: Platform.OS === 'ios' ? 40 : 42.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Platform.OS === 'ios' ? 3 : 2.5,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subscriberBadge: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? -4 : -2,
    right: Platform.OS === 'ios' ? -4 : -2,
    backgroundColor: '#fff',
    borderRadius: Platform.OS === 'ios' ? 16 : 14,
    padding: Platform.OS === 'ios' ? 4 : 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 2 : 3,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.25,
    shadowRadius: Platform.OS === 'ios' ? 4 : 5,
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  userId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 2,
  },
  bio: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  joinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  joinText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  subscriptionCard: {
    marginBottom: Platform.OS === 'ios' ? 24 : 20,
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 4 : 5,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.35,
    shadowRadius: Platform.OS === 'ios' ? 8 : 10,
    elevation: Platform.OS === 'android' ? 10 : 0,
  },
  subscriptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  subscriptionText: {
    marginLeft: 16,
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    padding: Platform.OS === 'ios' ? 16 : 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 2 : 3,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.15,
    shadowRadius: Platform.OS === 'ios' ? 4 : 5,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    padding: Platform.OS === 'ios' ? 16 : 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 2 : 3,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.15,
    shadowRadius: Platform.OS === 'ios' ? 4 : 5,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: '#999',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 2 : 3,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.15,
    shadowRadius: Platform.OS === 'ios' ? 4 : 5,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 16 : 18,
    borderBottomWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    flex: 1,
    textAlign: 'right',
  },
  signOutText: {
    color: '#e74c3c',
  },
})