const OPEN_LIBRARY_BASE = 'https://openlibrary.org'

function buildUrl(path, params = {}) {
  const url = new URL(path, OPEN_LIBRARY_BASE)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

export async function searchWorks({
  query,
  author,
  subject,
  language,
  limit = 24,
  offset = 0,
} = {}) {
  if (!query) {
    return { docs: [], numFound: 0 }
  }

  const url = buildUrl('/search.json', {
    q: query,
    author,
    subject,
    language,
    limit,
    offset,
    fields: 'key,title,author_name,first_publish_year,edition_key,ia,cover_i,public_scan_b,language',
  })

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Unable to load search results right now.')
  }
  return response.json()
}

export async function getWork(workId) {
  const url = buildUrl(`/works/${workId}.json`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Unable to load that work from Open Library.')
  }
  return response.json()
}

export async function getWorkEditions(workId, { limit = 25 } = {}) {
  const url = buildUrl(`/works/${workId}/editions.json`, {
    limit,
    fields: 'title,ocaid,key,publish_date,number_of_pages,covers,languages',
  })
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Unable to load editions for that work.')
  }
  return response.json()
}

export async function getEdition(editionId) {
  const url = buildUrl(`/books/${editionId}.json`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Unable to load that edition.')
  }
  return response.json()
}

export function buildCoverUrl({ coverId, editionId, size = 'M' }) {
  if (coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
  }
  if (editionId) {
    return `https://covers.openlibrary.org/b/olid/${editionId}-${size}.jpg`
  }
  return null
}

export function buildWorkUrl(workId) {
  return `${OPEN_LIBRARY_BASE}/works/${workId}`
}

export function buildEditionUrl(editionId) {
  return `${OPEN_LIBRARY_BASE}/books/${editionId}`
}
