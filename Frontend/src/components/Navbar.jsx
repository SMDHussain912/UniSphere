import { useState } from 'react'
import { useHashLocation, navigate } from '../router'
import { useAuth } from '../auth/AuthContext'
import { STAFF_ROLES } from './UI'

function NavLink({ to, children, className = '' }) {
  const path = useHashLocation()
  const active = path === to || (to !== '/' && path.startsWith(`${to}/`))
  return (
    <a href={`#${to}`} className={`${className} ${active ? 'active' : ''}`}>
      {children}
    </a>
  )
}

function Dropdown({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="dropdown" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="dropdown-toggle" onClick={() => setOpen(!open)}>
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ marginLeft: 4, opacity: 0.6 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {open && <div className="dropdown-menu">{children}</div>}
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const name = user ? user.fullname?.firstname || user.email : ''
  const isStaff = user && STAFF_ROLES.includes(user.role)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav className="navbar">
        <div className="container nav-inner">
          <a href="#/" className="brand">
            <span className="mark">U</span> UniSphere
          </a>
          <button type="button" className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></> : <><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
          <div className="nav-links">
            <Dropdown label="Learn">
              <a href="#/courses">Courses</a>
              <a href="#/exams">Assessments</a>
              <a href="#/skills">Skills</a>
            </Dropdown>
            <Dropdown label="Practice">
              <a href="#/code">Code Lab</a>
              <a href="#/projects">Projects</a>
              <a href="#/challenges">Challenges</a>
            </Dropdown>
            <Dropdown label="Career">
              <a href="#/jobs">Jobs</a>
              <a href="#/internships">Internships</a>
            </Dropdown>
            <a href="#/community">
            <a href="#/office" onClick={() =>
            <a href="#/database" onClick={() => setMobileOpen(false)}>Database</a>
            <a href="#/api-tools" onClick={() => setMobileOpen(false)}>API Tools</a>
            <a href="#/careers" onClick={() => setMobileOpen(false)}>Careers</a>
 setMobileOpen(false)}>Office</a>
Community</a>
            <a href="#/leaderboard">Leaderboard</a>
            {isStaff && <a href="#/admin">Workspace</a>}
          </div>
          <div className="nav-right">
            {user ? (
              <>
                <a href="#/achievements" className="nav-link-icon" title="Achievements">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                  </svg>
                </a>
                <NavLink to="/profile" className="username">{name}</NavLink>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <a href="#/register"><button type="button" className="btn btn-primary btn-sm">Register</button></a>
              </>
            )}
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="nav-mobile-menu">
          <a href="#/courses" onClick={() => setMobileOpen(false)}>Courses</a>
          <a href="#/exams" onClick={() => setMobileOpen(false)}>Assessments</a>
          <a href="#/code" onClick={() => setMobileOpen(false)}>Code Lab</a>
          <a href="#/projects" onClick={() => setMobileOpen(false)}>Projects</a>
          <a href="#/jobs" onClick={() => setMobileOpen(false)}>Jobs</a>
          <a href="#/community" onClick={() => setMobileOpen(false)}>Community</a>
          <a href="#/leaderboard" onClick={() => setMobileOpen(false)}>Leaderboard</a>
          {isStaff && <a href="#/admin" onClick={() => setMobileOpen(false)}>Workspace</a>}
        </div>
      )}
      <div className="mobile-nav">
        <a href="#/" className={useHashLocation() === '/' ? 'active' : ''}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
          Home
        </a>
        <a href="#/courses"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>Learn</a>
        <a href="#/code"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></svg>Code</a>
        <a href="#/projects"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>Build</a>
        <a href="#/profile"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>Profile</a>
      </div>
    </>
  )
}
