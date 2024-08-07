/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '7f211cfa0225cb2d8fd0c542435fd3cf.ipfscdn.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'farconic.xyz',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
