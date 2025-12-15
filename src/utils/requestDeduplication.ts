// Global request deduplication utility
interface PendingRequest {
  promise: Promise<any>
  timestamp: number
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>()
  private readonly TIMEOUT = 5000 // 5 seconds

  // Generate a unique key for the request
  private generateKey(url: string, method: string, body?: string): string {
    const bodyHash = body ? btoa(body).substring(0, 20) : 'no-body'
    return `${method}:${url}:${bodyHash}`
  }

  // Clean up expired requests
  private cleanup(): void {
    const now = Date.now()
    // Use Array.from to avoid TypeScript iteration issues
    Array.from(this.pendingRequests.entries()).forEach(([key, request]) => {
      if (now - request.timestamp > this.TIMEOUT) {
        this.pendingRequests.delete(key)
      }
    })
  }

  // Deduplicate fetch requests
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    this.cleanup()

    const method = options.method || 'GET'
    const body = options.body as string
    const key = this.generateKey(url, method, body)

    console.log('🔍 Request deduplication check:', { key, hasPending: this.pendingRequests.has(key) })

    // If we have a pending request with the same key, return that promise
    if (this.pendingRequests.has(key)) {
      console.log('⚠️ Duplicate request detected, returning existing promise:', key)
      return this.pendingRequests.get(key)!.promise
    }

    // Create new request
    console.log('✨ New request, creating promise:', key)
    const promise = fetch(url, options)
    
    // Store the pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    })

    // Clean up after request completes (success or failure)
    promise.finally(() => {
      console.log('🧹 Cleaning up completed request:', key)
      this.pendingRequests.delete(key)
    })

    return promise
  }

  // Get current pending requests (for debugging)
  getPendingRequests(): string[] {
    return Array.from(this.pendingRequests.keys())
  }

  // Clear all pending requests (for testing)
  clear(): void {
    this.pendingRequests.clear()
  }
}

// Global instance
export const requestDeduplicator = new RequestDeduplicator()

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).requestDeduplicator = requestDeduplicator
}