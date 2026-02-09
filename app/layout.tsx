import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Work_Sans, BBH_Bartle } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const bbhBartle = BBH_Bartle({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "A simple bookmarking app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bookmarks",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffcdcd", // matches --red-6 (bg-card)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${workSans.variable} ${bbhBartle.variable}`}>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <main>{children}</main>
            <Toaster
              position="top-center"
              style={{ top: "env(safe-area-inset-top, 0px)" }}
              toastOptions={{
                classNames: {
                  toast: "!rounded-none",
                  actionButton: "!rounded-none",
                  cancelButton: "!rounded-none",
                },
              }}
            />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
