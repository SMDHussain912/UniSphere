export default function Home() {
  return (
    <div>
      <section className="card hero">
        <p className="eyebrow">UniSphere</p>
        <h1>Exams and Jobs, Ready for You</h1>
        <p>
          Discover competitive exams, take online tests with instant grading, and apply to
          job openings at UniSphere — all in one place.
        </p>
        <div className="hero-actions">
          <a href="#/exams">
            <button type="button" className="btn btn-primary">
              Browse Exams
            </button>
          </a>
          <a href="#/jobs">
            <button type="button" className="btn btn-white">
              Explore Jobs
            </button>
          </a>
        </div>
      </section>

      <div className="grid mt">
        <div className="card">
          <h3 className="card-title">Online Exams</h3>
          <p className="muted mt">Take timed exams and receive automatic, instant result grading.</p>
          <a className="link" href="#/exams">View exams</a>
        </div>
        <div className="card">
          <h3 className="card-title">Job Openings</h3>
          <p className="muted mt">Discover openings with clear requirements and apply directly.</p>
          <a className="link" href="#/jobs">View jobs</a>
        </div>
        <div className="card">
          <h3 className="card-title">Track Everything</h3>
          <p className="muted mt">Follow application statuses and exam results from your dashboard.</p>
          <a className="link" href="#/applications">My status</a>
        </div>
      </div>
    </div>
  )
}
