import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function usePayments() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user?.id,
  })

  const paymentsHistoryQuery = useQuery({
    queryKey: ['payments-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          subscriptions (
            plan_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })

  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ 
      planType, 
      paymentMethod, 
      amount 
    }: { 
      planType: 'basic' | 'premium' | 'pro'
      paymentMethod: 'visa' | 'mastercard' | 'bankily'
      amount: number
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)
      
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()
      
      if (subError) throw subError
      
      const { data: payment, error: payError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          amount,
          currency: 'MRU',
          payment_method: paymentMethod,
          status: 'completed',
          transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        })
        .select()
        .single()
      
      if (payError) throw payError
      
      return { subscription, payment }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['payments-history'] })
    },
  })

  const generateBankilyFactorMutation = useMutation({
    mutationFn: async ({ amount, planType }: { amount: number; planType: string }) => {
      // Generate a unique factor ID for Bankily payment
      const factorId = `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      return {
        factorId,
        amount,
        planType,
        instructions: 'استخدم هذا الرقم في تطبيق بنكيلي لإتمام الدفع',
        expiresIn: '15 دقيقة',
      }
    },
  })

  const processCardPaymentMutation = useMutation({
    mutationFn: async ({ 
      cardNumber, 
      expiryDate, 
      cvv, 
      cardholderName,
      amount,
      planType 
    }: {
      cardNumber: string
      expiryDate: string
      cvv: string
      cardholderName: string
      amount: number
      planType: 'basic' | 'premium' | 'pro'
    }) => {
      // Simulate card payment processing
      // In a real app, this would integrate with a payment processor
      
      if (!user?.id) throw new Error('Not authenticated')
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate random success/failure for demo
      if (Math.random() < 0.1) {
        throw new Error('Payment failed. Please check your card details.')
      }
      
      const paymentMethod = cardNumber.startsWith('4') ? 'visa' : 'mastercard'
      
      return await createSubscriptionMutation.mutateAsync({
        planType,
        paymentMethod,
        amount,
      })
    },
  })

  return {
    subscription: subscriptionQuery.data,
    paymentsHistory: paymentsHistoryQuery.data || [],
    isLoading: subscriptionQuery.isLoading || paymentsHistoryQuery.isLoading,
    error: subscriptionQuery.error || paymentsHistoryQuery.error,
    createSubscription: createSubscriptionMutation.mutateAsync,
    generateBankilyFactor: generateBankilyFactorMutation.mutateAsync,
    processCardPayment: processCardPaymentMutation.mutateAsync,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    isGeneratingFactor: generateBankilyFactorMutation.isPending,
    isProcessingPayment: processCardPaymentMutation.isPending,
    bankilyFactor: generateBankilyFactorMutation.data,
  }
}