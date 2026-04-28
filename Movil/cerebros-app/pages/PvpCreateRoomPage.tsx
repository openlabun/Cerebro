import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Menu, Text } from "react-native-paper";

import { useAppTheme } from "@/constants/theme";
import { useAuth } from "@/context";
import AuthRequiredPage from "@/pages/AuthRequiredPage";
import { difficultyLevels, getDifficultyByKey, getHintLimit } from "@/services";

export default function PvpCreateRoomPage() {
  const theme = useAppTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [difficultyMenuVisible, setDifficultyMenuVisible] = useState(false);
  const [selectedDifficultyKey, setSelectedDifficultyKey] = useState("medio");
  const selectedDifficulty = getDifficultyByKey(selectedDifficultyKey);

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingScreen,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredPage
        title="Debes iniciar sesion para crear una sala PvP."
        subtitle="Crea tu cuenta o inicia sesion para generar un codigo de partida."
      />
    );
  }

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>
            CREAR SALA
          </Text>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Tu tablero, tu codigo
          </Text>

          <View style={styles.fieldBlock}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Dificultad:
            </Text>

            <Menu
              visible={difficultyMenuVisible}
              onDismiss={() => setDifficultyMenuVisible(false)}
              anchor={
                <Pressable
                  onPress={() => setDifficultyMenuVisible(true)}
                  style={[
                    styles.selector,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                >
                  <Text style={[styles.selectorText, { color: theme.colors.onSurface }]}>
                    {selectedDifficulty.label}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </Pressable>
              }
            >
              {difficultyLevels.map((level) => (
                <Menu.Item
                  key={level.key}
                  title={level.label}
                  onPress={() => {
                    setSelectedDifficultyKey(level.key);
                    setDifficultyMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            <Text style={[styles.helperPrimary, { color: theme.colors.primary }]}>
              Tablero PvP: {selectedDifficulty.label}
            </Text>
            <Text
              style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}
            >
              En single player esta dificultad permite {getHintLimit(selectedDifficulty)} pista(s).
              En PvP las pistas siguen deshabilitadas para ambos jugadores.
            </Text>
          </View>

          <Button
            mode="contained"
            contentStyle={styles.buttonContent}
            style={styles.button}
          >
            Crear partida
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  section: {
    gap: 12,
  },
  eyebrow: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: 2.2,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  fieldBlock: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  selector: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  helperPrimary: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    borderRadius: 14,
    marginTop: 6,
  },
  buttonContent: {
    minHeight: 52,
  },
});
