/**
 * Get the API URL dynamically based on environment and runtime context
 * This automatically detects the IP/hostname and uses it for the backend API
 * 
 * Priority:
 * 1. NEXT_PUBLIC_API_URL environment variable (if set)
 * 2. Current hostname from browser (automatically adapts to any IP/domain)
 * 3. Fallback to localhost:5001 (for local development)
 */
export const getApiUrl = (): string => {
  // Priority 1: Check environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Priority 2: If running in browser, use current hostname
  // This automatically adapts to whatever IP/domain the frontend is accessed from
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    // Use same hostname but port 5001 for backend
    return `${protocol}//${hostname}:5001`
  }
  
  // Priority 3: Fallback for server-side rendering
  return 'http://localhost:5001'
}

// Export a constant for convenience (will be evaluated at module load time)
// Note: This will use fallback during SSR, but getApiUrl() will work correctly in browser
export const API_URL = getApiUrl()
