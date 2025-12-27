/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3200', 'http://localhost:4000'],
  transpilePackages: ['@workspace/ui'],
};

export default nextConfig;
