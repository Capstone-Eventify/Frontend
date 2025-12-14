'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useUser } from './UserContext'

interface DataContextType {
  // Data states
  events: any[]
  tickets: any[]
  favorites: any[]
  myEvents: any[]
  
  // Loading states
  eventsLoading: boolean
  ticketsLoading: boolean
  favoritesLoading: boolean
  myEventsLoading: boolean
  
  // Actions
  loadEvents: () => Promise<void>
  loadTickets: () => Promise<void>
  loadFavorites: () => Promise<void>
  loadMyEvents: () => Promise<void>
  
  // Update actions
  updateEvent: (eventId: string, updates: any) => void
  updateTicket: (ticketId: string, updates: any) => void
  addFavorite: (eventId: string) => void
  removeFavorite: (eventId: string) => void
  
  // Refresh actions (for after mutations)
  refreshEvents: () => Promise<void>
  refreshTickets: () => Promise<void>
  refreshFavorites: () => Promise<void>
  refreshMyEvents: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useUser()
  
  // Data states
  const [events, setEvents] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [myEvents, setMyEvents] = useState<any[]>([])
  
  // Loading states
  const [eventsLoading, setEventsLoading] = useState(false)
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [myEventsLoading, setMyEventsLoading] = useState(false)
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
  
  // Load events (public data)
  const loadEvents = useCallback(async () => {
    if (eventsLoading) return
    
    setEventsLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/events`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvents(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setEventsLoading(false)
    }
  }, [apiUrl, eventsLoading])
  
  // Load tickets (requires auth)
  const loadTickets = useCallback(async () => {
    if (!isAuthenticated || ticketsLoading) return
    
    const token = localStorage.getItem('token')
    if (!token) return
    
    setTicketsLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTickets(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setTicketsLoading(false)
    }
  }, [apiUrl, isAuthenticated, ticketsLoading])
  
  // Load favorites (requires auth)
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || favoritesLoading) return
    
    const token = localStorage.getItem('token')
    if (!token) return
    
    setFavoritesLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFavorites(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setFavoritesLoading(false)
    }
  }, [apiUrl, isAuthenticated, favoritesLoading])
  
  // Load my events (requires organizer auth)
  const loadMyEvents = useCallback(async () => {
    if (!isAuthenticated || !user?.role?.includes('organizer') || myEventsLoading) return
    
    const token = localStorage.getItem('token')
    if (!token) return
    
    setMyEventsLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/events/organizer/my-events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMyEvents(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading my events:', error)
    } finally {
      setMyEventsLoading(false)
    }
  }, [apiUrl, isAuthenticated, user?.role, myEventsLoading])
  
  // Update functions for optimistic updates
  const updateEvent = useCallback((eventId: string, updates: any) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ))
    setMyEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ))
  }, [])
  
  const updateTicket = useCallback((ticketId: string, updates: any) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ))
  }, [])
  
  const addFavorite = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      setFavorites(prev => [...prev, event])
    }
  }, [events])
  
  const removeFavorite = useCallback((eventId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== eventId))
  }, [])
  
  // Refresh functions (for after mutations)
  const refreshEvents = loadEvents
  const refreshTickets = loadTickets
  const refreshFavorites = loadFavorites
  const refreshMyEvents = loadMyEvents
  
  // Clear data on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setTickets([])
      setFavorites([])
      setMyEvents([])
    }
  }, [isAuthenticated])
  
  const value: DataContextType = {
    // Data
    events,
    tickets,
    favorites,
    myEvents,
    
    // Loading states
    eventsLoading,
    ticketsLoading,
    favoritesLoading,
    myEventsLoading,
    
    // Load actions
    loadEvents,
    loadTickets,
    loadFavorites,
    loadMyEvents,
    
    // Update actions
    updateEvent,
    updateTicket,
    addFavorite,
    removeFavorite,
    
    // Refresh actions
    refreshEvents,
    refreshTickets,
    refreshFavorites,
    refreshMyEvents
  }
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}