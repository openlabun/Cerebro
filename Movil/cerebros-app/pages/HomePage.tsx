import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { Button, Card, Switch, Text } from 'react-native-paper';

import { useThemeMode } from '@/constants/theme';
import { useAppStyles } from '@/hooks/useAppStyles';
import { appRoutes } from '@/routes';

export default function HomePage() {
  const router = useRouter();
  const { isDark, mode, toggleTheme } = useThemeMode();
  const ui = useAppStyles();

  return (
    <LinearGradient
      colors={ui.gradientColors}
      locations={ui.gradientLocations}
      start={ui.gradientStart}
      end={ui.gradientEnd}
      style={ui.screenStyle}
    >
      <View style={ui.containerStyle}>
        <Text style={ui.eyebrowStyle}>Cerebros App</Text>
        <Text style={ui.titleStyle}>Modo oscuro con React Native Paper</Text>
        <Text style={ui.bodyStyle}>
          Fondo lineal con los mismos colores actuales y una transicion suave
          desde la esquina superior derecha.
        </Text>

        <Card style={ui.cardStyle}>
          <Card.Content style={ui.cardContentStyle}>
            <View style={ui.switchRowStyle}>
              <View style={ui.switchCopyStyle}>
                <Text variant="titleMedium" style={ui.switchTitleStyle}>
                  Activar modo oscuro
                </Text>
                <Text style={ui.switchDescriptionStyle}>
                  Estado actual: {mode === 'dark' ? 'oscuro' : 'claro'}
                </Text>
              </View>
              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={toggleTheme}
          contentStyle={ui.buttonContentStyle}
        >
          Cambiar tema
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.push(appRoutes.profile)}
          contentStyle={ui.buttonContentStyle}
        >
          Ir al perfil
        </Button>
      </View>
    </LinearGradient>
  );
}
