import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react-native';
import { router } from 'expo-router';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Sign up specific validations
    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters long';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      if (isLogin) {
        Alert.alert('Login Successful', 'Welcome back!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      } else {
        Alert.alert('Account Created', 'Your account has been created successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      }
    }, 1500);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  const InputField = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    error, 
    secureTextEntry = false,
    keyboardType = 'default',
    showPasswordToggle = false,
    onTogglePassword
  }: {
    icon: React.ReactNode;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    showPasswordToggle?: boolean;
    onTogglePassword?: () => void;
  }) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <View style={styles.inputIcon}>
          {icon}
        </View>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {showPasswordToggle && (
          <TouchableOpacity style={styles.passwordToggle} onPress={onTogglePassword}>
            {secureTextEntry ? (
              <EyeOff size={20} color="#64748B" />
            ) : (
              <Eye size={20} color="#64748B" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Sign up to get started with your tasks'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <InputField
                icon={<User size={20} color="#64748B" />}
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                error={errors.name}
              />
            )}

            <InputField
              icon={<Mail size={20} color="#64748B" />}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              error={errors.email}
              keyboardType="email-address"
            />

            {!isLogin && (
              <InputField
                icon={<Phone size={20} color="#64748B" />}
                placeholder="Phone Number"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                error={errors.phone}
                keyboardType="phone-pad"
              />
            )}

            <InputField
              icon={<Lock size={20} color="#64748B" />}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              error={errors.password}
              secureTextEntry={!showPassword}
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {!isLogin && (
              <InputField
                icon={<Lock size={20} color="#64748B" />}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                showPasswordToggle={true}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )}

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading 
                  ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                  : (isLogin ? 'Sign In' : 'Create Account')
                }
              </Text>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={toggleAuthMode}>
                <Text style={styles.switchLink}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter-Regular',
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  switchLink: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});