import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '@/constants/colors'
import { ArrowLeft, RotateCcw, Dice5, Dice1, Dice2, Dice3, Dice4, Dice6 } from 'lucide-react-native'
import { router } from 'expo-router'

function rollDie(): number { return Math.floor(Math.random() * 6) + 1 }

export default function SeikGame() {
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [round, setRound] = useState<number>(1)
  const [turn, setTurn] = useState<0 | 1>(0)
  const [die, setDie] = useState<number>(1)

  const goBack = useCallback(() => {
    try { router.back() } catch { router.replace('/(tabs)/games') }
  }, [])

  const reset = useCallback(() => {
    setScores([0, 0]); setRound(1); setTurn(0); setDie(1)
  }, [])

  const roll = useCallback(() => {
    const v = rollDie()
    setDie(v)
    setScores(prev => {
      const next = [...prev] as [number, number]
      next[turn] += v
      return next
    })
    setTurn(prev => (prev === 0 ? 1 : 0))
    setRound(r => r + 1)
  }, [turn])

  const winner = useMemo<0 | 1 | null>(() => {
    if (scores[0] >= 30) return 0
    if (scores[1] >= 30) return 1
    return null
  }, [scores])

  const DieIcon = useMemo(() => {
    switch (die) {
      case 1: return Dice1
      case 2: return Dice2
      case 3: return Dice3
      case 4: return Dice4
      case 5: return Dice5
      default: return Dice6
    }
  }, [die])

  return (
    <LinearGradient colors={['#1f2937', '#0f172a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.headerButton} testID="back">
          <ArrowLeft size={22} color={Colors.mauritanian.white} />
        </TouchableOpacity>
        <Text style={styles.title}>السيك</Text>
        <TouchableOpacity onPress={reset} style={styles.headerButton} testID="reset">
          <RotateCcw size={18} color={Colors.mauritanian.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreCard, turn === 0 && styles.activeCard]}>
          <Text style={styles.playerLabel}>أنت</Text>
          <Text style={styles.scoreText}>{scores[0]}</Text>
        </View>
        <View style={[styles.scoreCard, turn === 1 && styles.activeCard]}>
          <Text style={styles.playerLabel}>خصمك</Text>
          <Text style={styles.scoreText}>{scores[1]}</Text>
        </View>
      </View>

      <View style={styles.diceArea}>
        <DieIcon size={88} color={Colors.mauritanian.gold} />
        <Text style={styles.roundText}>الجولة: {round}</Text>
      </View>

      {winner === null ? (
        <TouchableOpacity style={styles.rollBtn} onPress={roll} testID="roll">
          <Text style={styles.rollText}>ارمِ النرد</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.winnerBox}>
          <Text style={styles.winnerText}>{winner === 0 ? 'فزت 🎉' : 'فاز خصمك'}</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>لعبة جديدة</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: Colors.mauritanian.white, fontSize: 20, fontWeight: '800' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 8 },
  scoreCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 14, minWidth: 120 },
  activeCard: { borderColor: Colors.mauritanian.gold, borderWidth: 1 },
  playerLabel: { color: '#e5e7eb', fontWeight: '700', marginBottom: 6 },
  scoreText: { color: Colors.mauritanian.white, fontWeight: '900', fontSize: 28 },
  diceArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  roundText: { color: '#cbd5e1', marginTop: 10 },
  rollBtn: { backgroundColor: Colors.mauritanian.darkGold, marginHorizontal: 16, marginBottom: 18, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  rollText: { color: Colors.mauritanian.white, fontWeight: '800', fontSize: 16 },
  winnerBox: { alignItems: 'center', paddingBottom: 20 },
  winnerText: { color: Colors.mauritanian.white, fontWeight: '900', fontSize: 20, marginBottom: 12 },
  resetBtn: { backgroundColor: '#d1e7dd', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  resetText: { color: '#0f5132', fontWeight: '800' },
})
