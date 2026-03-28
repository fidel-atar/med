import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, RotateCcw, Info } from 'lucide-react-native'
import { router, useLocalSearchParams } from 'expo-router'
import Colors from '@/constants/colors'

type CellValue = 'X' | 'O' | null

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export default function XOGame() {
  const { opponentName } = useLocalSearchParams<{ opponentName?: string }>()
  const { width } = useWindowDimensions()
  const [board, setBoard] = useState<CellValue[]>(Array<CellValue>(9).fill(null))
  const [turn, setTurn] = useState<'X' | 'O'>('X')

  const winner = useMemo(() => {
    for (const [a, b, c] of WIN_LINES) {
      const va = board[a]
      if (va && va === board[b] && va === board[c]) return va
    }
    return null as CellValue
  }, [board])

  const isDraw = useMemo(() => board.every(v => v !== null) && !winner, [board, winner])

  const handlePress = useCallback((idx: number) => {
    if (winner || isDraw) return
    setBoard(prev => {
      if (prev[idx] !== null) return prev
      const next = [...prev]
      next[idx] = turn
      return next
    })
    setTurn(prev => (prev === 'X' ? 'O' : 'X'))
  }, [turn, winner, isDraw])

  const reset = useCallback(() => {
    setBoard(Array<CellValue>(9).fill(null))
    setTurn('X')
  }, [])

  const goBack = useCallback(() => {
    try {
      const r = router as unknown as { canGoBack?: () => boolean }
      if (typeof r.canGoBack === 'function' && r.canGoBack()) {
        router.back()
      } else {
        router.replace('/(tabs)/games')
      }
    } catch {
      router.replace('/(tabs)/games')
    }
  }, [])

  const showRules = useCallback(() => {
    Alert.alert(
      'قواعد XO',
      'اللعبة بين لاعبين. يضع اللاعبون الرمزين X و O بالتناوب على شبكة 3×3. أول من يصنع ثلاثة على خط واحد يفوز. إذا امتلأت الخانات دون فائز فالنتيجة تعادل.',
      [{ text: 'حسناً' }]
    )
  }, [])

  const statusText = useMemo(() => {
    if (winner) return winner === 'X' ? 'فاز X' : 'فاز O'
    if (isDraw) return 'تعادل'
    return turn === 'X' ? 'دور X' : 'دور O'
  }, [winner, isDraw, turn])

  return (
    <LinearGradient colors={['#0f172a', '#1f2937']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.headerButton} testID="back">
          <ArrowLeft size={22} color={Colors.mauritanian.white} />
        </TouchableOpacity>
        <Text style={styles.title}>XO</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={showRules} style={styles.headerButton} testID="rules">
            <Info size={18} color={Colors.mauritanian.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={reset} style={[styles.headerButton, styles.headerButtonGap]} testID="reset">
            <RotateCcw size={18} color={Colors.mauritanian.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.vsText} numberOfLines={1} ellipsizeMode="tail">أنت (X) vs {String(opponentName ?? 'صديقك')} (O)</Text>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <View
        style={[
          styles.board,
          {
            width: Math.min(Math.floor(width - 32), 360),
            height: Math.min(Math.floor(width - 32), 360),
          },
        ]}
      >
        {Array.from({ length: 9 }).map((_, i) => {
          const v = board[i]
          const highlight = winner && WIN_LINES.some(line => line.includes(i) && line.every(j => board[j] === winner))
          const isLastCol = i % 3 === 2
          const isLastRow = i >= 6
          return (
            <TouchableOpacity
              key={`cell-${i}`}
              style={[
                styles.cell,
                {
                  borderRightWidth: isLastCol ? 0 : 1,
                  borderBottomWidth: isLastRow ? 0 : 1,
                },
                highlight && styles.cellHighlight,
              ]}
              onPress={() => handlePress(i)}
              testID={`cell-${i}`}
              activeOpacity={0.8}
            >
              <Text style={[styles.cellText, v === 'X' ? styles.xColor : v === 'O' ? styles.oColor : null]}>{v ?? ''}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {(winner || isDraw) && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={reset} style={styles.primaryBtn} testID="play-again">
            <Text style={styles.primaryBtnText}>{winner ? 'لعبة جديدة' : 'إعادة'}</Text>
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
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonGap: { marginLeft: 8 },
  title: { color: Colors.mauritanian.white, fontSize: 20, fontWeight: '800' },
  statusBar: { alignItems: 'center', paddingVertical: 8 },
  vsText: { color: Colors.mauritanian.white, opacity: 0.85, fontWeight: '700', fontSize: 13 },
  statusText: { color: Colors.mauritanian.white, fontWeight: '900', fontSize: 16 },
  board: {
    marginTop: 16,
    marginHorizontal: 16,
    alignSelf: 'center',
    backgroundColor: '#0b1020',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.mauritanian.gold,
    flexDirection: 'row',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  cell: {
    width: '33.3333%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#1f2937',
  },
  cellHighlight: { backgroundColor: 'rgba(34,197,94,0.25)' },
  cellText: { fontSize: 56, fontWeight: '900' },
  xColor: { color: '#60a5fa' },
  oColor: { color: '#f87171' },
  footer: { padding: 16, alignItems: 'center' },
  primaryBtn: { backgroundColor: Colors.mauritanian.darkGold, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18 },
  primaryBtnText: { color: Colors.mauritanian.white, fontWeight: '800', fontSize: 16 },
})
