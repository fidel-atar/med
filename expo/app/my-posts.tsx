import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, router } from 'expo-router'
import { Search, ArrowLeft } from 'lucide-react-native'
import PostCard from '@/components/PostCard'
import { usePosts } from '@/hooks/usePosts'

interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  video?: string
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  is_sponsored: boolean
  sponsor_name?: string
  profiles: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    is_subscriber: boolean
  }
}

type FilterType = 'all' | 'images' | 'videos' | 'text'

export default function MyPostsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { posts } = usePosts()

  // Filter posts to show only current user's posts
  const currentUserId = 'user123' // This should come from auth context
  const myPosts = (posts as Post[]).filter((post: Post) => post.user_id === currentUserId)

  // Apply search and filter
  const filteredPosts = myPosts.filter((post: Post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeFilter === 'all') return matchesSearch
    if (activeFilter === 'images') return matchesSearch && post.image_url
    if (activeFilter === 'videos') return matchesSearch && post.video
    if (activeFilter === 'text') return matchesSearch && !post.image_url && !post.video
    
    return matchesSearch
  })

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: myPosts.length },
    { key: 'images', label: 'الصور', count: myPosts.filter((p: Post) => p.image_url).length },
    { key: 'videos', label: 'الفيديو', count: myPosts.filter((p: Post) => p.video).length },
    { key: 'text', label: 'النص', count: myPosts.filter((p: Post) => !p.image_url && !p.video).length },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'منشوراتي',
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في منشوراتي..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter.key && styles.activeFilterText,
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContainer}
      >
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد منشورات'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'جرب البحث بكلمات مختلفة'
                : 'ابدأ بإنشاء منشورك الأول'
              }
            </Text>
          </View>
        ) : (
          filteredPosts.map((post: Post) => (
            <PostCard 
              key={post.id}
              id={post.id}
              username={post.profiles.full_name}
              userId={post.profiles.id}
              avatar={post.profiles.avatar_url}
              content={post.content}
              imageUrl={post.image_url}
              videoUrl={post.video}
              likesCount={post.likes_count}
              commentsCount={post.comments_count}
              viewsCount={post.views_count}
              isPromoted={post.is_sponsored}
              isSubscriber={post.profiles.is_subscriber}
              createdAt={post.created_at}
              sponsorName={post.sponsor_name}
              onLike={() => console.log('Like post', post.id)}
              onComment={() => console.log('Comment on post', post.id)}
              onShare={() => console.log('Share post', post.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingRight: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  postsContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
})