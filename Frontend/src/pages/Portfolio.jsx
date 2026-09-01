import { useEffect, useState } from 'react'
import { useHashLocation } from '../router'
import { api } from '../api'
import { Loader, EmptyState, ProgressBar, Badge } from '../components/UI'

const LEVEL_ICONS = ['', 'Apprentice', 'Developer', 'Engineer', 'Expert', 'Master']

export default function Portfolio() {
  const location = useHashLocation()
  const segs = location.split('/').filter(Boolean)
  const userId = segs[1]
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(userId ? `/portfolio/${userId}` : '/portfolio')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Loader />
  if (!data) return <EmptyState text="Portfolio not available." />

  const { user, profile, stats, projects, achievements, skillEvidence } = data
  const fullname = user.fullname
  const displayName = `${fullname.firstname} ${fullname.lastname}`

  return (
    <div className="portfolio-layout">
      <aside className="portfolio-sidebar">
        <div className="portfolio-card">
          <div className="portfolio-avatar">{fullname.firstname?.[0]}{fullname.lastname?.[0]}</div>
          <h2 className="portfolio-name">{displayName}</h2>
          <p className="portfolio-role">{user.role}</p>
          <p className="portfolio-member">Member since {new Date(user.memberSince).getFullYear()}</p>
          {profile?.headline && <Badge kind="info">{profile.headline}</Badge>}
          <div className="portfolio-stats-grid">
            <div className="stat"><span className="stat-value">{stats.learningPoints}</span><span className="stat-label">Learning Points</span></div>
            <div className="stat"><span className="stat-value">{stats.levelName}</span><span className="stat-label">Level</span></div>
            <div className="stat"><span className="stat-value">{stats.projectsCompleted}</span><span className="stat-label">Projects</span></div>
            <div className="stat"><span className="stat-value">{stats.achievements}</span><span className="stat-label">Achievements</span></div>
          </div>
          <div className="portfolio-section mt">
            <h3 className="section-title">Badges</h3>
            <div className="badges">
              {stats.badges.map((b) => <Badge key={b} kind="gold">{b}</Badge>)}
            </div>
          </div>
        </div>
      </aside>
      <main className="portfolio-main">
        <div className="portfolio-section">
          <h2 className="section-title">About</h2>
          <p className="sub">{profile?.bio || 'No bio added yet.'}</p>
        </div>
        <div className="portfolio-section">
          <h2 className="section-title">Verified Skills</h2>
          {stats.verifiedSkills.length === 0 ? (
            <EmptyState text="No verified skills yet." />
          ) : (
            <div className="skills-list">
              {stats.verifiedSkills.map((s) => (
                <div key={s.skillKey} className="skill-row">
                  <span className="skill-key">{s.skillKey}</span>
                  <ProgressBar value={s.level} label={`${s.level}%`} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="portfolio-section">
          <h2 className="section-title">Recent Projects</h2>
          {projects.length === 0 ? (
            <EmptyState text="No projects completed yet." />
          ) : (
            <div className="projects-list">
              {projects.map((p) => (
                <div key={p.slug} className="project-row">
                  <div>
                    <h3 className="project-title">{p.title}</h3>
                    <div className="project-skills">
                      {(p.skills || []).map((s) => <Badge key={s} kind="info">{s}</Badge>)}
                    </div>
                  </div>
                  <Badge kind={p.score >= 80 ? 'gold' : p.score >= 60 ? 'info' : 'muted'}>
                    {p.score}/{p.totalPoints}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="portfolio-section">
          <h2 className="section-title">Recent Achievements</h2>
          {achievements.length === 0 ? (
            <EmptyState text="No achievements earned yet." />
          ) : (
            <div className="achievements-grid">
              {achievements.map((a) => (
                <div key={a._id} className="achievement-card">
                  <span className="achievement-icon">{a.icon}</span>
                  <div>
                    <h3 className="achievement-name">{a.name}</h3>
                    <p className="achievement-desc">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
