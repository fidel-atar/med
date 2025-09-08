import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import Colors from '@/constants/colors'
import { Search, X } from 'lucide-react-native'

interface ResultItem {
  id: string
  title: string
  type: 'user' | 'post' | 'game'
}

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState<string>('')

  const data: ResultItem[] = useMemo(() => {
    const base: ResultItem[] = [
      { id: 'u-1', title: 'محمد الأمين', type: 'user' },
      { id: 'p-1', title: 'أفضل صور من الصحراء', type: 'post' },
      { id: 'g-1', title: 'لعبة لودو', type: 'game' },
      { id: 'u-2', title: 'فاطمة علي', type: 'user' },
      { id: 'p-2', title: 'نصيحة اليوم', type: 'post' },
    ]
    if (!query.trim()) return base
    const q = query.trim().toLowerCase()
    return base.filter(i => i.title.toLowerCase().includes(q))
  }, [query])

  const onPressItem = useCallback((item: ResultItem) => {
    console.log('[Search] item pressed', item)
    if (item.type === 'user') router.push(`/user/${item.id}` as const)
    if (item.type === 'post') console.log('Open post', item.id)
    if (item.type === 'game') router.push('/games' as const)
  }, [router])

  const renderItem = useCallback(({ item }: { item: ResultItem }) => (
    <TouchableOpacity
      testID={`search-item-${item.id}`}
      style={styles.item}
      onPress={() => onPressItem(item)}
    >
      <Text style={styles.itemType}>{item.type === 'user' ? 'مستخدم' : item.type === 'post' ? 'منشور' : 'لعبة'}</Text>
      <Text style={styles.itemTitle}>{item.title}</Text>
    </TouchableOpacity>
  ), [onPressItem])

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'بحث' }} />

      <View style={styles.searchBar}>
        <Search size={18} color={Colors.mauritanian.mediumGray} />
        <TextInput
          testID="search-input"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث عن أشخاص أو منشورات أو لعب"
          placeholderTextColor={Colors.mauritanian.mediumGray}
        />
        {!!query && (
          <TouchableOpacity
            testID="clear-query"
            onPress={() => setQuery('')}
            style={styles.clearBtn}
          >
            <X size={16} color={Colors.mauritanian.mediumGray} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        testID="search-results"
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mauritanian.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.sand,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: Colors.mauritanian.darkGray,
  },
  clearBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: Colors.mauritanian.lightSand,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  item: {
    backgroundColor: Colors.mauritanian.white,
    borderRadius: Platform.OS === 'ios' ? 14 : 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: Platform.OS === 'ios' ? 1 : 0.5,
    borderColor: Colors.mauritanian.sand,
  },
  itemType: {
    fontSize: 12,
    color: Colors.mauritanian.mediumGray,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    color: Colors.mauritanian.mauritanianBlue,
    fontWeight: '700',
  },
})
