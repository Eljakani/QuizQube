import type { Metadata } from "next";
import { Ubuntu } from 'next/font/google';
import { SessionProvider } from "next-auth/react";
import { ViewTransitions } from 'next-view-transitions'

import "./globals.css";

export const metadata: Metadata = {
  title: "QuizQube",
  description: "QuizQube is an AI-powered quiz platform that helps you learn and test your knowledge.",
  openGraph: {
    images: ["/quizqube_featured.png"],
  },
};

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ["300", "400", "500", "700"],
});

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <ViewTransitions>
      <html lang="en">
        <body className={`${ubuntu.className} antialiased bg-gray-100`}>
          {children}
        </body>
      </html>
      </ViewTransitions>
    </SessionProvider>
  );
}