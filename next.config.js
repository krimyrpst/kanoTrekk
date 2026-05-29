/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repoBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/kanoTrekk";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? repoBasePath : "",
  assetPrefix: isProd ? `${repoBasePath}/` : "",
};

module.exports = nextConfig;
