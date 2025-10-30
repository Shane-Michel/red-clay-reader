import Link from './Link'
import { buildCoverUrl } from '../services/openLibrary'

function formatAuthors(authors) {
  if (!authors || authors.length === 0) {
    return 'Unknown author'
  }
  if (authors.length === 1) {
    return authors[0]
  }
  if (authors.length === 2) {
    return `${authors[0]} & ${authors[1]}`
  }
  return `${authors[0]} et al.`
}

export default function SearchResultCard({ result }) {
  const {
    workId,
    editionId,
    iaId,
    title,
    authors,
    firstPublishYear,
    coverId,
  } = result

  const coverUrl = buildCoverUrl({ coverId, editionId })
  const readPath = iaId ? `/read/${editionId}#page/n1` : null
  const authorLine = formatAuthors(authors)

  return (
    <article className="result-card">
      <div className="result-cover" aria-hidden="true">
        {coverUrl ? <img src={coverUrl} alt="" loading="lazy" /> : <div className="result-cover--placeholder">No cover</div>}
      </div>
      <div className="result-meta">
        <h3>{title}</h3>
        <p className="result-author">{authorLine}</p>
        {firstPublishYear ? <p className="result-year">First published {firstPublishYear}</p> : null}
      </div>
      <div className="result-actions">
        <Link to={`/books/${workId}`} className="ghost-button" state={{ editionId, iaId, title, author: authorLine }}>
          Details
        </Link>
        {readPath ? (
          <Link to={readPath} className="primary-button" state={{ iaId, title, author: authorLine }}>
            Read now
          </Link>
        ) : (
          <a
            className="ghost-button"
            href={`https://openlibrary.org/works/${workId}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Open Library
          </a>
        )}
      </div>
    </article>
  )
}
