const CANONICAL_ORIGIN = 'https://redclayreader.com'
const DEFAULT_DESCRIPTION =
  'Red Clay Reader helps libraries and readers browse, open, and enjoy public-domain Southern literature instantly from Open Library and the Internet Archive.'

function ensureDocument() {
  return typeof document !== 'undefined' ? document : null
}

function normalisePath(pathname) {
  if (!pathname) {
    return '/'
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

export function buildCanonicalUrl(pathname = '/', search = '') {
  try {
    const url = new URL(CANONICAL_ORIGIN)
    url.pathname = normalisePath(pathname)
    if (search) {
      url.search = search.startsWith('?') ? search : `?${search}`
    }
    return url.toString()
  } catch (error) {
    console.error('Failed to build canonical URL', error)
    return `${CANONICAL_ORIGIN}${normalisePath(pathname)}${search ? (search.startsWith('?') ? search : `?${search}`) : ''}`
  }
}

function setElementAttribute(selector, attribute, value) {
  if (!value) {
    return
  }
  const doc = ensureDocument()
  if (!doc) {
    return
  }
  const element = doc.head.querySelector(selector)
  if (element) {
    element.setAttribute(attribute, value)
  }
}

export function applySeoMetadata({ title, description, url, ogType = 'website' }) {
  const doc = ensureDocument()
  if (!doc) {
    return
  }

  if (title) {
    doc.title = title
    setElementAttribute('meta[property="og:title"]', 'content', title)
    setElementAttribute('meta[name="twitter:title"]', 'content', title)
  }

  const metaDescription = description || DEFAULT_DESCRIPTION
  setElementAttribute('meta[name="description"]', 'content', metaDescription)
  setElementAttribute('meta[property="og:description"]', 'content', metaDescription)
  setElementAttribute('meta[name="twitter:description"]', 'content', metaDescription)

  if (url) {
    setElementAttribute('meta[property="og:url"]', 'content', url)
    setElementAttribute('meta[name="twitter:url"]', 'content', url)
    setElementAttribute('link[rel="canonical"]', 'href', url)
  }

  setElementAttribute('meta[property="og:type"]', 'content', ogType)
}

export function getDefaultDescription() {
  return DEFAULT_DESCRIPTION
}

export const SEO_ORIGIN = CANONICAL_ORIGIN
