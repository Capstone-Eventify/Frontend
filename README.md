# Eventify - Event Management Platform

A modern, responsive event management and ticketing platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Clean, professional UI with smooth animations
- **Responsive**: Works perfectly on all devices
- **TypeScript**: Full type safety throughout the application
- **Performance**: Optimized for speed and SEO
- **Accessibility**: Built with accessibility best practices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)


## 📁 Project Structure

```
.
├── config/                        # Environment & service configurations
│   └── README.md
├── docs/                          # Project documentation
│   └── README.md
├── public/                        # Static assets served as-is
│   ├── icons/
│   │   └── README.md
│   ├── images/
│   │   └── README.md
│   └── qr-templates/
│       └── README.md
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage
│   │   └── globals.css            # Global styles
│   ├── components/                # Reusable components
│   │   ├── layout/                # Header, Footer, etc.
│   │   ├── sections/              # Homepage sections (Hero, Features, etc.)
│   │   ├── ui/                    # UI atoms (Button, Badge, ...)
│   │   ├── auth/                  # Auth components (planned)
│   │   │   └── README.md
│   │   ├── payments/              # Payment UI (planned)
│   │   │   └── README.md
│   │   ├── forms/                 # Form elements (planned)
│   │   │   └── README.md
│   │   ├── events/                # Event UI (planned)
│   │   │   └── README.md
│   │   └── dashboard/             # Dashboards (planned)
│   │       ├── attendee/
│   │       │   └── README.md
│   │       └── organizer/
│   │           └── README.md
│   ├── data/                      # Static data & mock content
│   │   ├── events.ts
│   │   ├── features.ts
│   │   ├── pricing.ts
│   │   └── testimonials.ts
│   ├── hooks/                     # Custom hooks (planned)
│   │   └── README.md
│   ├── lib/                       # Utilities & domain libraries
│   │   ├── api/                   # API client (planned)
│   │   │   └── README.md
│   │   ├── auth/                  # Auth helpers (planned)
│   │   │   └── README.md
│   │   ├── payments/              # Payment helpers (planned)
│   │   │   └── README.md
│   │   ├── validations/           # Validation schemas (planned)
│   │   │   └── README.md
│   │   ├── constants.ts
│   │   ├── motion.ts
│   │   └── utils.ts
│   └── types/                     # TypeScript type definitions (planned)
│       └── README.md
├── tests/                         # Testing setup (planned)
│   └── README.md
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── README.md                      # This file
```

Notes:
- Empty/planned folders contain a short README.md describing intended contents so the structure is visible in Git and future work is guided.
- Only the homepage is implemented today; other areas are scaffolded for phased development.

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors
- **Primary**: Purple (#8b5cf6)
- **Secondary**: Gray scale
- **Accent**: Various shades for different states

### Typography
- **Font Family**: Inter
- **Headings**: Bold weights (600-900)
- **Body**: Regular weight (400)

### Components
- **Buttons**: Primary, Secondary, Outline variants
- **Cards**: Consistent shadow and border radius
- **Badges**: Status indicators with animations

## 🔮 Future Features

This homepage is designed to support future feature additions:

- User authentication and authorization
- Event creation and management
- Ticket purchasing and validation
- Payment processing
- Real-time analytics
- Mobile applications
- Multi-language support

### Suggested Next Steps (Phased)
- Types & API foundations: `src/types`, `src/lib/api`
- Auth flows: `src/lib/auth`, `src/components/auth`
- Payments: `src/lib/payments`, `src/components/payments`
- Dashboards: `src/components/dashboard/*`
- Forms & validation: `src/components/forms`, `src/lib/validations`

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance

## 🚀 Performance

- Image optimization with Next.js Image
- Code splitting and lazy loading
- Optimized bundle size
- Fast page load times
- SEO optimized

## 📄 License

This project is licensed under the MIT License.// Test deployment
// Pipeline test - Thu Sep 25 01:05:44 EDT 2025
