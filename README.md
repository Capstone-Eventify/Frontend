# Eventify - Event Management Platform

A comprehensive event management and ticketing platform built with Next.js, TypeScript, and Tailwind CSS. Features complete authentication, dashboard management, real-time notifications, payment processing, and QR code ticket validation.

## 🚀 Features

### Core Functionality
- **Complete Authentication System**: Login, signup, password reset, and onboarding flows
- **Role-Based Dashboards**: Separate interfaces for attendees, organizers, and administrators
- **Event Management**: Full CRUD operations for events with analytics and attendee management
- **Ticket System**: QR code generation, validation, and tier management
- **Real-time Notifications**: Socket.io integration with notification center and toast messages
- **Payment Processing**: Stripe integration with checkout flows and refund management
- **Communication Tools**: Admin communication panels and event-specific messaging

### Technical Features
- **Modern Design**: Clean, professional UI with smooth animations
- **Responsive**: Works perfectly on all devices
- **TypeScript**: Full type safety throughout the application
- **Performance**: Optimized for speed and SEO
- **Accessibility**: Built with accessibility best practices
- **Real-time Updates**: WebSocket integration for live data

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API
- **Real-time**: Socket.io Client
- **Payments**: Stripe React Components
- **QR Codes**: QRCode.react & HTML5-QRCode
- **Charts**: Recharts
- **Font**: Inter (Google Fonts)

## 📁 Project Structure

```
Frontend/
├── config/                        # Environment & service configurations
├── public/                        # Static assets
│   ├── icons/                     # Application icons
│   ├── images/                    # Static images
│   └── qr-templates/              # QR code templates
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── dashboard/             # Dashboard page
│   │   ├── events/[id]/           # Dynamic event pages
│   │   ├── forgot-password/       # Password recovery
│   │   ├── login/                 # Login page
│   │   ├── onboarding/            # User onboarding
│   │   ├── organizers/[id]/       # Organizer profiles
│   │   ├── reset-password/        # Password reset
│   │   ├── signup/                # Registration
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage
│   │   └── globals.css            # Global styles
│   ├── components/                # Reusable components
│   │   ├── admin/                 # Admin-specific components
│   │   │   └── CommunicationTestPanel.tsx
│   │   ├── auth/                  # Authentication components
│   │   │   ├── AuthForm.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   └── OnboardingFlow.tsx
│   │   ├── dashboard/             # Dashboard components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── OrganizerDashboard.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── EventAnalytics.tsx
│   │   │   ├── AttendeeManagement.tsx
│   │   │   ├── QRCodeScanner.tsx
│   │   │   ├── TicketDetailModal.tsx
│   │   │   └── [20+ other dashboard components]
│   │   ├── events/                # Event-related components
│   │   │   ├── CheckoutFlow.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── QRCodeDisplay.tsx
│   │   │   ├── TicketTierSelector.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── [10+ other event components]
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   └── ConditionalLayout.tsx
│   │   ├── notifications/         # Notification system
│   │   │   ├── NotificationsModal.tsx
│   │   │   ├── NotificationToast.tsx
│   │   │   └── NotificationTestPanel.tsx
│   │   ├── sections/              # Homepage sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   └── [4+ other sections]
│   │   ├── support/               # Support components
│   │   │   ├── SupportModal.tsx
│   │   │   └── SupportTickets.tsx
│   │   └── ui/                    # Reusable UI components
│   │       ├── Button.tsx
│   │       └── Badge.tsx
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.tsx        # Authentication state
│   │   ├── DataContext.tsx        # Application data
│   │   ├── SocketContext.tsx      # WebSocket connection
│   │   └── UserContext.tsx        # User state management
│   ├── data/                      # Static data & configurations
│   │   ├── features.ts            # Feature definitions
│   │   ├── pricing.ts             # Pricing tiers
│   │   └── testimonials.ts        # Customer testimonials
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utilities & libraries
│   │   ├── api/                   # API client utilities
│   │   ├── auth/                  # Authentication helpers
│   │   ├── payments/              # Payment processing
│   │   ├── validations/           # Form validation schemas
│   │   ├── constants.ts           # Application constants
│   │   ├── motion.ts              # Animation configurations
│   │   ├── stripe.ts              # Stripe configuration
│   │   └── utils.ts               # General utilities
│   ├── store/                     # State management
│   └── types/                     # TypeScript type definitions
│       ├── event.ts               # Event-related types
│       └── README.md
├── tailwind.config.js             # Tailwind CSS configuration
├── next.config.js                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see Backend README)

### Installation

1. **Clone and navigate to frontend**:
   ```bash
   cd Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create `.env.local` file with required variables:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🏗️ Architecture Overview

