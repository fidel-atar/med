import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import {
  User,
  Save,
  X,
  Camera,
  Mail,
  AtSign,
} from 'lucide-react-native'

interface ProfileForm {
  username: string
  fullName: string
  bio: string
  email: string
}

export default function EditProfileScreen() {
  const { user, profile, updateProfile, isUpdatingProfile } = useAuth()
  const [form, setForm] = useState<ProfileForm>({
    username: '',
    fullName: '',
    bio: '',
    email: '',
  })
  const [errors, setErrors] = useState<Partial<ProfileForm>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (user && profile) {
      const initialForm = {
        username: profile.username || '',
        fullName: profile.full_name || '',
        bio: profile.bio || '',
        email: user.email || '',
      }
      setForm(initialForm)
    }
  }, [user, profile])

  useEffect(() => {
    if (user && profile) {
      const hasFormChanges = 
        form.username !== (profile.username || '') ||
        form.fullName !== (profile.full_name || '') ||
        form.bio !== (profile.bio || '')
      setHasChanges(hasFormChanges)
    }
  }, [form, user, profile])

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileForm> = {}

    if (!form.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب'
    } else if (form.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'
    }

    if (!form.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب'
    } else if (form.fullName.length < 2) {
      newErrors.fullName = 'الاسم الكامل يجب أن يكون حرفين على الأقل'
    }

    if (form.bio.length > 150) {
      newErrors.bio = 'النبذة الشخصية يجب أن تكون أقل من 150 حرف'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await updateProfile({
        username: form.username,
        full_name: form.fullName,
        bio: form.bio,
      })

      Alert.alert(
        'تم الحفظ',
        'تم تحديث معلومات الحساب بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء تحديث المعلومات. يرجى المحاولة مرة أخرى.',
        [{ text: 'موافق' }]
      )
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'إلغاء التغييرات',
        'هل أنت متأكد من إلغاء التغييرات؟',
        [
          { text: 'البقاء', style: 'cancel' },
          {
            text: 'إلغاء',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      )
    } else {
      router.back()
    }
  }

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'تعديل الحساب',
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.headerButton, !hasChanges && styles.disabledButton]}
              disabled={!hasChanges || isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Save size={24} color={hasChanges ? '#fff' : '#ccc'} />
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {form.fullName.charAt(0) || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>اضغط لتغيير الصورة</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Email (Read-only) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Mail size={20} color="#999" />
              <TextInput
                style={[styles.input, styles.readOnlyText]}
                value={form.email}
                editable={false}
                placeholder="البريد الإلكتروني"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.fieldHint}>لا يمكن تغيير البريد الإلكتروني</Text>
          </View>

          {/* Username */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>اسم المستخدم</Text>
            <View style={[styles.inputContainer, errors.username && styles.errorInput]}>
              <AtSign size={20} color={errors.username ? '#e74c3c' : '#667eea'} />
              <TextInput
                style={styles.input}
                value={form.username}
                onChangeText={(text) => updateField('username', text)}
                placeholder="اسم المستخدم"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
            <Text style={styles.fieldHint}>يظهر للآخرين كـ @{form.username}</Text>
          </View>

          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>الاسم الكامل</Text>
            <View style={[styles.inputContainer, errors.fullName && styles.errorInput]}>
              <User size={20} color={errors.fullName ? '#e74c3c' : '#667eea'} />
              <TextInput
                style={styles.input}
                value={form.fullName}
                onChangeText={(text) => updateField('fullName', text)}
                placeholder="الاسم الكامل"
                placeholderTextColor="#999"
              />
            </View>
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          {/* Bio */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>النبذة الشخصية</Text>
            <View style={[styles.inputContainer, styles.bioContainer, errors.bio && styles.errorInput]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={form.bio}
                onChangeText={(text) => updateField('bio', text)}
                placeholder="اكتب نبذة عن نفسك..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                maxLength={150}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.bioFooter}>
              {errors.bio && (
                <Text style={styles.errorText}>{errors.bio}</Text>
              )}
              <Text style={styles.characterCount}>
                {form.bio.length}/150
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || isUpdatingProfile) && styles.disabledSaveButton,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" />
                <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  errorInput: {
    borderColor: '#e74c3c',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    textAlign: 'right',
  },
  readOnlyText: {
    color: '#999',
  },
  bioContainer: {
    alignItems: 'flex-start',
    minHeight: 80,
  },
  bioInput: {
    minHeight: 60,
    marginLeft: 0,
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
  },
  fieldHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
    textAlign: 'right',
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledSaveButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
})