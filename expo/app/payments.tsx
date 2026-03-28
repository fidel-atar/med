import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Crown, Star, CheckCircle, X, Shield, Copy } from 'lucide-react-native'


type PaymentMethod = {
  id: string
  type: 'card' | 'bank'
  name: string
  nameEn: string
  description: string
  logo: string
}

type SubscriptionPlan = {
  id: string
  name: string
  nameEn: string
  price: string
  duration: string
  features: string[]
  popular?: boolean
  color: string
}

type PaymentHistory = {
  id: string
  type: 'subscription' | 'game' | 'premium'
  description: string
  amount: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  method: string
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'الأساسية',
    nameEn: 'Basic Plan',
    price: '500 أوقية',
    duration: 'شهرياً',
    features: [
      'الوصول لجميع الألعاب',
      'إزالة الإعلانات',
      'دعم فني أساسي'
    ],
    color: '#4ECDC4'
  },
  {
    id: 'premium',
    name: 'المميزة',
    nameEn: 'Premium Plan',
    price: '1200 أوقية',
    duration: 'شهرياً',
    features: [
      'جميع مميزات الأساسية',
      'ألعاب حصرية',
      'مكافآت يومية مضاعفة',
      'دعم فني متقدم',
      'إحصائيات مفصلة'
    ],
    popular: true,
    color: '#FF6B6B'
  },
  {
    id: 'vip',
    name: 'في آي بي',
    nameEn: 'VIP Plan',
    price: '2500 أوقية',
    duration: 'شهرياً',
    features: [
      'جميع المميزات السابقة',
      'وصول مبكر للألعاب الجديدة',
      'تخصيص كامل للملف الشخصي',
      'دعم فني مخصص 24/7',
      'بطولات حصرية'
    ],
    color: '#9B59B6'
  }
]

const PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: '1',
    type: 'subscription',
    description: 'اشتراك الخطة المميزة',
    amount: '1200 أوقية',
    date: '2024-01-15',
    status: 'completed',
    method: 'Bankily'
  },
  {
    id: '2',
    type: 'game',
    description: 'شراء عملات اللعبة',
    amount: '300 أوقية',
    date: '2024-01-10',
    status: 'completed',
    method: 'Visa Card'
  },
  {
    id: '3',
    type: 'premium',
    description: 'ترقية الحساب',
    amount: '800 أوقية',
    date: '2024-01-05',
    status: 'pending',
    method: 'Master Card'
  },
  {
    id: '4',
    type: 'subscription',
    description: 'تجديد الاشتراك الشهري',
    amount: '500 أوقية',
    date: '2023-12-28',
    status: 'failed',
    method: 'Bankily'
  }
]

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bankily',
    type: 'bank',
    name: 'بانكيلي',
    nameEn: 'Bankily',
    description: 'الدفع عبر تطبيق بانكيلي',
    logo: 'https://r2-pub.rork.com/attachments/7rm4o4qrrezzfmdy6et7q',
  },
  {
    id: 'masrifi',
    type: 'bank',
    name: 'مصرفي',
    nameEn: 'Masrifi',
    description: 'الدفع عبر تطبيق مصرفي',
    logo: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5rt01fwzawbt16yfl059t',
  },
  {
    id: 'saddad',
    type: 'bank',
    name: 'سداد',
    nameEn: 'Saddad',
    description: 'الدفع عبر تطبيق سداد',
    logo: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/qu4d5yp8xgngc0iujb8w7',
  },
  {
    id: 'visa',
    type: 'card',
    name: 'فيزا',
    nameEn: 'Visa Card',
    description: 'بطاقة فيزا الائتمانية',
    logo: 'https://r2-pub.rork.com/generated-images/b3f5919c-484e-4389-af20-f23b60af6161.png',
  },
  {
    id: 'mastercard',
    type: 'card',
    name: 'ماستركارد',
    nameEn: 'Master Card',
    description: 'بطاقة ماستركارد الائتمانية',
    logo: 'https://r2-pub.rork.com/generated-images/1aaa9d8f-8aeb-42a4-b4a3-f22c52833956.png',
  },
]

