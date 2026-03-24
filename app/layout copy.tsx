// import type { Metadata } from "next";
// import localFont from "next/font/local";
// import { IBM_Plex_Serif } from "next/font/google";
// import Providers from "@/components/providers/Providers";
// import GlobalBackground from "@/components/effects/GlobalBackground";
// import "./globals.css";

// const satoshi = localFont({
//   src: "../../public/fonts/Satoshi-Variable.ttf",
//   variable: "--font-satoshi",
//   display: "swap",
// });

// const ibmPlexSerif = IBM_Plex_Serif({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   style: ["normal", "italic"],
//   variable: "--font-ibm-plex-serif",
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: "Novare Talent — India's Elite Talent Network",
//   description:
//     "We help companies hire from India's top 1% institutes. Curated talent from IITs, IIMs, and more.",
//   keywords: [
//     "hiring",
//     "IIT",
//     "IIM",
//     "talent",
//     "recruitment",
//     "India",
//     "startup hiring",
//     "curated talent",
//   ],
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" className={`${satoshi.variable} ${ibmPlexSerif.variable}`}>
//       <body className="antialiased">
//         <Providers>
//           <GlobalBackground />
//           {children}
//         </Providers>
//         <div className="grain-overlay" />
//       </body>
//     </html>
//   );
// }
