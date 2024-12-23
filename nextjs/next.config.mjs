/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "web-archive-for-all.s3.amazonaws.com",
        port: "",
        pathname: "/images/*",
        search: "",
      },
    ],
  },
};

export default nextConfig;
