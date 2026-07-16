import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "@/assets/scss/global.scss";

import QueryProvider from "@/components/QueryProvider";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Health Checker",
  description: "개인 화장실 패턴 기록 앱",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={notoSansKr.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
