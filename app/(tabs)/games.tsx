import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Trophy, Users, Clock, Crown } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import GameCard from '@/components/GameCard'
import { GAMES } from '@/constants/games'

const MOCK_LEADERBOARD = [
  { id: '1', username: 'أحمد الموريتاني', score: 2450, isSubscriber: true },
  { id: '2', username: 'فاطمة بنت محمد', score: 2380, isSubscriber: false },
  { id: '3', username: 'محمد ولد أحمد', score: 2290, isSubscriber: true },
  { id: '4', username: 'عائشة الحسن', score: 2150, isSubscriber: false },
  { id: '5', username: 'يوسف المختار', score: 2080, isSubscriber: true },
]

export default function GamesScreen() {
  const [isSubscriber] = useState(false) // This would come from user context

  const handleGamePress = (gameId: string) => {
    const game = GAMES.find(g => g.id === gameId)
    if (!game) return

    if (game.isPremium && !isSubscriber) {
      Alert.alert(
        'لعبة مميزة',
        'هذه اللعبة متاحة للمشتركين فقط. اشترك الآن للاستمتاع بجميع الألعاب!',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'اشترك الآن', onPress: () => console.log('Navigate to subscription') },
        ]
      )
      return
    }

    router.push({ pathname: '/games/[gameId]/invite', params: { gameId } })
  }

  const renderGameItem = ({ item, index }: { item: typeof GAMES[0], index: number }) => (
    <View style={[styles.gameItem, index % 2 === 0 ? styles.gameItemLeft : styles.gameItemRight]}>
      <GameCard
        id={item.id}
        name={item.name}
        nameAr={item.nameAr}
        description={item.description}
        descriptionAr={item.descriptionAr}
        icon={item.icon}
        maxPlayers={item.maxPlayers}
        isPremium={item.isPremium}
        color={item.color}
        isSubscriber={isSubscriber}
        onPress={() => handleGamePress(item.id)}
      />
    </View>
  )

  const renderLeaderboardItem = ({ item, index }: { item: typeof MOCK_LEADERBOARD[0], index: number }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.leaderboardRank}>
        <Text style={[
          styles.rankText,
          index === 0 && styles.goldRank,
          index === 1 && styles.silverRank,
          index === 2 && styles.bronzeRank,
        ]}>
          {index + 1}
        </Text>
      </View>
      <View style={styles.leaderboardInfo}>
        <View style={styles.leaderboardUser}>
          <Text style={styles.leaderboardUsername}>{item.username}</Text>
          {item.isSubscriber && (
            <Crown size={16} color="#FFD700" style={styles.subscriberIcon} />
          )}
        </View>
        <Text style={styles.leaderboardScore}>{item.score.toLocaleString()} نقطة</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.title}>لعباتك</Text>
        <Text style={styles.subtitle}>اختر لعبتك المفضلة واستمتع!</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users size={20} color="#fff" />
            <Text style={styles.statText}>1,234</Text>
            <Text style={styles.statLabel}>لاعب متصل</Text>
          </View>
          <View style={styles.statItem}>
            <Trophy size={20} color="#fff" />
            <Text style={styles.statText}>856</Text>
            <Text style={styles.statLabel}>مباراة اليوم</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color="#fff" />
            <Text style={styles.statText}>24/7</Text>
            <Text style={styles.statLabel}>متاح دائماً</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>الألعاب المتاحة</Text>
          <FlatList
            data={GAMES}
            renderItem={renderGameItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.gamesList}
          />
        </View>

        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>لوحة الشرف</Text>
          <View style={styles.leaderboardContainer}>
            <FlatList
              data={MOCK_LEADERBOARD}
              renderItem={renderLeaderboardItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  gamesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  gamesList: {
    paddingBottom: 16,
  },
  gameItem: {
    flex: 1,
    height: Platform.OS === 'ios' ? 180 : 190,
  },
  gameItemLeft: {
    marginRight: 4,
  },
  gameItemRight: {
    marginLeft: 4,
  },
  leaderboardSection: {
    padding: 16,
    paddingTop: 0,
  },
  leaderboardContainer: {
    backgroundColor: '#fff',
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    padding: Platform.OS === 'ios' ? 16 : 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 2 : 3,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.15,
    shadowRadius: Platform.OS === 'ios' ? 4 : 5,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 12 : 14,
    borderBottomWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderBottomColor: '#f0f0f0',
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  goldRank: {
    color: '#FFD700',
  },
  silverRank: {
    color: '#C0C0C0',
  },
  bronzeRank: {
    color: '#CD7F32',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subscriberIcon: {
    marginLeft: 8,
  },
  leaderboardScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
})