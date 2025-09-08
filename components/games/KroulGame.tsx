import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, RotateCcw } from 'lucide-react-native'
import { router } from 'expo-router'

export default function KroulGame() {
  const [gameStarted, setGameStarted] = useState<boolean>(false)

  const startGame = () => {
    setGameStarted(true)
    Alert.alert(
      'كرول - اللعبة التقليدية',
      'هذه لعبة الحجارة الموريتانية التقليدية. سيتم تطويرها قريباً!',
      [{ text: 'حسناً', onPress: () => setGameStarted(false) }]
    )
  }

  const goHome = () => {
    router.back()
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goHome} style={styles.headerButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>كرول</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.gameTitle}>🪨 كرول</Text>
        <Text style={styles.gameSubtitle}>لعبة الحجارة الموريتانية التقليدية</Text>
        
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            لعبة كرول هي من الألعاب التراثية الموريتانية العريقة
          </Text>
          <Text style={styles.descriptionText}>
            تُلعب بالحجارة الصغيرة وتتطلب مهارة ودقة
          </Text>
          <Text style={styles.descriptionText}>
            قريباً ستكون متاحة بشكل كامل!
          </Text>
        </View>

        <TouchableOpacity style={styles.playButton} onPress={startGame}>
          <Text style={styles.playButtonText}>جرب اللعبة</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  gameSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  description: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
  },
  descriptionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  playButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
})