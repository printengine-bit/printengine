import { Lock, Repeat, Shield, Truck } from "@/components/ui/icons";

const ITEMS = [
  { Icon: Truck, title: "5-day dispatch", copy: "Made to order, shipped pan-India" },
  { Icon: Shield, title: "Print guarantee", copy: "Free reprint on any print defect" },
  { Icon: Repeat, title: "Easy size exchange", copy: "One free exchange on every order" },
  { Icon: Lock, title: "Secure payments", copy: "UPI, cards and net banking" },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-line bg-alt" aria-label="Why shop with us">
      <div className="container-pe grid grid-cols-2 gap-8 py-12 lg:grid-cols-4 lg:py-14">
        {ITEMS.map(({ Icon, title, copy }) => (
          <div key={title}>
            <Icon className="h-6 w-6 text-ink" />
            <p className="mt-4 text-[14px] font-medium">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
