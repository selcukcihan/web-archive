/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nextjs.org",
        port: "",
        pathname: "*/*",
        search: "",
      },
      {
        protocol: "https",
        hostname: "react.dev",
        port: "",
        pathname: "/images/*",
        search: "",
      },
      {
        protocol: "https",
        hostname: "www.typescriptlang.org",
        port: "",
        pathname: "/images/*/*",
        search: "",
      },
    ],
  },
};

export default nextConfig;
