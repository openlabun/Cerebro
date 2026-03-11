const featureCards = [
  {
    title: 'Salas PvP',
    description: 'Crea una base para listar partidas activas, privadas o por matchmaking.',
    badge: '01',
  },
  {
    title: 'Estado de partida',
    description: 'Reserva este espacio para sincronizar turnos, cronometro y tablero.',
    badge: '02',
  },
  {
    title: 'Resultados',
    description: 'Prepara una vista ligera para ranking, revancha y resumen del duelo.',
    badge: '03',
  },
]

function HomePage() {
  return (
    <main>
      <section className="hero welcome-banner">
        <div>
          <p className="eyebrow">Diseno / PvP</p>
          <h1>Simulador React + Vite</h1>
          <p className="lead">
            Base visual alineada con IyR para mantener consistencia grafica en los frontends
            de la aplicacion.
          </p>

          <div className="hero-actions">
            <button className="btn primary" type="button">
              Crear sala
            </button>
            <button className="btn light" type="button">
              Ver ranking
            </button>
            <button className="btn ghost" type="button">
              Configurar duelo
            </button>
          </div>

          <div className="board-actions">
            <span className="chip">Matchmaking</span>
            <span className="chip">1v1</span>
            <span className="chip">Tiempo real</span>
          </div>
        </div>

        <aside className="board-card mode-visual-card pvp-card">
          <div className="mode-visual-inner">
            <span>PvP</span>
            <small>Frontend listo para flujo competitivo</small>
          </div>
        </aside>
      </section>

      <section id="modos" className="games-list">
        <div className="board-card section-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Modulos base</p>
              <h2>Bloques iniciales del simulador</h2>
            </div>
            <span className="stat-chip">React + Vite</span>
          </div>

          <div className="card-grid">
            {featureCards.map((card) => (
              <article key={card.title} className="mode-card">
                <span className="feature-badge">{card.badge}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div id="estado" className="board-card section-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Estado actual</p>
              <h2>Contenedor listo para integracion</h2>
            </div>
            <span className="chip">Puerto 3003</span>
          </div>

          <div className="mode-detail">
            <ul className="mode-view-list">
              <li>Boilerplate de React + Vite creado dentro de `Diseno/PvP/simulador`.</li>
              <li>Servicio agregado a Docker Compose con publicacion directa en `3003`.</li>
              <li>Base visual alineada con tokens, botones y tarjetas de IyR.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
