/**
 * Mock Email Notification System
 * Simulates sending email notifications to organizers when events are registered
 */

export interface EmailNotification {
  id: string
  to: string
  from: string
  subject: string
  body: string
  timestamp: string
  type: 'registration' | 'waitlist' | 'payment' | 'cancellation'
  eventId: string
  eventTitle: string
  attendeeName?: string
  attendeeEmail?: string
  ticketQuantity?: number
  ticketType?: string
  amount?: number
  isRead: boolean
}

/**
 * Send email notification to organizer when someone registers for their event
 */
export const sendRegistrationEmail = (
  organizerEmail: string,
  organizerName: string,
  eventId: string,
  eventTitle: string,
  attendeeName: string,
  attendeeEmail: string,
  ticketQuantity: number,
  ticketType: string,
  amount: number
): EmailNotification => {
  const email: EmailNotification = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to: organizerEmail,
    from: 'noreply@eventify.com',
    subject: `New Registration: ${attendeeName} registered for "${eventTitle}"`,
    body: `
Hello ${organizerName},

Great news! You have a new registration for your event.

Event: ${eventTitle}
Attendee: ${attendeeName} (${attendeeEmail})
Ticket Type: ${ticketType}
Quantity: ${ticketQuantity}
Total Amount: $${amount.toFixed(2)}

You can view all registrations in your organizer dashboard.

Best regards,
Eventify Team
    `.trim(),
    timestamp: new Date().toISOString(),
    type: 'registration',
    eventId,
    eventTitle,
    attendeeName,
    attendeeEmail,
    ticketQuantity,
    ticketType,
    amount,
    isRead: false
  }

  // Store email in localStorage
  if (typeof window !== 'undefined') {
    const existingEmails = JSON.parse(
      localStorage.getItem('eventify_organizer_emails') || '[]'
    )
    existingEmails.push(email)
    localStorage.setItem('eventify_organizer_emails', JSON.stringify(existingEmails))
  }

  return email
}

/**
 * Send email notification when someone joins waitlist
 */
export const sendWaitlistEmail = (
  organizerEmail: string,
  organizerName: string,
  eventId: string,
  eventTitle: string,
  attendeeName: string,
  attendeeEmail: string,
  ticketQuantity: number,
  ticketType: string
): EmailNotification => {
  const email: EmailNotification = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to: organizerEmail,
    from: 'noreply@eventify.com',
    subject: `New Waitlist Entry: ${attendeeName} wants to attend "${eventTitle}"`,
    body: `
Hello ${organizerName},

Someone has joined the waitlist for your event.

Event: ${eventTitle}
Attendee: ${attendeeName} (${attendeeEmail})
Ticket Type: ${ticketType}
Quantity: ${ticketQuantity}

Please review the waitlist in your organizer dashboard and approve or decline the request.

Best regards,
Eventify Team
    `.trim(),
    timestamp: new Date().toISOString(),
    type: 'waitlist',
    eventId,
    eventTitle,
    attendeeName,
    attendeeEmail,
    ticketQuantity,
    ticketType,
    isRead: false
  }

  // Store email in localStorage
  if (typeof window !== 'undefined') {
    const existingEmails = JSON.parse(
      localStorage.getItem('eventify_organizer_emails') || '[]'
    )
    existingEmails.push(email)
    localStorage.setItem('eventify_organizer_emails', JSON.stringify(existingEmails))
  }

  return email
}

/**
 * Get all emails for an organizer
 */
export const getOrganizerEmails = (organizerEmail?: string): EmailNotification[] => {
  if (typeof window === 'undefined') return []
  
  const allEmails = JSON.parse(
    localStorage.getItem('eventify_organizer_emails') || '[]'
  ) as EmailNotification[]

  if (organizerEmail) {
    return allEmails.filter(email => email.to === organizerEmail)
  }

  return allEmails
}

/**
 * Mark email as read
 */
export const markEmailAsRead = (emailId: string): void => {
  if (typeof window === 'undefined') return

  const emails = JSON.parse(
    localStorage.getItem('eventify_organizer_emails') || '[]'
  ) as EmailNotification[]

  const updatedEmails = emails.map(email =>
    email.id === emailId ? { ...email, isRead: true } : email
  )

  localStorage.setItem('eventify_organizer_emails', JSON.stringify(updatedEmails))
}

/**
 * Delete email
 */
export const deleteEmail = (emailId: string): void => {
  if (typeof window === 'undefined') return

  const emails = JSON.parse(
    localStorage.getItem('eventify_organizer_emails') || '[]'
  ) as EmailNotification[]

  const updatedEmails = emails.filter(email => email.id !== emailId)

  localStorage.setItem('eventify_organizer_emails', JSON.stringify(updatedEmails))
}

