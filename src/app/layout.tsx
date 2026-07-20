import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "@/assets/scss/global.scss";

import QueryProvider from "@/components/QueryProvider";
import ToastContainer from "@/components/common/toast/ToastContainer";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Health Checker",
  description: "개인 건강 기록 앱",
  applicationName: "Health Checker",
  icons: {
    icon: [
      {
        url: "/icons/health-checker-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3b82c4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={notoSansKr.className}>
        <QueryProvider>
          {children}
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
