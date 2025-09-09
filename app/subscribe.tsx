import React, { useMemo, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useRouter } from 'expo-router'
import { Crown, Star, CheckCircle, X, Shield, ArrowRight } from 'lucide-react-native'

interface SubscriptionPlan {
  id: string
  name: string
  nameEn: string
  price: string
  duration: string
  features: string[]
  popular?: boolean
  color: string
}

interface PaymentMethodItem {
  id: string
  label: string
  logo: string
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'الأساسية',
    nameEn: 'Basic Plan',
    price: '500 أوقية',
    duration: 'شهرياً',
    features: ['الوصول لجميع الألعاب', 'إزالة الإعلانات', 'دعم فني أساسي'],
    color: '#4ECDC4',
  },
  {
    id: 'premium',
    name: 'المميزة',
    nameEn: 'Premium Plan',
    price: '1200 أوقية',
    duration: 'شهرياً',
    features: ['جميع مميزات الأساسية', 'ألعاب حصرية', 'مكافآت يومية مضاعفة', 'دعم فني متقدم', 'إحصائيات مفصلة'],
    popular: true,
    color: '#FF6B6B',
  },
  {
    id: 'vip',
    name: 'في آي بي',
    nameEn: 'VIP Plan',
    price: '2500 أوقية',
    duration: 'شهرياً',
    features: ['جميع المميزات السابقة', 'وصول مبكر للألعاب الجديدة', 'تخصيص كامل للملف الشخصي', 'دعم فني مخصص 24/7', 'بطولات حصرية'],
    color: '#9B59B6',
  },
]