export default function PaymentsScreen() {
  const params = useLocalSearchParams<{ openSubscriptions?: string }>()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [modalAnimation] = useState(new Animated.Value(0))
  const [showBankilyModal, setShowBankilyModal] = useState<boolean>(false)
  const [showCardModal, setShowCardModal] = useState<boolean>(false)
  const [selectedCardMethod, setSelectedCardMethod] = useState<PaymentMethod | null>(null)
  const [generatedFactorId, setGeneratedFactorId] = useState<string>('')
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false)
  const [factorIdCopied, setFactorIdCopied] = useState<boolean>(false)
  const [showPlansModal, setShowPlansModal] = useState<boolean>(false)
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  useEffect(() => {
    if (params?.openSubscriptions) {
      setShowPlansModal(true)
    }
  }, [params?.openSubscriptions])

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowPlansModal(false)
    setShowPaymentModal(true)
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start()
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
    
    if (method.type === 'bank') {
      const factorId = generateFactorId()
      setGeneratedFactorId(factorId)
      setShowPaymentModal(false)
      setShowBankilyModal(true)
    } else if (method.type === 'card') {
      // Handle card payments
      setSelectedCardMethod(method)
      setShowPaymentModal(false)
      setShowCardModal(true)
    }
  }

  const closePaymentModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowPaymentModal(false)
      setSelectedPlan(null)
      setSelectedPaymentMethod(null)
    })
  }

  const closeBankilyModal = () => {
    setShowBankilyModal(false)
    setGeneratedFactorId('')
    setFactorIdCopied(false)
    setSelectedPaymentMethod(null)
    setSelectedPlan(null)
  }

  const closeCardModal = () => {
    setShowCardModal(false)
    setSelectedCardMethod(null)
    setSelectedPaymentMethod(null)
    setSelectedPlan(null)
    setCardForm({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    })
  }

  const generateFactorId = (): string => {
    // Generate a unique 12-digit Factor ID
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${timestamp}${random}`
  }

  const copyFactorId = async () => {
    try {
      // For web compatibility, we'll use a simple approach
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(generatedFactorId)
      } else {
        const Clipboard = await import('expo-clipboard')
        await Clipboard.setStringAsync(generatedFactorId)
      }
      setFactorIdCopied(true)
      Alert.alert('تم النسخ!', 'تم نسخ رقم الهوية إلى الحافظة')
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setFactorIdCopied(false)
      }, 3000)
    } catch {
      Alert.alert('خطأ', 'فشل في نسخ رقم الهوية')
    }
  }

  const handleBankilyPayment = async () => {
    setIsProcessingPayment(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false)
      setShowBankilyModal(false)
      
      Alert.alert(
        'تم الدفع بنجاح!',
        `تم تفعيل اشتراكك في ${selectedPlan?.name} بنجاح!\n\nطريقة الدفع: ${selectedPaymentMethod?.name ?? 'بانكيلي'}\nرقم الهوية: ${generatedFactorId}\nالمبلغ: ${selectedPlan?.price}`,
        [{ 
          text: 'موافق',
          onPress: () => {
            setGeneratedFactorId('')
            setFactorIdCopied(false)
            setSelectedPaymentMethod(null)
            setSelectedPlan(null)
          }
        }]
      )
    }, 2000)
  }

  const handleCardPayment = async () => {
    // Validate card form
    if (!cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv || !cardForm.cardholderName) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة')
      return
    }

    // Basic card number validation (should be 16 digits)
    const cleanCardNumber = cardForm.cardNumber.replace(/\s/g, '')
    if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
      Alert.alert('خطأ', 'رقم البطاقة يجب أن يكون 16 رقماً')
      return
    }

    // Basic expiry date validation (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiryDate)) {
      Alert.alert('خطأ', 'تاريخ الانتهاء يجب أن يكون بصيغة MM/YY')
      return
    }

    // Basic CVV validation (3 digits)
    if (cardForm.cvv.length !== 3 || !/^\d+$/.test(cardForm.cvv)) {
      Alert.alert('خطأ', 'رمز الأمان يجب أن يكون 3 أرقام')
      return
    }

    setIsProcessingPayment(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false)
      setShowCardModal(false)
      
      Alert.alert(
        'تم الدفع بنجاح!',
        `تم تفعيل اشتراكك في ${selectedPlan?.name} بنجاح!\n\nطريقة الدفع: ${selectedCardMethod?.name}\nآخر 4 أرقام: ****${cleanCardNumber.slice(-4)}\nالمبلغ: ${selectedPlan?.price}`,
        [{ 
          text: 'موافق',
          onPress: () => {
            closeCardModal()
          }
        }]
      )
    }, 2000)
  }

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '')
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19)
  }

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '')
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
    }
    return cleaned
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'المدفوعات',
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
        {/* Subscription Plans Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>خطط الاشتراك</Text>
          <Text style={styles.sectionSubtitle}>اختر الخطة المناسبة لك واستمتع بالمميزات الحصرية</Text>
          {/* تم نقل زر الاشتراك إلى صفحة مستقلة */}

        </View>

        {/* Payment History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سجل المدفوعات</Text>
          <Text style={styles.sectionSubtitle}>تاريخ جميع معاملاتك المالية</Text>
          
          <View style={styles.sectionContent}>
            {PAYMENT_HISTORY.map((transaction) => (
              <View key={transaction.id} style={styles.transaction}>
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    {
                      backgroundColor: transaction.type === 'subscription' ? '#4ECDC4' :
                                     transaction.type === 'game' ? '#FF6B6B' : '#9B59B6'
                    }
                  ]}>
                    {transaction.type === 'subscription' && <Crown size={20} color="#fff" />}
                    {transaction.type === 'game' && <Star size={20} color="#fff" />}
                    {transaction.type === 'premium' && <CheckCircle size={20} color="#fff" />}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>{transaction.date} • {transaction.method}</Text>
                  </View>
                </View>
                
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>{transaction.amount}</Text>
                  <Text style={[
                    styles.transactionStatus,
                    {
                      color: transaction.status === 'completed' ? '#4CAF50' :
                             transaction.status === 'pending' ? '#FF9800' : '#F44336'
                    }
                  ]}>
                    {transaction.status === 'completed' ? 'مكتمل' :
                     transaction.status === 'pending' ? 'قيد المعالجة' : 'فشل'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>طرق الدفع المتاحة</Text>
          <Text style={styles.sectionSubtitle}>عرض طرق الدفع المدعومة في التطبيق</Text>
          
          <View style={styles.sectionContent}>
            {PAYMENT_METHODS.map((method) => (
              <View key={method.id} style={styles.paymentMethod}>
                <View style={styles.methodLeft}>
                  <View style={styles.methodIcon}>
                    <Image 
                      source={{ uri: method.logo }}
                      style={method.type === 'bank' ? styles.bankilyLogo : styles.paymentLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodNameEn}>{method.nameEn}</Text>
                    <Text style={styles.methodDescription}>{method.description}</Text>
                  </View>
                </View>
                
                <View style={styles.methodBadge}>
                  <Text style={styles.methodBadgeText}>متاح</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Subscription Plans Modal */}
      <Modal
        visible={showPlansModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlansModal(false)}
      >
        <View style={styles.plansModalOverlay}>
          <View style={styles.plansModalContent}>
            <View style={styles.plansModalHeader}>
              <Text style={styles.plansModalTitle}>اختر خطة الإشتراك</Text>
              <TouchableOpacity onPress={() => setShowPlansModal(false)} style={styles.plansModalClose}>
                <X size={22} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
              <View style={styles.plansContainer}>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    testID={`plan-${plan.id}`}
                    style={[styles.planCard, { backgroundColor: plan.color }]}
                    activeOpacity={0.9}
                    onPress={() => handleSubscribe(plan)}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Star size={12} color="#fff" fill="#fff" />
                        <Text style={styles.popularText}>الأكثر شعبية</Text>
                      </View>
                    )}
                    <View style={styles.planHeader}>
                      <Crown size={32} color="#fff" />
                      <View style={styles.planInfo}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planNameEn}>{plan.nameEn}</Text>
                        <Text style={styles.planPrice}>{plan.price} / {plan.duration}</Text>
                      </View>
                    </View>
                    <View style={styles.planFeatures}>
                      {plan.features.map((feature, index) => (
                        <View key={`${plan.id}-f-${index}`} style={styles.featureRow}>
                          <CheckCircle size={16} color="#fff" />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity 
                      style={styles.subscribeButton}
                      onPress={() => handleSubscribe(plan)}
                    >
                      <Text style={[styles.subscribeText, { color: plan.color }]}>اشترك الآن</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Method Selection Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="none"
        onRequestClose={closePaymentModal}
      >
        <View style={styles.simpleModalOverlay}>
          <Animated.View 
            style={[
              styles.simpleModalContent,
              {
                transform: [
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
                opacity: modalAnimation,
              },
            ]}
          >
            {/* Simple Header */}
            <View style={styles.simpleModalHeader}>
              <Text style={styles.simpleModalTitle}>اختر طريقة الدفع</Text>
              <Text style={styles.simpleModalSubtitle}>اشتراك شهري - 500 أوقية</Text>
            </View>
            
            {/* Payment Methods List */}
            <View style={styles.simplePaymentMethodsList}>
              {PAYMENT_METHODS.map((method, index) => (
                <TouchableOpacity
                  key={method.id}
                  style={styles.simplePaymentMethodOption}
                  onPress={() => handlePaymentMethodSelect(method)}
                  activeOpacity={0.7}
                >
                  <View style={styles.simplePaymentMethodIcon}>
                    <Image 
                      source={{ uri: method.logo }}
                      style={method.type === 'bank' ? styles.bankilyLogoSimple : styles.paymentLogoSimple}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.simplePaymentMethodName}>{method.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Simple Footer */}
            <TouchableOpacity 
              style={styles.simpleCancelButton}
              onPress={closePaymentModal}
            >
              <Text style={styles.simpleCancelText}>إلغاء</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Bankily Payment Modal */}
      <Modal
        visible={showBankilyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeBankilyModal}
      >
        <View style={styles.bankilyModalOverlay}>
          <View style={styles.bankilyModalContent}>
            {/* Header */}
            <View style={styles.bankilyModalHeader}>
              <TouchableOpacity 
                style={styles.bankilyCloseButton}
                onPress={closeBankilyModal}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
              <View style={styles.bankilyHeaderContent}>
                <View style={styles.bankilyLogoContainer}>
                  <Image 
                    source={{ uri: selectedPaymentMethod?.logo ?? 'https://r2-pub.rork.com/attachments/7rm4o4qrrezzfmdy6et7q' }}
                    style={styles.bankilyModalLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.bankilyModalTitle}>الدفع عبر {selectedPaymentMethod?.name ?? 'بانكيلي'}</Text>
              </View>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Payment Summary */}
              <View style={styles.bankilyPaymentSummary}>
                <Text style={styles.bankilySummaryTitle}>ملخص الدفع</Text>
                <View style={styles.bankilySummaryRow}>
                  <Text style={styles.bankilySummaryLabel}>الخطة:</Text>
                  <Text style={styles.bankilySummaryValue}>{selectedPlan?.name}</Text>
                </View>
                <View style={styles.bankilySummaryRow}>
                  <Text style={styles.bankilySummaryLabel}>المدة:</Text>
                  <Text style={styles.bankilySummaryValue}>{selectedPlan?.duration}</Text>
                </View>
                <View style={[styles.bankilySummaryRow, styles.bankilyTotalRow]}>
                  <Text style={styles.bankilyTotalLabel}>المبلغ الإجمالي:</Text>
                  <Text style={styles.bankilyTotalValue}>{selectedPlan?.price}</Text>
                </View>
              </View>

              {/* Generated Factor ID */}
              <View style={styles.bankilyFormSection}>
                <Text style={styles.bankilyFormLabel}>رقم الهوية المُولد (Factor ID)</Text>
                <View style={styles.factorIdContainer}>
                  <View style={styles.factorIdDisplay}>
                    <Text style={styles.factorIdText}>{generatedFactorId}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.copyFactorButton, factorIdCopied && styles.copyFactorButtonSuccess]}
                    onPress={copyFactorId}
                  >
                    {factorIdCopied ? (
                      <CheckCircle size={20} color="#fff" />
                    ) : (
                      <Copy size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.bankilyInputHint}>انسخ هذا الرقم واستخدمه في تطبيق {selectedPaymentMethod?.name ?? 'بانكيلي'} لإتمام الدفع</Text>
              </View>

              {/* Security Info */}
              <View style={styles.bankilySecurityInfo}>
                <Shield size={16} color="#4ECDC4" />
                <Text style={styles.bankilySecurityText}>جميع المعاملات محمية بتشفير عالي الأمان</Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.bankilyModalFooter}>
              <TouchableOpacity 
                style={[
                  styles.bankilyPayButton,
                  isProcessingPayment && styles.bankilyPayButtonDisabled
                ]}
                onPress={handleBankilyPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <Text style={styles.bankilyPayButtonText}>جاري التحقق من الدفع...</Text>
                ) : (
                  <>
                    <CheckCircle size={20} color="#fff" />
                    <Text style={styles.bankilyPayButtonText}>تأكيد الدفع</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.bankilyCancelButton}
                onPress={closeBankilyModal}
                disabled={isProcessingPayment}
              >
                <Text style={styles.bankilyCancelText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Card Payment Modal */}
      <Modal
        visible={showCardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCardModal}
      >
        <View style={styles.cardModalOverlay}>
          <View style={[
            styles.cardModalContent,
            Platform.OS === 'android' ? { height: '85%' as const } : null,
          ]}>
            {/* Header */}
            <View style={styles.cardModalHeader}>
              <TouchableOpacity 
                style={styles.cardModalClose}
                onPress={closeCardModal}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.cardModalTitle}>دفع بالبطاقة الائتمانية</Text>
              <View style={styles.cardModalPlaceholder} />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
              style={{ flex: 1 }}
            >
              <ScrollView 
                style={styles.cardModalForm}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 160 : 240 }}
              >
                <View style={styles.cardPaymentSummary}>
                  <Text style={styles.cardPaymentSummaryTitle}>ملخص الدفع</Text>
                  <View style={styles.cardPaymentSummaryRow}>
                    <Text style={styles.cardPaymentSummaryLabel}>الخطة:</Text>
                    <Text style={styles.cardPaymentSummaryValue}>{selectedPlan?.name}</Text>
                  </View>
                  <View style={styles.cardPaymentSummaryRow}>
                    <Text style={styles.cardPaymentSummaryLabel}>المدة:</Text>
                    <Text style={styles.cardPaymentSummaryValue}>{selectedPlan?.duration}</Text>
                  </View>
                  <View style={styles.cardPaymentSummaryRow}>
                    <Text style={styles.cardPaymentSummaryLabel}>طريقة الدفع:</Text>
                    <Text style={styles.cardPaymentSummaryValue}>{selectedCardMethod?.name}</Text>
                  </View>
                  <View style={[styles.cardPaymentSummaryRow, { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#b0bec5', marginTop: 8 }]}>
                    <Text style={[styles.cardPaymentSummaryLabel, { fontWeight: 'bold', color: '#333' }]}>المبلغ الإجمالي:</Text>
                    <Text style={[styles.cardPaymentSummaryValue, { fontSize: 18, fontWeight: 'bold', color: '#4ECDC4' }]}>{selectedPlan?.price}</Text>
                  </View>
                </View>

                <View style={styles.cardFormSection}>
                  <Text style={styles.cardFormLabel}>رقم البطاقة</Text>
                  <TextInput
                    testID="card-number-input"
                    style={styles.cardFormInput}
                    value={cardForm.cardNumber}
                    onChangeText={(text) => setCardForm(prev => ({ ...prev, cardNumber: formatCardNumber(text) }))}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#9aa0a6"
                    selectionColor="#4ECDC4"
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.cardFormRow}>
                  <View style={styles.cardFormHalf}>
                    <Text style={styles.cardFormLabel}>تاريخ الانتهاء</Text>
                    <TextInput
                      testID="expiry-date-input"
                      style={styles.cardFormInput}
                      value={cardForm.expiryDate}
                      onChangeText={(text) => setCardForm(prev => ({ ...prev, expiryDate: formatExpiryDate(text) }))}
                      placeholder="MM/YY"
                      placeholderTextColor="#9aa0a6"
                      selectionColor="#4ECDC4"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.cardFormHalf}>
                    <Text style={styles.cardFormLabel}>رمز الأمان (CVV)</Text>
                    <TextInput
                      testID="cvv-input"
                      style={styles.cardFormInput}
                      value={cardForm.cvv}
                      onChangeText={(text) => setCardForm(prev => ({ ...prev, cvv: text.replace(/\D/g, '').substring(0, 3) }))}
                      placeholder="123"
                      placeholderTextColor="#9aa0a6"
                      selectionColor="#4ECDC4"
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.cardFormSection}>
                  <Text style={styles.cardFormLabel}>اسم حامل البطاقة</Text>
                  <TextInput
                    testID="cardholder-name-input"
                    style={styles.cardFormInput}
                    value={cardForm.cardholderName}
                    onChangeText={(text) => setCardForm(prev => ({ ...prev, cardholderName: text }))}
                    placeholder="الاسم كما هو مكتوب على البطاقة"
                    placeholderTextColor="#9aa0a6"
                    selectionColor="#4ECDC4"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.cardSecurityInfo}>
                  <Text style={styles.cardSecurityTitle}>🔒 معلومات آمنة ومحمية</Text>
                  <Text style={styles.cardSecurityText}>
                    جميع بياناتك محمية بتشفير SSL 256-bit ولن يتم حفظ معلومات البطاقة
                  </Text>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.cardModalFooter}>
              <TouchableOpacity 
                style={[
                  styles.cardPayButton,
                  isProcessingPayment && styles.cardPayButtonDisabled
                ]}
                onPress={handleCardPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <Text style={styles.cardPayButtonText}>جاري معالجة الدفع...</Text>
                ) : (
                  <>
                    <Shield size={20} color="#fff" />
                    <Text style={styles.cardPayButtonText}>دفع {selectedPlan?.price}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
  openSubscribeButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  openSubscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    padding: 20,
    position: 'relative',
  },
  selectedPlan: {
    transform: [{ scale: 1.02 }],
  },
  planGradient: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    marginLeft: 16,
    flex: 1,
  },
  planNameEn: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  planPrice: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodInfo: {
    marginLeft: 16,
    flex: 1,
  },
  methodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginBottom: 2,
  },
  methodNameEn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
    textAlign: 'right',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  methodBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  methodBadgeText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  paymentCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentCardGradient: {
    padding: 20,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  factureSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  factureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  factureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
  },
  factureId: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
  },
  instructionsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    lineHeight: 20,
  },
  statusSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkStatusButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkStatusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  amountModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  amountModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  amountModalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  amountInput: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
  },
  amountModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  amountModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  simpleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  simpleModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  simpleModalHeader: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  simpleModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  simpleModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  simplePaymentMethodsList: {
    padding: 24,
    gap: 16,
  },
  simplePaymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  simplePaymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  simplePaymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  simpleCancelButton: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  simpleCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  paymentLogoSimple: {
    width: 32,
    height: 20,
  },
  bankilyLogoSimple: {
    width: 32,
    height: 32,
  },
  paymentMethodModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  paymentMethodModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
    overflow: 'hidden',
  },
  enhancedModalHeader: {
    backgroundColor: '#fff',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  enhancedCloseButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 12,
  },
  enhancedModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 6,
  },
  enhancedModalSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  enhancedPlanSummary: {
    backgroundColor: '#f8fdfc',
    margin: 24,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  planSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  planSummaryContent: {
    gap: 12,
  },
  planSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  planSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  enhancedPaymentMethodsList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  paymentMethodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
  },
  enhancedPaymentMethodOption: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  selectedPaymentMethod: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f8fdfc',
    transform: [{ scale: 1.02 }],
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  enhancedPaymentMethodIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  bankilyIconContainer: {
    backgroundColor: '#f0f8ff',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  enhancedPaymentMethodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'right',
  },
  enhancedPaymentMethodDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
    fontWeight: '500',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  recommendedText: {
    fontSize: 11,
    color: '#856404',
    fontWeight: '600',
    marginLeft: 4,
  },
  paymentMethodRight: {
    alignItems: 'center',
    gap: 8,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  instantText: {
    fontSize: 11,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 4,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  secureText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4ECDC4',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
  },
  selectedMethodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e8',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#4ECDC4',
  },
  selectedMethodText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  enhancedModalFooter: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  enhancedCancelButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  enhancedCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  selectedPlanSummary: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedPlanTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedPlanInfo: {
    alignItems: 'center',
  },
  selectedPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedPlanPrice: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  paymentMethodModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentMethodModalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  paymentMethodsList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentMethodOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentMethodOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
  paymentMethodModalCancel: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  paymentMethodModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  cardModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '95%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardModalClose: {
    padding: 4,
  },
  cardModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardModalPlaceholder: {
    width: 32,
  },
  cardModalForm: {
    flex: 1,
    padding: 20,
  },
  cardPaymentSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardPaymentSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardPaymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardPaymentSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  cardPaymentSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardFormSection: {
    marginBottom: 20,
  },
  cardFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  cardFormInput: {
    borderWidth: 1.5,
    borderColor: '#b0bec5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111',
    textAlign: 'right',
  },
  cardFormRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cardFormHalf: {
    flex: 1,
  },
  cardPayButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardPayButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardSecurityInfo: {
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cardSecurityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5a2d',
    marginBottom: 4,
  },
  cardSecurityText: {
    fontSize: 12,
    color: '#5a7a5a',
    textAlign: 'center',
  },
  cardPayButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  cardModalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paymentLogo: {
    width: 48,
    height: 30,
  },
  bankilyLogo: {
    width: 48,
    height: 48,
  },
  // Plans Modal Styles
  plansModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  plansModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  plansModalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  plansModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  plansModalClose: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 6,
  },
  // Bankily Modal Styles
  bankilyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bankilyModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  bankilyModalHeader: {
    backgroundColor: '#f8fdfc',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5f3',
    position: 'relative',
  },
  bankilyCloseButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  bankilyHeaderContent: {
    alignItems: 'center',
    paddingTop: 8,
  },
  bankilyLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bankilyModalLogo: {
    width: 60,
    height: 60,
  },
  bankilyModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  bankilyModalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  bankilyPaymentSummary: {
    backgroundColor: '#f8f9fa',
    margin: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bankilySummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  bankilySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankilySummaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  bankilySummaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  bankilyTotalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 8,
    marginBottom: 0,
  },
  bankilyTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bankilyTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  bankilyFormSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  bankilyFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  bankilyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bankilyInputIcon: {
    marginRight: 12,
  },
  bankilyInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
    textAlign: 'right',
  },
  bankilyInputHint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
    lineHeight: 18,
  },
  bankilySecurityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8f0',
    marginHorizontal: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  bankilySecurityText: {
    fontSize: 13,
    color: '#2d5a2d',
    marginLeft: 8,
    fontWeight: '500',
  },
  bankilyModalFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  bankilyPayButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bankilyPayButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  bankilyPayButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bankilyCancelButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bankilyCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  // Factor ID Display Styles
  factorIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  factorIdDisplay: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorIdText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  copyFactorButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  copyFactorButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  // Instructions Styles
  bankilyInstructionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankilyInstructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bankilyInstructionsList: {
    gap: 12,
  },
  bankilyInstructionItem: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    lineHeight: 20,
  },
})