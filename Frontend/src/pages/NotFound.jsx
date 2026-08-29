export default function NotFound() {
  return (
    <div className="card empty">
      <h2 className="heading">Page not found</h2>
      <p className="mt">The page you are looking for does not exist.</p>
      <div className="mt">
        <a href="#/">
          <button type="button" className="btn btn-primary">
            Go Home
          </button>
        </a>
      </div>
    </div>
  )
}
