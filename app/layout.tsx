// import type { Metadata } from "next";
// import { Geist_Mono, Inter } from "next/font/google";
// import { ThemeProvider } from "@/components/theme-provider";
// import "./globals.css";
// import { Toaster } from "@/components/ui/sonner"

// const inter = Inter({
//    subsets: ["latin"],
//    weight: ["100","300","500"],
//    variable: "--font-sans"
// })

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Novare Talent",
//   description: "Connecting Startups with Top Talents",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body
//         className={`${inter.variable} ${geistMono.variable} antialiased`}
//       >
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="dark"
//           enableSystem
//           disableTransitionOnChange
//         >
//         {children}
//         <Toaster />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Lora } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/context/SessionContext";
import { MousePositionProvider } from "@/hooks/useMousePosition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/SkipLink";
import { WebVitals } from "@/components/WebVitals";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

/* Default font (everywhere) */
const satoshi = localFont({
  src: "../public/fonts/Satoshi-Variable.ttf",
  variable: "--font-sans",
  weight: "300 900",
  display: "swap",
  preload: true,
});

/* Optional serif font */
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Novare Talent - AI-Powered Talent Matching Platform",
    template: "%s | Novare Talent",
  },
  description: "Connect startups with top talent using AI-powered candidate ranking, automated assignments, and intelligent evaluations. Streamline your hiring process with Novare Talent.",
  keywords: ["talent matching", "AI recruitment", "startup hiring", "candidate ranking", "automated hiring"],
  authors: [{ name: "Novare Talent" }],
  creator: "Novare Talent",
  publisher: "Novare Talent",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://novaretalent.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Novare Talent - AI-Powered Talent Matching",
    description: "Connect startups with top talent using AI-powered recruitment",
    siteName: "Novare Talent",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Novare Talent Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Novare Talent - AI-Powered Talent Matching",
    description: "Connect startups with top talent using AI-powered recruitment",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${satoshi.variable} ${lora.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="antialiased font-sans">
        <WebVitals />
        <SkipLink />
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <MousePositionProvider>
              <SessionProvider>
                <main id="main-content">
                  {children}
                </main>
              </SessionProvider>
              <Toaster />
            </MousePositionProvider>
          </ThemeProvider>
        </ErrorBoundary>
        
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Novare Talent",
              "url": "https://novaretalent.com",
              "logo": "https://novaretalent.com/logo.png",
              "description": "AI-powered talent matching platform for startups",
              "sameAs": [
                "https://twitter.com/novaretalent",
                "https://linkedin.com/company/novaretalent",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
