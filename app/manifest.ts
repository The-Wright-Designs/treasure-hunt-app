import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Treasure Hunt App",
    short_name: "Treasure Hunt",
    description: "An exciting treasure hunt application",
    id: "/",
    scope: "/",
    orientation: "portrait",
    categories: ["games"],
    start_url: "/dashboard",
    display: "standalone",
    theme_color: "#E37434",
    background_color: "#FFFFFF",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
