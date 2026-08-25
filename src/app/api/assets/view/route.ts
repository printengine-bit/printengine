import { NextResponse } from "next/server";
import { signedArtworkUrl } from "@/lib/cloudinary";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const publicId = url.searchParams.get("publicId");
  const format = url.searchParams.get("format") || undefined;
  if (!publicId || !publicId.startsWith("printengine/artwork/")) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }
  try {
    return NextResponse.redirect(signedArtworkUrl(publicId, format), 307);
  } catch {
    return NextResponse.json({ error: "Artwork storage is unavailable." }, { status: 503 });
  }
}
