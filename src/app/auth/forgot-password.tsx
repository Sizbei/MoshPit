import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';

function sanitizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = useCallback(async () => {
    setError(null);

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(cleanEmail);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }, [email, resetPassword]);

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Check Your Email</Text>
        <Text style={styles.successSubtitle}>
          We sent a password reset link to{'\n'}
          <Text style={styles.emailHighlight}>{sanitizeEmail(email)}</Text>
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace('/auth/sign-in')}
        >
          <Text style={styles.buttonText}>Back to Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={RAVE_COLORS.lightGray + '80'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!isLoading}
          />

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.backRow}
            onPress={() => router.replace('/auth/sign-in')}
            disabled={isLoading}
          >
            <Text style={styles.backText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: RAVE_COLORS.lightGray,
    marginBottom: 32,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: RAVE_COLORS.lightGray,
    marginBottom: 6,
  },
  input: {
    backgroundColor: BACKGROUND.card,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorBox: {
    backgroundColor: RAVE_COLORS.laserRed + '20',
    borderWidth: 1,
    borderColor: RAVE_COLORS.laserRed + '60',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: RAVE_COLORS.laserRed,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: RAVE_COLORS.hotPink,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: BACKGROUND.border,
    marginVertical: 24,
  },
  backRow: {
    alignItems: 'center',
  },
  backText: {
    color: RAVE_COLORS.hotPink,
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    fontSize: 48,
    color: RAVE_COLORS.acidGreen,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: RAVE_COLORS.lightGray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emailHighlight: {
    color: RAVE_COLORS.hotPink,
    fontWeight: '600',
  },
});
