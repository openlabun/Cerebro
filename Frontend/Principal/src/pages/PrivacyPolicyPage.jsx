const LAST_UPDATED = '29 de abril de 2026'

const DEFINITIONS = [
  ['Aplicacion', 'La aplicacion movil y/o web denominada Cerebro Uninorte, asi como cualquier servicio, contenido, funcionalidad y material disponible a traves de ella.'],
  ['Contenido', 'Todo tipo de contenido, incluidos, entre otros, el diseno visual de la Aplicacion, textos, datos, imagenes, graficos, sonidos, musica, animaciones, videos, niveles, insignias, recompensas, comentarios, perfiles, logros, materiales cargados o publicados por los usuarios y cualquier otro elemento disponible a traves de la Aplicacion o de sus servicios asociados.'],
  ['Dispositivo', 'Telefono movil, tableta u otro dispositivo autorizado que el usuario posea o controle legalmente para uso personal, licito y no comercial.'],
  ['Derechos de Propiedad Intelectual', 'Todos los derechos de patente, marca, derecho de autor, diseno industrial, secretos empresariales y demas derechos de propiedad intelectual o industrial reconocidos en cualquier jurisdiccion.'],
  ['Servicios', 'La Aplicacion, sus funciones relacionadas, su sitio web, sus servicios auxiliares y cualquier otra prestacion asociada.'],
  ['Usuario', 'La persona que descarga, instala, accede o utiliza los Servicios.'],
  ['Informacion del Usuario', 'Datos personales y demas informacion asociada al uso de los Servicios.'],
  ['Contenido No Aceptable', 'Cualquier contenido o conducta relacionada con el uso de la Aplicacion que sea ilegal, ofensiva, danina, enganosa, difamatoria, obscena, discriminatoria, violenta, fraudulenta o contraria a la convivencia o al ordenamiento aplicable.'],
  ['Open Source Software', 'Cualquier parte del software de la Aplicacion que este licenciada por terceros bajo licencias de codigo abierto.'],
]

