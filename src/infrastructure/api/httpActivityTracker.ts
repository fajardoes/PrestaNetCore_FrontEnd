type Listener = () => void

interface Snapshot {
  activeRequests: number
}

class HttpActivityTracker {
  private activeRequests = 0
  private listeners = new Set<Listener>()
  private cachedSnapshot: Snapshot = { activeRequests: 0 }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = (): Snapshot => {
    return this.cachedSnapshot
  }

  increment() {
    this.activeRequests += 1
    this.cachedSnapshot = { activeRequests: this.activeRequests }
    this.emit()
  }

  decrement() {
    this.activeRequests = Math.max(0, this.activeRequests - 1)
    this.cachedSnapshot = { activeRequests: this.activeRequests }
    this.emit()
  }

  private emit() {
    const snapshot = this.cachedSnapshot
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch {
        // ignore listener errors
      }
    })
    return snapshot
  }
}

export const httpActivityTracker = new HttpActivityTracker()
