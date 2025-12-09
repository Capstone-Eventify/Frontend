export interface PricingPlan {
  id: string
  name: string
  description: string
  price: string
  period: string
  features: string[]
  buttonText: string
  buttonVariant: "primary" | "secondary"
  popular?: boolean
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "1",
    name: "FREE",
    description: "Perfect for getting started",
    price: "$0",
    period: "",
    features: [
      "Unlimited free events",
      "Basic analytics",
      "Standard support",
      "QR code tickets",
      "Email notifications"
    ],
    buttonText: "Get Started",
    buttonVariant: "primary"
  },
  {
    id: "2",
    name: "PRO",
    description: "For growing event organizers",
    price: "$29",
    period: "/mo",
    features: [
      "Custom branding",
      "Advanced marketing tools",
      "Priority support",
      "Real-time analytics",
      "Email marketing"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "secondary",
    popular: true
  },
  {
    id: "3",
    name: "ENTERPRISE",
    description: "For large organizations",
    price: "$50",
    period: "/yr",
    features: [
      "Dedicated success manager",
      "API access",
      "Volume discounts",
      "Advanced security",
      "Custom integrations"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "primary"
  }
]
