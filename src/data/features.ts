export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export const features: Feature[] = [
  {
    id: "1",
    title: "Secure Payments",
    description: "Accept payments worldwide with industry-leading security and fraud protection.",
    icon: "checkmark"
  },
  {
    id: "2",
    title: "Analytics Dashboard",
    description: "Track ticket sales, revenue, and attendee engagement with detailed reports.",
    icon: "chart"
  },
  {
    id: "3",
    title: "Mobile Optimized",
    description: "Perfect experience on all devices with responsive design and mobile apps.",
    icon: "mobile"
  },
  {
    id: "4",
    title: "Global Reach",
    description: "Multi-language and multi-currency support for international events.",
    icon: "globe"
  },
  {
    id: "5",
    title: "Enterprise Security",
    description: "Bank-level security with data encryption and compliance certifications.",
    icon: "shield"
  },
  {
    id: "6",
    title: "24/7 Support",
    description: "Expert support team available around the clock to help you succeed.",
    icon: "support"
  }
]
