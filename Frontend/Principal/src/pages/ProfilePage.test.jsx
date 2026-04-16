import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ProfilePage from './ProfilePage.jsx'

const { mockAuth, mockApiClient } = vi.hoisted(() => ({
  mockAuth: {
    accessToken: null,
    isAuthenticated: false,
    user: null,
  },
  mockApiClient: {
    getMyAchievements: vi.fn(),
    getMyProfile: vi.fn(),
    getMyGameStats: vi.fn(),
    getTournamentResultsByUser: vi.fn(),
    getMyPvpRanking: vi.fn(),
    getMyTournamentHistory: vi.fn(),
  },
}))

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => mockAuth,
}))

vi.mock('../services/apiClient.js', () => ({
  apiClient: mockApiClient,
}))

vi.mock('../components/ProfileCard.jsx', () => ({
  default: ({ activeMode, onModeChange }) => (
    <div>
      <button type="button" onClick={() => onModeChange('sudoku')}>
        Sudoku
      </button>
      <button type="button" onClick={() => onModeChange('torneos')}>
        Torneos
      </button>
      <button type="button" onClick={() => onModeChange('pvp')}>
        PvP
      </button>
      <div>Modo activo: {activeMode}</div>
    </div>
  ),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    mockAuth.accessToken = null
    mockAuth.isAuthenticated = false
    mockAuth.user = null
    Object.values(mockApiClient).forEach((fn) => fn.mockReset())
    mockApiClient.getMyAchievements.mockResolvedValue([])
    mockApiClient.getMyProfile.mockResolvedValue(null)
    mockApiClient.getMyGameStats.mockResolvedValue(null)
    mockApiClient.getTournamentResultsByUser.mockResolvedValue([])
    mockApiClient.getMyPvpRanking.mockResolvedValue(null)
    mockApiClient.getMyTournamentHistory.mockResolvedValue([])
  })

  it('shows finalized tournament history for the authenticated participant', async () => {
    const user = userEvent.setup()
    mockAuth.accessToken = 'token-123'
    mockAuth.isAuthenticated = true
    mockAuth.user = {
      sub: 'user-1',
      name: 'Alice',
    }
    mockApiClient.getMyTournamentHistory.mockResolvedValue([
      {
        _id: 'torneo-1',
        nombre: 'Serie finalizada',
        descripcion: 'Resumen del torneo',
        creadorId: 'creator-1',
        creadorNombre: 'Creator Uno',
        estado: 'FINALIZADO',
        tipo: 'SERIE',
        esPublico: true,
        fechaInicio: '2026-04-01T14:00:00',
        fechaFin: '2026-04-01T15:00:00',
        fechaUnion: '2026-04-01T13:55:00.000Z',
        miPosicion: 2,
        miPuntaje: 140,
        miTiempo: 305,
        miFechaRegistro: '2026-04-01T15:02:00.000Z',
      },
    ])

    renderPage()

    await waitFor(() => {
      expect(mockApiClient.getMyTournamentHistory).toHaveBeenCalledWith('token-123')
    })

    expect(
      screen.queryByText('Resultados de torneos donde participaste'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Torneos' }))

    await waitFor(() => {
      expect(screen.getByText('Resultados de torneos donde participaste')).toBeInTheDocument()
    })

    expect(screen.getByText('Serie finalizada')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver detalle del torneo' }),
    ).toHaveAttribute('href', '/torneos/torneo-1')
  })
})
