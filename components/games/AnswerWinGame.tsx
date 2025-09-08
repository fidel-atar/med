import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, RotateCcw, Clock, Trophy } from 'lucide-react-native'
import { router } from 'expo-router'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  category: string
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'ما هي عاصمة موريتانيا؟',
    options: ['نواكشوط', 'نواذيبو', 'كيفة', 'أطار'],
    correctAnswer: 0,
    category: 'جغرافيا',
  },
  {
    id: 2,
    question: 'كم عدد أيام السنة الميلادية؟',
    options: ['364', '365', '366', '367'],
    correctAnswer: 1,
    category: 'عامة',
  },
  {
    id: 3,
    question: 'ما هو أكبر كوكب في المجموعة الشمسية؟',
    options: ['الأرض', 'المشتري', 'زحل', 'المريخ'],
    correctAnswer: 1,
    category: 'علوم',
  },
  {
    id: 4,
    question: 'من هو مؤلف رواية "الأسود يليق بك"؟',
    options: ['أحلام مستغانمي', 'نجيب محفوظ', 'طه حسين', 'عباس العقاد'],
    correctAnswer: 0,
    category: 'أدب',
  },
  {
    id: 5,
    question: 'كم عدد لاعبي فريق كرة القدم في الملعب؟',
    options: ['10', '11', '12', '9'],
    correctAnswer: 1,
    category: 'رياضة',
  },
  {
    id: 6,
    question: 'ما هي أطول سورة في القرآن الكريم؟',
    options: ['البقرة', 'آل عمران', 'النساء', 'المائدة'],
    correctAnswer: 0,
    category: 'دين',
  },
  {
    id: 7,
    question: 'في أي قارة تقع موريتانيا؟',
    options: ['آسيا', 'أوروبا', 'أفريقيا', 'أمريكا'],
    correctAnswer: 2,
    category: 'جغرافيا',
  },
  {
    id: 8,
    question: 'كم عدد أحرف الأبجدية العربية؟',
    options: ['26', '27', '28', '29'],
    correctAnswer: 2,
    category: 'لغة',
  },
]

export default function AnswerWinGame() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(30)
  const [gameState, setGameState] = useState<'playing' | 'finished' | 'paused'>('playing')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState<boolean>(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [fadeAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    // Shuffle questions and take 5 random ones
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5)
    setQuestions(shuffled)
  }, [])



  const handleTimeUp = () => {
    setGameState('finished')
    Alert.alert(
      'انتهى الوقت! ⏰',
      `لقد انتهى الوقت المحدد\nنقاطك النهائية: ${score}`,
      [{ text: 'حسناً', style: 'default' }]
    )
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimeUp()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, gameState, score])



  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || gameState !== 'playing') return

    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer
    if (isCorrect) {
      setScore(prev => prev + 10)
    }

    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(30)
      } else {
        setGameState('finished')
        Alert.alert(
          'انتهت اللعبة! 🎉',
          `لقد أجبت على جميع الأسئلة!\nنقاطك النهائية: ${score + (isCorrect ? 10 : 0)} من ${questions.length * 10}`,
          [{ text: 'رائع!', style: 'default' }]
        )
      }
    }, 2000)
  }

  const resetGame = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5)
    setQuestions(shuffled)
    setCurrentQuestion(0)
    setScore(0)
    setTimeLeft(30)
    setGameState('playing')
    setSelectedAnswer(null)
    setShowResult(false)
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

  const getOptionStyle = (index: number) => {
    if (!showResult) return styles.option

    if (index === questions[currentQuestion].correctAnswer) {
      return [styles.option, styles.correctOption]
    } else if (index === selectedAnswer) {
      return [styles.option, styles.wrongOption]
    }
    return [styles.option, styles.disabledOption]
  }

  if (questions.length === 0) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري تحضير الأسئلة...</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goHome} style={styles.headerButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>أجب واربح</Text>
        <TouchableOpacity onPress={resetGame} style={styles.headerButton}>
          <RotateCcw size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.gameInfo}>
          <View style={styles.infoItem}>
            <Clock size={20} color="#fff" />
            <Text style={styles.infoText}>{timeLeft}s</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.questionCounter}>
              {currentQuestion + 1}/{questions.length}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Trophy size={20} color="#FFD700" />
            <Text style={styles.infoText}>{score}</Text>
          </View>
        </View>

        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{questions[currentQuestion].category}</Text>
          </View>
          
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>

          <View style={styles.optionsContainer}>
            {questions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(index)}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null || gameState !== 'playing'}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            التقدم: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </Text>
        </View>
      </View>

      {gameState === 'finished' && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>انتهت اللعبة!</Text>
          <Text style={styles.gameOverScore}>النقاط النهائية: {score}</Text>
          <Text style={styles.gameOverPercentage}>
            النسبة: {Math.round((score / (questions.length * 10)) * 100)}%
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  questionCounter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  correctOption: {
    backgroundColor: 'rgba(39, 174, 96, 0.3)',
    borderColor: '#27AE60',
  },
  wrongOption: {
    backgroundColor: 'rgba(231, 76, 60, 0.3)',
    borderColor: '#E74C3C',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
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
  gameOverPercentage: {
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