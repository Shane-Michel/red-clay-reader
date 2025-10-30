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
    const registry = window.customElements
    const originalDefine = typeof registry?.define === 'function' ? registry.define : null

    let patchedDefine = null

    if (registry && originalDefine) {
      patchedDefine = function defineWithDuplicateGuard(name, constructor, options) {
        if (registry.get(name)) {
          return
        }
        return originalDefine.call(this, name, constructor, options)
      }

      try {
        registry.define = patchedDefine
      } catch {
        patchedDefine = null
      }
    }

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
      if (registry && patchedDefine && registry.define === patchedDefine && originalDefine) {
        try {
          registry.define = originalDefine
        } catch {
          // Ignore cleanup failures.
        }
      }
    }
  }, [])
}
