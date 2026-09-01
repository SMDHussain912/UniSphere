export default function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <div>
          <div className="brand" style={{ color: '#fff', marginBottom: 4 }}>
            <span className="mark">U</span> UniSphere
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Learn. Practice. Build. Prove. Connect.</p>
        </div>
        <div style={{ fontSize: '0.82rem', display: 'flex', gap: 20 }}>
          <a href="#/courses" style={{ color: '#94a3b8' }}>Courses</a>
          <a href="#/jobs" style={{ color: '#94a3b8' }}>Jobs</a>
          <a href="#/community" style={{ color: '#94a3b8' }}>Community</a>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>© 2026 UniTech. All rights reserved.</div>
      </div>
    </footer>
  )
}
