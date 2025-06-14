import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import '../../public/styles/tailwind.css';
import "../styles/tailwind-input.css"; // ✅ DIRECTLY import the input
import { TranscriptProvider } from "./contexts/TranscriptContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HRMNY HR",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TranscriptProvider>
          {children}
        </TranscriptProvider>
      </body>
    </html>
  );
}
