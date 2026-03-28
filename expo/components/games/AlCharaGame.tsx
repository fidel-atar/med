import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, RotateCcw, Target, Zap } from 'lucide-react-native'
import { router } from 'expo-router'

const { width, height } = Dimensions.get('window')
const GAME_WIDTH = width - 40
const GAME_HEIGHT = height * 0.7

export default function AlCharaGame() {
  const [score, setScore] = useState<number>(0)
  const [shots, setShots] = useState<number>(10)
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; hit: boolean }[]>([])
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing')
  const crosshairPosition = useRef(new Animated.ValueXY({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 })).current

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newX = Math.max(20, Math.min(GAME_WIDTH - 20, gestureState.moveX - 20))
      const newY = Math.max(20, Math.min(GAME_HEIGHT - 20, gestureState.moveY - 100))
      
      crosshairPosition.setValue({ x: newX, y: newY })
    },
  })

  const generateTargets = () => {
    const newTargets = []
    for (let i = 0; i < 5; i++) {
      newTargets.push({
        id: i,
        x: Math.random() * (GAME_WIDTH - 60) + 30,
        y: Math.random() * (GAME_HEIGHT - 60) + 30,
        hit: false,
      })
    }
    setTargets(newTargets)
  }

  React.useEffect(() => {
    generateTargets()
  }, [])

  const shoot = () => {
    if (shots <= 0 || gameState !== 'playing') return

    setShots(prev => prev - 1)

    // Get crosshair position
    const crosshairX = (crosshairPosition.x as any)._value
    const crosshairY = (crosshairPosition.y as any)._value

    // Check if any target is hit
    let hit = false
    const updatedTargets = targets.map(target => {
      if (!target.hit) {
        const distance = Math.sqrt(
          Math.pow(crosshairX - target.x, 2) + Math.pow(crosshairY - target.y, 2)
        )
        if (distance < 30) {
          hit = true
          setScore(prev => prev + 10)
          return { ...target, hit: true }
        }
      }
      return target
    })

    setTargets(updatedTargets)

    // Check if all targets are hit or no shots left
    const allHit = updatedTargets.every(target => target.hit)
    if (allHit || shots - 1 <= 0) {
      setGameState('finished')
      setTimeout(() => {
        Alert.alert(
          'انتهت اللعبة! 🎯',
          `النقاط النهائية: ${score + (hit ? 10 : 0)}\nالأهداف المصابة: ${updatedTargets.filter(t => t.hit).length}/5`,
          [{ text: 'رائع!', style: 'default' }]
        )
      }, 500)
    }
  }

  const resetGame = () => {
    setScore(0)
    setShots(10)
    setGameState('playing')
    generateTargets()
    crosshairPosition.setValue({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 })
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

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goHome} style={styles.headerButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>الشارة</Text>
        <TouchableOpacity onPress={resetGame} style={styles.headerButton}>
          <RotateCcw size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.gameInfo}>
        <View style={styles.infoItem}>
          <Target size={20} color="#fff" />
          <Text style={styles.infoText}>{score}</Text>
          <Text style={styles.infoLabel}>النقاط</Text>
        </View>
        <View style={styles.infoItem}>
          <Zap size={20} color="#fff" />
          <Text style={styles.infoText}>{shots}</Text>
          <Text style={styles.infoLabel}>طلقات متبقية</Text>
        </View>
      </View>

      <View style={styles.gameArea} {...panResponder.panHandlers}>
        <View style={styles.gameField}>
          {targets.map(target => (
            <View
              key={target.id}
              style={[
                styles.target,
                {
                  left: target.x,
                  top: target.y,
                  backgroundColor: target.hit ? '#27AE60' : '#E74C3C',
                },
              ]}
            >
              <Text style={styles.targetText}>{target.hit ? '✓' : '🎯'}</Text>
            </View>
          ))}

          <Animated.View
            style={[
              styles.crosshair,
              {
                transform: crosshairPosition.getTranslateTransform(),
              },
            ]}
          >
            <View style={styles.crosshairHorizontal} />
            <View style={styles.crosshairVertical} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.shootButton, (shots <= 0 || gameState !== 'playing') && styles.shootButtonDisabled]}
          onPress={shoot}
          disabled={shots <= 0 || gameState !== 'playing'}
        >
          <Text style={styles.shootButtonText}>
            {gameState === 'playing' ? 'اطلق النار' : 'انتهت اللعبة'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.instructions}>
          اسحب لتحريك المنظار واضغط &quot;اطلق النار&quot; لإصابة الأهداف
        </Text>
      </View>

      {gameState === 'finished' && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>انتهت اللعبة!</Text>
          <Text style={styles.gameOverScore}>النقاط النهائية: {score}</Text>
          <Text style={styles.gameOverTargets}>
            الأهداف المصابة: {targets.filter(t => t.hit).length}/5
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
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  gameArea: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  gameField: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  target: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  targetText: {
    fontSize: 16,
    color: '#fff',
  },
  crosshair: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 40,
    height: 2,
    backgroundColor: '#FFD700',
  },
  crosshairVertical: {
    position: 'absolute',
    width: 2,
    height: 40,
    backgroundColor: '#FFD700',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  shootButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shootButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  shootButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
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
    color: '#fff',
    marginBottom: 16,
  },
  gameOverScore: {
    fontSize: 24,
    color: '#FFD700',
    marginBottom: 8,
  },
  gameOverTargets: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 32,
  },
  playAgainButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
})