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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
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
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    const result = await signIn(cleanEmail, password);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    }
  }, [email, password, signIn]);

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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

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

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Your password"
            placeholderTextColor={RAVE_COLORS.lightGray + '80'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            editable={!isLoading}
          />

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => router.push('/auth/forgot-password')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Forgot your password?</Text>
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable
              onPress={() => router.push('/auth/sign-up')}
              disabled={isLoading}
            >
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: RAVE_COLORS.lightGray,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: RAVE_COLORS.lightGray,
    marginBottom: 6,
    marginTop: 16,
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
    marginBottom: 8,
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
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: RAVE_COLORS.electricBlue,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: BACKGROUND.border,
    marginVertical: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: RAVE_COLORS.lightGray,
    fontSize: 14,
  },
  footerLink: {
    color: RAVE_COLORS.hotPink,
    fontSize: 14,
    fontWeight: '600',
  },
});
