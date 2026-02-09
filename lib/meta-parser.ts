import { FETCH_TIMEOUT_MS } from "./constants";

export interface PageMetadata {
  title?: string;
  favicon?: string;
}

function getMetaContent(html: string, pattern: RegExp): string | undefined {
  const match = html.match(pattern);
  return match?.[1]?.trim();
}

export async function extractMetadataFromUrl(url: string): Promise<PageMetadata | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BookmarksBot/1.0)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract title: og:title → twitter:title → <title>
    const title =
      getMetaContent(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      getMetaContent(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
      getMetaContent(html, /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i) ||
      getMetaContent(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

    // Extract favicon
    const faviconMatch =
      html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:icon|shortcut icon)["']/i);

    let favicon = faviconMatch?.[1]?.trim();

    // Convert relative favicon URLs to absolute, or fallback to /favicon.ico
    try {
      const baseUrl = new URL(url);
      if (favicon && !favicon.startsWith("http")) {
        favicon = new URL(favicon, url).href;
      } else if (!favicon) {
        favicon = new URL("/favicon.ico", baseUrl.origin).href;
      }
    } catch {
      // Keep as-is if URL parsing fails
    }

    return { title, favicon };
  } catch {
    return null;
  }
}

// Fetch a favicon and convert it to a base64 data URI
export async function fetchFaviconAsBase64(faviconUrl: string): Promise<string | null> {
  try {
    const response = await fetch(faviconUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BookmarksBot/1.0)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/x-icon";

    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}
