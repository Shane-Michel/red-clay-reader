import Link from './Link'

export default function ContinueBanner({ progress }) {
  if (!progress) {
    return null
  }

  const { editionId, iaId, title, author, page } = progress
  const readPath = page ? `/read/${editionId}#page/n${page}` : `/read/${editionId}`

  return (
    <div className="continue-banner" role="status" aria-live="polite">
      <div>
        <p className="continue-kicker">Continue reading</p>
        <p className="continue-title">{title}</p>
        {author ? <p className="continue-author">{author}</p> : null}
        {page ? <p className="continue-page">Last page: {page}</p> : null}
      </div>
      <Link to={readPath} className="continue-button" state={{ iaId, title, author }}>
        Continue
      </Link>
    </div>
  )
}
