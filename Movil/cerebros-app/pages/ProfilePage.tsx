import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { useAppTheme } from '@/constants/theme';
import { useAppStyles } from '@/hooks/useAppStyles';
import { appRoutes } from '@/routes';

export default function ProfilePage() {
  const router = useRouter();
  const theme = useAppTheme();
  const ui = useAppStyles();

  return (
    <LinearGradient
      colors={ui.gradientColors}
      locations={ui.gradientLocations}
      start={ui.gradientStart}
      end={ui.gradientEnd}
      style={ui.screenStyle}
    >
      <View style={styles.content}>
        <Text style={ui.eyebrowStyle}>Perfil</Text>
        <Text style={ui.titleStyle}>Profile Page</Text>
        <Text style={ui.bodyStyle}>
          Esta pantalla ahora vive dentro del tab de perfil y puede crecer sin
          mezclar la logica de navegacion con la vista.
        </Text>

        <Card style={ui.cardStyle}>
          <Card.Content style={ui.cardContentStyle}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Ruta activa:{' '}
              <Text style={{ color: theme.colors.primary }}>
                {appRoutes.profile}
              </Text>
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => router.replace(appRoutes.home)}
          contentStyle={ui.buttonContentStyle}
        >
          Volver al inicio
        </Button>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
