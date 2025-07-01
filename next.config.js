// ===== SIMPLE & SAFE NEXT.CONFIG.JS =====
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Basic settings only
  images: {
    domains: [
      'localhost',
      'commondatastorage.googleapis.com',
      'bitdash-a.akamaihd.net'
    ],
  },

  // ✅ Basic headers for video streaming
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },

  // ✅ Simple webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig