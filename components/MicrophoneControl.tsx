import React, { useCallback, useMemo, useRef, useState } from 'react'
import { View, TouchableOpacity, StyleSheet, Text, Platform, Alert } from 'react-native'
import { Mic, MicOff, Loader2 } from 'lucide-react-native'
import { Audio } from 'expo-av'

interface Props {
  onTranscript?: (text: string) => void
}

export default function MicrophoneControl({ onTranscript }: Props) {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastText, setLastText] = useState<string>('')

  const recordingRef = useRef<Audio.Recording | null>(null)
  const webStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const webChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      if (Platform.OS !== 'web') {
        const perm = await Audio.requestPermissionsAsync()
        if (!perm.granted) {
          setError('إذن الميكروفون مرفوض')
          Alert.alert('الميكروفون', 'يرجى منح إذن الميكروفون من الإعدادات')
          return
        }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
        const rec = new Audio.Recording()
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
        recordingRef.current = rec
        await rec.startAsync()
        setIsRecording(true)
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        webStreamRef.current = stream
        const mr = new MediaRecorder(stream)
        mediaRecorderRef.current = mr
        webChunksRef.current = []
        mr.ondataavailable = (e: BlobEvent) => {
          if (e.data && e.data.size > 0) webChunksRef.current.push(e.data)
        }
        mr.start()
        setIsRecording(true)
      }
    } catch (e) {
      console.log('[Mic] start error', e)
      setError('تعذر بدء التسجيل')
    }
  }, [])

  const stopRecording = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        const rec = recordingRef.current
        if (rec) {
          await rec.stopAndUnloadAsync()
          const uri = rec.getURI()
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
          setIsRecording(false)
          if (uri) {
            await sendToSTT(uri)
          }
          recordingRef.current = null
        } else {
          setIsRecording(false)
        }
      } else {
        const mr = mediaRecorderRef.current
        if (mr && mr.state !== 'inactive') {
          await new Promise<void>((resolve) => {
            mr.onstop = () => resolve()
            mr.stop()
          })
        }
        const stream = webStreamRef.current
        stream?.getTracks().forEach(t => t.stop())
        setIsRecording(false)
        const blob = new Blob(webChunksRef.current, { type: 'audio/webm' })
        if (blob.size > 0) {
          const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
          await sendWebFileToSTT(file)
        }
        mediaRecorderRef.current = null
        webStreamRef.current = null
        webChunksRef.current = []
      }
    } catch (e) {
      console.log('[Mic] stop error', e)
      setError('تعذر إيقاف التسجيل')
      setIsRecording(false)
    }
  }, [])

  const sendToSTT = useCallback(async (uri: string) => {
    try {
      setIsProcessing(true)
      const uriParts = uri.split('.')
      const fileType = uriParts[uriParts.length - 1]
      const audioFile = { uri, name: 'recording.' + fileType, type: 'audio/' + fileType }
      const formData = new FormData()
      formData.append('audio', audioFile as any)
      const res = await fetch('https://toolkit.rork.com/stt/transcribe/', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json() as { text: string, language: string }
      setLastText(json.text ?? '')
      onTranscript?.(json.text ?? '')
      if (!json.text) Alert.alert('النص', 'تم إرسال صوتك، ولكن لم يتم التعرف على نص.')
    } catch (e) {
      console.log('[Mic] STT error', e)
      setError('تعذر تحويل الصوت إلى نص')
      Alert.alert('تعذر التحويل', 'حاول مرة أخرى لاحقاً')
    } finally {
      setIsProcessing(false)
    }
  }, [onTranscript])

  const sendWebFileToSTT = useCallback(async (file: File) => {
    try {
      setIsProcessing(true)
      const fd = new FormData()
      fd.append('audio', file)
      const res = await fetch('https://toolkit.rork.com/stt/transcribe/', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json() as { text: string, language: string }
      setLastText(json.text ?? '')
      onTranscript?.(json.text ?? '')
      if (!json.text) Alert.alert('النص', 'تم إرسال صوتك، ولكن لم يتم التعرف على نص.')
    } catch (e) {
      console.log('[Mic] Web STT error', e)
      setError('تعذر تحويل الصوت إلى نص على الويب')
    } finally {
      setIsProcessing(false)
    }
  }, [onTranscript])

  const onPress = useCallback(() => {
    if (isProcessing) return
    if (!isRecording) startRecording()
    else stopRecording()
  }, [isRecording, isProcessing, startRecording, stopRecording])

  const caption = useMemo(() => {
    if (isProcessing) return 'جارِ التحويل'
    if (isRecording) return 'إيقاف'
    return lastText ? lastText.slice(0, 40) : 'تحدّث'
  }, [isProcessing, isRecording, lastText])

  return (
    <View style={styles.wrapper} testID="mic-control">
      <TouchableOpacity onPress={onPress} style={[styles.button, isRecording && styles.btnRec]} activeOpacity={0.9} testID="mic-toggle">
        {isProcessing ? (
          <Loader2 size={18} color="#fff" />
        ) : isRecording ? (
          <MicOff size={18} color="#fff" />
        ) : (
          <Mic size={18} color="#fff" />
        )}
        <Text style={styles.btnText}>{caption}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {Platform.OS === 'web' ? <Text style={styles.hint}>الويب: قد تكون الجودة محدودة</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', right: 16, bottom: 20, alignItems: 'flex-end' },
  button: { flexDirection: 'row', alignItems: 'center', gap: 8 as unknown as number, backgroundColor: '#0ea5e9', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999 },
  btnRec: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  errorText: { color: '#ef4444', marginTop: 6, fontSize: 12 },
  hint: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 4 },
})
