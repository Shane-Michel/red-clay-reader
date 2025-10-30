import { useEffect } from 'react'

const CUSTOM_ELEMENT_ERROR_SIGNATURE = "Failed to execute 'define' on 'CustomElementRegistry'"

function isArchiveCustomElementError(event) {
  if (!event || typeof event.message !== 'string') {
    return false
  }

  if (!event.message.includes(CUSTOM_ELEMENT_ERROR_SIGNATURE)) {
    return false
  }

  if (typeof event.filename === 'string' && event.filename.includes('archive.org')) {
    return true
  }

  const target = event.target || event.currentTarget
  if (target && typeof target.tagName === 'string' && target.tagName.toLowerCase() === 'iframe') {
    try {
      const source = target.src || target.dataset?.src || ''
      return source.includes('archive.org')
    } catch {
      return false
    }
  }

  return false
}

export default function useArchiveEmbedErrorSuppression() {
  useEffect(() => {
    const handleWindowError = (event) => {
      if (isArchiveCustomElementError(event)) {
        event.preventDefault()
        return false
      }
      return undefined
    }

    window.addEventListener('error', handleWindowError)

    return () => {
      window.removeEventListener('error', handleWindowError)
    }
  }, [])
}
