/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'eventifyimages.s3.us-east-2.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  // Add experimental features to help with hydration issues
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Improve error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
