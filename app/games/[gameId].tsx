import React, { useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

// Import individual game components
import XOGame from '@/components/games/XOGame'
import TournikeGame from '@/components/games/TournikeGame'
import CarreGame from '@/components/games/CarreGame'
import AnswerWinGame from '@/components/games/AnswerWinGame'
import AlCharaGame from '@/components/games/AlCharaGame'
import KroulGame from '@/components/games/KroulGame'
import ZamatGame from '@/components/games/ZamatGame'
import BeloteGame from '@/components/games/BeloteGame'
import SarahaGame from '@/components/games/SarahaGame'
import SeikGame from '@/components/games/SeikGame'
import MicrophoneControl from '@/components/MicrophoneControl'

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()

  const renderGame = () => {
    switch (gameId) {
      case 'xo':
        return <XOGame />
      case 'tournike':
        return <TournikeGame />
      case 'carre':
        return <CarreGame />
      case 'answer-win':
        return <AnswerWinGame />
      case 'al-chara':
        return <AlCharaGame />
      case 'kroul':
        return <KroulGame />
      case 'zamat':
        return <ZamatGame />
      case 'belote':
        return <BeloteGame />
      case 'saraha':
        return <SarahaGame />
      case 'seik':
        return <SeikGame />
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>لعبة غير موجودة</Text>
            <Text style={styles.errorSubtext}>Game not found: {gameId}</Text>
          </View>
        )
    }
  }

  const onTranscript = useCallback((text: string) => {
    console.log('[Mic][Transcript]', text)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameWrapper}>
        {renderGame()}
        <MicrophoneControl onTranscript={onTranscript} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameWrapper: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
  },
})