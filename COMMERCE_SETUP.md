# PrintEngine independent commerce setup

PrintEngine owns its storefront, administration, catalogue, customers, inventory, discounts,
orders and production artwork. Shopify is not used.

## Architecture

- Next.js storefront and `/admin` operations console
- PostgreSQL as the source of truth
- Signed HTTP-only customer and staff sessions
- Razorpay Orders API, browser checkout and signed webhooks
- Cloudinary for durable artwork storage
- OpenAI image generation for print-ready artwork
- Optional Shiprocket fulfilment and Resend transactional email

## First-time setup

1. Copy `.env.example` to `.env.local`.
2. Create a PostgreSQL database and set `DATABASE_URL`. For local development with Docker, run
   `docker compose up -d` and use
   `postgresql://printengine:printengine-local-only@localhost:5432/printengine`.
3. Generate a random `SESSION_SECRET` containing at least 32 characters.
4. Set a temporary `ADMIN_EMAIL` and strong `ADMIN_PASSWORD`.
5. Run `npm run db:setup` to migrate the schema, seed 18 products and create the administrator.
6. Remove `ADMIN_PASSWORD` from the runtime environment after seeding. Production startup applies
   pending numbered migrations automatically but never runs the seed.
7. Add Razorpay test credentials and configure the webhook URL as
   `/api/payments/razorpay/webhook`.
8. Add OpenAI and Cloudinary credentials when artwork generation and uploads are ready.

## Admin modules

- Overview: revenue, orders, customers, low stock and artwork queues
- Products: prices, MRP and publishing state
- Inventory: stock per SKU with an immutable movement history
- Orders: production, fulfilment and tracking status
- Customers: accounts, order counts and paid lifetime value
- Discounts: automatic and code-based rules, limits and combination behavior
- Artwork: approve, request changes or reject customer assets
- Content: storefront announcements and campaign copy
- Settings: store identity, support, GST and shipping values

## Checkout guarantees

The server reloads every variant, price, supported decoration method and stock level before creating
an order. Browser totals are estimates only. Stock is reserved atomically for 30 minutes while the
customer pays. Payment callbacks and webhooks are verified with HMAC, and webhook events and
paid-order processing are idempotent: inventory and discount usage are deducted exactly once.
Guest order pages require an opaque per-order access token; signed-in customers can only read their
own orders.

Supported discount structures are percentage, fixed amount, free shipping and buy-X-get-Y. The
highest eligible non-combinable offer wins; explicitly combinable offers can stack when no exclusive
offer applies.

## Production checklist

- Use managed PostgreSQL with automated backups and point-in-time recovery.
- Rotate the administrator password and Razorpay secrets before launch.
- Enable Razorpay test mode first and rehearse captured, failed and refunded payments.
- Verify the sending domain in Resend and rehearse verification, reset and receipt delivery.
- Add an asynchronous malware-scanning provider if non-raster artwork formats are introduced later.
- Connect Shiprocket label creation and tracking webhooks.
- Connect Resend for receipts, artwork-change requests and fulfilment updates.
- Add GST invoice numbering and verify calculations with the business accountant.
- Complete accessibility, mobile, performance and end-to-end checkout testing.
- Rehearse a real low-value order, cancellation, refund, reprint and inventory reconciliation.
