import { Tabs } from 'expo-router';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: RAVE_COLORS.hotPink,
        tabBarInactiveTintColor: RAVE_COLORS.lightGray,
        tabBarStyle: {
          backgroundColor: BACKGROUND.surface,
          borderTopColor: BACKGROUND.border,
        },
        headerStyle: { backgroundColor: BACKGROUND.editor },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Collages',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarLabel: 'Create',
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarLabel: 'Events',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
