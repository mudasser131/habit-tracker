// next.config.js
const nextConfig = {
  reactStrictMode: true, // Enables React Strict Mode for debugging
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'], // Ensure Next.js recognizes TypeScript pages
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignores ESLint errors during builds
  },
};

module.exports = nextConfig;