const SECTIONS = [
  {
    title: '2. Aceptacion de los terminos',
    paragraphs: [
      'Al descargar, instalar, acceder o utilizar Cerebro Uninorte, el Usuario declara que ha leido, entendido y aceptado este Acuerdo y la Politica de Privacidad aplicable.',
      'Si el Usuario no esta de acuerdo con estos terminos, no debe descargar, instalar ni usar la Aplicacion o sus Servicios.',
      'El uso de la Aplicacion implica tambien que el Usuario:',
    ],
    orderedItems: [
      'tiene capacidad legal para celebrar este Acuerdo;',
      'es titular del Dispositivo o cuenta con autorizacion legitima para usarlo; y',
      'se compromete a cumplir con este Acuerdo y con las leyes aplicables.',
    ],
    closing:
      'Si el Usuario es menor de edad, debera contar con la autorizacion y supervision de su representante legal, cuando asi lo exija la ley.',
  },
  {
    title: '3. Descripcion del servicio',
    paragraphs: [
      'Cerebro Uninorte es una plataforma de juegos de desafio mental cuyo juego base es Sudoku. La Aplicacion puede incluir, entre otras funciones:',
    ],
    listItems: [
      'creacion, carga, validacion y finalizacion de partidas;',
      'seleccion de niveles de dificultad;',
      'sistema de pistas limitadas;',
      'perfil de usuario con alias y avatar;',
      'sistema de experiencia, niveles, logros y misiones;',
      'competencia entre jugadores en modo PvP;',
      'torneos;',
      'rankings y metricas de desempeno;',
      'funcionamiento en entornos web y movil.',
    ],
    closing:
      'Las funciones disponibles pueden variar segun la version, el dispositivo, la plataforma, la region o las actualizaciones del producto.',
  },
  {
    title: '4. Licencia de uso',
    paragraphs: [
      'Se concede al Usuario una licencia limitada, personal, revocable, no exclusiva e intransferible para descargar, instalar y utilizar Cerebro Uninorte en sus Dispositivos, unicamente para fines personales y no comerciales, y siempre conforme a este Acuerdo.',
      'La Aplicacion no se vende al Usuario; se licencia para su uso.',
      'Salvo autorizacion expresa por escrito, el Usuario no puede:',
    ],
    listItems: [
      'vender, revender, alquilar, sublicenciar, ceder, distribuir o transferir la Aplicacion;',
      'copiar la Aplicacion, salvo una copia de respaldo cuando la ley lo permita;',
      'poner la Aplicacion a disposicion de terceros en una red;',
      'modificar, descompilar, desensamblar, realizar ingenieria inversa o crear obras derivadas;',
      'eliminar avisos legales, marcas o indicaciones de titularidad;',
      'usar medios automaticos o manuales para interferir con el funcionamiento normal de la Aplicacion;',
      'explotar el Contenido para entrenar, alimentar o mejorar sistemas de inteligencia artificial, salvo autorizacion expresa y escrita del titular;',
      'capturar, extraer o recolectar datos del sistema de forma masiva para fines no autorizados.',
    ],
    closing:
      'El software de codigo abierto incluido en la Aplicacion se regira por sus respectivas licencias.',
  },
  {
    title: '5. Registro, cuenta y seguridad',
    paragraphs: [
      'Para acceder a ciertas funciones, el Usuario puede necesitar crear una cuenta.',
      'El Usuario se compromete a:',
    ],
    listItems: [
      'proporcionar informacion veraz, actual y completa;',
      'mantener sus datos actualizados;',
      'custodiar sus credenciales de acceso;',
      'notificar de inmediato cualquier uso no autorizado de su cuenta.',
    ],
    closing:
      'El Usuario es responsable de toda actividad realizada desde su cuenta, salvo que la ley aplicable disponga otra cosa. La cuenta puede incluir alias, avatar, progreso, logros, estadisticas y otra informacion visible para otros usuarios, segun la configuracion de la Aplicacion.',
  },
  {
    title: '6. Uso de la Aplicacion y conducta del usuario',
    paragraphs: [
      'El Usuario se obliga a usar la Aplicacion de manera licita, respetuosa y conforme a este Acuerdo.',
      'Queda prohibido:',
    ],
    listItems: [
      'publicar o transmitir Contenido No Aceptable;',
      'acosar, amenazar, difamar, hostigar o discriminar a otros usuarios;',
      'suplantar identidades;',
      'intentar vulnerar sistemas de seguridad;',
      'introducir virus, malware, scripts maliciosos o herramientas daninas;',
      'hacer spam, publicidad no autorizada o fraudes;',
      'infringir derechos de terceros;',
      'explotar errores del sistema para obtener ventajas indebidas.',
    ],
    closing:
      'La Empresa podra, a su discrecion, retirar contenido, restringir funcionalidades, suspender cuentas o tomar otras medidas cuando detecte uso indebido o infracciones.',
  },
  {
    title: '7. Juego, progreso, rankings y competencia',
    paragraphs: [
      'La Aplicacion puede incluir sistemas de progreso, niveles, logros, misiones, rankings, partidas PvP y torneos.',
      'El Usuario entiende y acepta que:',
    ],
    listItems: [
      'los resultados, rankings y puntuaciones pueden depender de validaciones automaticas y/o server-side;',
      'el rendimiento, los empates, las clasificaciones y los torneos pueden verse afectados por factores tecnicos, de conexion o de integridad competitiva;',
      'la Empresa puede ajustar reglas, balance, metricas, temporadas, torneos, recompensas y criterios de clasificacion para mantener la equidad y el funcionamiento del sistema;',
      'los rankings y logros reflejan datos del sistema y pueden modificarse si se detectan errores, fraude o manipulacion.',
    ],
    closing:
      'La Empresa podra suspender o anular resultados obtenidos mediante trampas, abuso de fallos, manipulacion de tiempos, bots, scripts o cualquier conducta desleal.',
  },
  {
    title: '8. Contenido de terceros y enlaces externos',
    paragraphs: [
      'La Aplicacion puede contener enlaces, servicios, funciones o contenidos de terceros.',
      'La Empresa no controla ni garantiza:',
    ],
    listItems: [
      'la exactitud de esos contenidos;',
      'su disponibilidad;',
      'sus politicas de uso;',
      'su seguridad o legalidad.',
    ],
    closing:
      'El acceso a servicios de terceros sera bajo responsabilidad del Usuario y conforme a los terminos de cada tercero.',
  },
  {
    title: '9. Propiedad intelectual',
    paragraphs: [
      'Todos los Derechos de Propiedad Intelectual sobre la Aplicacion, su diseno, marca, interfaces, codigo, elementos visuales, textos, sistemas, bases de datos y demas materiales pertenecen a la Empresa o a sus licenciantes, salvo que se indique lo contrario.',
      'Nada de lo dispuesto en este Acuerdo concede al Usuario derechos de propiedad sobre la Aplicacion o sobre su Contenido, mas alla de la licencia limitada de uso aqui establecida.',
    ],
  },
  {
    title: '10. Contenido generado por el usuario',
    paragraphs: [
      'Si la Aplicacion permite publicar, subir o compartir contenido, el Usuario conserva los derechos que legalmente le correspondan sobre dicho contenido, pero otorga a la Empresa una licencia no exclusiva, mundial, gratuita, sublicenciable y transferible para alojarlo, reproducirlo, adaptarlo, mostrarlo, transmitirlo y distribuirlo en la medida necesaria para operar, mejorar y prestar los Servicios.',
      'El Usuario declara y garantiza que cualquier contenido que aporte:',
    ],
    listItems: [
      'es suyo o cuenta con los permisos necesarios;',
      'no infringe derechos de terceros;',
      'no viola leyes ni este Acuerdo.',
    ],
    closing:
      'La Empresa podra eliminar contenido que considere inapropiado, ilicito o perjudicial para la comunidad o para la integridad del servicio.',
  },
  {
    title: '11. Privacidad',
    paragraphs: [
      'El uso de la Aplicacion tambien esta sujeto a la Politica de Privacidad aplicable, que forma parte de este Acuerdo por referencia.',
      'La forma en que se recolectan, usan, almacenan y comparten los datos del Usuario debe explicarse en dicha politica.',
    ],
  },
  {
    title: '12. Disponibilidad, actualizaciones y cambios',
    paragraphs: [
      'La Empresa puede modificar, actualizar, suspender o discontinuar total o parcialmente la Aplicacion o cualquiera de sus funciones en cualquier momento.',
      'La Empresa no garantiza:',
    ],
    listItems: [
      'que la Aplicacion este siempre disponible;',
      'que funcione sin interrupciones o sin errores;',
      'que todas las funciones esten disponibles en todos los dispositivos o plataformas;',
      'que el servicio sea compatible con todos los sistemas operativos o versiones.',
    ],
    closing:
      'Las actualizaciones pueden instalarse automaticamente o requerir aceptacion previa del Usuario. Algunas actualizaciones pueden ser necesarias para seguir usando la Aplicacion.',
  },
  {
    title: '13. Conectividad, costos y compatibilidad',
    paragraphs: [
      'El Usuario es responsable de contar con el dispositivo, conexion a internet y plan de datos necesarios para usar la Aplicacion, asi como de asumir los costos asociados.',
      'La Empresa no garantiza compatibilidad con todos los dispositivos, redes, sistemas operativos o configuraciones.',
    ],
  },
  {
    title: '14. Recompensas virtuales y elementos digitales',
    paragraphs: [
      'La Aplicacion puede incluir elementos virtuales, recompensas cosmeticas, monedas, insignias u otros objetos digitales.',
      'El Usuario reconoce que estos elementos:',
    ],
    listItems: [
      'no tienen valor monetario fuera de la Aplicacion;',
      'no pueden canjearse por dinero real, salvo que la ley o la Empresa indiquen expresamente lo contrario;',
      'no pueden transferirse, venderse ni sublicenciarse entre usuarios, salvo autorizacion expresa.',
    ],
    closing:
      'Si existieran funciones de sincronizacion entre dispositivos, la disponibilidad de estos elementos dependera de las reglas tecnicas y del diseno del sistema.',
  },
  {
    title: '15. Suspension y terminacion',
    paragraphs: [
      'La Empresa puede suspender o cancelar el acceso del Usuario a la Aplicacion, total o parcialmente, si considera razonablemente que el Usuario:',
    ],
    listItems: [
      'ha incumplido este Acuerdo;',
      'ha actuado de forma fraudulenta o abusiva;',
      'ha puesto en riesgo la seguridad del sistema o de otros usuarios;',
      'ha infringido derechos de terceros o la ley.',
    ],
    closing:
      'El Usuario puede dejar de usar la Aplicacion en cualquier momento y desinstalarla de su Dispositivo.',
  },
  {
    title: '16. Exencion de garantias',
    paragraphs: [
      'La Aplicacion y los Servicios se proporcionan “tal cual” y “segun disponibilidad”.',
      'En la medida maxima permitida por la ley, la Empresa no garantiza:',
    ],
    listItems: [
      'que la Aplicacion sea ininterrumpida, segura o libre de errores;',
      'que el contenido sea exacto, completo o actualizado;',
      'que la Aplicacion cumpla con expectativas particulares del Usuario;',
      'que los defectos seran corregidos de manera inmediata.',
    ],
  },
  {
    title: '17. Limitacion de responsabilidad',
    paragraphs: [
      'En la medida maxima permitida por la ley, la Empresa no sera responsable por danos indirectos, incidentales, especiales, consecuenciales o punitivos, incluyendo perdida de datos, perdida de beneficios, interrupcion del servicio o dano reputacional, derivados del uso o imposibilidad de uso de la Aplicacion.',
      'Nada de lo anterior limitara responsabilidades que no puedan excluirse por ley.',
    ],
  },
  {
    title: '18. Modificaciones de este Acuerdo',
    paragraphs: [
      'La Empresa puede modificar este Acuerdo en cualquier momento.',
      'Cuando corresponda, la version actualizada entrara en vigor desde su publicacion o desde la fecha indicada en el documento.',
      'El uso continuado de la Aplicacion despues de una modificacion implica la aceptacion de los nuevos terminos.',
    ],
  },
  {
    title: '19. Contacto',
    paragraphs: [
      'Para consultas, reportes de contenido o asuntos relacionados con este Acuerdo, el canal oficial de contacto es:',
    ],
    contactLink: 'https://www.instagram.com/cerebro.uninorte',
  },
]

function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <section className="legal-page-header">
        <p className="section-kicker">Documento publico</p>
        <h1>Acuerdo de licencia de usuario final y terminos de uso</h1>
        <p className="legal-page-copy">Cerebro Uninorte</p>
        <p className="legal-page-updated">Ultima actualizacion: {LAST_UPDATED}</p>
      </section>

      <article className="board-card legal-card">
        <section className="legal-section">
          <h2>1. Definiciones</h2>
          <dl className="legal-definition-list">
            {DEFINITIONS.map(([term, description]) => (
              <div key={term} className="legal-definition-item">
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        {SECTIONS.map((section) => (
          <section key={section.title} className="legal-section">
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.orderedItems?.length ? (
              <ol>
                {section.orderedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : null}
            {section.listItems?.length ? (
              <ul>
                {section.listItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.closing ? <p>{section.closing}</p> : null}
            {section.contactLink ? (
              <p>
                Instagram:{' '}
                <a href={section.contactLink} target="_blank" rel="noreferrer">
                  {section.contactLink}
                </a>
              </p>
            ) : null}
          </section>
        ))}
      </article>
    </main>
  )
}

export default PrivacyPolicyPage
