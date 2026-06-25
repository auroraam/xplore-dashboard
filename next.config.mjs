/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' http://localhost:3000 https://xplore.pustakadata.id;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;