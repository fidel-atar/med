import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, RotateCcw, User, Users } from 'lucide-react-native'
import { router } from 'expo-router'

const { width } = Dimensions.get('window')
const BOARD_SIZE = Math.min(width * 0.9, 350)
const CELL_SIZE = BOARD_SIZE / 6

type CellState = 'empty' | 'player1' | 'player2'
type GameState = 'playing' | 'finished'

interface GameBoard {
  cells: CellState[][]
  currentPlayer: 1 | 2
  gameState: GameState
  winner: 1 | 2 | null
  player1Score: number
  player2Score: number
}

export default function CarreGame() {
  const [game, setGame] = useState<GameBoard>({
    cells: Array(6).fill(null).map(() => Array(6).fill('empty')),
    currentPlayer: 1,
    gameState: 'playing',
    winner: null,
    player1Score: 0,
    player2Score: 0,
  })

  const checkForSquares = (newCells: CellState[][], player: 1 | 2): number => {
    let squares = 0
    const playerState = `player${player}` as CellState

    // Check for 2x2 squares
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (
          newCells[row][col] === playerState &&
          newCells[row][col + 1] === playerState &&
          newCells[row + 1][col] === playerState &&
          newCells[row + 1][col + 1] === playerState
        ) {
          squares++
        }
      }
    }

    return squares
  }

  const makeMove = (row: number, col: number) => {
    if (game.gameState !== 'playing' || game.cells[row][col] !== 'empty') {
      return
    }

    const newCells = game.cells.map(r => [...r])
    newCells[row][col] = `player${game.currentPlayer}` as CellState

    const player1Squares = checkForSquares(newCells, 1)
    const player2Squares = checkForSquares(newCells, 2)

    // Check if board is full
    const isBoardFull = newCells.every(row => row.every(cell => cell !== 'empty'))

    let winner: 1 | 2 | null = null
    let gameState: GameState = 'playing'

    if (isBoardFull || player1Squares >= 3 || player2Squares >= 3) {
      gameState = 'finished'
      if (player1Squares > player2Squares) {
        winner = 1
      } else if (player2Squares > player1Squares) {
        winner = 2
      } else {
        winner = null // Draw
      }
    }

    setGame({
      cells: newCells,
      currentPlayer: game.currentPlayer === 1 ? 2 : 1,
      gameState,
      winner,
      player1Score: player1Squares,
      player2Score: player2Squares,
    })

    if (gameState === 'finished') {
      setTimeout(() => {
        if (winner) {
          Alert.alert(
            'انتهت اللعبة! 🎉',
            `فاز اللاعب ${winner}!\nالنتيجة: ${winner === 1 ? player1Squares : player2Squares} مربعات`,
            [{ text: 'رائع!', style: 'default' }]
          )
        } else {
          Alert.alert(
            'تعادل!',
            `انتهت اللعبة بالتعادل\nاللاعب 1: ${player1Squares} مربعات\nاللاعب 2: ${player2Squares} مربعات`,
            [{ text: 'حسناً', style: 'default' }]
          )
        }
      }, 500)
    }
  }

  const resetGame = () => {
    setGame({
      cells: Array(6).fill(null).map(() => Array(6).fill('empty')),
      currentPlayer: 1,
      gameState: 'playing',
      winner: null,
      player1Score: 0,
      player2Score: 0,
    })
  }

  const goHome = () => {
    Alert.alert(
      'العودة للقائمة',
      'هل تريد العودة لقائمة الألعاب؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'نعم', onPress: () => router.back() },
      ]
    )
  }

  const getCellColor = (cellState: CellState): string => {
    switch (cellState) {
      case 'player1':
        return '#FF6B6B'
      case 'player2':
        return '#4ECDC4'
      default:
        return '#f0f0f0'
    }
  }

  const renderBoard = () => {
    return game.cells.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <TouchableOpacity
          key={`${rowIndex}-${colIndex}`}
          style={[
            styles.cell,
            { backgroundColor: getCellColor(cell) },
            cell !== 'empty' && styles.filledCell,
          ]}
          onPress={() => makeMove(rowIndex, colIndex)}
          disabled={game.gameState !== 'playing' || cell !== 'empty'}
        >
          {cell !== 'empty' && (
            <View style={styles.piece}>
              {cell === 'player1' ? (
                <User size={CELL_SIZE * 0.4} color="#fff" />
              ) : (
                <Users size={CELL_SIZE * 0.4} color="#fff" />
              )}
            </View>
          )}
        </TouchableOpacity>
      ))
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goHome} style={styles.headerButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>كاريه</Text>
        <TouchableOpacity onPress={resetGame} style={styles.headerButton}>
          <RotateCcw size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.scoreContainer}>
          <View style={[styles.playerInfo, game.currentPlayer === 1 && styles.activePlayer]}>
            <View style={[styles.playerColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.playerText}>اللاعب 1</Text>
            <Text style={styles.scoreText}>{game.player1Score}</Text>
          </View>
          
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.turnText}>
              {game.gameState === 'playing' ? `دور اللاعب ${game.currentPlayer}` : 'انتهت اللعبة'}
            </Text>
          </View>

          <View style={[styles.playerInfo, game.currentPlayer === 2 && styles.activePlayer]}>
            <View style={[styles.playerColor, { backgroundColor: '#4ECDC4' }]} />
            <Text style={styles.playerText}>اللاعب 2</Text>
            <Text style={styles.scoreText}>{game.player2Score}</Text>
          </View>
        </View>

        <View style={styles.boardContainer}>
          <View style={styles.board}>
            {renderBoard()}
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>كيفية اللعب:</Text>
          <Text style={styles.instructionsText}>
            • اضغط على المربعات الفارغة لوضع قطعتك
          </Text>
          <Text style={styles.instructionsText}>
            • اهدف لتكوين مربعات 2×2 من قطعك
          </Text>
          <Text style={styles.instructionsText}>
            • الفائز هو من يكون أكثر مربعات
          </Text>
        </View>
      </View>

      {game.gameState === 'finished' && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>
            {game.winner ? `فاز اللاعب ${game.winner}!` : 'تعادل!'}
          </Text>
          <Text style={styles.gameOverScore}>
            اللاعب 1: {game.player1Score} مربعات
          </Text>
          <Text style={styles.gameOverScore}>
            اللاعب 2: {game.player2Score} مربعات
          </Text>
          <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
            <Text style={styles.playAgainText}>العب مرة أخرى</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  playerInfo: {
    alignItems: 'center',
    opacity: 0.7,
  },
  activePlayer: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  playerColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  playerText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  vsContainer: {
    alignItems: 'center',
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  turnText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  boardContainer: {
    marginBottom: 20,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledCell: {
    borderColor: '#333',
  },
  piece: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textAlign: 'right',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  gameOverScore: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  playAgainButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 20,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
})