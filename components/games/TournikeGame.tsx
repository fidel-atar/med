import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, RotateCcw, Gift } from 'lucide-react-native'
import { router } from 'expo-router'

const { width } = Dimensions.get('window')
const WHEEL_SIZE = Math.min(width * 0.8, 300)

const PRIZES = [
  { id: 1, text: '100 نقطة', color: '#FF6B6B', value: 100 },
  { id: 2, text: '50 نقطة', color: '#4ECDC4', value: 50 },
  { id: 3, text: '200 نقطة', color: '#45B7D1', value: 200 },
  { id: 4, text: '25 نقطة', color: '#F39C12', value: 25 },
  { id: 5, text: '500 نقطة', color: '#9B59B6', value: 500 },
  { id: 6, text: '75 نقطة', color: '#E74C3C', value: 75 },
  { id: 7, text: '300 نقطة', color: '#27AE60', value: 300 },
  { id: 8, text: 'حظ أوفر', color: '#95A5A6', value: 0 },
]

export default function TournikeGame() {
  const [isSpinning, setIsSpinning] = useState<boolean>(false)
  const [totalScore, setTotalScore] = useState<number>(0)
  const [spinsLeft, setSpinsLeft] = useState<number>(5)
  const [lastPrize, setLastPrize] = useState<string>('')
  const spinValue = useRef(new Animated.Value(0)).current

  const spinWheel = () => {
    if (isSpinning || spinsLeft <= 0) return

    setIsSpinning(true)
    setSpinsLeft(prev => prev - 1)

    // Random rotation between 1080 and 2160 degrees (3-6 full rotations)
    const randomRotation = Math.random() * 1080 + 1080
    
    Animated.timing(spinValue, {
      toValue: randomRotation,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      // Calculate which prize was won
      const normalizedRotation = randomRotation % 360
      const prizeIndex = Math.floor((360 - normalizedRotation + 22.5) / 45) % 8
      const wonPrize = PRIZES[prizeIndex]
      
      setLastPrize(wonPrize.text)
      setTotalScore(prev => prev + wonPrize.value)
      setIsSpinning(false)

      // Show prize alert
      if (wonPrize.value > 0) {
        Alert.alert(
          'مبروك! 🎉',
          `لقد ربحت ${wonPrize.text}!`,
          [{ text: 'رائع!', style: 'default' }]
        )
      } else {
        Alert.alert(
          'حظ أوفر المرة القادمة',
          'لم تربح هذه المرة، جرب مرة أخرى!',
          [{ text: 'حسناً', style: 'default' }]
        )
      }
    })
  }

  const resetGame = () => {
    spinValue.setValue(0)
    setTotalScore(0)
    setSpinsLeft(5)
    setLastPrize('')
    setIsSpinning(false)
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

  const renderWheelSegments = () => {
    return PRIZES.map((prize, index) => {
      const rotation = (index * 45) - 22.5
      return (
        <View
          key={prize.id}
          style={[
            styles.segment,
            {
              transform: [{ rotate: `${rotation}deg` }],
              backgroundColor: prize.color,
            },
          ]}
        >
          <Text style={styles.segmentText}>{prize.text}</Text>
        </View>
      )
    })
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goHome} style={styles.headerButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>تورنيك</Text>
        <TouchableOpacity onPress={resetGame} style={styles.headerButton}>
          <RotateCcw size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Gift size={20} color="#FFD700" />
            <Text style={styles.scoreText}>{totalScore}</Text>
            <Text style={styles.scoreLabel}>النقاط الإجمالية</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.spinsText}>{spinsLeft}</Text>
            <Text style={styles.scoreLabel}>محاولات متبقية</Text>
          </View>
        </View>

        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [
                  {
                    rotate: spinValue.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            {renderWheelSegments()}
          </Animated.View>
          
          <View style={styles.pointer} />
        </View>

        <TouchableOpacity
          style={[
            styles.spinButton,
            (isSpinning || spinsLeft <= 0) && styles.spinButtonDisabled,
          ]}
          onPress={spinWheel}
          disabled={isSpinning || spinsLeft <= 0}
        >
          <Text style={styles.spinButtonText}>
            {isSpinning ? 'جاري الدوران...' : spinsLeft > 0 ? 'أدر العجلة' : 'انتهت المحاولات'}
          </Text>
        </TouchableOpacity>

        {lastPrize !== '' && (
          <View style={styles.lastPrizeContainer}>
            <Text style={styles.lastPrizeLabel}>آخر جائزة:</Text>
            <Text style={styles.lastPrizeText}>{lastPrize}</Text>
          </View>
        )}
      </View>

      {spinsLeft <= 0 && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>انتهت اللعبة!</Text>
          <Text style={styles.gameOverScore}>النقاط النهائية: {totalScore}</Text>
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
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 4,
  },
  spinsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  wheelContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    position: 'relative',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  segment: {
    position: 'absolute',
    width: WHEEL_SIZE / 2,
    height: WHEEL_SIZE / 2,
    top: WHEEL_SIZE / 4,
    left: WHEEL_SIZE / 4,
    transformOrigin: `${WHEEL_SIZE / 4}px ${WHEEL_SIZE / 4}px`,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointer: {
    position: 'absolute',
    top: -10,
    left: WHEEL_SIZE / 2 - 10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    zIndex: 10,
  },
  spinButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  spinButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  spinButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  lastPrizeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  lastPrizeLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lastPrizeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 4,
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