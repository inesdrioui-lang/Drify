import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // @react-pdf/renderer uses canvas/browser APIs — never bundle server-side
      const externals = Array.isArray(config.externals) ? config.externals : []
      config.externals = [...externals, '@react-pdf/renderer']
    }
    return config
  },
}

export default nextConfig
