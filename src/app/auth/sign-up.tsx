import { useState, useCallback, useMemo } from 'react';
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

interface PasswordStrength {
  readonly score: number;
  readonly label: string;
  readonly color: string;
  readonly checks: {
    readonly minLength: boolean;
    readonly hasUppercase: boolean;
    readonly hasNumber: boolean;
  };
}

function sanitizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function sanitizeUsername(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const score = [checks.minLength, checks.hasUppercase, checks.hasNumber].filter(Boolean).length;

  if (score === 0) {
    return { score, label: '', color: RAVE_COLORS.lightGray, checks };
  }
  if (score === 1) {
    return { score, label: 'Weak', color: RAVE_COLORS.laserRed, checks };
  }
  if (score === 2) {
    return { score, label: 'Fair', color: RAVE_COLORS.neonOrange, checks };
  }
  return { score, label: 'Strong', color: RAVE_COLORS.acidGreen, checks };
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const handleSignUp = useCallback(async () => {
    setError(null);

    const cleanUsername = sanitizeUsername(username);
    const cleanEmail = sanitizeEmail(email);

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 characters (letters, numbers, _ or -)');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!passwordStrength.checks.minLength) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!passwordStrength.checks.hasUppercase) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!passwordStrength.checks.hasNumber) {
      setError('Password must contain at least one number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setIsLoading(true);
    const result = await signUp(cleanEmail, password, cleanUsername);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }, [username, email, password, confirmPassword, agreedToTerms, passwordStrength, signUp]);

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Account Created</Text>
        <Text style={styles.successSubtitle}>
          Check your email for a confirmation link to activate your account.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace('/auth/sign-in')}
        >
          <Text style={styles.buttonText}>Go to Sign In</Text>
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the MoshPit community</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="your_username"
            placeholderTextColor={RAVE_COLORS.lightGray + '80'}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
            textContentType="username"
            maxLength={30}
            editable={!isLoading}
          />

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
            placeholder="Min 8 chars, uppercase, number"
            placeholderTextColor={RAVE_COLORS.lightGray + '80'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!isLoading}
          />

          {password.length > 0 ? (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${(passwordStrength.score / 3) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
              <View style={styles.checksContainer}>
                <Text
                  style={[
                    styles.checkItem,
                    { color: passwordStrength.checks.minLength ? RAVE_COLORS.acidGreen : RAVE_COLORS.lightGray },
                  ]}
                >
                  {passwordStrength.checks.minLength ? '+ ' : '- '}8+ characters
                </Text>
                <Text
                  style={[
                    styles.checkItem,
                    { color: passwordStrength.checks.hasUppercase ? RAVE_COLORS.acidGreen : RAVE_COLORS.lightGray },
                  ]}
                >
                  {passwordStrength.checks.hasUppercase ? '+ ' : '- '}Uppercase letter
                </Text>
                <Text
                  style={[
                    styles.checkItem,
                    { color: passwordStrength.checks.hasNumber ? RAVE_COLORS.acidGreen : RAVE_COLORS.lightGray },
                  ]}
                >
                  {passwordStrength.checks.hasNumber ? '+ ' : '- '}Number
                </Text>
              </View>
            </View>
          ) : null}

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor={RAVE_COLORS.lightGray + '80'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!isLoading}
          />

          <Pressable
            style={styles.termsRow}
            onPress={() => setAgreedToTerms((prev) => !prev)}
            disabled={isLoading}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable
              onPress={() => router.push('/auth/sign-in')}
              disabled={isLoading}
            >
              <Text style={styles.footerLink}>Sign In</Text>
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
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: BACKGROUND.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  checksContainer: {
    marginTop: 6,
  },
  checkItem: {
    fontSize: 12,
    marginTop: 2,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BACKGROUND.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: RAVE_COLORS.hotPink,
    borderColor: RAVE_COLORS.hotPink,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: RAVE_COLORS.lightGray,
    lineHeight: 20,
  },
  termsLink: {
    color: RAVE_COLORS.electricBlue,
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
});
