import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>MOSHPIT</Text>
        <Text style={styles.tagline}>Rave Collage Maker</Text>
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: BACKGROUND.editor },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.editor,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: RAVE_COLORS.hotPink,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 14,
    color: RAVE_COLORS.lightGray,
    marginTop: 4,
    letterSpacing: 2,
  },
});
