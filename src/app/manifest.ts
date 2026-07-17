import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Health Checker",
    short_name: "Health Checker",
    description: "개인 건강 기록 앱",
    start_url: "/record",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82c4",
    icons: [
      {
        src: "/icons/health-checker-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/health-checker-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/health-checker-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
