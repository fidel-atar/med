import { Tabs } from 'expo-router'
import { Users, Gamepad2, User, MessageCircle } from 'lucide-react-native'
import React from 'react'
import { Platform } from 'react-native'
import Colors from '@/constants/colors'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.mauritanian.gold,
        tabBarInactiveTintColor: Colors.mauritanian.mediumGray,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.mauritanian.white,
          borderTopWidth: 1,
          borderTopColor: Colors.mauritanian.sand,
          paddingBottom: Platform.OS === 'ios' ? 8 : 10,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 60 : 64,
          elevation: 0,
        },
        tabBarActiveBackgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.04)' : undefined,
        tabBarItemStyle: {
          paddingVertical: 6,
          marginHorizontal: 0,
          borderRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'ios' ? 12 : 11,
          fontWeight: '700',
          marginTop: 4,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'جماعتك',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'لعباتك',
          tabBarIcon: ({ color, size }) => <Gamepad2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'رسائلك',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابك',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
