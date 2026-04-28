import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { useAppTheme } from "@/constants/theme";
import { useAuth } from "@/context";
import { useAppStyles } from "@/hooks/useAppStyles";
import AuthRequiredPage from "@/pages/AuthRequiredPage";
import { appRoutes } from "@/routes";

export default function PvpPage() {
  const router = useRouter();
  const theme = useAppTheme();
  const ui = useAppStyles();
  const headerHeight = useHeaderHeight();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <AuthRequiredPage
        title="Debes iniciar sesion para jugar PvP."
        subtitle="Crea tu cuenta o inicia sesion para crear salas y unirte con codigo."
      />
    );
  }

  return (
    <LinearGradient
      colors={ui.gradientColors}
      locations={ui.gradientLocations}
      start={ui.gradientStart}
      end={ui.gradientEnd}
      style={ui.screenStyle}
    >
      <View style={[styles.content, { paddingTop: headerHeight + 12 }]}>
        <View style={styles.copyBlock}>
          <MaterialCommunityIcons
            name="sword-cross"
            size={34}
            color={theme.colors.primary}
            style={styles.eyebrowIcon}
          />
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Reta a otro jugador
          </Text>
          <Text
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            Crea una sala privada o unete rapidamente con un codigo. Ambos
            resuelven el mismo sudoku. Gana quien termine primero con mejor
            precision.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => router.push(appRoutes.pvpCreate)}
            contentStyle={styles.primaryButtonContent}
            style={styles.primaryButton}
          >
            Crear sala
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push(appRoutes.pvpJoin)}
            textColor={theme.colors.primary}
            contentStyle={styles.secondaryButtonContent}
            style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
          >
            Unirme por codigo
          </Button>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 64,
    gap: 32,
  },
  copyBlock: {
    gap: 12,
  },
  eyebrowIcon: {
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  actions: {
    gap: 14,
  },
  primaryButton: {
    borderRadius: 28,
  },
  primaryButtonContent: {
    minHeight: 54,
  },
  secondaryButton: {
    borderRadius: 28,
    borderWidth: 1.5,
  },
  secondaryButtonContent: {
    minHeight: 54,
  },
});
