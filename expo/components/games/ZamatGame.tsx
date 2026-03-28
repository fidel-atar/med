import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, RotateCcw, Info } from 'lucide-react-native'
import { router } from 'expo-router'
import Colors from '@/constants/colors'

type Player = 'RED' | 'BLACK'

type Piece = {
  id: string
  player: Player
  king: boolean
  row: number
  col: number
}

type Cell = { row: number; col: number }

const BOARD_SIZE = 8 as const

function inBounds(r: number, c: number) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
}

export default function ZamatGame() {
  const initialPieces = useMemo<Piece[]>(() => {
    const pieces: Piece[] = []
    let id = 0
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const dark = (r + c) % 2 === 1
        if (!dark) continue
        if (r < 3) {
          pieces.push({ id: `B${id++}`, player: 'BLACK', king: false, row: r, col: c })
        }
        if (r > BOARD_SIZE - 4) {
          pieces.push({ id: `R${id++}`, player: 'RED', king: false, row: r, col: c })
        }
      }
    }
    return pieces
  }, [])

  const [pieces, setPieces] = useState<Piece[]>(initialPieces)
  const [turn, setTurn] = useState<Player>('RED')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mustCaptureIds, setMustCaptureIds] = useState<Set<string>>(new Set())

  const reset = useCallback(() => {
    setPieces(initialPieces)
    setTurn('RED')
    setSelectedId(null)
    setMustCaptureIds(new Set())
  }, [initialPieces])

  const darkSquares = useMemo(() => {
    const arr: Cell[] = []
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if ((r + c) % 2 === 1) arr.push({ row: r, col: c })
      }
    }
    return arr
  }, [])

  const pieceAt = useCallback((r: number, c: number): Piece | undefined => pieces.find(p => p.row === r && p.col === c), [pieces])

  const computeCapturesFor = useCallback((p: Piece) => {
    const dirs = p.king
      ? [[1,1],[1,-1],[-1,1],[-1,-1]]
      : p.player === 'RED'
      ? [[-1,1],[-1,-1]]
      : [[1,1],[1,-1]]
    const caps: { to: Cell; jumped: Piece }[] = []
    for (const [dr, dc] of dirs) {
      const mr = p.row + dr
      const mc = p.col + dc
      const tr = p.row + 2*dr
      const tc = p.col + 2*dc
      if (!inBounds(tr, tc)) continue
      const mid = pieceAt(mr, mc)
      const dst = pieceAt(tr, tc)
      if (mid && mid.player !== p.player && !dst) {
        caps.push({ to: { row: tr, col: tc }, jumped: mid })
      }
    }
    return caps
  }, [pieceAt])

  const mandatoryCaptureIds = useMemo(() => {
    const set = new Set<string>()
    for (const p of pieces) {
      if (p.player !== turn) continue
      if (computeCapturesFor(p).length > 0) set.add(p.id)
    }
    return set
  }, [pieces, computeCapturesFor, turn])

  const simpleMovesFor = useCallback((p: Piece) => {
    const dirs = p.king
      ? [[1,1],[1,-1],[-1,1],[-1,-1]]
      : p.player === 'RED'
      ? [[-1,1],[-1,-1]]
      : [[1,1],[1,-1]]
    const mv: Cell[] = []
    for (const [dr, dc] of dirs) {
      const r = p.row + dr
      const c = p.col + dc
      if (!inBounds(r, c)) continue
      if (!pieceAt(r, c)) mv.push({ row: r, col: c })
    }
    return mv
  }, [pieceAt])

  const selectedPiece = useMemo(() => pieces.find(p => p.id === selectedId) ?? null, [pieces, selectedId])

  const availableDestinations = useMemo(() => {
    if (!selectedPiece) return [] as Cell[]
    const caps = computeCapturesFor(selectedPiece)
    if (caps.length > 0) return caps.map(c => c.to)
    if (mandatoryCaptureIds.size > 0) return []
    return simpleMovesFor(selectedPiece)
  }, [selectedPiece, computeCapturesFor, simpleMovesFor, mandatoryCaptureIds])

  const onCellPress = useCallback((cell: Cell) => {
    const current = selectedPiece
    const targetPiece = pieceAt(cell.row, cell.col)
    if (targetPiece && targetPiece.player === turn) {
      if (mandatoryCaptureIds.size > 0 && !mandatoryCaptureIds.has(targetPiece.id)) return
      setSelectedId(targetPiece.id)
      return
    }

    if (!current) return

    const caps = computeCapturesFor(current)
    const cap = caps.find(c => c.to.row === cell.row && c.to.col === cell.col)
    if (cap) {
      const remaining = pieces.filter(p => p.id !== cap.jumped.id && p.id !== current.id)
      const moved: Piece = { ...current, row: cell.row, col: cell.col }
      const crowned = moved.player === 'RED' ? moved.row === 0 : moved.row === BOARD_SIZE - 1
      const withMove = [...remaining, { ...moved, king: moved.king || crowned }]
      setPieces(withMove)

      const movedNow = { ...moved, king: moved.king || crowned }
      const moreCaps = computeCapturesFor(movedNow)
      if (moreCaps.length > 0 && !crowned) {
        setSelectedId(movedNow.id)
        setMustCaptureIds(new Set([movedNow.id]))
      } else {
        setSelectedId(null)
        setMustCaptureIds(new Set())
        setTurn(prev => (prev === 'RED' ? 'BLACK' : 'RED'))
      }
      return
    }

    if (mandatoryCaptureIds.size > 0) return

    const moves = simpleMovesFor(current)
    const canSimple = moves.find(m => m.row === cell.row && m.col === cell.col)
    if (canSimple) {
      const others = pieces.filter(p => p.id !== current.id)
      const moved: Piece = { ...current, row: cell.row, col: cell.col }
      const crowned = moved.player === 'RED' ? moved.row === 0 : moved.row === BOARD_SIZE - 1
      setPieces([...others, { ...moved, king: moved.king || crowned }])
      setSelectedId(null)
      setTurn(prev => (prev === 'RED' ? 'BLACK' : 'RED'))
    }
  }, [selectedPiece, pieceAt, turn, mandatoryCaptureIds, pieces, computeCapturesFor, simpleMovesFor])

  const onSquarePress = useCallback((cell: Cell) => {
    const p = pieces.find(pp => pp.row === cell.row && pp.col === cell.col)
    if (p && p.player === turn) {
      if (mandatoryCaptureIds.size > 0 && !mandatoryCaptureIds.has(p.id)) return
      setSelectedId(p.id)
      return
    }
    onCellPress(cell)
  }, [pieces, turn, mandatoryCaptureIds, onCellPress])

  const currentPlayerPieces = useMemo(() => pieces.filter(p => p.player === turn).length, [pieces, turn])
  const opponentPieces = useMemo(() => pieces.filter(p => p.player !== turn).length, [pieces, turn])

  const winner = useMemo<Player | null>(() => {
    const reds = pieces.filter(p => p.player === 'RED')
    const blacks = pieces.filter(p => p.player === 'BLACK')
    if (reds.length === 0) return 'BLACK'
    if (blacks.length === 0) return 'RED'
    return null
  }, [pieces])

  const goBack = useCallback(() => {
    try {
      router.back()
    } catch {
      router.replace('/(tabs)/games')
    }
  }, [])

  const showRules = useCallback(() => {
    Alert.alert(
      'قواعد ظامت (الداما)',
      '• لوح 8x8 واللعب على المربعات الداكنة\n• يتحرك الجندي قطرياً للأمام مربعاً واحداً\n• الأَكل إجباري عند الإمكان ويكون بالقفز فوق خصمٍ إلى خانة فارغة\n• يمكن تتابع الأكل في نفس الدور\n• التتويج: عند وصول الجندي إلى آخر صف يصبح ملكاً ويتحرك في الاتجاهين\n• الفوز بإزالة كل قطع الخصم أو منعه من التحرك',
      [{ text: 'حسناً' }]
    )
  }, [])

  return (
    <LinearGradient colors={['#1f2937', '#0f172a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.headerButton} testID="back">
          <ArrowLeft size={22} color={Colors.mauritanian.white} />
        </TouchableOpacity>
        <Text style={styles.title}>ظامت</Text>
        <TouchableOpacity onPress={showRules} style={styles.headerButton} testID="rules">
          <Info size={20} color={Colors.mauritanian.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.scoreBar}>
        <View style={styles.playerBadgeRed}>
          <View style={styles.redPiece} />
          <Text style={styles.badgeText}>أنت</Text>
          <Text style={styles.countText}>{pieces.filter(p => p.player==='RED').length}</Text>
        </View>
        <Text style={styles.turnText}>{turn === 'RED' ? 'دورك' : 'دور خصمك'}</Text>
        <View style={styles.playerBadgeBlack}>
          <View style={styles.blackPiece} />
          <Text style={styles.badgeText}>الخصم</Text>
          <Text style={styles.countText}>{pieces.filter(p => p.player==='BLACK').length}</Text>
        </View>
      </View>

      <View style={styles.boardWrapper}>
        <View style={styles.board}>
          {Array.from({ length: BOARD_SIZE }).map((_, r) => (
            <View key={`row-${r}`} style={styles.row}>
              {Array.from({ length: BOARD_SIZE }).map((__, c) => {
                const dark = (r + c) % 2 === 1
                const on = dark
                const isAvailable = availableDestinations.some(d => d.row === r && d.col === c)
                const isSelected = !!selectedPiece && selectedPiece.row === r && selectedPiece.col === c
                const p = pieceAt(r, c)
                return (
                  <TouchableOpacity
                    key={`cell-${r}-${c}`}
                    style={[styles.cell, dark ? styles.cellDark : styles.cellLight, isAvailable && styles.cellAvailable, isSelected && styles.cellSelected]}
                    onPress={() => onSquarePress({ row: r, col: c })}
                    disabled={!on}
                    testID={`cell-${r}-${c}`}
                    activeOpacity={0.8}
                  >
                    {p && (
                      <View style={[styles.piece, p.player === 'RED' ? styles.pieceRed : styles.pieceBlack, p.king && styles.king]}>
                        {p.king && <Text style={styles.kingText}>👑</Text>}
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetBtn} onPress={reset} testID="reset">
          <RotateCcw size={18} color={Colors.mauritanian.white} />
          <Text style={styles.resetText}>إعادة</Text>
        </TouchableOpacity>
      </View>

      {winner && (
        <View style={styles.winnerOverlay} testID="winner">
          <View style={styles.winnerCard}>
            <Text style={styles.winnerTitle}>انتهت اللعبة</Text>
            <Text style={styles.winnerText}>{winner === 'RED' ? 'فزت!' : 'فاز خصمك'}</Text>
            <TouchableOpacity style={styles.winnerBtn} onPress={reset}>
              <Text style={styles.winnerBtnText}>لعبة جديدة</Text>
            </TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: '800', color: Colors.mauritanian.white },
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  playerBadgeRed: { flexDirection: 'row', alignItems: 'center', gap: 8 as unknown as number },
  playerBadgeBlack: { flexDirection: 'row', alignItems: 'center', gap: 8 as unknown as number },
  redPiece: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#e11d48' },
  blackPiece: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#111827' },
  badgeText: { color: Colors.mauritanian.white, marginLeft: 6, fontWeight: '700' },
  countText: { color: Colors.mauritanian.white, marginLeft: 8, opacity: 0.85 },
  turnText: { color: Colors.mauritanian.white, fontWeight: '900' },

  boardWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  board: {
    width: 320,
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0b1020',
    borderWidth: 2,
    borderColor: Colors.mauritanian.gold,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  row: { flex: 1, flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cellLight: { backgroundColor: '#d6d3d1' },
  cellDark: { backgroundColor: '#4b5563' },
  cellAvailable: { backgroundColor: '#16a34a' },
  cellSelected: { backgroundColor: '#d97706' },

  piece: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  pieceRed: { backgroundColor: '#ef4444', borderColor: '#991b1b' },
  pieceBlack: { backgroundColor: '#111827', borderColor: '#374151' },
  king: { borderColor: Colors.mauritanian.gold, borderWidth: 2 },
  kingText: { color: Colors.mauritanian.gold, fontSize: 12, fontWeight: '800' },

  footer: { padding: 16, alignItems: 'center' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 as unknown as number,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetText: { color: Colors.mauritanian.white, marginLeft: 6, fontWeight: '800' },

  winnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerCard: {
    backgroundColor: '#0b1020',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.mauritanian.gold,
    width: 260,
    alignItems: 'center',
  },
  winnerTitle: { color: Colors.mauritanian.white, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  winnerText: { color: Colors.mauritanian.white, fontSize: 16, marginBottom: 12 },
  winnerBtn: { backgroundColor: Colors.mauritanian.darkGold, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  winnerBtnText: { color: Colors.mauritanian.white, fontWeight: '800' },
})