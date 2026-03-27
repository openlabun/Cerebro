import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { apiClient } from '../services/apiClient.js'

function ForgotPasswordPage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(() => String(searchParams.get('email') || '').trim())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(
    'Escribe tu correo y te ayudaremos a iniciar el proceso de recuperacion.',
  )
  const [tone, setTone] = useState('info')

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    if (!email.trim()) {
      setTone('error')
      setMessage('Ingresa el correo asociado a tu cuenta.')
      return
    }

    setIsSubmitting(true)
    setTone('info')
    setMessage('Solicitando recuperacion...')

    try {
      await apiClient.forgotPassword({ email: email.trim().toLowerCase() })
      setTone('success')
      setMessage(
        'Si el correo existe, revisa tu bandeja y sigue las instrucciones para recuperar tu contrasena.',
      )
    } catch (error) {
      setTone('error')
      setMessage(error instanceof Error ? error.message : 'No fue posible iniciar la recuperacion.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <section className="auth-page">
        <div className="auth-page-header">
          <h1>Recuperar contrasena</h1>
        </div>

        <div className="auth-shell">
          <article className="auth-card">
            <div className="auth-tabs">
              <Link className="auth-tab" to="/login">
                Iniciar sesion
              </Link>
              <Link className="auth-tab" to="/signup">
                Crear cuenta
              </Link>
              <button className="auth-tab active" type="button">
                Recuperar acceso
              </button>
            </div>

            <p className="auth-copy">
              Te pediremos solo el correo. El resto del proceso continuara desde el mensaje que te
              envie el backend.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Correo</span>
                <input
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  spellCheck="false"
                  type="email"
                  value={email}
                />
              </label>

              <p className={`auth-feedback auth-feedback--inline${tone !== 'info' ? ` ${tone}` : ''}`}>
                {message}
              </p>

              <button className="btn primary auth-submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Solicitando...' : 'Enviar instrucciones'}
              </button>
            </form>

            <p className="auth-links">
              Ya tienes el token? <Link to="/reset-password">Restablecer contrasena</Link>
            </p>

            <p className="auth-links">
              Recordaste tu clave? <Link to="/login">Volver al login</Link>
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
