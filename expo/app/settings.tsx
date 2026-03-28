import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,

  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  Bell,
  Volume2,
  VolumeX,
  Globe,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  LogOut,
  User,
  CreditCard,
  Users,
  X,
} from 'lucide-react-native'
import { useAuth } from '@/contexts/AuthContext'

type SettingsItem = {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  type: 'toggle' | 'navigation' | 'action'
  value?: boolean
  onPress?: () => void
  onToggle?: (value: boolean) => void
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [vibration, setVibration] = useState(true)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('العربية')

  const languages = ['العربية', 'English', 'Français']

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setNotifications(settings.notifications ?? true)
        setSounds(settings.sounds ?? true)
        setDarkMode(settings.darkMode ?? false)
        setVibration(settings.vibration ?? true)
        setSelectedLanguage(settings.language ?? 'العربية')
      }
    } catch (error) {
      console.log('Error loading settings:', error)
    }
  }

  const saveSettings = async (newSettings: any) => {
    try {
      const currentSettings = {
        notifications,
        sounds,
        darkMode,
        vibration,
        language: selectedLanguage,
        ...newSettings
      }
      await AsyncStorage.setItem('app_settings', JSON.stringify(currentSettings))
    } catch (error) {
      console.log('Error saving settings:', error)
    }
  }

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value)
    saveSettings({ notifications: value })
    if (Platform.OS !== 'web') {
      // Here you would integrate with expo-notifications
      console.log('Notifications:', value ? 'enabled' : 'disabled')
    }
  }

  const handleSoundsToggle = (value: boolean) => {
    setSounds(value)
    saveSettings({ sounds: value })
    console.log('Sounds:', value ? 'enabled' : 'disabled')
  }

  const handleVibrationToggle = (value: boolean) => {
    setVibration(value)
    saveSettings({ vibration: value })
    console.log('Vibration:', value ? 'enabled' : 'disabled')
  }

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value)
    saveSettings({ darkMode: value })
    console.log('Dark mode:', value ? 'enabled' : 'disabled')
  }

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    saveSettings({ language })
    setShowLanguageModal(false)
    Alert.alert('تم التغيير', `تم تغيير اللغة إلى ${language}`)
  }

  const handleSignOut = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
              router.replace('/')
            } catch {
              Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج')
            }
          }
        }
      ]
    )
  }

  const settingsData: SettingsItem[] = [
    {
      id: 'notifications',
      title: 'الإشعارات',
      subtitle: 'تلقي إشعارات الألعاب والرسائل',
      icon: <Bell size={24} color="#4ECDC4" />,
      type: 'toggle',
      value: notifications,
      onToggle: handleNotificationToggle,
    },
    {
      id: 'sounds',
      title: 'الأصوات',
      subtitle: 'تشغيل أصوات الألعاب والتأثيرات',
      icon: sounds ? <Volume2 size={24} color="#4ECDC4" /> : <VolumeX size={24} color="#999" />,
      type: 'toggle',
      value: sounds,
      onToggle: handleSoundsToggle,
    },
    {
      id: 'vibration',
      title: 'الاهتزاز',
      subtitle: 'اهتزاز الجهاز عند اللعب',
      icon: <Smartphone size={24} color="#4ECDC4" />,
      type: 'toggle',
      value: vibration,
      onToggle: handleVibrationToggle,
    },
    {
      id: 'darkMode',
      title: 'الوضع الليلي',
      subtitle: 'تفعيل المظهر الداكن',
      icon: darkMode ? <Moon size={24} color="#4ECDC4" /> : <Sun size={24} color="#FFD700" />,
      type: 'toggle',
      value: darkMode,
      onToggle: handleDarkModeToggle,
    },
    {
      id: 'profile',
      title: 'الملف الشخصي',
      subtitle: 'تعديل معلومات الحساب',
      icon: <User size={24} color="#4ECDC4" />,
      type: 'navigation',
      onPress: () => router.push('/profile'),
    },
    {
      id: 'payments',
      title: 'المدفوعات والاشتراكات',
      subtitle: 'إدارة طرق الدفع والاشتراكات',
      icon: <CreditCard size={24} color="#4ECDC4" />,
      type: 'navigation',
      onPress: () => router.push('/payments'),
    },
    {
      id: 'friends',
      title: 'الأصدقاء',
      subtitle: 'إدارة قائمة الأصدقاء',
      icon: <Users size={24} color="#4ECDC4" />,
      type: 'navigation',
      onPress: () => router.push('/friends'),
    },
    {
      id: 'language',
      title: 'اللغة',
      subtitle: selectedLanguage,
      icon: <Globe size={24} color="#4ECDC4" />,
      type: 'navigation',
      onPress: () => setShowLanguageModal(true),
    },
    {
      id: 'privacy',
      title: 'الخصوصية والأمان',
      subtitle: 'إدارة بيانات الحساب',
      icon: <Shield size={24} color="#4ECDC4" />,
      type: 'navigation',
      onPress: () => setShowPrivacyModal(true),
    },
    {
      id: 'help',
      title: 'المساعدة والدعم',
      subtitle: 'الحصول على المساعدة',
      icon: <HelpCircle size={24} color="#4ECDC4" />,
      type: 'navigation',
      onPress: () => setShowHelpModal(true),
    },
    {
      id: 'about',
      title: 'حول التطبيق',
      subtitle: 'الإصدار 1.0.0',
      icon: <Info size={24} color="#4ECDC4" />,
      type: 'navigation',
      onPress: () => Alert.alert('حول التطبيق', 'تطبيق الألعاب الموريتانية\nالإصدار 1.0.0\n\nتم تطويره بحب في موريتانيا 🇲🇷\n\nالمطور: فريق التطوير الموريتاني\nالبريد الإلكتروني: support@mauritaniangames.com'),
    },
    {
      id: 'logout',
      title: 'تسجيل الخروج',
      subtitle: user?.email || 'تسجيل الخروج من الحساب',
      icon: <LogOut size={24} color="#FF6B6B" />,
      type: 'action',
      onPress: handleSignOut,
    },
  ]

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingsItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.itemLeft}>
          {item.icon}
          <View style={styles.itemText}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.itemRight}>
          {item.type === 'toggle' && item.onToggle && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#e0e0e0', true: '#4ECDC4' }}
              thumbColor={item.value ? '#fff' : '#f4f3f4'}
            />
          )}
          {item.type === 'navigation' && (
            <ChevronRight size={20} color="#999" />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'الإعدادات',
          headerStyle: {
            backgroundColor: '#4ECDC4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عام</Text>
          <View style={styles.sectionContent}>
            {settingsData.slice(0, 4).map(renderSettingsItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الحساب</Text>
          <View style={styles.sectionContent}>
            {settingsData.slice(4, 7).map(renderSettingsItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التطبيق</Text>
          <View style={styles.sectionContent}>
            {settingsData.slice(7, 11).map(renderSettingsItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أخرى</Text>
          <View style={styles.sectionContent}>
            {settingsData.slice(11).map(renderSettingsItem)}
          </View>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر اللغة</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageOption,
                  selectedLanguage === language && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageSelect(language)}
              >
                <Text style={[
                  styles.languageText,
                  selectedLanguage === language && styles.selectedLanguageText
                ]}>
                  {language}
                </Text>
                {selectedLanguage === language && (
                  <View style={styles.checkmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>الخصوصية والأمان</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.privacyText}>
                نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.
                {"\n\n"}
                البيانات التي نجمعها:
                • معلومات الحساب (الاسم، البريد الإلكتروني)
                • إحصائيات الألعاب والنتائج
                • تفضيلات التطبيق
                {"\n\n"}
                كيف نستخدم بياناتك:
                • تحسين تجربة اللعب
                • حفظ التقدم والإنجازات
                • التواصل معك حول التحديثات
                {"\n\n"}
                أمان البيانات:
                • تشفير جميع البيانات الحساسة
                • عدم مشاركة البيانات مع أطراف ثالثة
                • إمكانية حذف الحساب في أي وقت
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>المساعدة والدعم</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.helpText}>
                مرحباً بك في مركز المساعدة!
                {"\n\n"}
                الأسئلة الشائعة:
                {"\n\n"}
                س: كيف أبدأ لعبة جديدة؟
                ج: اذهب إلى تبويب &ldquo;الألعاب&rdquo; واختر اللعبة المفضلة لديك.
                {"\n\n"}
                س: كيف أضيف أصدقاء؟
                ج: اذهب إلى تبويب &ldquo;الأصدقاء&rdquo; واستخدم خاصية البحث.
                {"\n\n"}
                س: كيف أغير كلمة المرور؟
                ج: اذهب إلى &ldquo;الملف الشخصي&rdquo; ثم &ldquo;تغيير كلمة المرور&rdquo;.
                {"\n\n"}
                للمساعدة الإضافية:
                البريد الإلكتروني: support@mauritaniangames.com
                الهاتف: +222 12 34 56 78
                {"\n\n"}
                أوقات الدعم:
                السبت - الخميس: 9:00 ص - 6:00 م
                الجمعة: مغلق
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    marginLeft: 16,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  itemRight: {
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  modalScroll: {
    maxHeight: 400,
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguage: {
    backgroundColor: '#f0f9ff',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  selectedLanguageText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    textAlign: 'right',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    textAlign: 'right',
  },
})