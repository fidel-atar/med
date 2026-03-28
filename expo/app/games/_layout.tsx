import { Stack } from 'expo-router'

export default function GamesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[gameId]" />
      <Stack.Screen name="[gameId]/invite" options={{ presentation: 'modal' }} />
    </Stack>
  )
}