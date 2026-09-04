import { shiprocketConfigured } from "@/lib/shiprocket";
import { emailConfigured } from "@/lib/email";

export default function IntegrationStatus(){
  const items=[
    ["Database URL",Boolean(process.env.DATABASE_URL)],
    ["Session signing secret",Boolean(process.env.SESSION_SECRET&&process.env.SESSION_SECRET.length>=32)],
    ["Public origin",Boolean(process.env.PUBLIC_BASE_URL||process.env.NEXT_PUBLIC_SITE_URL)],
    ["Razorpay keys and webhook",Boolean(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET&&process.env.RAZORPAY_WEBHOOK_SECRET)],
    ["Shiprocket credentials and package settings",shiprocketConfigured()],
    ["Resend sender configuration",emailConfigured()],
    ["Resend webhook secret",Boolean(process.env.RESEND_WEBHOOK_SECRET)],
    ["Artwork storage",Boolean(process.env.CLOUDINARY_CLOUD_NAME&&process.env.CLOUDINARY_API_KEY&&process.env.CLOUDINARY_API_SECRET)],
    ["AI artwork key",Boolean(process.env.OPENAI_API_KEY)],
  ] as const;
  return <section className="mb-6 border border-line bg-white p-5"><h2 className="text-lg font-medium">Integration configuration</h2><p className="mt-2 text-sm text-muted">Presence checks only—not connection tests. Secrets are managed in Railway Variables and are never displayed here.</p><ul className="mt-4 space-y-2">{items.map(([label,present])=><li key={label} className="flex flex-wrap justify-between gap-2 text-sm"><span>{label}</span><span className={present?"text-[#5f7f06]":"text-[#a32d2d]"}>{present?"Configured · not verified":"Missing configuration"}</span></li>)}</ul></section>;
}
