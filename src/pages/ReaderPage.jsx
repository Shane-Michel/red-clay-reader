import { useContext, useEffect, useMemo, useState } from 'react'
import { NavigationContext } from '../navigation'
import { getEdition } from '../services/openLibrary'
import { getProgressForEdition, saveProgress } from '../utils/storage'
import useArchiveEmbedErrorSuppression from '../utils/useArchiveEmbedErrorSuppression'

function parsePageFromHash(hash) {
  const match = /page\/n(\d+)/i.exec(hash || '')
  if (match) {
    return Number.parseInt(match[1], 10)
  }
  return 1
}

function clampPage(page) {
  if (!Number.isFinite(page) || page < 1) {
    return 1
  }
  if (page > 9999) {
    return 9999
  }
  return page
}

export default function ReaderPage({ editionId }) {
  useArchiveEmbedErrorSuppression()
  const { location } = useContext(NavigationContext)
  const [iaId, setIaId] = useState(location.state?.iaId || null)
  const [edition, setEdition] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(iaId ? 'ready' : 'loading')
  const [page, setPage] = useState(() => {
    const stored = getProgressForEdition(editionId)
    if (stored?.page) {
      return stored.page
    }
    return clampPage(parsePageFromHash(window.location.hash))
  })

  useEffect(() => {
    const handleHashChange = () => {
      setPage((previous) => {
        const incoming = clampPage(parsePageFromHash(window.location.hash))
        return previous === incoming ? previous : incoming
      })
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (iaId) {
      return undefined
    }

    setStatus('loading')
    setError(null)

    getEdition(editionId)
      .then((payload) => {
        if (cancelled) {
          return
        }
        const identifier = payload.ocaid || payload.ia?.[0]
        if (!identifier) {
          throw new Error('This edition cannot be embedded. Use the Open Library link instead.')
        }
        setIaId(identifier)
        setEdition(payload)
        setStatus('ready')
      })
      .catch((fetchError) => {
        if (cancelled) {
          return
        }
        setError(fetchError.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [editionId, iaId])

  useEffect(() => {
    if (edition) {
      return
    }
    if (location.state?.title || location.state?.author) {
      setEdition({
        title: location.state.title,
        author_display: location.state.author,
      })
    }
  }, [edition, location.state])

  useEffect(() => {
    if (!iaId) {
      return
    }
    const currentTitle = edition?.title || location.state?.title
    const currentAuthor = location.state?.author || edition?.author_display
    saveProgress({
      editionId,
      iaId,
      title: currentTitle,
      author: currentAuthor,
      page,
    })
  }, [edition?.author_display, edition?.title, editionId, iaId, location.state, page])

  const viewerSrc = useMemo(() => {
    if (!iaId) {
      return null
    }
    return `https://archive.org/embed/${iaId}?ui=full&show=bookReader#page/n${clampPage(page)}`
  }, [iaId, page])

  const handlePageChange = (nextPage) => {
    const safePage = clampPage(nextPage)
    setPage(safePage)
    window.location.hash = `page/n${safePage}`
  }

  if (status === 'loading') {
    return (
      <div className="reader-page">
        <p>Preparing the reader…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="reader-page">
        <p className="error-text">{error}</p>
        <a
          className="ghost-button"
          href={`https://openlibrary.org/books/${editionId}`}
          target="_blank"
          rel="noreferrer"
        >
          Open this edition on Open Library ↗
        </a>
      </div>
    )
  }

  if (!iaId) {
    return null
  }

  const title = edition?.title || location.state?.title || 'Untitled edition'
  const authorLine = edition?.by_statement || location.state?.author

  return (
    <div className="reader-page">
      <header className="reader-header">
        <div>
          <p className="section-kicker">Reader</p>
          <h1>{title}</h1>
          {authorLine ? <p className="reader-author">{authorLine}</p> : null}
          <p className="reader-subhead">
            Embedded from Internet Archive BookReader. Share this page with{' '}
            <code>{window.location.origin}/read/{editionId}#page/n{page}</code>.
          </p>
        </div>
        <div className="page-controls" aria-label="Page controls">
          <button type="button" className="ghost-button" onClick={() => handlePageChange(page - 1)}>
            ◀ Prev page
          </button>
          <label className="page-input">
            <span>Page</span>
            <input
              type="number"
              min="1"
              max="9999"
              value={page}
              onChange={(event) => handlePageChange(Number.parseInt(event.target.value, 10))}
            />
          </label>
          <button type="button" className="ghost-button" onClick={() => handlePageChange(page + 1)}>
            Next page ▶
          </button>
        </div>
      </header>
      <div className="reader-frame">
        <iframe
          key={`${iaId}-${page}`}
          title={`${title} via Internet Archive BookReader`}
          src={viewerSrc}
          allowFullScreen
        />
      </div>
      <div className="reader-footnote">
        <p>
          Tip: Use the BookReader toolbar inside the iframe for full-screen mode, thumbnails, and text search. We store only your
          last page locally on this device.
        </p>
      </div>
    </div>
  )
}
