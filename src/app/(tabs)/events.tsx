import { View, Text, StyleSheet } from 'react-native';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>
          Browse EDM events and tag your collages
        </Text>
        <Text style={styles.comingSoon}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.editor,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: RAVE_COLORS.lightGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 14,
    color: RAVE_COLORS.hotPink,
    fontWeight: '600',
  },
});
