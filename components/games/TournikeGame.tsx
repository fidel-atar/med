import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, RotateCcw, Spade, Heart, Club, Diamond, Users2, Shuffle, Crown, PlusCircle, MinusCircle } from 'lucide-react-native'
import { router } from 'expo-router'

type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds'
type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

interface Card {
  id: string
  suit: Suit
  rank: Rank
}

interface Player {
  id: string
  name: string
  hand: Card[]
}

interface GameState {
  players: Player[]
  currentPlayerIndex: number
  drawPile: Card[]
  discardPile: Card[]
  declaredSuit?: Suit
  pendingDraw: number
  stackedSevens: number
  freePlayAfterDoubleSeven: boolean
  started: boolean
  winnerId?: string
}

const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds']
const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A']

function suitIcon(suit: Suit, size: number, color?: string) {
  const iconColor = color ?? (suit === 'hearts' || suit === 'diamonds' ? '#E53935' : '#111')
  const common = { size, color: iconColor }
  switch (suit) {
    case 'spades':
      return <Spade {...common} />
    case 'hearts':
      return <Heart {...common} />
    case 'clubs':
      return <Club {...common} />
    case 'diamonds':
      return <Diamond {...common} />
  }
}

function createDeck(): Card[] {
  const deck: Card[] = []
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({ id: `${suit}-${rank}-${Math.random().toString(36).slice(2, 8)}` , suit, rank })
    })
  })
  return deck
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

function drawOne(state: GameState): void {
  if (state.drawPile.length === 0) {
    if (state.discardPile.length > 1) {
      const top = state.discardPile[state.discardPile.length - 1]
      const rest = shuffle(state.discardPile.slice(0, -1))
      state.drawPile = rest
      state.discardPile = [top]
      console.log('[Tornika] Reshuffled discard into draw pile')
    } else {
      console.log('[Tornika] No cards left to draw')
      return
    }
  }
  const card = state.drawPile.pop()
  if (card) {
    state.players[state.currentPlayerIndex].hand.push(card)
  }
}

function nextPlayerIndex(state: GameState): number {
  return (state.currentPlayerIndex + 1) % state.players.length
}

function initialDeal(numPlayers: number): GameState {
  const deck = shuffle(createDeck())
  const players: Player[] = Array.from({ length: numPlayers }).map((_, i) => ({
    id: `p${i+1}`,
    name: `Player ${i+1}`,
    hand: [],
  }))

  let idx = 0
  for (let r = 0; r < 3; r += 1) {
    players.forEach((p) => {
      p.hand.push(deck[idx]); idx += 1
    })
  }
  for (let r = 0; r < 2; r += 1) {
    players.forEach((p) => {
      p.hand.push(deck[idx]); idx += 1
    })
  }

  const faceUp = deck[idx]; idx += 1
  const drawPile = deck.slice(idx)

  const startingSuit: Suit | undefined = faceUp?.suit

  const state: GameState = {
    players,
    currentPlayerIndex: 0,
    drawPile,
    discardPile: faceUp ? [faceUp] : [],
    declaredSuit: startingSuit,
    pendingDraw: 0,
    stackedSevens: 0,
    freePlayAfterDoubleSeven: false,
    started: true,
  }
  return state
}

function canPlayCard(card: Card, state: GameState): boolean {
  const top = state.discardPile[state.discardPile.length - 1]
  const activeSuit = state.declaredSuit ?? top?.suit
  if (!top) return true

  if (state.pendingDraw > 0) {
    return false
  }

  if (state.stackedSevens > 0) {
    if (state.freePlayAfterDoubleSeven) return true
    if (card.rank === '7') return true
    if (card.suit === activeSuit) return true
    return false
  }

  if (card.rank === 'J') return true

  if (top.rank === '9') {
    if (card.suit === top.suit) return true
    return false
  }

  if (card.suit === activeSuit) return true

  return false
}

function computePlayable(hand: Card[], state: GameState): Card[] {
  return hand.filter((c) => canPlayCard(c, state))
}

