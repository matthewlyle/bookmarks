import { FETCH_TIMEOUT_MS } from "./constants";

export async function validateUrl(url: string): Promise<boolean> {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  // Try HEAD first (faster, less bandwidth)
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });

    if (response.ok) return true;
  } catch {
    // HEAD failed, try GET as fallback
  }

  // Fallback to GET (some sites block HEAD requests)
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });

    return response.ok;
  } catch {
    return false;
  }
}
