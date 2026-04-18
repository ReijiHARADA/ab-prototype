import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "商品詳細 — ソーシャルプルーフ確認",
  description:
    "EC商品詳細画面のソーシャルプルーフ表示に関する研究用プロトタイプ（日本語 / 한국어）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSans.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col overflow-x-hidden bg-white font-sans text-neutral-900 [-webkit-tap-highlight-color:transparent]">
        {children}
      </body>
    </html>
  );
}