export default function TournikeGame() {
  const [numPlayers, setNumPlayers] = useState<number>(2)
  const [state, setState] = useState<GameState | undefined>(undefined)
  const [showSuitPicker, setShowSuitPicker] = useState<boolean>(false)
  const [pendingJackCard, setPendingJackCard] = useState<Card | undefined>(undefined)

  useEffect(() => {
    console.log('[Tornika] mounted')
  }, [])

  const startGame = useCallback(() => {
    if (numPlayers < 2 || numPlayers > 5) {
      if (Platform.OS !== 'web') {
        Alert.alert('عدد اللاعبين غير صالح', 'اختر من 2 إلى 5 لاعبين')
      } else {
        console.log('[Alert]', 'عدد اللاعبين غير صالح: اختر من 2 إلى 5 لاعبين')
      }
      return
    }
    const s = initialDeal(numPlayers)
    setState(s)
    console.log('[Tornika] game started', s)
  }, [numPlayers])

  const resetGame = useCallback(() => {
    setState(undefined)
    setShowSuitPicker(false)
    setPendingJackCard(undefined)
  }, [])

  const topCard = state?.discardPile[state.discardPile.length - 1]
  const activeSuit: Suit | undefined = state?.declaredSuit ?? topCard?.suit
  const currentPlayer = state ? state.players[state.currentPlayerIndex] : undefined
  const playable = useMemo(() => (state && currentPlayer ? computePlayable(currentPlayer.hand, state) : []), [state, currentPlayer])

  const performPlay = useCallback((card: Card) => {
    if (!state) return
    const s: GameState = JSON.parse(JSON.stringify(state)) as GameState

    const player = s.players[s.currentPlayerIndex]
    const cardIdx = player.hand.findIndex((c) => c.id === card.id)
    if (cardIdx === -1) return

    if (!canPlayCard(card, s)) {
      if (Platform.OS !== 'web') {
        Alert.alert('لا يمكن لعب هذه الورقة الآن')
      } else {
        console.log('[Alert]', 'لا يمكن لعب هذه الورقة الآن')
      }
      return
    }

    player.hand.splice(cardIdx, 1)
    s.discardPile.push(card)

    if (card.rank === 'J') {
      setPendingJackCard(card)
      setShowSuitPicker(true)
      setState(s)
      return
    }

    if (card.rank === 'A') {
      s.pendingDraw += 3
      s.declaredSuit = undefined
      if (player.hand.length === 0) {
        s.winnerId = player.id
        setState(s)
        return
      }
      s.currentPlayerIndex = nextPlayerIndex(s)
      setState(s)
      return
    }

    if (card.rank === '7') {
      s.stackedSevens += 1
      s.declaredSuit = card.suit
      if (s.stackedSevens >= 2) {
        s.freePlayAfterDoubleSeven = true
      }
      if (player.hand.length === 0) {
        s.winnerId = player.id
        setState(s)
        return
      }
      setState(s)
      return
    }

    if (s.freePlayAfterDoubleSeven) {
      s.freePlayAfterDoubleSeven = false
      s.stackedSevens = 0
      s.declaredSuit = undefined
      if (card.rank === '9') s.declaredSuit = card.suit
      if (player.hand.length === 0) {
        s.winnerId = player.id
        setState(s)
        return
      }
      // After consuming free play, pass turn
      s.currentPlayerIndex = nextPlayerIndex(s)
      setState(s)
      return
    }

    s.declaredSuit = undefined
    s.stackedSevens = 0
    if (card.rank === '9') {
      s.declaredSuit = card.suit
    }

    if (player.hand.length === 0) {
      s.winnerId = player.id
      setState(s)
      return
    }

    s.currentPlayerIndex = nextPlayerIndex(s)
    setState(s)
  }, [state])

  const onPickSuit = useCallback((suit: Suit) => {
    if (!state || !pendingJackCard) return
    const s = { ...state }
    s.declaredSuit = suit
    s.stackedSevens = 0
    s.currentPlayerIndex = nextPlayerIndex(s)
    setShowSuitPicker(false)
    setPendingJackCard(undefined)
    setState(s)
  }, [state, pendingJackCard])

  const onDraw = useCallback(() => {
    if (!state) return
    const s: GameState = JSON.parse(JSON.stringify(state)) as GameState
    const player = s.players[s.currentPlayerIndex]

    if (s.pendingDraw > 0) {
      for (let k = 0; k < s.pendingDraw; k += 1) {
        drawOne(s)
      }
      s.pendingDraw = 0
      s.declaredSuit = undefined
      s.currentPlayerIndex = nextPlayerIndex(s)
      setState(s)
      return
    }

    const playableNow = computePlayable(player.hand, s)
    if (playableNow.length > 0) {
      if (Platform.OS !== 'web') {
        Alert.alert('لديك ورقة صالحة', 'اختر ورقة لتلعبها')
      } else {
        console.log('[Alert]', 'لديك ورقة صالحة — اختر ورقة لتلعبها')
      }
      return
    }

    drawOne(s)

    s.currentPlayerIndex = nextPlayerIndex(s)
    setState(s)
  }, [state])

  const renderCard = useCallback((card: Card, canPlay: boolean) => {
    return (
      <TouchableOpacity
        key={card.id}
        disabled={!canPlay}
        onPress={() => performPlay(card)}
        style={[styles.card, !canPlay && styles.cardDisabled]}
        testID={`card-${card.suit}-${card.rank}`}
      >
        <View style={styles.cardTop}>{suitIcon(card.suit, 18)}</View>
        <View style={styles.cardCenter}>
          <Text style={styles.cardRank}>{card.rank}</Text>
          {suitIcon(card.suit, 24)}
        </View>
        <View style={styles.cardBottom}>{suitIcon(card.suit, 18)}</View>
      </TouchableOpacity>
    )
  }, [performPlay])

  const goBack = useCallback(() => {
    if (!state) {
      router.back()
      return
    }
    if (Platform.OS !== 'web') {
      Alert.alert('الخروج من اللعبة', 'هل تريد إنهاء الجولة والعودة؟', [
        { text: 'متابعة', style: 'cancel' },
        { text: 'خروج', style: 'destructive', onPress: () => router.back() },
      ])
    } else {
      console.log('[Alert]', 'الخروج من اللعبة? إنهاء الجولة والعودة')
      router.back()
    }
  }, [state])

  if (!state || !state.started) {
    return (
      <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.headerButton} testID="back-button">
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>تـورنـيـكـا</Text>
          <TouchableOpacity onPress={resetGame} style={styles.headerButton} testID="reset-button">
            <RotateCcw size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.lobby}>
          <View style={styles.lobbyRow}>
            <Users2 size={18} color="#fff" />
            <Text style={styles.lobbyLabel}>عدد اللاعبين</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity onPress={() => setNumPlayers(Math.max(2, numPlayers - 1))} style={styles.counterBtn} testID="players-dec">
              <MinusCircle size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{numPlayers}</Text>
            <TouchableOpacity onPress={() => setNumPlayers(Math.min(5, numPlayers + 1))} style={styles.counterBtn} testID="players-inc">
              <PlusCircle size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={startGame} style={styles.primaryBtn} testID="start-game">
            <Text style={styles.primaryBtnText}>ابدأ اللعبة</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.headerButton} testID="back-button">
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>تـورنـيـكـا</Text>
        <TouchableOpacity onPress={resetGame} style={styles.headerButton} testID="reset-button">
          <RotateCcw size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.table}>
        <View style={styles.turnRow}>
          <Text style={styles.turnText}>الدور: {currentPlayer?.name}</Text>
          <View style={styles.suitRow}>
            {activeSuit && (
              <View style={styles.suitBadge} testID={`active-suit-${activeSuit}`}>
                {suitIcon(activeSuit, 18, '#fff')}
                <Text style={styles.suitBadgeText}>السُّمْ</Text>
              </View>
            )}
            {state.stackedSevens > 0 && (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>7×{state.stackedSevens}</Text>
              </View>
            )}
            {state.pendingDraw > 0 && (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>+{state.pendingDraw}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.centerRow}>
          <TouchableOpacity style={styles.pile} disabled>
            <Text style={styles.pileLabel}>السحب</Text>
            <Shuffle size={18} color="#fff" />
            <Text style={styles.pileCount} testID="draw-count">{state.drawPile.length}</Text>
          </TouchableOpacity>

          <View style={styles.discard}>
            <Text style={styles.pileLabel}>الطاولة</Text>
            {topCard ? (
              <View style={styles.topCard} testID="top-card">
                {renderCard(topCard, false)}
              </View>
            ) : (
              <Text style={styles.emptyText}>لا توجد ورقة</Text>
            )}
          </View>
        </View>

        <View style={styles.playersRow}>
          {state.players.map((p, idx) => (
            <View key={p.id} style={[styles.playerBadge, idx === state.currentPlayerIndex && styles.currentPlayerBadge]}>
              {idx === state.currentPlayerIndex && <Crown size={14} color="#FFD700" />}
              <Text style={styles.playerName}>{p.name}</Text>
              <Text style={styles.playerCount} testID={`hand-count-${p.id}`}>{p.hand.length}</Text>
            </View>
          ))}
        </View>

        {state.winnerId ? (
          <View style={styles.winnerBox}>
            <Text style={styles.winnerText}>الفائز: {state.players.find(p => p.id === state.winnerId)?.name}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={resetGame} testID="play-again">
              <Text style={styles.primaryBtnText}>جولة جديدة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.handTitle}>أوراق {currentPlayer?.name}</Text>
            <FlatList
              data={currentPlayer?.hand ?? []}
              keyExtractor={(c) => c.id}
              horizontal
              contentContainerStyle={styles.handList}
              renderItem={({ item }) => renderCard(item, playable.some(pc => pc.id === item.id))}
              showsHorizontalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.secondaryBtn} onPress={onDraw} testID="draw-button">
              <Text style={styles.secondaryBtnText}>{state.pendingDraw > 0 ? `اسحب +${state.pendingDraw}` : 'اسحب ورقة'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {showSuitPicker && (
        <View style={styles.suitPicker} testID="suit-picker">
          <Text style={styles.suitPickerTitle}>اختر اللون بعد الجاك</Text>
          <View style={styles.suitPickerRow}>
            {SUITS.map((s) => (
              <TouchableOpacity key={s} style={styles.suitButton} onPress={() => onPickSuit(s)} testID={`pick-${s}`}>
                {suitIcon(s, 28, '#fff')}
                <Text style={styles.suitButtonText}>{s === 'spades' ? 'سبيد' : s === 'hearts' ? 'قلب' : s === 'clubs' ? 'شجر' : 'ديمن'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerButton: { padding: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },

  lobby: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  lobbyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  lobbyLabel: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  counterBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  counterValue: { color: '#fff', fontSize: 22, fontWeight: 'bold', minWidth: 36, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#00C853', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  table: { flex: 1, paddingHorizontal: 12, paddingBottom: 12 },
  turnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  turnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  suitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  suitBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  suitBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  infoBadge: { backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  infoBadgeText: { color: '#FFD54F', fontWeight: '700' },

  centerRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 8 },
  pile: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12, minWidth: 90 },
  discard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12, minWidth: 140 },
  pileLabel: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  pileCount: { color: '#fff' },
  topCard: { marginTop: 6 },
  emptyText: { color: '#eee' },

  playersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginVertical: 8 },
  playerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  currentPlayerBadge: { borderWidth: 1, borderColor: '#FFD700' },
  playerName: { color: '#fff', fontWeight: '600' },
  playerCount: { color: '#fff', opacity: 0.9 },

  handTitle: { color: '#fff', fontWeight: '700', marginVertical: 6, textAlign: 'center' },
  handList: { paddingVertical: 6, paddingHorizontal: 8 },

  card: { width: 78, height: 110, borderRadius: 10, backgroundColor: '#fff', marginHorizontal: 6, padding: 8, justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: Platform.OS === 'android' ? 4 : 0 },
  cardDisabled: { opacity: 0.5 },
  cardTop: { alignItems: 'flex-start' },
  cardCenter: { alignItems: 'center' },
  cardBottom: { alignItems: 'flex-end' },
  cardRank: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 2 },

  secondaryBtn: { alignSelf: 'center', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  secondaryBtnText: { color: '#fff', fontWeight: '700' },

  winnerBox: { alignItems: 'center', gap: 10, marginTop: 12 },
  winnerText: { color: '#fff', fontSize: 18, fontWeight: '800' },

  suitPicker: { position: 'absolute', left: 12, right: 12, bottom: 16, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 16, padding: 14 },
  suitPickerTitle: { color: '#fff', fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  suitPickerRow: { flexDirection: 'row', justifyContent: 'space-around' },
  suitButton: { alignItems: 'center', gap: 6, padding: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 },
  suitButtonText: { color: '#fff', fontWeight: '600' },
})