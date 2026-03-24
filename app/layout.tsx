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
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

/* Default font (everywhere) */
const satoshi = localFont({
  src: "../public/fonts/Satoshi-Variable.ttf",
  variable: "--font-sans",
  weight: "300 900",
});

/* Optional serif font */
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Novare Talent",
  description: "Connecting Startups with Top Talents",
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
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MousePositionProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
            <Toaster />
          </MousePositionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
