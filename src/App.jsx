import { useEffect, useMemo, useState } from 'react'
import { NavigationContext } from './navigation'
import { applySeoMetadata, buildCanonicalUrl, getDefaultDescription } from './utils/seo'
import HomePage from './pages/HomePage'
import BookDetailPage from './pages/BookDetailPage'
import ReaderPage from './pages/ReaderPage'
import Header from './components/Header'
import Footer from './components/Footer'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function getLocationSnapshot() {
  return {
    path: window.location.pathname || '/',
    search: window.location.search || '',
    hash: window.location.hash || '',
    state: window.history.state || null,
  }
}

function App() {
  const [location, setLocation] = useState(() => getLocationSnapshot())

  useEffect(() => {
    const handlePopState = () => {
      setLocation(getLocationSnapshot())
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const navigate = (to, { state = null, replace = false } = {}) => {
    if (replace) {
      window.history.replaceState(state, '', to)
    } else {
      window.history.pushState(state, '', to)
    }
    setLocation(getLocationSnapshot())
  }

  useEffect(() => {
    const titleBase = 'Red Clay Reader'
    let pageTitle = titleBase
    let description = getDefaultDescription()
    let ogType = 'website'

    if (location.path.startsWith('/books/')) {
      pageTitle = `${titleBase} · Book Detail`
      description =
        'Browse detailed publication history, authors, and embeddable public-domain editions from Open Library on Red Clay Reader.'
      ogType = 'book'
    } else if (location.path.startsWith('/read/')) {
      pageTitle = `${titleBase} · Reader`
      description =
        "Read digitized public-domain books directly in your browser with Red Clay Reader's Internet Archive BookReader integration."
      ogType = 'book'
    }

    applySeoMetadata({
      title: pageTitle,
      description,
      ogType,
      url: buildCanonicalUrl(location.path, location.search),
    })
  }, [location.path, location.search])

  const providerValue = useMemo(
    () => ({ location, navigate }),
    [location],
  )

  let content
  if (location.path === '/' || location.path === '') {
    content = <HomePage />
  } else if (location.path.startsWith('/books/')) {
    const workId = location.path.replace('/books/', '')
    content = <BookDetailPage workId={workId} />
  } else if (location.path.startsWith('/read/')) {
    const editionId = location.path.replace('/read/', '')
    content = <ReaderPage editionId={editionId} />
  } else {
    content = <NotFoundPage />
  }

  return (
    <NavigationContext.Provider value={providerValue}>
      <div className="app-shell">
        <Header />
        <main className="app-main" role="main">
          {content}
        </main>
        <Footer />
      </div>
    </NavigationContext.Provider>
  )
}

export default App
