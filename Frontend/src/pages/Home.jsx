import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'
import { ProgressBar } from '../components/UI'

const PATHS = {
  learn: <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></>,
  practice: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  projects: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91 0z" /><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></>,
  jobs: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></>,
  internships: <><rect x="4" y="7" width="16" height="14" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" /><path d="M8 12h8" /><path d="M8 16h5" /></>,
  community: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
  trophy: <><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></>,
  target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
}

function Icon({ name, color, size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}

function Greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const { user } = useAuth()
  const name = user ? user.fullname?.firstname || user.email.split('@')[0] : ''
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([api.get('/my/level').catch(() => null), api.get('/my/skills').catch(() => null)]).then(([lvl, skl]) => {
      const skills = skl?.data || []
      setStats({
        skills: skills.length,
        verified: skills.filter((s) => s.verified).length,
        xp: lvl?.data?.xp || 0,
        levelName: lvl?.data?.levelName || 'Novice',
        progress: lvl?.data?.progress || 0,
      })
    })
  }, [user])

  const discoverCards = [
    { icon: 'learn', title: 'Learn', desc: 'Master technologies through structured courses and roadmaps.', color: '#4f46e5', bg: '#e0e7ff', link: '#/courses' },
    { icon: 'practice', title: 'Practice', desc: 'Write real code and solve technical challenges in our lab.', color: '#2563eb', bg: '#dbeafe', link: '#/code' },
    { icon: 'projects', title: 'Projects', desc: 'Build real projects that prove what you can do.', color: '#7c3aed', bg: '#ede9fe', link: '#/projects' },
    { icon: 'jobs', title: 'Jobs', desc: 'Discover opportunities matched to your verified skills.', color: '#059669', bg: '#dcfce7', link: '#/jobs' },
    { icon: 'internships', title: 'Internships', desc: 'Find internships designed for students and beginners.', color: '#d97706', bg: '#fef3c7', link: '#/internships' },
    { icon: 'community', title: 'Community', desc: 'Learn together, discuss, collaborate and connect.', color: '#db2777', bg: '#fce7f3', link: '#/community' },
    { icon: 'trophy', title: 'Leaderboard', desc: 'See top performers ranked by skills and achievements.', color: '#d97706', bg: '#fef3c7', link: '#/leaderboard' },
    { icon: 'target', title: 'Achievements', desc: 'Unlock badges and prove your progress.', color: '#7c3aed', bg: '#ede9fe', link: '#/achievements' },
  ]

  return (
    <div>
      <section className="hero">
        <div className="container">
          <p style={{ color: '#93c5fd', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Welcome to UniSphere</p>
          <h1>Build your skills.<br />Prove your ability.<br />Find your opportunity.</h1>
          <p>Learn, practice, build projects, connect with people, and discover jobs and internships — all in one place.</p>
          <div className="hero-actions">
            {user ? (
              <>
                <a href="#/courses"><button type="button" className="btn btn-white btn-lg">Continue Learning</button></a>
                <a href="#/code"><button type="button" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>Start Practicing</button></a>
              </>
            ) : (
              <>
                <a href="#/register"><button type="button" className="btn btn-white btn-lg">Get Started</button></a>
                <a href="#/courses"><button type="button" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>Explore</button></a>
              </>
            )}
          </div>
        </div>
      </section>

      {user && (
        <section className="mb-lg">
          <div className="container">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>
              <Greeting />, {name}
            </h2>
            <div className="stats-grid">
              <div className="stat"><div className="stat-value">{stats ? stats.skills : '—'}</div><div className="stat-label">Skills Learned</div></div>
              <div className="stat"><div className="stat-value">{stats ? stats.verified : '—'}</div><div className="stat-label">Verified Skills</div></div>
              <div className="stat"><div className="stat-value">{stats ? stats.xp.toLocaleString() : '—'}</div><div className="stat-label">XP Earned</div></div>
              <div className="stat">
                <div className="stat-value">{stats ? stats.levelName : '—'}</div>
                <div className="stat-label">Level Progress</div>
                {stats && <ProgressBar value={stats.progress} small />}
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore UniSphere</h2>
            <p className="section-sub">Everything you need to learn, practice, and grow your career.</p>
          </div>
          <div className="grid">
            {discoverCards.map((card) => (
              <a key={card.title} href={card.link} className="card card-hover card-interactive">
                <div className="icon-tile" style={{ background: card.bg, marginBottom: 12 }}>
                  <Icon name={card.icon} color={card.color} />
                </div>
                <h3 style={{ marginBottom: 6 }}>{card.title}</h3>
                <p style={{ fontSize: '0.88rem', marginBottom: 16, color: 'var(--muted)' }}>{card.desc}</p>
                <span className="link" style={{ fontSize: '0.85rem' }}>Explore →</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

