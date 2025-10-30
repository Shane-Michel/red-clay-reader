import { useEffect, useMemo, useState } from 'react'
import Link from './Link'
import { buildCoverUrl, searchWorks } from '../services/openLibrary'

function mapDocToShelfItem(doc) {
  const workId = doc.key?.replace('/works/', '') ?? ''
  const editionId = doc.edition_key?.[0]
  const iaId = doc.ia?.[0]

  return {
    workId,
    editionId,
    iaId,
    title: doc.title,
    authors: doc.author_name || [],
    coverId: doc.cover_i,
  }
}

function ShelfItem({ item }) {
  const { title, authors, workId, editionId, iaId } = item
  const coverUrl = buildCoverUrl({ editionId, coverId: item.coverId })
  const readPath = iaId ? `/read/${editionId}#page/n1` : `/books/${workId}`
  const authorLine = authors?.length ? authors.join(', ') : 'Unknown author'

  return (
    <li className="shelf-item">
      <div className="shelf-cover" aria-hidden="true">
        {coverUrl ? <img src={coverUrl} alt="" loading="lazy" /> : <div className="shelf-cover--placeholder">No cover</div>}
      </div>
      <div className="shelf-meta">
        <h4>{title}</h4>
        <p className="shelf-author">{authorLine}</p>
      </div>
      <div className="shelf-actions">
        <Link to={`/books/${workId}`} className="ghost-button" state={{ editionId, iaId, title, author: authorLine }}>
          Details
        </Link>
        <Link to={readPath} className="primary-button" state={{ iaId, title, author: authorLine }}>
          {iaId ? 'Read now' : 'View details'}
        </Link>
      </div>
    </li>
  )
}

export default function ShelfSection({ shelf }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const openLibraryUrl = useMemo(() => {
    if (shelf.openLibraryUrl) {
      return shelf.openLibraryUrl
    }
    if (!shelf.search) {
      return 'https://openlibrary.org'
    }

    const params = new URLSearchParams()
    if (shelf.search.query) {
      params.set('q', shelf.search.query)
    }
    if (shelf.search.author) {
      params.set('author', shelf.search.author)
    }
    if (shelf.search.subject) {
      params.set('subject', shelf.search.subject)
    }
    if (shelf.search.language) {
      params.set('language', shelf.search.language)
    }

    const queryString = params.toString()
    return queryString ? `https://openlibrary.org/search?${queryString}` : 'https://openlibrary.org'
  }, [shelf])

  useEffect(() => {
    if (!shelf.search?.query) {
      setItems([])
      setStatus('idle')
      return
    }

    let isCancelled = false
    setStatus('loading')
    setError(null)

    searchWorks({
      ...shelf.search,
      limit: Math.max(12, shelf.maxItems ? shelf.maxItems * 3 : 18),
    })
      .then((payload) => {
        if (isCancelled) {
          return
        }
        const filteredDocs = (payload.docs || []).filter(
          (doc) => doc.public_scan_b && doc.ia && doc.ia.length > 0 && doc.edition_key && doc.edition_key.length > 0,
        )
        const mappedItems = filteredDocs.map(mapDocToShelfItem)
        const limitedItems = shelf.maxItems ? mappedItems.slice(0, shelf.maxItems) : mappedItems
        setItems(limitedItems)
        setStatus('ready')
      })
      .catch((fetchError) => {
        if (isCancelled) {
          return
        }
        setError(fetchError.message)
        setStatus('error')
      })

    return () => {
      isCancelled = true
    }
  }, [shelf])

  const shouldShowEmptyState = status === 'ready' && items.length === 0

  return (
    <section className="shelf-section" aria-labelledby={`shelf-${shelf.slug}`}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Shelf</p>
          <h3 id={`shelf-${shelf.slug}`}>{shelf.title}</h3>
          <p className="section-description">{shelf.description}</p>
        </div>
        <a
          href={openLibraryUrl}
          target="_blank"
          rel="noreferrer"
          className="header-link"
        >
          Explore on Open Library ↗
        </a>
      </div>
      <ul className="shelf-grid" aria-live="polite">
        {items.map((item) => (
          <ShelfItem key={item.editionId ?? item.workId} item={item} />
        ))}
      </ul>
      {status === 'loading' ? (
        <div className="shelf-status" aria-live="polite">
          <div className="shelf-item shelf-item--loading" aria-hidden="true">
            <div className="shelf-cover shelf-cover--placeholder" />
            <div className="shelf-meta">
              <div className="shelf-placeholder-line" />
              <div className="shelf-placeholder-line" />
            </div>
            <div className="shelf-actions">
              <div className="shelf-placeholder-button" />
              <div className="shelf-placeholder-button" />
            </div>
          </div>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="shelf-status" role="status" aria-live="polite">
          <div className="shelf-item shelf-item--message">
            <p className="error-text">{error || 'Unable to load this shelf right now.'}</p>
          </div>
        </div>
      ) : null}
      {shouldShowEmptyState ? (
        <div className="shelf-status" role="status" aria-live="polite">
          <div className="shelf-item shelf-item--message">
            <p>No embeddable editions matched this shelf query.</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
