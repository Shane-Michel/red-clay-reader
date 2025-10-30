import { useContext, useEffect, useState } from 'react'
import ContinueBanner from '../components/ContinueBanner'
import Link from '../components/Link'
import SearchResultCard from '../components/SearchResultCard'
import ShelfSection from '../components/ShelfSection'
import curatedShelves from '../data/shelves'
import { NavigationContext } from '../navigation'
import { searchWorks } from '../services/openLibrary'
import { getLastProgress } from '../utils/storage'

function parseSearchParams(searchString) {
  const params = new URLSearchParams(searchString || '')
  return {
    query: params.get('q') ?? '',
    author: params.get('author') ?? '',
    subject: params.get('subject') ?? '',
    language: params.get('language') ?? '',
  }
}

const languageOptions = [
  { value: '', label: 'Any language' },
  { value: 'eng', label: 'English' },
  { value: 'spa', label: 'Spanish' },
  { value: 'fre', label: 'French' },
  { value: 'ger', label: 'German' },
]

export default function HomePage() {
  const { location, navigate } = useContext(NavigationContext)
  const [formValues, setFormValues] = useState(() => parseSearchParams(location.search))
  const [results, setResults] = useState([])
  const [resultMeta, setResultMeta] = useState({ total: 0 })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const lastProgress = getLastProgress()

  useEffect(() => {
    setFormValues(parseSearchParams(location.search))
  }, [location.search])

  useEffect(() => {
    const active = parseSearchParams(location.search)
    if (!active.query) {
      setResults([])
      setResultMeta({ total: 0 })
      setStatus('idle')
      setError(null)
      return
    }

    let isCancelled = false
    setStatus('loading')
    setError(null)

    searchWorks({
      query: active.query,
      author: active.author || undefined,
      subject: active.subject || undefined,
      language: active.language || undefined,
    })
      .then((payload) => {
        if (isCancelled) {
          return
        }
        const filtered = (payload.docs || []).filter((doc) => doc.public_scan_b && doc.ia && doc.ia.length > 0)
        const mapped = filtered.map((doc) => {
          const workId = doc.key.replace('/works/', '')
          const editionId = doc.edition_key?.[0]
          const iaId = doc.ia?.[0]
          return {
            workId,
            editionId,
            iaId,
            title: doc.title,
            authors: doc.author_name,
            firstPublishYear: doc.first_publish_year,
            coverId: doc.cover_i,
          }
        })
        setResults(mapped)
        setResultMeta({ total: payload.numFound ?? mapped.length, query: active.query })
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
  }, [location.search])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!formValues.query) {
      setError('Enter a title, author, or keyword to search the catalog.')
      return
    }
    const params = new URLSearchParams()
    params.set('q', formValues.query)
    if (formValues.author) {
      params.set('author', formValues.author)
    }
    if (formValues.subject) {
      params.set('subject', formValues.subject)
    }
    if (formValues.language) {
      params.set('language', formValues.language)
    }
    navigate(`/?${params.toString()}`)
  }

  const handleReset = () => {
    setFormValues({ query: '', author: '', subject: '', language: '' })
    navigate('/', { replace: true })
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">Public Domain · Southern Modern</p>
          <h1>Search it. Open it. Read it right here.</h1>
          <p>
            Red Clay Reader gives your community instant, beautiful access to public-domain books via Open Library and the Internet Archive BookReader.
          </p>
        </div>
        <div className="hero-card">
          <p className="hero-card-title">Launch checklist</p>
          <ul>
            <li>Search &amp; open in under two clicks.</li>
            <li>Only public-domain scans embed inline.</li>
            <li>Local “Continue reading” picks up where you left off.</li>
            <li>Curated Southern shelves to browse from the sofa.</li>
          </ul>
        </div>
      </section>

      <ContinueBanner progress={lastProgress} />

      <section className="search-section" aria-labelledby="search-books">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Catalog</p>
            <h2 id="search-books">Search Open Library</h2>
            <p className="section-description">
              Title, author, or subject — filter for language and zero in on public-domain editions you can read instantly.
            </p>
          </div>
        </div>
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="query">Search</label>
            <input
              id="query"
              name="query"
              type="search"
              placeholder="Try ‘Flannery O’Connor’ or ‘Southern cooking’"
              value={formValues.query}
              onChange={(event) => setFormValues((prev) => ({ ...prev, query: event.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              name="author"
              type="text"
              placeholder="Optional author filter"
              value={formValues.author}
              onChange={(event) => setFormValues((prev) => ({ ...prev, author: event.target.value }))}
            />
          </div>
          <div className="form-row">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Optional subject keyword"
              value={formValues.subject}
              onChange={(event) => setFormValues((prev) => ({ ...prev, subject: event.target.value }))}
            />
          </div>
          <div className="form-row">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              name="language"
              value={formValues.language}
              onChange={(event) => setFormValues((prev) => ({ ...prev, language: event.target.value }))}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              Search catalog
            </button>
            <button type="button" className="ghost-button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>

        <div className="search-status" role="status" aria-live="polite">
          {status === 'loading' && <p>Loading results…</p>}
          {status === 'error' && <p className="error-text">{error}</p>}
          {status === 'ready' && resultMeta.query ? (
            <p>
              Showing {results.length} embeddable editions for “{resultMeta.query}”.{' '}
              <a href={`https://openlibrary.org/search?q=${encodeURIComponent(resultMeta.query)}`} target="_blank" rel="noreferrer">
                View full results ↗
              </a>
            </p>
          ) : null}
        </div>

        <div className="results-grid" aria-live="polite">
          {results.map((result) => (
            <SearchResultCard key={`${result.workId}-${result.editionId}`} result={result} />
          ))}
          {status === 'ready' && results.length === 0 ? (
            <div className="empty-state">
              <p>No public-domain editions matched this search. Try adjusting your filters.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="how-it-works" aria-labelledby="flow-overview">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Flow</p>
            <h2 id="flow-overview">Frictionless read flow</h2>
            <p className="section-description">Search, select, and keep reading — all inside your site.</p>
          </div>
        </div>
        <ol className="flow-steps">
          <li>
            <h3>Search &amp; explore</h3>
            <p>Use Open Library’s public search API with smart filters and curated shelves to surface gems.</p>
          </li>
          <li>
            <h3>Resolve the right edition</h3>
            <p>Book detail pages lock onto Internet Archive identifiers and confirm public-domain access.</p>
          </li>
          <li>
            <h3>Read instantly</h3>
            <p>
              Embed the Internet Archive BookReader at <code>/read/&lt;edition-olid&gt;</code> with autoplay resume for the last page viewed.
            </p>
          </li>
          <li>
            <h3>Continue anywhere</h3>
            <p>
              Local storage keeps the last page so readers can pick up across desktop, phone, or TV with the shareable URL hash.
            </p>
          </li>
        </ol>
      </section>

      {curatedShelves.map((shelf) => (
        <ShelfSection key={shelf.slug} shelf={shelf} />
      ))}

    </div>
  )
}
