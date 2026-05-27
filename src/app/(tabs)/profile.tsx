import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../hooks/useAuth';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';

function getInitials(email: string, username?: string): string {
  if (username && username.length > 0) {
    return username.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const email = user?.email ?? '';
  const username =
    (user?.user_metadata as Record<string, unknown> | undefined)?.username as
      | string
      | undefined;
  const initials = getInitials(email, username);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSignOut = useCallback(async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setIsSigningOut(true);
          await signOut();
          setIsSigningOut(false);
        },
      },
    ]);
  }, [signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your collages and data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            // Account deletion requires a server-side function or admin API.
            // For now, sign the user out and show a notice.
            Alert.alert(
              'Request Sent',
              'Please contact support to complete account deletion. You have been signed out.',
              [
                {
                  text: 'OK',
                  onPress: async () => {
                    await signOut();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [signOut]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        {username ? (
          <Text style={styles.username}>@{username}</Text>
        ) : null}
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{email}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>
            <Text style={styles.rowValue}>{username ?? 'Not set'}</Text>
          </View>
        </View>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plan</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Free</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <Pressable style={styles.row}>
            <Text style={styles.rowLabel}>Upgrade to Pro</Text>
            <Text style={styles.rowAction}>Coming soon</Text>
          </Pressable>
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>{appVersion}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.signOutButton, isSigningOut && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={isSigningOut}
        >
          <Text style={styles.deleteText}>Delete Account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.editor,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RAVE_COLORS.hotPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: RAVE_COLORS.lightGray,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: RAVE_COLORS.lightGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: BACKGROUND.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  rowValue: {
    fontSize: 15,
    color: RAVE_COLORS.lightGray,
    maxWidth: '60%',
    textAlign: 'right',
  },
  rowAction: {
    fontSize: 14,
    color: RAVE_COLORS.hotPink,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: BACKGROUND.border,
    marginLeft: 16,
  },
  badge: {
    backgroundColor: RAVE_COLORS.hotPink + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: RAVE_COLORS.hotPink,
  },
  actions: {
    marginTop: 40,
    gap: 12,
  },
  signOutButton: {
    backgroundColor: BACKGROUND.card,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteText: {
    color: RAVE_COLORS.laserRed,
    fontSize: 14,
    fontWeight: '500',
  },
});
