import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "할 일 메모장",
  description: "날짜별 일정 및 메모 관리 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 테마 플리커 방지: 첫 paint 전에 localStorage에서 테마 읽어 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('memo_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
