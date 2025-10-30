import Link from './Link'
import { buildCoverUrl } from '../services/openLibrary'

function ShelfItem({ item }) {
  const { title, author, workId, editionId, iaId } = item
  const coverUrl = buildCoverUrl({ editionId })
  const readPath = iaId ? `/read/${editionId}#page/n1` : `/books/${workId}`

  return (
    <li className="shelf-item">
      <div className="shelf-cover" aria-hidden="true">
        {coverUrl ? <img src={coverUrl} alt="" loading="lazy" /> : <div className="shelf-cover--placeholder">No cover</div>}
      </div>
      <div className="shelf-meta">
        <h4>{title}</h4>
        <p className="shelf-author">{author}</p>
      </div>
      <div className="shelf-actions">
        <Link to={`/books/${workId}`} className="ghost-button" state={{ editionId, iaId, title, author }}>
          Details
        </Link>
        <Link to={readPath} className="primary-button" state={{ iaId, title, author }}>
          {iaId ? 'Read now' : 'View details'}
        </Link>
      </div>
    </li>
  )
}

export default function ShelfSection({ shelf }) {
  return (
    <section className="shelf-section" aria-labelledby={`shelf-${shelf.slug}`}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Shelf</p>
          <h3 id={`shelf-${shelf.slug}`}>{shelf.title}</h3>
          <p className="section-description">{shelf.description}</p>
        </div>
        <a
          href={`https://openlibrary.org/subjects/${encodeURIComponent(shelf.slug.replace(/-/g, '_'))}`}
          target="_blank"
          rel="noreferrer"
          className="header-link"
        >
          Explore on Open Library ↗
        </a>
      </div>
      <ul className="shelf-grid">
        {shelf.items.map((item) => (
          <ShelfItem key={item.editionId ?? item.workId} item={item} />
        ))}
      </ul>
    </section>
  )
}
