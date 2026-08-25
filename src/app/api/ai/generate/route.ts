import { NextResponse } from "next/server";
import { artworkProxyUrl, cloudinaryConfigured, uploadArtwork } from "@/lib/cloudinary";
import { sessionUser } from "@/lib/auth";
import { databaseConfigured, db } from "@/lib/db";
import { rateLimit, requestIsSameOrigin, tooManyRequests } from "@/lib/security";

type OpenAIImageResponse = { data?: { b64_json?: string }[]; error?: { message?: string } };

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY || !cloudinaryConfigured()) {
    return NextResponse.json(
      { error: "AI generation and secure artwork storage must be connected before this feature can be used." },
      { status: 503 }
    );
  }
  if (!requestIsSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!databaseConfigured()) return NextResponse.json({ error: "AI generation requires the commerce database for usage controls." }, { status: 503 });
  const limited=await rateLimit(request,"ai-generate",10,86400);if(!limited.allowed)return tooManyRequests(limited.retryAfter);

  const body = (await request.json()) as { prompt?: string; style?: string };
  const prompt = body.prompt?.trim().slice(0, 600);
  const style = body.style?.trim().slice(0, 80);
  if (!prompt) return NextResponse.json({ error: "Describe your print first." }, { status: 400 });

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt: `Create production-ready apparel artwork for direct-to-garment printing. ${prompt}. Style: ${style || "clean graphic"}. Isolated design only, transparent background, no garment mockup, no watermark, crisp edges, print-safe composition.`,
      n: 4,
      size: "1024x1024",
      quality: "medium",
      background: "transparent",
      output_format: "png",
    }),
    cache: "no-store",
  });

  const result = (await response.json()) as OpenAIImageResponse;
  if (!response.ok || !result.data?.length) {
    return NextResponse.json(
      { error: result.error?.message || "AI generation is temporarily unavailable." },
      { status: response.status || 502 }
    );
  }

  try {
    const user = await sessionUser();
    const designs = await Promise.all(
      result.data.map(async (image, variant) => {
        if (!image.b64_json) throw new Error("Missing image data.");
        const uploaded = await uploadArtwork(`data:image/png;base64,${image.b64_json}`, `ai-${Date.now()}-${variant}.png`);
        const url = artworkProxyUrl(uploaded.publicId, uploaded.format);
        if (databaseConfigured()) await db()`INSERT INTO artworks (user_id,source,name,url,public_id,metadata) VALUES (${user?.id??null},'ai',${prompt},${url},${uploaded.publicId},${db().json({style:style||"Custom",variant,format:uploaded.format})})`;
        return {
          kind: "ai" as const,
          prompt,
          style: style || "Custom",
          variant,
          url,
          publicId: uploaded.publicId,
        };
      })
    );
    return NextResponse.json({ designs });
  } catch {
    return NextResponse.json({ error: "The designs were created but could not be stored securely." }, { status: 502 });
  }
}
