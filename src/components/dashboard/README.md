# Dashboard Components

This directory contains all the dashboard-related components for the Eventify platform.

## Components Overview

### Main Dashboard (`/app/dashboard/page.tsx`)
- **Purpose**: Main dashboard page with sidebar navigation
- **Features**: 
  - Responsive sidebar navigation
  - Mobile-friendly design
  - Section-based routing (overview, events, tickets, profile, organizer)
  - User authentication integration

### Dashboard Sections

#### 1. DashboardOverview (`DashboardOverview.tsx`)
- **Purpose**: Main dashboard overview with stats and quick actions
- **Features**:
  - Welcome section with user greeting
  - Key statistics (events attended, active tickets, total spent, networking score)
  - Upcoming events preview
  - Recent activity feed
  - Quick action buttons

#### 2. EventsSection (`EventsSection.tsx`)
- **Purpose**: Browse and discover events
- **Features**:
  - Grid and list view modes
  - Search and filter functionality
  - Category filtering
  - Event cards with ratings and attendee counts
  - Favorite events functionality
  - Event registration

#### 3. TicketsSection (`TicketsSection.tsx`)
- **Purpose**: Manage user's event tickets
- **Features**:
  - Ticket status management (confirmed, pending, cancelled)
  - QR code display
  - Ticket download functionality
  - Order history
  - Seat information (for seated events)
  - Ticket sharing

#### 4. ProfileSection (`ProfileSection.tsx`)
- **Purpose**: User profile and account management
- **Features**:
  - Personal information editing
  - Notification preferences
  - Account settings
  - User statistics
  - Favorite categories
  - Security settings

#### 5. OrganizerDashboard (`OrganizerDashboard.tsx`)
- **Purpose**: Event organizer management interface
- **Features**:
  - Revenue and attendance statistics
  - Event management
  - Performance analytics
  - Recent activity tracking
  - Quick action buttons
  - Event creation tools

## Key Features

### 🎯 **User Experience**
- **Progressive Disclosure**: Different views for attendees vs organizers
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Smooth Animations**: Framer Motion for enhanced UX
- **Intuitive Navigation**: Clear section-based organization

### 📊 **Analytics & Insights**
- **Real-time Stats**: Live updates on events, revenue, attendees
- **Performance Metrics**: Growth tracking and conversion rates
- **Activity Feeds**: Recent actions and notifications
- **Visual Indicators**: Status badges, progress bars, charts

### 🔧 **Functionality**
- **Search & Filter**: Advanced filtering across all sections
- **Bulk Actions**: Download all tickets, manage multiple events
- **QR Code Integration**: Easy ticket verification
- **Social Features**: Favorites, sharing, networking scores

### 🎨 **Design System**
- **Consistent Styling**: Unified color scheme and typography
- **Component Reusability**: Shared UI components
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Dark Mode Ready**: Prepared for theme switching

## Usage Examples

### Basic Dashboard Access
```tsx
// Navigate to dashboard
<Link href="/dashboard">Go to Dashboard</Link>
```

### Custom Dashboard Section
```tsx
// Add custom section to navigation
const customSection = {
  id: 'custom',
  label: 'Custom Section',
  icon: CustomIcon
}
```

### Dashboard State Management
```tsx
// Access dashboard state
const [activeSection, setActiveSection] = useState('overview')
const [isOrganizer, setIsOrganizer] = useState(false)
```

## Integration Points

### Authentication
- Integrates with `AuthContext` for user state
- Role-based access (attendee vs organizer)
- Protected routes and permissions

### Data Management
- Mock data structure for development
- API integration points prepared
- Real-time updates support

### Navigation
- Sidebar navigation with active states
- Mobile-responsive menu
- Breadcrumb support

## Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket integration
- **Advanced Analytics**: Detailed reporting and insights
- **Team Management**: Multi-user organizer accounts
- **API Integration**: Full backend connectivity
- **Offline Support**: PWA capabilities

### Technical Improvements
- **Performance**: Code splitting and lazy loading
- **Testing**: Comprehensive test coverage
- **Accessibility**: Enhanced screen reader support
- **Internationalization**: Multi-language support

## Development Notes

### File Structure
```
src/components/dashboard/
├── DashboardOverview.tsx      # Main overview component
├── EventsSection.tsx          # Events browsing
├── TicketsSection.tsx         # Ticket management
├── ProfileSection.tsx         # User profile
├── OrganizerDashboard.tsx    # Organizer tools
└── README.md                 # This file
```

### Dependencies
- **Framer Motion**: Animations and transitions
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling framework
- **Next.js**: Framework and routing

### Performance Considerations
- Lazy loading for heavy components
- Optimized image handling
- Efficient state management
- Minimal re-renders

## Contributing

When adding new dashboard features:
1. Follow the existing component structure
2. Use consistent naming conventions
3. Include proper TypeScript types
4. Add responsive design considerations
5. Include accessibility features
6. Update this README with new features
