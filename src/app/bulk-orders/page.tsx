import type { Metadata } from "next";
import LandingShell from "@/components/layout/LandingShell";
import BulkQuoteForm from "@/components/bulk/BulkQuoteForm";

export const metadata: Metadata = {
  title: "Bulk orders",
  description:
    "Slab pricing from 10 pieces for teams, colleges, clinics and companies. GST invoicing and a dedicated manager.",
};

export default function Page() {
  return (
    <LandingShell
      eyebrow="From 10 pieces"
      title="Bulk orders for teams and companies"
      intro="Slab pricing, GST invoicing, sampling before the full run, and one person who owns your order end to end."
      primary={{ label: "Request a quote", href: "#quote" }}
      secondary={{ label: "See our range", href: "/shop" }}
      blocks={[
        { heading: "10 to 49 pieces", body: "10% off list price. Dispatched in 5 working days." },
        { heading: "50 to 199 pieces", body: "18% off list price, with a free sample before the full run." },
        { heading: "200 or more", body: "Custom quote, dedicated manager, and staggered delivery if you need it." },
        { heading: "GST invoicing", body: "Add your GSTIN and we raise the invoice against your business for input credit." },
      ]}
    >
      <BulkQuoteForm />
    </LandingShell>
  );
}
