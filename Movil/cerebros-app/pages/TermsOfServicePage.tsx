import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Divider, Text } from "react-native-paper";

import { useAppTheme } from "@/constants/theme";

const definitions = [
  {
    term: "Aplicacion",
    description:
      "La aplicacion movil y/o web denominada Cerebro Uninorte, asi como cualquier servicio, contenido, funcionalidad y material disponible a traves de ella.",
  },
  {
    term: "Contenido",
    description:
      "Todo tipo de contenido, incluidos el diseno visual de la Aplicacion, textos, datos, imagenes, graficos, sonidos, musica, animaciones, videos, niveles, insignias, recompensas, comentarios, perfiles, logros y materiales publicados por los usuarios.",
  },
  {
    term: "Dispositivo",
    description:
      "Telefono movil, tableta u otro dispositivo autorizado que el usuario posea o controle legalmente para uso personal, licito y no comercial.",
  },
  {
    term: "Derechos de Propiedad Intelectual",
    description:
      "Todos los derechos de patente, marca, derecho de autor, diseno industrial, secretos empresariales y demas derechos de propiedad intelectual o industrial reconocidos en cualquier jurisdiccion.",
  },
  {
    term: "Servicios",
    description:
      "La Aplicacion, sus funciones relacionadas, su sitio web, sus servicios auxiliares y cualquier otra prestacion asociada.",
  },
  {
    term: "Usuario",
    description:
      "La persona que descarga, instala, accede o utiliza los Servicios.",
  },
  {
    term: "Informacion del Usuario",
    description:
      "Datos personales y demas informacion asociada al uso de los Servicios.",
  },
  {
    term: "Contenido No Aceptable",
    description:
      "Cualquier contenido o conducta relacionada con el uso de la Aplicacion que sea ilegal, ofensiva, danina, enganosa, difamatoria, obscena, discriminatoria, violenta, fraudulenta o contraria a la convivencia o al ordenamiento aplicable.",
  },
  {
    term: "Open Source Software",
    description:
      "Cualquier parte del software de la Aplicacion que este licenciada por terceros bajo licencias de codigo abierto.",
  },
];

const serviceFeatures = [
  "Creacion y finalizacion de partidas.",
  "Niveles de dificultad.",
  "Sistema de pistas.",
  "Perfil de usuario.",
  "Experiencia, niveles y logros.",
  "Modo PvP.",
  "Torneos.",
  "Rankings.",
  "Uso en web y movil.",
];

const licenseRestrictions = [
  "Vender o distribuir la Aplicacion.",
  "Copiarla salvo respaldo permitido.",
  "Modificarla o hacer ingenieria inversa.",
  "Usar el contenido para entrenar inteligencia artificial.",
  "Extraer datos masivamente.",
];

const appUsageRestrictions = [
  "Publicar contenido ilegal u ofensivo.",
  "Realizar acoso o suplantacion.",
  "Usar malware o herramientas similares.",
  "Cometer fraude o spam.",
  "Explotar errores o vulnerabilidades.",
];

