import { NextResponse } from "next/server";
import { artworkProxyUrl, cloudinaryConfigured, uploadArtwork } from "@/lib/cloudinary";
import { sessionUser } from "@/lib/auth";
import { databaseConfigured, db } from "@/lib/db";
import { detectedImageType, MAX_ARTWORK_BYTES } from "@/lib/image-upload";
import { rateLimit, requestIsSameOrigin, tooManyRequests } from "@/lib/security";

export async function POST(request: Request) {
  if (!cloudinaryConfigured()) {
    return NextResponse.json({ error: "Artwork storage is not connected yet." }, { status: 503 });
  }
  if (!requestIsSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (databaseConfigured()) { const limited=await rateLimit(request,"artwork-upload",30,3600);if(!limited.allowed)return tooManyRequests(limited.retryAfter); }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an artwork file." }, { status: 400 });
  }
  if (file.size > MAX_ARTWORK_BYTES) {
    return NextResponse.json({ error: "Use a PNG, JPG or WebP file under 15 MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectedImageType(buffer);
    if (!detected || detected !== file.type) return NextResponse.json({ error: "The file contents are not a valid PNG, JPG or WebP image." }, { status: 400 });
    const dataUri = `data:${detected};base64,${buffer.toString("base64")}`;
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
