import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoomDrop - Anonymous Chat Rooms",
  description: "Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-mono antialiased w-full min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
          />
          <Suspense fallback={<IconLoader2 className="animate-spin m-auto" />}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
