import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Room Drop - Signup Less Chat Room To Chat with your Friends and Family.",
  description: "Create instant chat rooms without the hassle of signing up. Share the link and start chatting with friends and family right away!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full min-h-screen `}
      >

        <Toaster position="top-right"
          richColors
          closeButton
          duration={3000} />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<IconLoader2 className="animate-spin m-auto" />}>

          {children}
          </Suspense>
        </ThemeProvider>

      </body>
    </html>
  );
}
