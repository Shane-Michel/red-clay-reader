import Link from '../components/Link'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>The page you requested doesn’t exist yet. Head back to the catalog to keep exploring.</p>
      <Link to="/" className="primary-button">
        Return home
      </Link>
    </div>
  )
}
