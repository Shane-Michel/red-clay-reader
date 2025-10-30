const STORAGE_KEY = 'redClayReader.progress'

function readStorage() {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
  } catch (error) {
    console.warn('Unable to read progress from storage', error)
    return []
  }
}

function writeStorage(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.warn('Unable to persist reading progress', error)
  }
}

export function listProgress() {
  return readStorage()
}

export function getLastProgress() {
  const items = readStorage()
  if (items.length === 0) {
    return null
  }
  return items[0]
}

export function getProgressForEdition(editionId) {
  if (!editionId) {
    return null
  }
  return readStorage().find((item) => item.editionId === editionId) || null
}

export function saveProgress(entry) {
  if (!entry || !entry.editionId) {
    return
  }
  const existing = readStorage().filter((item) => item.editionId !== entry.editionId)
  const next = [
    {
      ...entry,
      updatedAt: Date.now(),
    },
    ...existing,
  ].slice(0, 12)
  writeStorage(next)
}

export function clearProgress(editionId) {
  if (!editionId) {
    return
  }
  const existing = readStorage().filter((item) => item.editionId !== editionId)
  writeStorage(existing)
}
