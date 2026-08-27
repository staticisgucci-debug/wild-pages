import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wild Pages",
  description: "Cozy campfire storybook",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#0d1b14] text-[#e8dcc0] antialiased">
        {children}
      </body>
    </html>
  );
}