export default function SubscribeScreen() {
  const router = useRouter()
  const [showPayModal, setShowPayModal] = useState<boolean>(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [anim] = useState(new Animated.Value(0))

  const plans = useMemo(() => SUBSCRIPTION_PLANS, [])
  
  const onBack = useCallback(() => {
    try {
      const r: any = router
      if (r?.canGoBack?.()) {
        console.log('[Subscribe] back: can go back, navigating back')
        r.back()
      } else {
        console.log('[Subscribe] back: no history, replacing to root')
        r.replace('/')
      }
    } catch (e) {
      console.log('[Subscribe] back error', e)
      router.replace('/')
    }
  }, [router])

  const paymentMethods: PaymentMethodItem[] = useMemo(() => [
    {
      id: 'bankily',
      label: 'بنكيلي',
      logo: 'https://placehold.co/72x72/ffffff/000000?text=Bankily',
    },
    {
      id: 'masrifi',
      label: 'مصرفي',
      logo: 'https://placehold.co/72x72/ffffff/000000?text=Masrifi',
    },
    {
      id: 'sadad',
      label: 'سداد',
      logo: 'https://placehold.co/72x72/ffffff/000000?text=Sadad',
    },
    {
      id: 'card',
      label: 'بطاقة بنكية',
      logo: 'https://placehold.co/72x72/ffffff/000000?text=Card',
    },
    {
      id: 'wallet',
      label: 'محفظة رقمية',
      logo: 'https://placehold.co/72x72/ffffff/000000?text=Wallet',
    },
  ], [])

  const openPay = useCallback((plan: SubscriptionPlan) => {
    console.log('[Subscribe] openPay', plan.id)
    setSelectedPlan(plan)
    setSelectedMethod(null)
    setShowPayModal(true)
    Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start()
  }, [anim])

  const closePay = useCallback(() => {
    console.log('[Subscribe] closePay')
    setIsProcessing(false)
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowPayModal(false)
      setSelectedPlan(null)
      setSelectedMethod(null)
    })
  }, [anim])

  const onConfirmPay = useCallback(() => {
    if (!selectedPlan || !selectedMethod) {
      console.log('[Subscribe] Missing selection')
      return
    }
    console.log('[Subscribe] Processing payment', { plan: selectedPlan.id, method: selectedMethod })
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      closePay()
    }, 900)
  }, [selectedPlan, selectedMethod, closePay])

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            testID="subscribe-back"
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="رجوع"
          >
            <ArrowRight color="#111" size={22} />
          </TouchableOpacity>
        </View>
        <View style={styles.hero}>
          <Crown size={36} color="#fff" />
          <Text style={styles.heroTitle}>الإشتراك</Text>
          <Text style={styles.heroSubtitle}>افتح كل الألعاب وامسح الإعلانات</Text>
        </View>

        <View style={styles.cards}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              testID={`subscribe-plan-${plan.id}`}
              style={[styles.card, { backgroundColor: plan.color }]}
              activeOpacity={0.9}
              onPress={() => openPay(plan)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Star size={12} color="#fff" />
                  <Text style={styles.popularText}>الأكثر شعبية</Text>
                </View>
              )}
              <View style={styles.cardHeader}>
                <Crown size={28} color="#fff" />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{plan.name}</Text>
                  <Text style={styles.cardNameEn}>{plan.nameEn}</Text>
                  <Text style={styles.cardPrice}>{plan.price} / {plan.duration}</Text>
                </View>
              </View>
              <View style={styles.features}>
                {plan.features.map((f, i) => (
                  <View key={`${plan.id}-f-${i}`} style={styles.featureRow}>
                    <CheckCircle size={16} color="#fff" />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.cta} onPress={() => openPay(plan)}>
                <Text style={[styles.ctaText, { color: plan.color }]}>اشترك الآن</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showPayModal} transparent animationType="none" onRequestClose={closePay}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.paySheet,
              {
                transform: [
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) },
                  { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
                ],
                opacity: anim,
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={closePay} style={styles.closeBtn}>
                <X size={22} color="#666" />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>اختر طريقة الدفع</Text>
              <Text style={styles.sheetSubtitle}>{selectedPlan?.name} • {selectedPlan?.price}</Text>
            </View>

            <View style={styles.methods}>
              {paymentMethods.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  testID={`pay-method-${m.id}`}
                  style={[styles.method, selectedMethod === m.id ? styles.methodSelected : undefined]}
                  onPress={() => setSelectedMethod(m.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.methodLeft}>
                    <Image
                      source={{ uri: m.logo }}
                      style={styles.methodIcon}
                    />
                    <Text style={styles.methodName}>{m.label}</Text>
                  </View>
                  <Shield size={18} color="#4ECDC4" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              testID="confirm-pay"
              style={[styles.confirm, (!selectedMethod || isProcessing) ? styles.confirmDisabled : undefined]}
              onPress={onConfirmPay}
              disabled={!selectedMethod || isProcessing}
            >
              <Text style={styles.confirmText}>{isProcessing ? 'جاري المعالجة...' : 'تابع الدفع'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancel} onPress={closePay}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1 },
  topBar: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4, alignItems: 'flex-start' },
  backBtn: { padding: 8, borderRadius: 9999, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  hero: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800' as const, marginTop: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  cards: { padding: 16, gap: 16 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: { color: '#fff', fontSize: 12, fontWeight: '600' as const, marginLeft: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardInfo: { marginLeft: 16, flex: 1 },
  cardName: { color: '#fff', fontSize: 22, fontWeight: '800' as const },
  cardNameEn: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  cardPrice: { color: 'rgba(255,255,255,0.95)', fontSize: 15, marginTop: 4 },
  features: { marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureText: { color: '#fff', fontSize: 14, marginLeft: 8 },
  cta: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '800' as const },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  paySheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
  },
  sheetHeader: { backgroundColor: '#4ECDC4', paddingVertical: 20, paddingHorizontal: 20, alignItems: 'center' },
  closeBtn: { position: 'absolute', right: 12, top: 12, padding: 6, backgroundColor: '#fff', borderRadius: 16 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '800' as const },
  sheetSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4 },
  methods: { padding: 20, gap: 12 },
  method: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef', backgroundColor: '#f8f9fa' },
  methodSelected: { borderColor: '#4ECDC4', backgroundColor: '#e7f8f6' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff' },
  methodName: { fontSize: 16, color: '#333', fontWeight: '600' as const },
  confirm: { backgroundColor: '#4ECDC4', marginHorizontal: 20, marginBottom: 12, alignItems: 'center', padding: 14, borderRadius: 12 },
  confirmDisabled: { backgroundColor: '#bdebe6' },
  confirmText: { fontSize: 16, color: '#fff', fontWeight: '800' as const },
  cancel: { backgroundColor: '#f8f9fa', marginHorizontal: 20, marginBottom: 20, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef' },
  cancelText: { fontSize: 16, color: '#666', fontWeight: '700' as const },
})
