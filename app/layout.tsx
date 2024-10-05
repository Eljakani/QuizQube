import type { Metadata } from "next";
import { Ubuntu } from 'next/font/google'
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizQube",
  description: "QuizQube is an AI-powered quiz platform that helps you learn and test your knowledge.",
};

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ["300", "400", "500", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${ubuntu.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}