/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**insta**',
      },
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`,
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
