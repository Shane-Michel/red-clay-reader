import { useContext, useEffect, useMemo, useState } from 'react'
import Link from '../components/Link'
import { NavigationContext } from '../navigation'
import { buildCoverUrl, buildEditionUrl, buildWorkUrl, getWork, getWorkEditions } from '../services/openLibrary'

function normaliseDescription(description) {
  if (!description) {
    return null
  }
  if (typeof description === 'string') {
    return description
  }
  if (typeof description === 'object' && typeof description.value === 'string') {
    return description.value
  }
  return null
}

function formatLanguage(code) {
  if (!code) {
    return null
  }
  const languageMap = {
    eng: 'English',
    spa: 'Spanish',
    fre: 'French',
    ger: 'German',
    ita: 'Italian',
    por: 'Portuguese',
  }
  return languageMap[code] || code
}

export default function BookDetailPage({ workId }) {
  const { location } = useContext(NavigationContext)
  const [work, setWork] = useState(null)
  const [editions, setEditions] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isCancelled = false
    setStatus('loading')
    setError(null)
    setWork(null)
    setEditions([])

    async function load() {
      try {
        const [workResponse, editionsResponse] = await Promise.all([getWork(workId), getWorkEditions(workId, { limit: 40 })])
        if (isCancelled) {
          return
        }
        setWork(workResponse)
        const mapped = (editionsResponse.entries || []).map((entry) => ({
          key: entry.key?.replace('/books/', ''),
          title: entry.title,
          publishDate: entry.publish_date,
          pageCount: entry.number_of_pages,
          ocaid: entry.ocaid,
          coverId: entry.covers && entry.covers.length > 0 ? entry.covers[0] : null,
          languages: (entry.languages || []).map((language) => language.key?.replace('/languages/', '')).filter(Boolean),
        }))
        setEditions(mapped)
        setStatus('ready')
      } catch (fetchError) {
        if (isCancelled) {
          return
        }
        setStatus('error')
        setError(fetchError.message)
      }
    }

    load()

    return () => {
      isCancelled = true
    }
  }, [workId])

  const bestEdition = useMemo(() => {
    const stateEditionId = location.state && location.state.editionId
    const stateIaId = location.state && location.state.iaId
    if (stateEditionId && stateIaId) {
      const fromState = editions.find((edition) => edition.key === stateEditionId)
      return (
        fromState || {
          key: stateEditionId,
          ocaid: stateIaId,
          title: work?.title,
          languages: [],
          coverId: null,
          publishDate: null,
        }
      )
    }
    return editions.find((edition) => Boolean(edition.ocaid)) || null
  }, [editions, location.state, work?.title])

  const description = useMemo(() => normaliseDescription(work?.description), [work])
  const authorNames = useMemo(() => {
    if (!work?.authors) {
      return null
    }
    const names = work.authors
      .map((author) => (typeof author?.name === 'string' ? author.name : null))
      .filter(Boolean)
    if (names.length === 0) {
      return null
    }
    return names.join(', ')
  }, [work?.authors])

  const coverUrl = useMemo(() => {
    if (bestEdition?.coverId) {
      return buildCoverUrl({ coverId: bestEdition.coverId })
    }
    if (work?.covers && work.covers.length > 0) {
      return buildCoverUrl({ coverId: work.covers[0] })
    }
    return null
  }, [bestEdition?.coverId, work?.covers])

  if (status === 'loading') {
    return (
      <div className="detail-page">
        <p>Loading book details…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="detail-page">
        <p className="error-text">{error}</p>
        <a className="ghost-button" href={buildWorkUrl(workId)} target="_blank" rel="noreferrer">
          View on Open Library ↗
        </a>
      </div>
    )
  }

  if (!work) {
    return null
  }

  const readPath = bestEdition?.ocaid ? `/read/${bestEdition.key}` : null

  return (
    <article className="detail-page">
      <header className="detail-header">
        <div className="detail-cover" aria-hidden="true">
          {coverUrl ? <img src={coverUrl} alt="" /> : <div className="detail-cover--placeholder">No cover</div>}
        </div>
        <div className="detail-meta">
          <p className="section-kicker">Work</p>
          <h1>{work.title}</h1>
          {authorNames ? <p className="detail-author">{authorNames}</p> : null}
          {work.first_publish_date ? <p className="detail-pub">First published {work.first_publish_date}</p> : null}
          {description ? <p className="detail-description">{description}</p> : null}
          <div className="detail-actions">
            {readPath ? (
              <Link to={readPath} className="primary-button" state={{ iaId: bestEdition.ocaid, title: work.title, author: authorNames }}>
                Read online
              </Link>
            ) : (
              <a className="primary-button" href={buildWorkUrl(workId)} target="_blank" rel="noreferrer">
                Borrow on Open Library ↗
              </a>
            )}
            <a className="ghost-button" href={buildWorkUrl(workId)} target="_blank" rel="noreferrer">
              Work on Open Library ↗
            </a>
          </div>
        </div>
      </header>

      <section className="edition-list" aria-labelledby="available-editions">
        <h2 id="available-editions">Available public-domain editions</h2>
        {editions.filter((edition) => edition.ocaid).length === 0 ? (
          <p>No embeddable editions found. Try the Open Library link above.</p>
        ) : (
          <ul>
            {editions
              .filter((edition) => edition.ocaid)
              .map((edition) => (
                <li key={edition.key} className="edition-item">
                  <div>
                    <p className="edition-title">{edition.title || work.title}</p>
                    <p className="edition-meta">
                      {edition.publishDate ? `${edition.publishDate}` : 'Publication date unknown'}
                      {edition.pageCount ? ` · ${edition.pageCount} pages` : ''}
                    </p>
                    {edition.languages && edition.languages.length > 0 ? (
                      <p className="edition-meta">
                        {edition.languages.map(formatLanguage).filter(Boolean).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <div className="edition-actions">
                    <Link
                      to={`/read/${edition.key}`}
                      className="primary-button"
                      state={{ iaId: edition.ocaid, title: edition.title || work.title, author: authorNames }}
                    >
                      Read this edition
                    </Link>
                    <a className="ghost-button" href={buildEditionUrl(edition.key)} target="_blank" rel="noreferrer">
                      Edition on Open Library ↗
                    </a>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </article>
  )
}
