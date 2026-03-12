import { useAuth } from '../context/AuthContext.jsx'

const pvpFeatures = [
  'Emparejamiento por nivel.',
  'Chat rapido con mensajes predefinidos.',
  'Modo revancha al finalizar la partida.',
]

function SimulationPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return (
    <main>
      <section className="games-list">
        <article className="board-card section-card simulation-card simulation-card--pvp">
          <p className="simulation-matchup">1 vs 1</p>

          <div className="simulation-copy">
            <h1 className="simulation-title">Reta a otro jugador</h1>
            <p className="simulation-description">
              Ambos resuelven el mismo sudoku. Gana quien termine primero con mejor precision.
            </p>
          </div>

          <ul className="simulation-feature-list">
            {pvpFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <button className="btn primary simulation-cta" type="button">
            Buscar rival
          </button>
        </article>
      </section>
    </main>
  )
}

export default SimulationPage
