/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'eventifyimages.s3.us-east-2.amazonaws.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eventifyimages.s3.us-east-2.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
