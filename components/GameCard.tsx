import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Lock, Users, Crown, Star } from 'lucide-react-native'
import Colors from '@/constants/colors'

interface GameCardProps {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  maxPlayers: number
  isPremium: boolean
  color: string
  isSubscriber: boolean
  onPress: () => void
}

export default function GameCard({
  name,
  nameAr,
  description,
  descriptionAr,
  icon,
  maxPlayers,
  isPremium,
  color,
  isSubscriber,
  onPress,
}: GameCardProps) {
  const canPlay = !isPremium || isSubscriber

  return (
    <TouchableOpacity
      style={[styles.container, !canPlay && styles.lockedContainer]}
      onPress={canPlay ? onPress : undefined}
      disabled={!canPlay}
    >
      <LinearGradient
        colors={canPlay ? [color, `${color}CC`] : ['#ccc', '#999']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
              {canPlay && <Star size={12} color={Colors.mauritanian.gold} fill={Colors.mauritanian.gold} style={styles.starIcon} />}
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                {canPlay ? (
                  <Crown size={16} color={Colors.mauritanian.gold} fill={Colors.mauritanian.gold} />
                ) : (
                  <Lock size={16} color={Colors.mauritanian.mediumGray} />
                )}
              </View>
            )}
          </View>
          
          <Text style={[styles.name, !canPlay && styles.lockedText]}>
            {nameAr}
          </Text>
          <Text style={[styles.nameEn, !canPlay && styles.lockedText]}>
            {name}
          </Text>
          
          <Text style={[styles.description, !canPlay && styles.lockedText]}>
            {descriptionAr}
          </Text>
          
          <View style={styles.footer}>
            <View style={styles.playersInfo}>
              <Users size={16} color={canPlay ? "#fff" : "#666"} />
              <Text style={[styles.playersText, !canPlay && styles.lockedText]}>
                {maxPlayers === 1 ? 'فردي' : `${maxPlayers} لاعبين`}
              </Text>
            </View>
            
            {!canPlay && (
              <View style={styles.upgradeContainer}>
                <Crown size={12} color={Colors.mauritanian.gold} />
                <Text style={styles.upgradeText}>اشترك للعب</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: Platform.OS === 'ios' ? 8 : 6,
    borderRadius: Platform.OS === 'ios' ? 20 : 16,
    overflow: 'hidden',
    shadowColor: Colors.mauritanian.mauritanianBlue,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 6 : 8,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.3,
    shadowRadius: Platform.OS === 'ios' ? 12 : 15,
    elevation: Platform.OS === 'android' ? 12 : 0,
    borderWidth: Platform.OS === 'ios' ? 2 : 1.5,
    borderColor: Colors.mauritanian.gold,
  },
  lockedContainer: {
    opacity: 0.6,
    borderColor: Colors.mauritanian.mediumGray,
  },
  gradient: {
    flex: 1,
    padding: Platform.OS === 'ios' ? 18 : 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  starIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: Platform.OS === 'ios' ? 15 : 12,
    padding: Platform.OS === 'ios' ? 6 : 5,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  name: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: Platform.OS === 'ios' ? '800' : '700',
    color: Colors.mauritanian.white,
    textAlign: 'right',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nameEn: {
    fontSize: Platform.OS === 'ios' ? 14 : 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'right',
    marginBottom: Platform.OS === 'ios' ? 10 : 8,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
  },
  description: {
    fontSize: Platform.OS === 'ios' ? 14 : 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
    lineHeight: Platform.OS === 'ios' ? 22 : 20,
    flex: 1,
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  playersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Platform.OS === 'ios' ? 8 : 6,
    paddingVertical: Platform.OS === 'ios' ? 4 : 3,
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
  },
  playersText: {
    color: Colors.mauritanian.white,
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  upgradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: Platform.OS === 'ios' ? 8 : 6,
    paddingVertical: Platform.OS === 'ios' ? 4 : 3,
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.gold,
  },
  upgradeText: {
    color: Colors.mauritanian.gold,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  lockedText: {
    color: Colors.mauritanian.mediumGray,
  },
})