import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock } from "@/components/ui/icons";

export function CheckoutHeader() {
  return (
    <>
      <header className="bg-ink text-white">
        <div className="container-pe flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="PrintEngine home">
            <Image
              src="/brand/printengine-dark.png"
              alt="PrintEngine"
              width={500}
              height={200}
              priority
              className="h-auto w-[132px]"
            />
          </Link>
          <p className="flex items-center gap-2 text-[14px]">
            <Lock className="h-4 w-4" />
            Secure checkout
          </p>
        </div>
      </header>
      <div className="border-b border-line">
        <div className="container-pe flex h-12 items-center">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-[14px] underline-offset-4 hover:underline"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Return to cart
          </Link>
        </div>
      </div>
    </>
  );
}

const CHECKOUT_LINKS = [
  { label: "Privacy policy", href: "/policies/privacy" },
  { label: "Terms of service", href: "/policies/terms" },
  { label: "Shipping policy", href: "/policies/shipping" },
  { label: "Contact us", href: "/policies/contact" },
];

export function CheckoutFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-pe flex flex-col gap-3 py-5 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-5">
          {CHECKOUT_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="underline-offset-4 hover:text-ink hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p>© 2026 printengine, India</p>
      </div>
    </footer>
  );
}

const STEPS = ["Cart", "Review", "Payment", "Done"];

export function Stepper({ current = 2 }: { current?: number }) {
  return (
    <nav aria-label="Checkout progress" className="border-b border-line">
      <ol className="container-pe grid grid-cols-4 gap-2 py-4 sm:gap-6">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <span
                aria-hidden
                className={
                  "flex h-6 w-6 items-center justify-center border text-[11px] " +
                  (done
                    ? "border-ink bg-ink text-white"
                    : active
                      ? "border-lime bg-lime text-ink"
                      : "border-line text-muted")
                }
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={
                  "truncate border-b-2 pb-1 text-[11px] sm:text-[13px] " +
                  (active
                    ? "border-lime text-ink"
                    : done
                      ? "border-transparent text-ink"
                      : "border-transparent text-muted")
                }
              >
                {s}
              </span>
              {active && <span className="sr-only">(current step)</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
