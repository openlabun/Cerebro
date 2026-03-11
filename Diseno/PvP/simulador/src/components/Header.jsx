import { NavLink } from 'react-router-dom'

function Header() {
  return (
    <header className="topbar">
      <NavLink className="logo" to="/">
        Cerebro<span>PvP</span>
      </NavLink>
      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
        >
          Inicio
        </NavLink>
        <NavLink
          to="/simulacion"
          className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
        >
          Simulacion
        </NavLink>
      </nav>
    </header>
  )
}

export default Header
