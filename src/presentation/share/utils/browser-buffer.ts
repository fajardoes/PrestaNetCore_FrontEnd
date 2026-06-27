type BrowserBufferLike = Uint8Array & { _isBuffer?: boolean }
type BrowserBufferGlobal = { isBuffer?: (value: unknown) => boolean }

const isBuffer = (value: unknown): value is BrowserBufferLike => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as {
    _isBuffer?: boolean
    constructor?: { isBuffer?: (input: unknown) => boolean }
  }

  if (candidate._isBuffer === true) return true
  return candidate.constructor?.isBuffer?.(value) === true
}

export const ensureBrowserBuffer = () => {
  const browserGlobal = globalThis as typeof globalThis & {
    Buffer?: BrowserBufferGlobal
  }
  const current = browserGlobal.Buffer

  if (typeof current?.isBuffer === 'function') return

  browserGlobal.Buffer = {
    ...(current ?? {}),
    isBuffer,
  }
}
