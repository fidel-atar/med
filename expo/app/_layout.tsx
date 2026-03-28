import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BackHandler, Platform } from 'react-native'
import { AuthProvider } from '@/contexts/AuthContext'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

function RootLayoutNav() {
  const router = useRouter()

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'android') return
    const onBackPress = () => {
      try {
        if (router.canGoBack?.()) {
          console.log('[BackHandler] going back')
          router.back()
          return true
        }
        console.log('[BackHandler] no screen to go back to — preventing default')
        return true
      } catch (e) {
        console.log('[BackHandler] error handling back press', e)
        return true
      }
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress)
    return () => sub.remove()
  }, [router])

  return (
    <Stack screenOptions={{ headerBackTitle: 'رجوع' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="games" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: true }} />
      <Stack.Screen name="payments" options={{ headerShown: true }} />
      <Stack.Screen name="subscribe" options={{ headerShown: false }} />
      <Stack.Screen name="user" options={{ headerShown: false }} />
      <Stack.Screen name="story/[storyId]" options={{ headerShown: false, title: '' }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ title: 'بحث' }} />
      <Stack.Screen name="notifications" options={{ title: 'الإشعارات' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  )
}