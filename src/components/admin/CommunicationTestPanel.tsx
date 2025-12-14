'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { MessageSquare, Mail, Phone, Settings, Send, CheckCircle, XCircle } from 'lucide-react'

interface TestResult {
  type: 'sms' | 'email'
  success: boolean
  message?: string
  error?: string
}

const CommunicationTestPanel: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState<{ sms: boolean; email: boolean }>({
    sms: false,
    email: false
  })
  const [settings, setSettings] = useState<any>(null)

  // Load communication settings
  const loadSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${apiUrl}/api/communications/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  // Test SMS functionality
  const testSMS = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number')
      return
    }

    setLoading(prev => ({ ...prev, sms: true }))
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${apiUrl}/api/communications/test-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber })
      })

      const data = await response.json()
      
      setTestResults(prev => [...prev, {
        type: 'sms',
        success: data.success && data.data.success,
        message: data.data.success ? `SMS sent successfully! Message ID: ${data.data.messageId}` : data.data.error,
        error: data.data.success ? undefined : data.data.error
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'sms',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }])
    } finally {
      setLoading(prev => ({ ...prev, sms: false }))
    }
  }

  // Test Email functionality
  const testEmail = async () => {
    if (!email) {
      alert('Please enter an email address')
      return
    }

    setLoading(prev => ({ ...prev, email: true }))
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${apiUrl}/api/communications/test-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      setTestResults(prev => [...prev, {
        type: 'email',
        success: data.success && data.data.success,
        message: data.data.success ? 'Email sent successfully!' : data.data.error,
        error: data.data.success ? undefined : data.data.error
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'email',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }])
    } finally {
      setLoading(prev => ({ ...prev, email: false }))
    }
  }

  React.useEffect(() => {
    loadSettings()
  }, [])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="text-primary-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Communication Test Panel</h2>
      </div>

      {/* Settings Overview */}
      {settings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Settings size={16} />
            <h3 className="font-medium">Configuration Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Phone size={14} />
              <span>SMS:</span>
              {settings.sms.enabled ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle size={14} className="mr-1" />
                  Enabled ({settings.sms.phoneNumber})
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <XCircle size={14} className="mr-1" />
                  Not configured
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={14} />
              <span>Email:</span>
              {settings.email.enabled ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle size={14} className="mr-1" />
                  Enabled ({settings.email.user})
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <XCircle size={14} className="mr-1" />
                  Not configured
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* SMS Test */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center space-x-2">
            <Phone size={16} />
            <span>Test SMS</span>
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button
            onClick={testSMS}
            disabled={loading.sms || !settings?.sms.enabled}
            className="w-full"
          >
            {loading.sms ? (
              'Sending...'
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Test SMS
              </>
            )}
          </Button>
        </div>

        {/* Email Test */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center space-x-2">
            <Mail size={16} />
            <span>Test Email</span>
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button
            onClick={testEmail}
            disabled={loading.email || !settings?.email.enabled}
            className="w-full"
          >
            {loading.email ? (
              'Sending...'
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Test Email
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {result.type === 'sms' ? <Phone size={16} /> : <Mail size={16} />}
                  <span className="font-medium capitalize">{result.type}</span>
                  {result.success ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                </div>
                <p className="text-sm mt-1">
                  {result.success ? result.message : result.error}
                </p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestResults([])}
          >
            Clear Results
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Setup Instructions & Troubleshooting</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>For SMS (Twilio):</strong> Already configured with your credentials</p>
          <p><strong>For Email (Gmail):</strong> Update EMAIL_USER and EMAIL_PASS in .env file</p>
          <p><strong>Gmail Setup:</strong> Use App Password, not regular password</p>
          <p><strong>SendGrid Alternative:</strong> Replace nodemailer config with SendGrid API</p>
          
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-medium text-yellow-800">SMS Troubleshooting:</p>
            <ul className="list-disc list-inside text-yellow-700 mt-1">
              <li>SMS only works with mobile numbers (not landlines)</li>
              <li>Use format: +1234567890 (include country code)</li>
              <li>Some carriers may block messages</li>
              <li>Check Twilio console for delivery status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunicationTestPanel