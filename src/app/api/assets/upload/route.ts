import { NextResponse } from "next/server";
import { artworkProxyUrl, cloudinaryConfigured, uploadArtwork } from "@/lib/cloudinary";
import { sessionUser } from "@/lib/auth";
import { databaseConfigured, db } from "@/lib/db";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  if (!cloudinaryConfigured()) {
    return NextResponse.json({ error: "Artwork storage is not connected yet." }, { status: 503 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an artwork file." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Use a PNG, JPG, SVG or WebP file under 15 MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
    const uploaded = await uploadArtwork(dataUri, file.name);
    const url = artworkProxyUrl(uploaded.publicId, uploaded.format);
    if (databaseConfigured()) {
      const user = await sessionUser();
      await db()`INSERT INTO artworks (user_id,source,name,url,public_id,metadata) VALUES (${user?.id??null},'upload',${file.name},${url},${uploaded.publicId},${db().json({format:uploaded.format,width:uploaded.width,height:uploaded.height})})`;
    }
    return NextResponse.json({
      url,
      publicId: uploaded.publicId,
      format: uploaded.format,
      name: file.name,
      width: uploaded.width,
      height: uploaded.height,
    });
  } catch {
    return NextResponse.json({ error: "We could not store that artwork. Please try again." }, { status: 502 });
  }
}
