const featureCards = [
  {
    title: 'Salas PvP',
    description: 'Crea una base para listar partidas activas, privadas o por matchmaking.',
  },
  {
    title: 'Estado de partida',
    description: 'Reserva este espacio para sincronizar turnos, cronometro y tablero.',
  },
  {
    title: 'Resultados',
    description: 'Prepara una vista ligera para ranking, revancha y resumen del duelo.',
  },
]

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Diseno / PvP</p>
        <h1>Simulador React + Vite</h1>
        <p className="lead">
          Boilerplate inicial para levantar el frontend del simulador PvP dentro de Docker.
        </p>
      </section>

      <section className="card-grid">
        {featureCards.map((card) => (
          <article key={card.title} className="feature-card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
