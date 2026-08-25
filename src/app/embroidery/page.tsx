import type { Metadata } from "next";
import LandingShell from "@/components/layout/LandingShell";
import { products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Embroidery",
  description:
    "Stitched names, initials and logos on polos, hoodies and doctor aprons. From ₹249 per area.",
};

export default function Page() {
  const embroiderable = products.filter((p) => p.methods.includes("Embroidery")).slice(0, 4);
  return (
    <LandingShell
      eyebrow="From ₹249 per area"
      title="Embroidery that outlasts the garment"
      intro="Dense stitched thread for names, initials, logos and uniforms. It survives hundreds of hot washes without fading."
      primary={{ label: "Shop embroidery", href: "/shop?method=Embroidery" }}
      secondary={{ label: "Read the guide", href: "/guides/embroidery" }}
      blocks={[
        { heading: "Names and initials", body: "Up to 24 characters, in your choice of font and thread colour. The default for doctor aprons." },
        { heading: "Logo embroidery", body: "Flat vector logos with clear edges. Send us an SVG or a high-resolution PNG." },
        { heading: "Puff embroidery", body: "Raised 3D stitching for bold lettering on caps and hoodies." },
        { heading: "What will not stitch", body: "Photographs and gradients cannot be embroidered. We will suggest printing instead." },
      ]}
      products={embroiderable}
      productsHeading="Garments we embroider"
    />
  );
}
