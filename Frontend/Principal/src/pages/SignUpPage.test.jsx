import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SignUpPage from './SignUpPage.jsx'

const { mockNavigate, mockAuth } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAuth: {
    signup: vi.fn(),
    isAuthenticated: false,
  },
}))

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => mockAuth,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>,
  )
}

describe('SignUpPage', () => {
  function getForm() {
    const form = document.querySelector('form.auth-form')
    expect(form).not.toBeNull()
    return form
  }

  function getSubmitButton() {
    const form = getForm()
    return within(form).getByRole('button', { name: 'Crear cuenta' })
  }

  function getPasswordInput() {
    const input = document.querySelector('input[name="password"]')
    expect(input).not.toBeNull()
    return input
  }

  function getConfirmPasswordInput() {
    const input = document.querySelector('input[name="confirmPassword"]')
    expect(input).not.toBeNull()
    return input
  }

  function getPrivacyCheckbox() {
    const input = document.querySelector('input[name="acceptedPrivacy"]')
    expect(input).not.toBeNull()
    return input
  }

  beforeEach(() => {
    mockNavigate.mockReset()
    mockAuth.isAuthenticated = false
    mockAuth.signup.mockReset()
  })

  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Nombre de usuario'), 'Alice')
    await user.type(screen.getByLabelText('Correo'), 'alice@example.com')
    await user.type(getPasswordInput(), 'Secret1!')
    await user.type(getConfirmPasswordInput(), 'Secret2!')
    await user.click(getSubmitButton())

    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument()
    expect(mockAuth.signup).not.toHaveBeenCalled()
  })

  it('requires accepting the privacy policy before signup', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Nombre de usuario'), 'Alice')
    await user.type(screen.getByLabelText('Correo'), 'alice@example.com')
    await user.type(getPasswordInput(), 'Secret1!')
    await user.type(getConfirmPasswordInput(), 'Secret1!')
    await user.click(getSubmitButton())

    expect(
      screen.getByText(
        'Debes aceptar la Politica de Privacidad y los Terminos de Uso para crear la cuenta.',
      ),
    ).toBeInTheDocument()
    expect(mockAuth.signup).not.toHaveBeenCalled()
  })

  it('redirects to verify-email when signup succeeds without session', async () => {
    const user = userEvent.setup()
    mockAuth.signup.mockResolvedValue({ session: null })
    renderPage()

    await user.type(screen.getByLabelText('Nombre de usuario'), 'Alice')
    await user.type(screen.getByLabelText('Correo'), 'ALICE@Example.com')
    await user.type(getPasswordInput(), 'Secret1!')
    await user.type(getConfirmPasswordInput(), 'Secret1!')
    await user.click(getPrivacyCheckbox())
    await user.click(getSubmitButton())

    await waitFor(() => {
      expect(mockAuth.signup).toHaveBeenCalledWith({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Secret1!',
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith(
      '/verify-email?email=alice%40example.com',
      expect.objectContaining({
        replace: true,
        state: expect.objectContaining({
          message: expect.stringContaining('Cuenta creada.'),
        }),
      }),
    )
  })
})
