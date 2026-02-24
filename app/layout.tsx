import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "뉴스레터 블로그",
  description: "최신 블로그 포스트와 뉴스레터를 구독하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
