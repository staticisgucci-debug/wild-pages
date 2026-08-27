/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: explicit serverActions.bodySizeLimit removed because this Next.js
  // version emits a warning for unknown next.config keys. Instead we use
  // client-side uploads for large files (see components/study/BookEditor.tsx)
  // which avoids sending large base64 bodies through Server Actions.
};

export default nextConfig;
