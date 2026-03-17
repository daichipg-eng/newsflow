/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export" は build:static 時に build-static.js が設定する
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
