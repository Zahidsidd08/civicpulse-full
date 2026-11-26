import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report' },
  { to: '/map', label: 'Map' },
  { to: '/leaderboard', label: 'Leaderboard' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center rounded-lg bg-white px-3 py-1">
          <img src="/logo.png" alt="CivicPulse" className="h-9 w-auto" />
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/report"
            className="ml-2 hidden rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 md:block"
          >
            Report an Issue
          </Link>
        </nav>
      </div>
    </header>
  )
}