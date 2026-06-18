import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Album — A Magical Journey Through Your Memories",
  description:
    "Transform your photos into an immersive 3D memory journey. A living, animated storybook that makes you feel you're reliving memories, not just browsing images.",
  keywords: [
    "memory album",
    "photo album",
    "3D experience",
    "interactive storybook",
    "photo memories",
    "digital scrapbook",
  ],
  openGraph: {
    title: "Memory Album — A Magical Journey Through Your Memories",
    description:
      "Transform your photos into an immersive 3D memory journey.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0d0a12" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