### Authentication Flow
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Organizer, Attendee)
- Protected routes with automatic redirects
- Onboarding flow for new users

### State Management
- **AuthContext**: User authentication and session management
- **DataContext**: Application data and API state
- **SocketContext**: Real-time WebSocket connections
- **UserContext**: User preferences and settings

### Real-time Features
- Live notifications via Socket.io
- Real-time event updates
- Instant messaging for event communication
- Live analytics and attendance tracking

### Payment Integration
- Stripe Elements for secure payment processing
- Support for multiple payment methods
- Refund and cancellation handling
- Promo code and discount management

## 🎨 Design System

### Colors
- **Primary**: Purple (#8b5cf6) - Main brand color
- **Secondary**: Gray scale (#f8fafc to #1e293b)
- **Success**: Green (#10b981) - Confirmations and success states
- **Warning**: Yellow (#f59e0b) - Warnings and pending states
- **Error**: Red (#ef4444) - Errors and destructive actions

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights (600-900)
- **Body**: Regular weight (400)
- **Code**: Monospace for technical content

### Component Library
- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Cards**: Consistent shadow system and border radius
- **Badges**: Status indicators with color coding
- **Modals**: Consistent overlay and animation patterns
- **Forms**: Unified input styling and validation states

## 🔧 Key Components

### Dashboard Components
- **AdminDashboard**: Complete admin interface with user management
- **OrganizerDashboard**: Event creation and management tools
- **EventAnalytics**: Real-time analytics and reporting
- **AttendeeManagement**: Attendee tracking and communication
- **QRCodeScanner**: Ticket validation and check-in system

### Event Management
- **EventForm**: Comprehensive event creation and editing
- **TicketTierBuilder**: Dynamic ticket tier configuration
- **SeatingArrangementBuilder**: Visual seating layout tool
- **CheckoutFlow**: Multi-step payment and booking process

### Notification System
- **NotificationBell**: Real-time notification indicator
- **NotificationsModal**: Notification center with filtering
- **NotificationToast**: Non-intrusive popup notifications

## 🔐 Security Features

- **Input Validation**: Client-side validation with server-side verification
- **XSS Protection**: Sanitized user inputs and secure rendering
- **CSRF Protection**: Token-based request validation
- **Secure Authentication**: JWT with httpOnly cookies
- **Role-based Access**: Component-level permission checking

## 📱 Responsive Design

Fully responsive design optimized for:
- **Mobile**: 320px - 767px (Touch-first interface)
- **Tablet**: 768px - 1023px (Hybrid touch/mouse)
- **Desktop**: 1024px - 1439px (Mouse-optimized)
- **Large Desktop**: 1440px+ (Wide screen layouts)

## ♿ Accessibility

- **WCAG 2.1 AA Compliance**: Color contrast and text sizing
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Focus Management**: Logical tab order and focus indicators
- **Alternative Text**: Comprehensive image descriptions

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Optimized dependencies and tree shaking
- **Caching Strategy**: Efficient API response caching
- **Lazy Loading**: Component-level lazy loading for better performance

## 🧪 Testing Strategy

### Component Testing
- Unit tests for individual components
- Integration tests for complex workflows
- Accessibility testing with automated tools

### User Experience Testing
- Cross-browser compatibility testing
- Mobile device testing on real devices
- Performance testing and optimization

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Required for production deployment:
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `NEXT_PUBLIC_SOCKET_URL`: WebSocket server URL

### CI/CD Pipeline
- Automated testing on pull requests
- Build verification and deployment
- Performance monitoring and alerts

## 🔄 Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `QA`: Testing and quality assurance
- `feature/*`: Individual feature development

### Code Quality
- ESLint configuration for consistent code style
- TypeScript for type safety
- Prettier for code formatting
- Pre-commit hooks for quality checks

## 📊 Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Error tracking and reporting

### User Analytics
- Event tracking for user interactions
- Conversion funnel analysis
- A/B testing capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive component documentation
- Include unit tests for new features
- Ensure accessibility compliance
- Test across multiple devices and browsers

## 📞 Support & Documentation

### Getting Help
- Check the component documentation in respective README files
- Review the troubleshooting guides in the docs folder
- Contact the development team for technical support

### Additional Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs/stripe-js/react)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Eventify Frontend** - Built with ❤️ by the development team
