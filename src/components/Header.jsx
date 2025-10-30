import Link from './Link'

export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <Link to="/" className="brand" onNavigate={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-mark" aria-hidden="true">
            📚
          </span>
          <div className="brand-copy">
            <span className="brand-title">Red Clay Reader</span>
            <span className="brand-subtitle">Public-domain reading, Southern style</span>
          </div>
        </Link>
        <nav aria-label="Site">
          <ul className="header-nav">
            <li>
              <a href="https://openlibrary.org" target="_blank" rel="noreferrer" className="header-link">
                Open Library
              </a>
            </li>
            <li>
              <a href="https://archive.org/details/inlibrary" target="_blank" rel="noreferrer" className="header-link">
                Internet Archive
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
