// Test utility to simulate rapid button clicks and API calls
export const testDuplicatePrevention = () => {
  console.log('🧪 Testing duplicate prevention mechanisms...')
  
  // Test 1: Rapid button clicks
  const testRapidClicks = () => {
    console.log('Test 1: Simulating rapid button clicks')
    let clickCount = 0
    
    const simulateClick = () => {
      clickCount++
      console.log(`Click ${clickCount} at ${Date.now()}`)
    }
    
    // Simulate 5 rapid clicks within 100ms
    for (let i = 0; i < 5; i++) {
      setTimeout(simulateClick, i * 20)
    }
  }
  
  // Test 2: API call timing
  const testApiTiming = async () => {
    console.log('Test 2: Testing API call timing')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
    
    const testPayload = {
      submissionId: `test-${Date.now()}`,
      title: 'Test Event',
      description: 'Test description'
    }
    
    console.log('Making test API call with payload:', testPayload)
    
    try {
      const response = await fetch(`${apiUrl}/api/events/test-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      })
      
      console.log('Test API response status:', response.status)
    } catch (error) {
      console.log('Test API call failed (expected):', error instanceof Error ? error.message : String(error))
    }
  }
  
  testRapidClicks()
  testApiTiming()
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testDuplicatePrevention = testDuplicatePrevention
}