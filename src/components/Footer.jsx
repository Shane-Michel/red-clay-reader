export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          Data & reader courtesy of{' '}
          <a href="https://openlibrary.org" target="_blank" rel="noreferrer">
            Open Library
          </a>{' '}
          and{' '}
          <a href="https://archive.org" target="_blank" rel="noreferrer">
            Internet Archive
          </a>
          .
        </p>
        <p className="footer-note">Only public-domain and unrestricted scans are embedded directly.</p>
      </div>
    </footer>
  )
}
