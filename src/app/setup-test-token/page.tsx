'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function SetupTestTokenPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Setting up test token...')

  useEffect(() => {
    const setupTestToken = async () => {
      try {
        // Try to register a test user with the backend
        const testEmail = `test_${Date.now()}@eventify.com`
        const testPassword = 'Test123!@#'
        
        // First, try to register
        const registerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              firstName: 'Test',
              lastName: 'User',
              email: testEmail,
              password: testPassword,
              role: 'ATTENDEE'
            })
          }
        )

        let token = null
        let userData = null

        if (registerResponse.ok) {
          const registerData = await registerResponse.json()
          if (registerData.success) {
            token = registerData.data.token
            userData = registerData.data.user
          }
        } else {
          // If registration fails (user might exist), try login
          const loginResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: testEmail,
                password: testPassword
              })
            }
          )

          if (loginResponse.ok) {
            const loginData = await loginResponse.json()
            if (loginData.success) {
              token = loginData.data.token
              userData = loginData.data.user
            }
          }
        }

        if (token && userData) {
          // Store token and user data
          localStorage.setItem('token', token)
          localStorage.setItem('eventify_user', JSON.stringify({
            id: userData.id,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            role: userData.role?.toLowerCase() || 'attendee',
            isAdmin: false,
            joinDate: new Date().toISOString()
          }))

          setStatus('success')
          setMessage(`Test account created! Email: ${testEmail}`)
        } else {
          // Fallback: Create a mock token for frontend-only testing
          const mockToken = `test_token_${Date.now()}`
          localStorage.setItem('token', mockToken)
          localStorage.setItem('eventify_user', JSON.stringify({
            id: `user_${Date.now()}`,
            name: 'Test User',
            email: testEmail,
            role: 'attendee',
            isAdmin: false,
            joinDate: new Date().toISOString()
          }))

          setStatus('success')
          setMessage('Test token created (mock mode - backend may require real authentication)')
        }
      } catch (error: any) {
        // Create mock token as fallback
        const mockToken = `test_token_${Date.now()}`
        localStorage.setItem('token', mockToken)
        localStorage.setItem('eventify_user', JSON.stringify({
          id: `user_${Date.now()}`,
          name: 'Test User',
          email: 'test@eventify.com',
          role: 'attendee',
          isAdmin: false,
          joinDate: new Date().toISOString()
        }))

        setStatus('success')
        setMessage('Mock test token created. Note: Backend may require real authentication.')
      }
    }

    setupTestToken()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Token Ready!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
                <ArrowRight className="ml-2" size={16} />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Go Back to Checkout
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

