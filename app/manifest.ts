import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Treasure Hunt App",
    short_name: "Treasure Hunt",
    description: "An exciting treasure hunt application",
    start_url: "/dashboard",
    display: "standalone",
    theme_color: "#E37434",
    background_color: "#FFFFFF",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
