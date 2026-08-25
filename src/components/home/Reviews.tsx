import Garment from "@/components/ui/Garment";
import { Star } from "@/components/ui/icons";
import { reviews } from "@/lib/catalog";
import { DEMO_MODE } from "@/lib/demo";

export default function Reviews() {
  if (!DEMO_MODE) return null;
  return (
    <section className="section-pe" aria-labelledby="rev-heading">
      <div className="container-pe">
        <h2 id="rev-heading" className="text-h2">
          What our customers made
        </h2>
        <p className="mt-2 max-w-lg text-[15px] text-muted">
          Real prints, photographed by the people wearing them.
        </p>

        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.name} className="border border-line">
              <div className="flex h-52 items-center justify-center bg-alt">
                <Garment kind={r.kind} printArea className="h-full w-auto py-6" />
              </div>
              <div className="p-6">
                <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 text-lime" />
                  ))}
                </div>
                <blockquote className="mt-4 text-[15px] leading-relaxed">
                  {r.quote}
                </blockquote>
                <p className="mt-4 text-[13px] text-muted">
                  {r.name} — {r.city}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
