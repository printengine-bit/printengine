# printengine

Independent custom-print commerce platform built with Next.js 16, React 19, PostgreSQL and Tailwind CSS 4. It includes the customer storefront, design studio and a Shopify-style `/admin` console without using Shopify.

## Local development

Copy `.env.example` to `.env.local`, configure PostgreSQL, then run:

```bash
npm install
npm run db:setup
npm run dev
```

The static catalogue remains available when PostgreSQL is absent for visual development. Accounts,
administration, checkout, AI generation and artwork storage return setup messages instead of simulating success.

## Validation

```bash
npm test
npm run lint
npm run build
```

See [COMMERCE_SETUP.md](./COMMERCE_SETUP.md) for the PostgreSQL, Razorpay, OpenAI and Cloudinary
production architecture and launch checklist.
