/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // No dedicated signup route — /signin handles new + existing users
      // (Supabase OTP creates the account on first code entry).
      { source: "/signup", destination: "/signin", permanent: false },
    ];
  },
};

export default nextConfig;
