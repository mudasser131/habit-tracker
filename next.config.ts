// next.config.js
const nextConfig = {
  reactStrictMode: true, // Enables React Strict Mode for debugging
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'], // Ensure Next.js recognizes TypeScript pages
  experimental: {
    appDir: true, // Required for the src directory structure
  },
};

module.exports = nextConfig;