const sections = [
  {
    title: "2. Aceptacion de los terminos",
    paragraphs: [
      "Al descargar, instalar, acceder o utilizar Cerebro Uninorte, el Usuario declara que ha leido, entendido y aceptado este Acuerdo y la Politica de Privacidad aplicable.",
      "Si el Usuario no esta de acuerdo con estos terminos, no debe descargar, instalar ni usar la Aplicacion o sus Servicios.",
      "El uso de la Aplicacion implica tambien que el Usuario tiene capacidad legal para celebrar este Acuerdo, es titular del Dispositivo o cuenta con autorizacion legitima para usarlo, y se compromete a cumplir con este Acuerdo y con las leyes aplicables.",
      "Si el Usuario es menor de edad, debera contar con la autorizacion y supervision de su representante legal.",
    ],
  },
  {
    title: "3. Descripcion del servicio",
    paragraphs: [
      "Cerebro Uninorte es una plataforma de juegos de desafio mental cuyo juego base es Sudoku.",
    ],
    bullets: serviceFeatures,
  },
  {
    title: "4. Licencia de uso",
    paragraphs: [
      "Se concede al Usuario una licencia limitada, personal, revocable, no exclusiva e intransferible.",
      "El Usuario no puede:",
    ],
    bullets: licenseRestrictions,
  },
  {
    title: "5. Registro, cuenta y seguridad",
    paragraphs: [
      "El Usuario debe proporcionar informacion veraz y proteger sus credenciales.",
    ],
  },
  {
    title: "6. Uso de la Aplicacion",
    paragraphs: ["Se prohibe:"],
    bullets: appUsageRestrictions,
  },
  {
    title: "7. Juego, rankings y competencia",
    paragraphs: [
      "Los resultados pueden depender de validaciones tecnicas y pueden modificarse en caso de fraude o errores.",
    ],
  },
  {
    title: "8. Contenido de terceros",
    paragraphs: [
      "No se garantiza la exactitud o disponibilidad de contenido externo.",
    ],
  },
  {
    title: "9. Propiedad intelectual",
    paragraphs: [
      "Todos los derechos pertenecen a la Empresa o sus licenciantes.",
    ],
  },
  {
    title: "10. Contenido del usuario",
    paragraphs: [
      "El Usuario otorga licencia para uso del contenido que publique.",
    ],
  },
  {
    title: "11. Privacidad",
    paragraphs: ["El uso esta sujeto a la Politica de Privacidad."],
  },
  {
    title: "12. Disponibilidad",
    paragraphs: [
      "El servicio puede cambiar o interrumpirse en cualquier momento.",
    ],
  },
  {
    title: "13. Conectividad",
    paragraphs: ["El Usuario es responsable de conexion y costos."],
  },
  {
    title: "14. Elementos virtuales",
    paragraphs: ["No tienen valor monetario fuera de la Aplicacion."],
  },
  {
    title: "15. Suspension",
    paragraphs: ["La Empresa puede suspender cuentas por incumplimiento."],
  },
  {
    title: "16. Exencion de garantias",
    paragraphs: ['El servicio se proporciona "tal cual".'],
  },
  {
    title: "17. Limitacion de responsabilidad",
    paragraphs: ["No se responde por danos indirectos."],
  },
  {
    title: "18. Modificaciones",
    paragraphs: ["El Acuerdo puede cambiar en cualquier momento."],
  },
];

export default function TermsOfServicePage() {
  const theme = useAppTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Politica de Privacidad y Terminos de Uso
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Ultima actualizacion: 29 de abril de 2026
      </Text>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          1. Definiciones
        </Text>
        {definitions.map((item) => (
          <Text
            key={item.term}
            style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}
          >
            <Text style={[styles.strong, { color: theme.colors.onSurface }]}>
              {item.term}:{" "}
            </Text>
            {item.description}
          </Text>
        ))}
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            {section.title}
          </Text>

          {section.paragraphs.map((paragraph) => (
            <Text
              key={paragraph}
              style={[
                styles.paragraph,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {paragraph}
            </Text>
          ))}

          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Text
                style={[styles.bulletMark, { color: theme.colors.primary }]}
              >
                -
              </Text>
              <Text
                style={[
                  styles.bulletText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {bullet}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          19. Contacto
        </Text>
        <Text
          style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}
        >
          Si necesitas comunicarte con nosotros, puedes escribirnos a traves de:
        </Text>
        <Text
          style={[styles.link, { color: theme.colors.primary }]}
          onPress={() =>
            Linking.openURL("https://www.instagram.com/cerebro.uninorte")
          }
        >
          https://www.instagram.com/cerebro.uninorte
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  divider: {
    marginVertical: 18,
  },
  section: {
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  strong: {
    fontWeight: "700",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletMark: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
});
