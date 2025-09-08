import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '@/constants/colors'

interface MauritanianPatternProps {
  size?: number
  style?: any
}

export default function MauritanianPattern({ size = 40, style }: MauritanianPatternProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LinearGradient
        colors={[Colors.mauritanian.gold, Colors.mauritanian.amber, Colors.mauritanian.darkGold]}
        style={styles.outerCircle}
      >
        <View style={styles.innerPattern}>
          <View style={styles.centerDot} />
          <View style={[styles.smallDot, styles.topDot]} />
          <View style={[styles.smallDot, styles.rightDot]} />
          <View style={[styles.smallDot, styles.bottomDot]} />
          <View style={[styles.smallDot, styles.leftDot]} />
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.mauritanian.mauritanianBlue,
  },
  innerPattern: {
    width: '70%',
    height: '70%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mauritanian.mauritanianBlue,
    position: 'absolute',
  },
  smallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.mauritanian.white,
    position: 'absolute',
  },
  topDot: {
    top: 2,
  },
  rightDot: {
    right: 2,
  },
  bottomDot: {
    bottom: 2,
  },
  leftDot: {
    left: 2,
  },
})