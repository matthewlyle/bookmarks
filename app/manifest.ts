import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bookmarks",
    short_name: "Bookmarks",
    description: "A simple bookmarking app",
    start_url: "/",
    display: "standalone",
    background_color: "#ffcdcd",
    theme_color: "#ffcdcd",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    share_target: {
      action: "/share",
      method: "GET",
      params: {
        url: "url",
        title: "title",
        text: "text",
      },
    },
  };
}
