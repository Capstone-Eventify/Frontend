'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userRole: 'attendee' | 'organizer' | 'admin'
  message: string
  timestamp: string
}

interface CommunicationBoardProps {
  eventId: string
  isOrganizer: boolean
}

export default function CommunicationBoard({ eventId, isOrganizer }: CommunicationBoardProps) {
  const { user, isAuthenticated } = useUser()
  const { openAuthModal } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMessages = JSON.parse(
        localStorage.getItem(`eventify_messages_${eventId}`) || '[]'
      )
      setMessages(storedMessages)
    }
  }, [eventId])

  // Auto-scroll to bottom when new messages arrive (only within the messages container)
  useEffect(() => {
    if (messagesEndRef.current) {
      // Find the scrollable parent container
      const scrollContainer = messagesEndRef.current.closest('.overflow-y-auto')
      if (scrollContainer) {
        // Scroll the container, not the page
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    if (!isAuthenticated) {
      openAuthModal('signin', window.location.pathname)
      return
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || '',
      userName: user?.name || 'User',
      userAvatar: user?.avatar,
      userRole: isOrganizer ? 'organizer' : 'attendee',
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `eventify_messages_${eventId}`,
        JSON.stringify(updatedMessages)
      )
    }

    setNewMessage('')
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Discussion</h3>
          </div>
          <Badge variant="outline" size="sm">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ask questions or share updates about this event
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isOwnMessage = message.userId === user?.id
              const isOrganizerMessage = message.userRole === 'organizer'

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.userAvatar ? (
                      <img
                        src={message.userAvatar}
                        alt={message.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User size={16} className="text-primary-600" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {message.userName}
                      </span>
                      {isOrganizerMessage && (
                        <Badge variant="success" size="sm">Organizer</Badge>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary-600 text-white'
                          : isOrganizerMessage
                          ? 'bg-green-50 text-gray-900 border border-green-200'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        {!isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-2">
              Sign in to join the discussion
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAuthModal('signin', window.location.pathname)}
            >
              Sign In
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Type your message..."
              rows={2}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="self-end"
            >
              <Send size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

