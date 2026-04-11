import { StyleSheet, Text, View } from 'react-native';

import { useThemeMode } from '@/constants/theme';

export function Header() {
  const { isDark } = useThemeMode();

  return (
    <View style={styles.container}>
      <Text style={[styles.logoBase, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>
        Cere
        <Text style={[styles.logoAccent, { color: isDark ? '#7AAEAF' : '#8EB7DF' }]}>bro</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  logoBase: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    letterSpacing: -1,
  },
  logoAccent: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    letterSpacing: -1,
  },
});
