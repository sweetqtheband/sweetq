/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**insta**',
      },
    ],
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
    includePaths: ['styles', 'node_modules'],
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es',
  },
};

export default nextConfig;
