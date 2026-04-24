import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  TabsProvider,
  useTabIndex,
  useTabNavigation,
} from 'react-native-paper-tabs';

type ProfileModeKey = 'sudoku' | 'torneos' | 'pvp';

type ProfileModeTabsProps = {
  renderScene: (mode: ProfileModeKey) => React.ReactNode;
};

export const profileModeLabels: Record<ProfileModeKey, string> = {
  sudoku: 'Sudoku',
  torneos: 'Torneos',
  pvp: 'PvP',
};

export const profileModeOrder: ProfileModeKey[] = ['sudoku', 'torneos', 'pvp'];

export type { ProfileModeKey };

function ProfileModeTabsInner({ renderScene }: ProfileModeTabsProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const activeIndex = useTabIndex();
  const goTo = useTabNavigation();
  const activeMode = profileModeOrder[activeIndex] ?? profileModeOrder[0];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.tabsRow,
          {
            backgroundColor: theme.dark ? '#363c47' : theme.colors.elevation.level3,
            padding: compact ? 6 : 8,
            borderRadius: compact ? 18 : 20,
          },
        ]}
      >
        {profileModeOrder.map((mode, index) => {
          const active = index === activeIndex;

          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => goTo(index)}
              style={[
                styles.tabButton,
                {
                  minHeight: compact ? 40 : 44,
                  borderRadius: compact ? 14 : 16,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: active
                      ? theme.colors.onSurface
                      : theme.colors.onSurfaceVariant,
                    fontSize: compact ? 13 : 14,
                    lineHeight: compact ? 16 : 18,
                  },
                ]}
              >
                {profileModeLabels[mode]}
              </Text>

              {active ? (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.colors.onSurface },
                  ]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.scene}>{renderScene(activeMode)}</View>
    </View>
  );
}

export function ProfileModeTabs({ renderScene }: ProfileModeTabsProps) {
  return (
    <TabsProvider defaultIndex={0}>
      <ProfileModeTabsInner renderScene={renderScene} />
    </TabsProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: {
    fontWeight: '700',
  },
  activeIndicator: {
    marginTop: 10,
    width: '72%',
    height: 3,
    borderRadius: 999,
  },
  scene: {
    minWidth: 0,
  },
});
