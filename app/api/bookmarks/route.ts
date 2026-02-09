import { NextRequest, NextResponse } from "next/server";
import { getBookmarks, createBookmark, findBookmarkByUrl } from "@/lib/storage";
import { requireAuth } from "@/lib/require-auth";
import { extractMetadataFromUrl, fetchFaviconAsBase64 } from "@/lib/meta-parser";
import { removeQueryStringsFromURL } from "@/lib/server-utils";
import { validateUrl } from "@/lib/url-validator";
import { createBookmarkSchema, parseBody } from "@/lib/validation";

// GET /api/bookmarks - Get all bookmarks
export async function GET() {
  try {
    const bookmarks = await getBookmarks();
    return NextResponse.json({ data: bookmarks });
  } catch (error) {
    console.error("Failed to get bookmarks:", error);
    return NextResponse.json({ error: "Failed to get bookmarks" }, { status: 500 });
  }
}

// POST /api/bookmarks - Create a new bookmark
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseBody(createBookmarkSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { url, title: providedTitle, categoryId } = parsed.data;

    // Remove query strings from URL
    const cleanUrl = removeQueryStringsFromURL(url);

    // Check for duplicate
    const existing = await findBookmarkByUrl(cleanUrl);
    if (existing) {
      return NextResponse.json({ error: "This URL has already been bookmarked" }, { status: 409 });
    }

    // Validate URL is accessible
    const isValid = await validateUrl(cleanUrl);
    if (!isValid) {
      return NextResponse.json(
        { error: "URL is not accessible (404 or invalid)" },
        { status: 400 }
      );
    }

    // Extract metadata (title and favicon)
    const metadata = await extractMetadataFromUrl(cleanUrl);

    const title = providedTitle || metadata?.title || "";
    const image = metadata?.favicon
      ? ((await fetchFaviconAsBase64(metadata.favicon)) ?? undefined)
      : undefined;

    const newBookmark = await createBookmark(
      {
        id: crypto.randomUUID(),
        url: cleanUrl,
        title,
        image,
        createdAt: new Date().toISOString(),
      },
      categoryId ?? undefined
    );

    return NextResponse.json({ data: newBookmark }, { status: 201 });
  } catch (error) {
    console.error("Failed to create bookmark:", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}
