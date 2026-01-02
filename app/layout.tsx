import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
   subsets: ["latin"],
   weight: ["100","300","500"],
   variable: "--font-sans"
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Novare Talent",
  description: "Connecting Startups with Top Talents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
        {children}
        <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

// import type { Metadata } from "next";
// import { Poppins, Lora, Lato } from "next/font/google";
// import { ThemeProvider } from "@/components/theme-provider";
// import "./globals.css";
// import { Toaster } from "@/components/ui/sonner";

// /* Default font (everywhere) */
// const lato = Lato({
//   subsets: ["latin"],
//   weight: ["300", "400", "700"],
//   variable: "--font-sans",
// });

// /* Optional serif font */
// const lora = Lora({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
//   variable: "--font-serif",
// });

// export const metadata: Metadata = {
//   title: "Novare Talent",
//   description: "Connecting Startups with Top Talents",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html
//       lang="en"
//       suppressHydrationWarning
//       className={`${lato.variable} ${lora.variable}`}
//     >
//       <body className="antialiased font-sans">
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="dark"
//           enableSystem
//           disableTransitionOnChange
//         >
//           {children}
//           <Toaster />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
