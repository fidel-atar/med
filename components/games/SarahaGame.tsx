import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, FlatList, TextInput } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '@/constants/colors'
import { ArrowLeft, RotateCcw, Info, Users, PlusCircle, Send } from 'lucide-react-native'
import { router } from 'expo-router'

interface Player {
  id: string
  name: string
}

interface Card {
  id: string
  text: string
}

const PRESET_CARDS: Card[] = [
  { id: 'c1', text: 'ما هي أكبر مخاوفك ولماذا؟' },
  { id: 'c2', text: 'من هو أقرب شخص لك حالياً؟' },
  { id: 'c3', text: 'سر صغير لم تخبر به أحد؟' },
  { id: 'c4', text: 'ما القرار الذي ندمت عليه؟' },
  { id: 'c5', text: 'حلم تتمنى تحقيقه قريباً؟' },
  { id: 'c6', text: 'شخصية تعجبك ولماذا؟' },
]

export default function SarahaGame() {
  const [players, setPlayers] = useState<Player[]>([{ id: 'p1', name: 'أنت' }])
  const [newPlayer, setNewPlayer] = useState<string>('')
  const [deck, setDeck] = useState<Card[]>(PRESET_CARDS)
  const [current, setCurrent] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [answerText, setAnswerText] = useState<string>('')

  const currentCard = useMemo<Card | null>(() => deck[current] ?? null, [deck, current])
  const currentPlayer = useMemo<Player>(() => players[current % players.length], [players, current])

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim()
    if (!name) return
    const id = 'p' + (players.length + 1)
    setPlayers([...players, { id, name }])
    setNewPlayer('')
  }, [newPlayer, players])

  const nextCard = useCallback(() => {
    if (current >= deck.length - 1) {
      Alert.alert('انتهت الأسئلة', 'لقد وصلت لنهاية البطاقات')
      return
    }
    setCurrent((c) => c + 1)
    setAnswerText('')
  }, [current, deck.length])

  const reset = useCallback(() => {
    setDeck(PRESET_CARDS.sort(() => Math.random() - 0.5))
    setCurrent(0)
    setAnswers({})
    setAnswerText('')
  }, [])

  const submitAnswer = useCallback(() => {
    if (!currentCard) return
    const key = `${currentCard.id}-${currentPlayer.id}`
    setAnswers((prev) => ({ ...prev, [key]: answerText.trim() }))
    nextCard()
  }, [answerText, currentCard, currentPlayer, nextCard])

  const goBack = useCallback(() => {
    try { router.back() } catch { router.replace('/(tabs)/games') }
  }, [])

  return (
    <LinearGradient colors={['#0f172a', '#1f2937']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.headerButton} testID="back">
          <ArrowLeft size={22} color={Colors.mauritanian.white} />
        </TouchableOpacity>
        <Text style={styles.title}>صراحة</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={reset} style={styles.headerButton} testID="reset">
            <RotateCcw size={18} color={Colors.mauritanian.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.playersBar}>
        <Users size={16} color={Colors.mauritanian.white} />
        <FlatList
          horizontal
          data={players}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.playersList}
          renderItem={({ item }) => (
            <View style={styles.playerChip}>
              <Text style={styles.playerText}>{item.name}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.addPlayerRow}>
        <TextInput
          value={newPlayer}
          onChangeText={setNewPlayer}
          placeholder="أضف لاعباً (اسم)"
          placeholderTextColor="#cbd5e1"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={addPlayer} style={styles.addBtn}>
          <PlusCircle size={18} color="#0f5132" />
          <Text style={styles.addBtnText}>إضافة</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardArea}>
        <View style={styles.card}>
          <Text style={styles.cardPlayer}>السؤال إلى: {currentPlayer.name}</Text>
          <Text style={styles.cardText}>{currentCard?.text ?? '—'}</Text>
        </View>

        <View style={styles.answerBox}>
          <TextInput
            value={answerText}
            onChangeText={setAnswerText}
            placeholder="اكتب الإجابة (اختياري)"
            placeholderTextColor="#94a3b8"
            style={styles.answerInput}
            multiline
          />
          <TouchableOpacity onPress={submitAnswer} style={styles.sendBtn}>
            <Send size={16} color={Colors.mauritanian.white} />
            <Text style={styles.sendText}>التالي</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 14 : 12,
    paddingBottom: 8,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: Colors.mauritanian.white, fontSize: 20, fontWeight: '800' },
  playersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8 as unknown as number,
  },
  playersList: { paddingHorizontal: 8 },
  playerChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  playerText: { color: Colors.mauritanian.white, fontWeight: '700' },
  addPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 as unknown as number,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: Colors.mauritanian.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1e7dd',
    borderColor: '#badbcc',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: '#0f5132', fontWeight: '800', marginLeft: 6 },
  cardArea: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  card: {
    backgroundColor: '#0b1020',
    borderWidth: 1,
    borderColor: Colors.mauritanian.gold,
    borderRadius: 16,
    padding: 16,
  },
  cardPlayer: { color: Colors.mauritanian.skyBlue, fontWeight: '800', marginBottom: 8 },
  cardText: { color: Colors.mauritanian.white, fontSize: 18, fontWeight: '700', lineHeight: 28 },
  answerBox: { marginTop: 12 },
  answerInput: {
    minHeight: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: Colors.mauritanian.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    backgroundColor: Colors.mauritanian.darkGold,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 as unknown as number,
  },
  sendText: { color: Colors.mauritanian.white, fontWeight: '800', marginLeft: 6 },
})
