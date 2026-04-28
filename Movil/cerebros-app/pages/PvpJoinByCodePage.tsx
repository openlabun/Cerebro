import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";

import { useAppTheme } from "@/constants/theme";
import { useAuth } from "@/context";
import AuthRequiredPage from "@/pages/AuthRequiredPage";

export default function PvpJoinByCodePage() {
  const theme = useAppTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [joinCode, setJoinCode] = useState("");

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
        title="Debes iniciar sesion para unirte a una sala PvP."
        subtitle="Crea tu cuenta o inicia sesion para entrar con un codigo."
      />
    );
  }

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>
              UNIRSE RAPIDO
            </Text>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Ingresa el codigo del host
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Escribe el codigo que te compartieron para unirte a la partida.
            </Text>

            <View style={styles.fieldBlock}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Codigo PvP
              </Text>
              <TextInput
                mode="outlined"
                value={joinCode}
                onChangeText={(value) =>
                  setJoinCode(value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="48217"
                keyboardType="number-pad"
                autoCorrect={false}
                maxLength={6}
                contentStyle={styles.inputContent}
                style={styles.input}
                outlineStyle={styles.inputOutline}
              />
            </View>

            <Button
              mode="contained"
              contentStyle={styles.buttonContent}
              style={styles.button}
            >
              Unirme con codigo
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  fieldBlock: {
    gap: 10,
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "transparent",
  },
  inputContent: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 4,
  },
  inputOutline: {
    borderRadius: 18,
  },
  button: {
    borderRadius: 14,
    marginTop: 6,
  },
  buttonContent: {
    minHeight: 52,
  },
});
