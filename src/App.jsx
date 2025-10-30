import { useEffect, useMemo, useState } from 'react'
import { NavigationContext } from './navigation'
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
    if (location.path.startsWith('/books/')) {
      document.title = `${titleBase} · Book Detail`
    } else if (location.path.startsWith('/read/')) {
      document.title = `${titleBase} · Reader`
    } else {
      document.title = `${titleBase}`
    }
  }, [location.path])

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
